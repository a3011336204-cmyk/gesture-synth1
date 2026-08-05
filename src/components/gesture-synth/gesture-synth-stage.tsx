'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import type {
  HandLandmarker,
  HandLandmarkerResult,
  NormalizedLandmark,
} from '@mediapipe/tasks-vision';
import {
  AlertTriangle,
  Circle,
  Expand,
  Fullscreen,
  HelpCircle,
  LoaderCircle,
  Maximize2,
  Minimize2,
  RotateCcw,
  Square,
  Volume2,
  X,
} from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';

import {
  classifyScaleDegree,
  computeCoverRect,
  createChordStabilizer,
  getChordFrequencies,
  getChordName,
  getHandHorizontalTilt,
  getQualityLabel,
  getRightHandQualityIndex,
  getVolumeFromHeight,
  isThumbExtended,
  KEY_OPTIONS,
  WAVEFORM_OPTIONS,
  type ChordState,
  type HandLandmark,
  type KeyOption,
} from './gesture-mapping';
import {
  createSynthEngine,
  selectRecordingMimeType,
  type SynthEngine,
} from './synth-engine';

const MAX_RECORDING_MS = 5 * 60 * 1000;
const MEDIAPIPE_ASSET_VERSION = '0.10.35';
const MEDIAPIPE_WASM_PATH = `/mediapipe/wasm-${MEDIAPIPE_ASSET_VERSION}`;
const HAND_LANDMARKER_MODEL_PATH = `/models/hand_landmarker-${MEDIAPIPE_ASSET_VERSION}.task`;

type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';
type SessionStatus = 'idle' | 'starting' | 'running' | 'error';
type AudioStatus = 'locked' | 'starting' | 'ready' | 'error';
type ModelDelegate = 'gpu' | 'cpu';
type RecordingStopReason = 'manual' | 'limit';
type StageErrorCode =
  | 'camera_denied'
  | 'camera_missing'
  | 'camera_busy'
  | 'camera_unavailable'
  | 'model_failed'
  | 'runtime_failed';

type StageError = {
  code: StageErrorCode;
  title: string;
  message: string;
};

type MicrophoneFailure = {
  code:
    | 'microphone_denied'
    | 'microphone_missing'
    | 'microphone_busy'
    | 'microphone_unavailable';
  message: string;
};

type PerformanceReadout = {
  chord: string;
  filterPercent: number;
  quality: string;
  volume: number;
};

type VideoFrameElement = HTMLVideoElement & {
  requestVideoFrameCallback?: (
    callback: (now: number, metadata: unknown) => void
  ) => number;
  cancelVideoFrameCallback?: (callbackId: number) => void;
};

type CapturableCanvas = HTMLCanvasElement & {
  captureStream?: (frameRate?: number) => MediaStream;
};

type PlausibleEvent =
  | 'synth_camera_start'
  | 'synth_audio_enabled'
  | 'camera_permission'
  | 'synth_engine_ready'
  | 'two_hands_detected'
  | 'recording_start'
  | 'recording_download'
  | 'synth_error';

declare global {
  interface Window {
    plausible?: (
      event: PlausibleEvent,
      options?: { props: Record<string, string> }
    ) => void;
  }
}

function trackSynthEvent(
  event: PlausibleEvent,
  properties?: Record<string, string>
): void {
  if (typeof window === 'undefined' || !window.plausible) return;
  window.plausible(event, properties ? { props: properties } : undefined);
}

function errorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

function cameraError(cause: unknown): StageError {
  const errorName = cause instanceof DOMException ? cause.name : '';
  if (errorName === 'NotAllowedError' || errorName === 'SecurityError') {
    return {
      code: 'camera_denied',
      title: 'Camera access is blocked',
      message:
        'Allow camera access in your browser settings, then try again. Audio and video stay on this device.',
    };
  }
  if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
    return {
      code: 'camera_missing',
      title: 'No camera was found',
      message: 'Connect or enable a front-facing camera, then try again.',
    };
  }
  if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
    return {
      code: 'camera_busy',
      title: 'The camera is unavailable',
      message:
        'Close other apps using the camera, check the device privacy switch, and try again.',
    };
  }
  return {
    code: 'camera_unavailable',
    title: 'The camera could not start',
    message: `The browser reported: ${errorMessage(cause)}`,
  };
}

function microphoneError(cause: unknown): MicrophoneFailure {
  const errorName = cause instanceof DOMException ? cause.name : '';
  if (errorName === 'NotAllowedError' || errorName === 'SecurityError') {
    return {
      code: 'microphone_denied',
      message:
        'Microphone access is blocked. Allow it in your browser settings, then start recording again.',
    };
  }
  if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
    return {
      code: 'microphone_missing',
      message:
        'No microphone was found. Connect or enable a microphone, then start recording again.',
    };
  }
  if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
    return {
      code: 'microphone_busy',
      message:
        'The microphone is unavailable. Close other apps using it, then start recording again.',
    };
  }
  return {
    code: 'microphone_unavailable',
    message: `The microphone could not start. The browser reported: ${errorMessage(cause)}`,
  };
}

function modelError(cause: unknown): StageError {
  return {
    code: 'model_failed',
    title: 'Hand tracking could not load',
    message: `Reload the tracking model and try again. The browser reported: ${errorMessage(cause)}`,
  };
}

async function createHandLandmarker(): Promise<{
  delegate: ModelDelegate;
  landmarker: HandLandmarker;
}> {
  const { FilesetResolver, HandLandmarker } =
    await import('@mediapipe/tasks-vision');
  const visionFiles = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_PATH);
  const baseOptions = {
    modelAssetPath: HAND_LANDMARKER_MODEL_PATH,
  };

  try {
    const landmarker = await HandLandmarker.createFromOptions(visionFiles, {
      baseOptions: { ...baseOptions, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numHands: 2,
    });
    return { delegate: 'gpu', landmarker };
  } catch (gpuFailure) {
    console.warn(
      `MediaPipe GPU initialization failed; retrying with CPU: ${errorMessage(gpuFailure)}`
    );
    try {
      const landmarker = await HandLandmarker.createFromOptions(visionFiles, {
        baseOptions: { ...baseOptions, delegate: 'CPU' },
        runningMode: 'VIDEO',
        numHands: 2,
      });
      return { delegate: 'cpu', landmarker };
    } catch (cpuFailure) {
      throw new Error(
        `MediaPipe failed with GPU (${errorMessage(gpuFailure)}) and CPU (${errorMessage(cpuFailure)})`,
        { cause: cpuFailure }
      );
    }
  }
}

function drawCameraFrame(
  context: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  results: HandLandmarkerResult
): void {
  const canvasWidth = context.canvas.width;
  const canvasHeight = context.canvas.height;
  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;
  if (
    canvasWidth === 0 ||
    canvasHeight === 0 ||
    sourceWidth === 0 ||
    sourceHeight === 0
  ) {
    return;
  }

  const crop = computeCoverRect(
    sourceWidth,
    sourceHeight,
    canvasWidth,
    canvasHeight
  );
  context.save();
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.translate(canvasWidth, 0);
  context.scale(-1, 1);
  context.drawImage(
    video,
    crop.sx,
    crop.sy,
    crop.sourceWidth,
    crop.sourceHeight,
    0,
    0,
    canvasWidth,
    canvasHeight
  );

  const landmarkRadius = Math.max(2, canvasWidth / 420);
  context.fillStyle = 'rgba(255, 255, 255, 0.58)';
  for (const landmarks of results.landmarks) {
    for (const point of landmarks) {
      const sourceX = point.x * sourceWidth;
      const sourceY = point.y * sourceHeight;
      const canvasX = ((sourceX - crop.sx) / crop.sourceWidth) * canvasWidth;
      const canvasY = ((sourceY - crop.sy) / crop.sourceHeight) * canvasHeight;
      context.beginPath();
      context.arc(canvasX, canvasY, landmarkRadius, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.restore();
}

const SCALE_COLORS: Record<string, string> = {
  I: '232, 161, 61',
  II: '210, 50, 120',
  III: '180, 40, 150',
  IV: '240, 210, 40',
  V: '245, 120, 30',
  VI: '230, 40, 40',
  VII: '100, 200, 250',
};

function drawEnergy(
  context: CanvasRenderingContext2D,
  volume: number,
  qualityIndex: number,
  tilt: number,
  chordState: ChordState | null,
  nowMs: number
): void {
  if (qualityIndex === 0) return;
  const canvasWidth = context.canvas.width;
  const canvasHeight = context.canvas.height;
  const pixelRatio = Math.max(1, canvasWidth / 1200);
  const centerY = canvasHeight - 58 * pixelRatio;
  const maximumThickness = (1 + volume * 8) * pixelRatio;
  const chaosScale = (tilt + 1) / 2;
  const shakinessAmplitude = chaosScale * 25 * pixelRatio;
  const shakinessFrequency = 0.05 + chaosScale * 0.15;
  const color = chordState ? SCALE_COLORS[chordState.degree] : '150, 150, 150';
  const brightness = chordState ? (chordState.isMajorMode ? 1 : 0.7) : 0.3;
  const [red, green, blue] = color.split(',').map(Number);
  const time = nowMs * 0.004;

  context.save();
  context.shadowBlur = (10 + volume * 20) * pixelRatio;
  context.shadowColor = `rgba(${red}, ${green}, ${blue}, ${0.5 * brightness})`;
  for (let line = 0; line < qualityIndex; line += 1) {
    context.beginPath();
    const lineY = centerY + (line - (qualityIndex - 1) / 2) * 12 * pixelRatio;
    for (let x = 0; x <= canvasWidth; x += 10 * pixelRatio) {
      const baseWave = Math.sin(x * 0.005 + time + line * 0.5) * 20;
      const jitter =
        (Math.random() - 0.5) *
        shakinessAmplitude *
        Math.sin(x * shakinessFrequency + time);
      const y = lineY + baseWave + jitter;
      if (x === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${brightness})`;
    context.lineWidth = Math.max(
      pixelRatio,
      maximumThickness - line * 0.5 * pixelRatio
    );
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke();
  }
  context.restore();
}

function formatDuration(elapsedSeconds: number): string {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function waitForVideo(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve, reject) => {
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      video.play().then(resolve).catch(reject);
      return;
    }

    const removeListeners = () => {
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('error', onError);
    };
    const onLoaded = () => {
      removeListeners();
      video.play().then(resolve).catch(reject);
    };
    const onError = () => {
      removeListeners();
      reject(new Error('The camera video stream could not be decoded'));
    };
    video.addEventListener('loadedmetadata', onLoaded, { once: true });
    video.addEventListener('error', onError, { once: true });
  });
}

export function GestureSynthStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mountedRef = useRef(false);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const modelPromiseRef = useRef<Promise<{
    delegate: ModelDelegate;
    landmarker: HandLandmarker;
  }> | null>(null);
  const modelDelegateRef = useRef<ModelDelegate>('gpu');
  const engineRef = useRef<SynthEngine | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const recordingVisualStreamRef = useRef<MediaStream | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const frameRequestRef = useRef<{
    id: number;
    kind: 'animation' | 'video';
    video?: VideoFrameElement;
  } | null>(null);
  const sessionActiveRef = useRef(false);
  const sessionStartingRef = useRef(false);
  const sessionVersionRef = useRef(0);
  const audioReadyRef = useRef(false);
  const audioStartPromiseRef = useRef<Promise<boolean> | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const lastReadoutAtRef = useRef(0);
  const twoHandsTrackedRef = useRef(false);
  const stabilizerRef = useRef(createChordStabilizer());
  const selectedKeyRef = useRef<KeyOption>(KEY_OPTIONS[0]);
  const recordingStartedAtRef = useRef(0);
  const recordingIntervalRef = useRef<number | null>(null);
  const recordingTimeoutRef = useRef<number | null>(null);
  const recordingStartingRef = useRef(false);
  const recordingStoppingRef = useRef(false);

  const [modelStatus, setModelStatus] = useState<ModelStatus>('idle');
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle');
  const [cameraReady, setCameraReady] = useState(false);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('locked');
  const [audioFailure, setAudioFailure] = useState<string | null>(null);
  const [stageError, setStageError] = useState<StageError | null>(null);
  const [readout, setReadout] = useState<PerformanceReadout>({
    chord: '--',
    filterPercent: 0,
    quality: '--',
    volume: 0,
  });
  const [selectedKeyName, setSelectedKeyName] = useState(KEY_OPTIONS[0].name);
  const [waveform, setWaveform] = useState<OscillatorType>('triangle');
  const [helpOpen, setHelpOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingStarting, setRecordingStarting] = useState(false);
  const [recordingStopping, setRecordingStopping] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingFailure, setRecordingFailure] = useState<string | null>(null);

  const ensureHandLandmarker = useCallback(async () => {
    if (landmarkerRef.current) {
      return {
        delegate: modelDelegateRef.current,
        landmarker: landmarkerRef.current,
      };
    }
    if (modelPromiseRef.current) return modelPromiseRef.current;

    setModelStatus('loading');
    const modelPromise = createHandLandmarker()
      .then((model) => {
        if (!mountedRef.current) {
          model.landmarker.close();
          return model;
        }
        landmarkerRef.current = model.landmarker;
        modelDelegateRef.current = model.delegate;
        setModelStatus('ready');
        return model;
      })
      .catch((cause: unknown) => {
        modelPromiseRef.current = null;
        const failure =
          cause instanceof Error ? cause : new Error(errorMessage(cause));
        if (mountedRef.current) {
          setModelStatus('error');
          trackSynthEvent('synth_error', { code: 'model_failed' });
        }
        throw failure;
      });
    modelPromiseRef.current = modelPromise;
    return modelPromise;
  }, []);

  const clearRecordingTimers = useCallback(() => {
    if (recordingIntervalRef.current !== null) {
      window.clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    if (recordingTimeoutRef.current !== null) {
      window.clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  }, []);

  const cancelFrameRequest = useCallback(() => {
    const request = frameRequestRef.current;
    if (!request) return;
    if (request.kind === 'video' && request.video?.cancelVideoFrameCallback) {
      request.video.cancelVideoFrameCallback(request.id);
    } else if (request.kind === 'animation') {
      window.cancelAnimationFrame(request.id);
    }
    frameRequestRef.current = null;
  }, []);

  const releaseRecordingInputStreams = useCallback(() => {
    const visualStream = recordingVisualStreamRef.current;
    recordingVisualStreamRef.current = null;
    if (visualStream) {
      for (const track of visualStream.getTracks()) track.stop();
    }

    const microphoneStream = microphoneStreamRef.current;
    microphoneStreamRef.current = null;
    if (microphoneStream) {
      for (const track of microphoneStream.getTracks()) track.stop();
    }
  }, []);

  const releaseSession = useCallback(
    (updateInterface = true) => {
      sessionActiveRef.current = false;
      sessionStartingRef.current = false;
      sessionVersionRef.current += 1;
      audioReadyRef.current = false;
      audioStartPromiseRef.current = null;
      cancelFrameRequest();
      clearRecordingTimers();
      recordingStartingRef.current = false;
      recordingStoppingRef.current = false;
      if (updateInterface) {
        setCameraReady(false);
        setAudioStatus('locked');
        setAudioFailure(null);
        setRecording(false);
        setRecordingStarting(false);
        setRecordingStopping(false);
        setRecordingSeconds(0);
      }

      const stream = cameraStreamRef.current;
      cameraStreamRef.current = null;
      if (stream) {
        for (const track of stream.getTracks()) track.stop();
      }
      if (videoRef.current) videoRef.current.srcObject = null;

      const engine = engineRef.current;
      engineRef.current = null;
      if (engine) {
        void engine.close().catch((cause: unknown) => {
          console.error(`Audio cleanup failed: ${errorMessage(cause)}`);
        });
      }
      releaseRecordingInputStreams();
      stabilizerRef.current.reset();
      lastVideoTimeRef.current = -1;
      twoHandsTrackedRef.current = false;
      if (updateInterface) {
        setReadout({
          chord: '--',
          filterPercent: 0,
          quality: '--',
          volume: 0,
        });
      }
    },
    [cancelFrameRequest, clearRecordingTimers, releaseRecordingInputStreams]
  );

  const stopAndDownloadRecording = useCallback(
    async (reason: RecordingStopReason) => {
      if (recordingStoppingRef.current) return;
      const engine = engineRef.current;
      if (!engine) {
        setRecordingFailure('The recording engine is no longer available.');
        releaseRecordingInputStreams();
        return;
      }

      recordingStoppingRef.current = true;
      setRecordingStopping(true);
      clearRecordingTimers();
      try {
        const recordedVideo = await engine.stopRecording();
        const downloadUrl = URL.createObjectURL(recordedVideo.blob);
        const downloadLink = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        downloadLink.href = downloadUrl;
        downloadLink.download = `gesture-synth-${timestamp}.${recordedVideo.extension}`;
        downloadLink.click();
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        trackSynthEvent('recording_download', {
          format: recordedVideo.extension,
          stop_reason: reason,
        });
      } catch (cause) {
        const message = errorMessage(cause);
        setRecordingFailure(`Recording could not be saved: ${message}`);
        trackSynthEvent('synth_error', { code: 'recording_failed' });
      } finally {
        releaseRecordingInputStreams();
        recordingStoppingRef.current = false;
        setRecording(false);
        setRecordingSeconds(0);
        setRecordingStopping(false);
      }
    },
    [clearRecordingTimers, releaseRecordingInputStreams]
  );

  const startFrameLoop = useCallback(
    (landmarker: HandLandmarker, engine: SynthEngine) => {
      const scheduleNextFrame = () => {
        if (!sessionActiveRef.current) return;
        const video = videoRef.current as VideoFrameElement | null;
        if (!video) return;

        if (video.requestVideoFrameCallback) {
          const id = video.requestVideoFrameCallback(processFrame);
          frameRequestRef.current = { id, kind: 'video', video };
        } else {
          const id = window.requestAnimationFrame(processFrame);
          frameRequestRef.current = { id, kind: 'animation' };
        }
      };

      const processFrame = (nowMs: number) => {
        frameRequestRef.current = null;
        if (!sessionActiveRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        if (video.currentTime === lastVideoTimeRef.current) {
          scheduleNextFrame();
          return;
        }
        lastVideoTimeRef.current = video.currentTime;

        try {
          const context = canvas.getContext('2d');
          if (!context) throw new Error('The synth canvas is unavailable');
          const results = landmarker.detectForVideo(video, nowMs);
          drawCameraFrame(context, video, results);

          let leftLandmarks: NormalizedLandmark[] | null = null;
          let rightLandmarks: NormalizedLandmark[] | null = null;
          results.landmarks.forEach((landmarks, index) => {
            const handedness = results.handedness[index]?.[0]?.categoryName;
            if (handedness === 'Left') leftLandmarks = landmarks;
            if (handedness === 'Right') rightLandmarks = landmarks;
          });

          if (leftLandmarks && rightLandmarks && !twoHandsTrackedRef.current) {
            twoHandsTrackedRef.current = true;
            trackSynthEvent('two_hands_detected');
          }

          let rawChordState: ChordState | null = null;
          if (leftLandmarks) {
            const degree = classifyScaleDegree(
              leftLandmarks as HandLandmark[],
              'Left'
            );
            if (degree) {
              rawChordState = {
                degree,
                isMajorMode:
                  getHandHorizontalTilt(
                    leftLandmarks as HandLandmark[],
                    'Left'
                  ) >= 0,
                qualityIndex: rightLandmarks
                  ? getRightHandQualityIndex(rightLandmarks as HandLandmark[])
                  : 0,
                octaveDown: rightLandmarks
                  ? isThumbExtended(rightLandmarks as HandLandmark[], 'Right')
                  : false,
              };
            }
          }

          const stableChordState = stabilizerRef.current.update(
            rawChordState,
            nowMs
          );
          let currentVolume = 0;
          let currentTilt = 0;
          if (rightLandmarks) {
            currentVolume = getVolumeFromHeight(
              rightLandmarks as HandLandmark[]
            );
            currentTilt = getHandHorizontalTilt(
              rightLandmarks as HandLandmark[],
              'Right'
            );
            if (audioReadyRef.current) {
              engine.setFilterTilt(currentTilt);
              if (stableChordState && stableChordState.qualityIndex >= 1) {
                engine.playNotes(
                  getChordFrequencies(
                    stableChordState,
                    selectedKeyRef.current.tonicFrequency
                  )
                );
                engine.setVolume(currentVolume);
              } else {
                engine.setVolume(0);
              }
            }
          } else if (audioReadyRef.current) {
            engine.setVolume(0);
          }

          drawEnergy(
            context,
            currentVolume,
            stableChordState?.qualityIndex ?? 0,
            currentTilt,
            stableChordState,
            nowMs
          );

          if (nowMs - lastReadoutAtRef.current >= 60) {
            lastReadoutAtRef.current = nowMs;
            setReadout({
              chord: stableChordState
                ? `${getChordName(
                    stableChordState.degree,
                    stableChordState.isMajorMode,
                    selectedKeyRef.current.name
                  )}(${stableChordState.degree})`
                : '--',
              filterPercent: Math.round(currentTilt * 100),
              quality: getQualityLabel(stableChordState),
              volume: currentVolume,
            });
          }
          scheduleNextFrame();
        } catch (cause) {
          const failure: StageError = {
            code: 'runtime_failed',
            title: 'The performance stopped',
            message: `Restart the synth to continue. The browser reported: ${errorMessage(cause)}`,
          };
          console.error(failure.message);
          trackSynthEvent('synth_error', { code: failure.code });
          releaseSession();
          setStageError(failure);
          setSessionStatus('error');
        }
      };

      scheduleNextFrame();
    },
    [releaseSession]
  );

  const startSession = useCallback(
    async (source: 'automatic' | 'retry') => {
      if (sessionStartingRef.current || sessionActiveRef.current) return;
      releaseSession();
      sessionStartingRef.current = true;
      setStageError(null);
      setRecordingFailure(null);
      setSessionStatus('starting');
      trackSynthEvent('synth_camera_start', { source });
      const sessionVersion = sessionVersionRef.current;
      const engine = createSynthEngine();
      engineRef.current = engine;

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw {
            code: 'camera_unavailable',
            title: 'Camera access is unavailable',
            message:
              'Open this page over HTTPS in a current browser with camera support, then try again.',
          } satisfies StageError;
        }

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
          trackSynthEvent('camera_permission', { result: 'granted' });
        } catch (cause) {
          const failure = cameraError(cause);
          trackSynthEvent('camera_permission', { result: failure.code });
          throw failure;
        }

        if (
          !mountedRef.current ||
          sessionVersion !== sessionVersionRef.current
        ) {
          for (const track of stream.getTracks()) track.stop();
          return;
        }

        cameraStreamRef.current = stream;
        const video = videoRef.current;
        if (!video) {
          throw {
            code: 'camera_unavailable',
            title: 'Camera view is unavailable',
            message:
              'The performance view was removed before the camera started.',
          } satisfies StageError;
        }
        video.srcObject = stream;
        await waitForVideo(video);

        if (
          !mountedRef.current ||
          sessionVersion !== sessionVersionRef.current
        ) {
          return;
        }
        setCameraReady(true);

        let model: Awaited<ReturnType<typeof createHandLandmarker>>;
        try {
          model = await ensureHandLandmarker();
        } catch (cause) {
          throw modelError(cause);
        }

        if (
          !mountedRef.current ||
          sessionVersion !== sessionVersionRef.current
        ) {
          return;
        }

        sessionActiveRef.current = true;
        setSessionStatus('running');
        trackSynthEvent('synth_engine_ready', { delegate: model.delegate });
        startFrameLoop(model.landmarker, engine);
      } catch (cause) {
        if (
          !mountedRef.current ||
          sessionVersion !== sessionVersionRef.current
        ) {
          return;
        }
        const failure =
          typeof cause === 'object' &&
          cause !== null &&
          'code' in cause &&
          'title' in cause &&
          'message' in cause
            ? (cause as StageError)
            : ({
                code: 'runtime_failed',
                title: 'The synth could not start',
                message: `Try again. The browser reported: ${errorMessage(cause)}`,
              } satisfies StageError);
        console.error(`${failure.title}: ${failure.message}`);
        trackSynthEvent('synth_error', { code: failure.code });
        releaseSession();
        setStageError(failure);
        setSessionStatus('error');
      } finally {
        if (sessionVersion === sessionVersionRef.current) {
          sessionStartingRef.current = false;
        }
      }
    },
    [ensureHandLandmarker, releaseSession, startFrameLoop]
  );

  const enableAudio = useCallback(async (): Promise<boolean> => {
    if (audioReadyRef.current) return true;
    if (audioStartPromiseRef.current) return audioStartPromiseRef.current;

    const engine = engineRef.current;
    if (!engine) {
      setAudioStatus('error');
      setAudioFailure('The sound engine is not ready yet.');
      return false;
    }

    const sessionVersion = sessionVersionRef.current;
    setAudioStatus('starting');
    setAudioFailure(null);
    const audioStartPromise = (async () => {
      try {
        await engine.start();
        if (
          !mountedRef.current ||
          sessionVersion !== sessionVersionRef.current ||
          engineRef.current !== engine
        ) {
          return false;
        }
        audioReadyRef.current = true;
        setAudioStatus('ready');
        trackSynthEvent('synth_audio_enabled');
        return true;
      } catch (cause) {
        if (
          !mountedRef.current ||
          sessionVersion !== sessionVersionRef.current ||
          engineRef.current !== engine
        ) {
          return false;
        }
        const message = `Sound could not start: ${errorMessage(cause)}`;
        setAudioStatus('error');
        setAudioFailure(message);
        trackSynthEvent('synth_error', { code: 'audio_unavailable' });
        return false;
      }
    })();

    audioStartPromiseRef.current = audioStartPromise;
    const audioEnabled = await audioStartPromise;
    if (audioStartPromiseRef.current === audioStartPromise) {
      audioStartPromiseRef.current = null;
    }
    return audioEnabled;
  }, []);

  const startRecording = useCallback(async () => {
    if (recordingStartingRef.current || recordingStoppingRef.current) return;
    const engine = engineRef.current;
    if (!engine) {
      setRecordingFailure('Start the synth before recording.');
      return;
    }
    const canvas = canvasRef.current as CapturableCanvas | null;
    if (!canvas?.captureStream) {
      setRecordingFailure(
        'Performance recording is unavailable because this browser cannot capture the synth canvas.'
      );
      trackSynthEvent('synth_error', { code: 'canvas_capture_unsupported' });
      return;
    }
    if (canvas.width <= 1 || canvas.height <= 1) {
      setRecordingFailure(
        `The performance canvas is not ready (${canvas.width}x${canvas.height}). Try again in a moment.`
      );
      trackSynthEvent('synth_error', { code: 'canvas_capture_not_ready' });
      return;
    }
    if (
      typeof MediaRecorder === 'undefined' ||
      typeof MediaRecorder.isTypeSupported !== 'function' ||
      !selectRecordingMimeType((mimeType) =>
        MediaRecorder.isTypeSupported(mimeType)
      )
    ) {
      setRecordingFailure(
        'This browser cannot encode performance recordings as MP4. Update Chrome, Edge, or Safari and try again.'
      );
      trackSynthEvent('synth_error', { code: 'mp4_recording_unsupported' });
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordingFailure(
        'Microphone access is unavailable. Open this page over HTTPS in a current browser and try again.'
      );
      trackSynthEvent('synth_error', { code: 'microphone_unavailable' });
      return;
    }
    if (!(await enableAudio())) {
      setRecordingFailure(
        'Sound could not start. Tap the sound button, then try recording again.'
      );
      return;
    }

    recordingStartingRef.current = true;
    setRecordingStarting(true);
    setRecordingFailure(null);
    const sessionVersion = sessionVersionRef.current;
    try {
      let microphoneStream: MediaStream;
      try {
        microphoneStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            autoGainControl: true,
            echoCancellation: true,
            noiseSuppression: true,
          },
          video: false,
        });
      } catch (cause) {
        if (
          !mountedRef.current ||
          sessionVersion !== sessionVersionRef.current
        ) {
          return;
        }
        const failure = microphoneError(cause);
        setRecordingFailure(failure.message);
        trackSynthEvent('synth_error', { code: failure.code });
        return;
      }

      if (
        !mountedRef.current ||
        sessionVersion !== sessionVersionRef.current ||
        engineRef.current !== engine
      ) {
        for (const track of microphoneStream.getTracks()) track.stop();
        return;
      }

      microphoneStreamRef.current = microphoneStream;
      const visualStream = canvas.captureStream(30);
      recordingVisualStreamRef.current = visualStream;
      engine.startRecording(visualStream, microphoneStream, (failure) => {
        clearRecordingTimers();
        releaseRecordingInputStreams();
        setRecording(false);
        setRecordingSeconds(0);
        setRecordingStopping(false);
        setRecordingFailure(`Recording stopped: ${failure.message}`);
        trackSynthEvent('synth_error', { code: 'recording_failed' });
      });
      setRecordingFailure(null);
      setRecording(true);
      setRecordingSeconds(0);
      recordingStartedAtRef.current = Date.now();
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds(
          Math.min(
            300,
            Math.floor((Date.now() - recordingStartedAtRef.current) / 1000)
          )
        );
      }, 250);
      recordingTimeoutRef.current = window.setTimeout(() => {
        void stopAndDownloadRecording('limit');
      }, MAX_RECORDING_MS);
      trackSynthEvent('recording_start', { format: 'mp4' });
    } catch (cause) {
      releaseRecordingInputStreams();
      if (!mountedRef.current || sessionVersion !== sessionVersionRef.current) {
        return;
      }
      setRecordingFailure(
        `Performance recording could not start: ${errorMessage(cause)}`
      );
      trackSynthEvent('synth_error', { code: 'recording_failed' });
    } finally {
      recordingStartingRef.current = false;
      if (mountedRef.current) setRecordingStarting(false);
    }
  }, [
    clearRecordingTimers,
    enableAudio,
    releaseRecordingInputStreams,
    stopAndDownloadRecording,
  ]);

  const toggleFullscreen = useCallback(async () => {
    const stage = stageRef.current;
    if (!stage) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (stage.requestFullscreen) await stage.requestFullscreen();
      else {
        setRecordingFailure('Fullscreen is not supported in this browser.');
      }
    } catch (cause) {
      setRecordingFailure(`Fullscreen could not open: ${errorMessage(cause)}`);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const automaticStartTimer = window.setTimeout(() => {
      void startSession('automatic');
    }, 0);
    return () => {
      window.clearTimeout(automaticStartTimer);
      mountedRef.current = false;
      releaseSession(false);
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [releaseSession, startSession]);

  useEffect(() => {
    const container = canvasContainerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resizeCanvas = () => {
      const bounds = container.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('The synth canvas is unavailable');
      context.fillStyle = '#071725';
      context.fillRect(0, 0, canvas.width, canvas.height);
    };

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(container);
    resizeCanvas();
    return () => observer.disconnect();
  }, [expanded, fullscreenActive]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setFullscreenActive(document.fullscreenElement === stageRef.current);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    const selectedKey = KEY_OPTIONS.find(
      (keyOption) => keyOption.name === selectedKeyName
    );
    if (!selectedKey) {
      throw new Error(`Unknown synth key: ${selectedKeyName}`);
    }
    selectedKeyRef.current = selectedKey;
  }, [selectedKeyName]);

  useEffect(() => {
    engineRef.current?.setWaveform(waveform);
  }, [waveform]);

  const closeHelp = (event: MouseEvent<HTMLDivElement>) => {
    if (event.currentTarget === event.target) setHelpOpen(false);
  };

  const volumeBarCount = Math.round(readout.volume * 8);
  const isTrackingActive = sessionStatus === 'running';
  const cameraStatusText = isTrackingActive
    ? 'Camera on · Processing locally'
    : cameraReady && modelStatus === 'loading'
      ? 'Camera on · Loading hand tracking'
      : cameraReady
        ? 'Camera on · Starting hand tracking'
        : 'Waiting for camera permission';
  const audioActionLabel =
    audioStatus === 'starting'
      ? 'Starting sound'
      : audioStatus === 'error'
        ? 'Retry sound'
        : 'Tap for sound';
  const showCameraHelp =
    stageError?.code === 'camera_denied' ||
    stageError?.code === 'camera_missing' ||
    stageError?.code === 'camera_busy' ||
    stageError?.code === 'camera_unavailable';

  return (
    <div
      ref={stageRef}
      className={cn(
        'gesture-synth-stage relative isolate overflow-hidden border border-white/15 bg-[#071725] text-white shadow-[0_28px_80px_rgba(2,12,22,0.35)]',
        expanded
          ? 'fixed inset-3 z-[100] h-auto rounded-md sm:inset-6'
          : 'h-[clamp(430px,58vw,690px)] rounded-md',
        fullscreenActive && 'h-screen rounded-none border-0'
      )}
    >
      <div ref={canvasContainerRef} className="absolute inset-0">
        <video
          ref={videoRef}
          className={cn(
            'absolute inset-0 size-full scale-x-[-1] object-cover transition-opacity duration-300',
            isTrackingActive ? 'opacity-0' : 'opacity-100'
          )}
          autoPlay
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          data-testid="gesture-canvas"
          className={cn(
            'absolute inset-0 size-full transition-opacity duration-300',
            isTrackingActive ? 'opacity-100' : 'opacity-0'
          )}
        />
      </div>

      <div className="absolute top-3 right-3 z-30 flex h-10 items-center rounded-md border border-white/10 bg-[#07111f]/90 p-1 backdrop-blur sm:top-4 sm:right-4">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="grid size-8 place-items-center rounded text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={expanded ? 'Restore synth size' : 'Expand synth'}
          title={expanded ? 'Restore size' : 'Expand'}
        >
          {expanded ? (
            <Minimize2 className="size-4" />
          ) : (
            <Expand className="size-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          className="grid size-8 place-items-center rounded text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={fullscreenActive ? 'Exit fullscreen' : 'Open fullscreen'}
          title={fullscreenActive ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {fullscreenActive ? (
            <Minimize2 className="size-4" />
          ) : (
            <Fullscreen className="size-4" />
          )}
        </button>
      </div>

      <div className="absolute top-3 left-3 z-20 flex w-[132px] flex-col gap-2 sm:top-4 sm:left-4 sm:w-[148px]">
        <label className="sr-only" htmlFor="gesture-synth-key">
          Musical key
        </label>
        <select
          id="gesture-synth-key"
          value={selectedKeyName}
          onChange={(event) =>
            setSelectedKeyName(event.target.value as KeyOption['name'])
          }
          className="h-8 rounded border border-[#3a3428] bg-[#151515]/95 px-2 font-mono text-xs text-[#e8a13d] outline-none focus:border-[#e8a13d] sm:text-sm"
        >
          {KEY_OPTIONS.map((keyOption) => (
            <option key={keyOption.name} value={keyOption.name}>
              Key: {keyOption.label}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="gesture-synth-waveform">
          Synth waveform
        </label>
        <select
          id="gesture-synth-waveform"
          value={waveform}
          onChange={(event) =>
            setWaveform(event.target.value as OscillatorType)
          }
          className="h-8 rounded border border-[#3a3428] bg-[#151515]/95 px-2 font-mono text-xs text-[#e8a13d] outline-none focus:border-[#e8a13d] sm:text-sm"
        >
          {WAVEFORM_OPTIONS.map((waveformOption) => (
            <option key={waveformOption.value} value={waveformOption.value}>
              {waveformOption.label}
            </option>
          ))}
        </select>
      </div>

      {!stageError && (
        <div className="absolute top-[92px] left-3 z-30 inline-flex min-h-8 max-w-[calc(100%_-_7rem)] items-center gap-2 rounded-md border border-[#75dfd2]/20 bg-[#07111f]/88 px-3 py-1.5 font-mono text-[10px] text-white/65 backdrop-blur sm:top-[92px] sm:left-4 sm:max-w-sm sm:text-xs">
          {sessionStatus === 'starting' ? (
            <LoaderCircle className="size-3.5 shrink-0 animate-spin text-[#75dfd2]" />
          ) : (
            <span className="size-1.5 shrink-0 rounded-full bg-[#75dfd2]" />
          )}
          <span>{cameraStatusText}</span>
        </div>
      )}

      <div className="absolute top-14 right-3 z-20 flex w-[72px] flex-col items-end gap-1 sm:top-16 sm:right-4">
        <div className="flex w-full flex-col-reverse gap-[3px]">
          {Array.from({ length: 8 }, (_, index) => (
            <span
              key={index}
              className={cn(
                'h-1.5 w-full rounded-[2px] bg-[#3a3428] sm:h-2',
                index >= 8 - volumeBarCount && 'bg-[#e8a13d]'
              )}
            />
          ))}
        </div>
        <span className="mt-1 font-mono text-[10px] text-[#e8a13d] sm:text-xs">
          Filter: {readout.filterPercent > 0 ? '+' : ''}
          {readout.filterPercent}%
        </span>
      </div>

      {!stageError && (
        <div className="absolute top-3 left-[160px] z-20 flex items-center gap-2 sm:top-4 sm:left-1/2 sm:-translate-x-1/2">
          {recording ? (
            <div className="flex h-9 items-center gap-2 rounded-md border border-red-400/30 bg-[#150c0d]/90 px-2 backdrop-blur">
              <span className="size-2 animate-pulse rounded-full bg-red-500" />
              <span className="w-11 font-mono text-xs text-white tabular-nums">
                {formatDuration(recordingSeconds)}
              </span>
              <button
                type="button"
                onClick={() => void stopAndDownloadRecording('manual')}
                disabled={recordingStopping}
                className="grid size-7 place-items-center rounded text-red-300 transition-colors hover:bg-white/10 disabled:opacity-50"
                aria-label="Stop and download recording"
                title="Stop and download"
              >
                {recordingStopping ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Square className="size-3.5 fill-current" />
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void startRecording()}
              disabled={recordingStarting || !isTrackingActive}
              className="grid size-9 place-items-center rounded-md border border-white/10 bg-[#07111f]/90 text-red-400 backdrop-blur transition-colors hover:bg-white/10 hover:text-red-300 disabled:cursor-wait disabled:opacity-65"
              aria-label={
                recordingStarting
                  ? 'Requesting microphone access'
                  : 'Start MP4 performance recording'
              }
              title={
                !isTrackingActive
                  ? 'Camera and hand tracking are still starting'
                  : recordingStarting
                    ? 'Allow microphone access to record'
                    : 'Record performance display, microphone, and synth audio as MP4'
              }
            >
              {recordingStarting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Circle className="size-4 fill-current" />
              )}
            </button>
          )}
        </div>
      )}

      <div className="pointer-events-none absolute right-20 bottom-3 left-20 z-20 flex flex-col items-center gap-1 font-mono text-[#e8a13d] sm:bottom-4">
        <span className="text-xs font-bold drop-shadow-[0_0_12px_rgba(232,161,61,0.65)]">
          {readout.chord}
        </span>
        <span className="text-[10px] sm:text-xs">{readout.quality}</span>
      </div>

      <button
        type="button"
        onClick={() => setHelpOpen(true)}
        className="absolute bottom-3 left-3 z-30 grid size-10 place-items-center rounded-full bg-[#151515]/90 text-[#e8a13d] transition-colors hover:bg-[#221c15] sm:bottom-4 sm:left-4"
        aria-label="Open gesture guide"
        title="Gesture guide"
      >
        <HelpCircle className="size-5" />
      </button>

      {recordingFailure && (
        <div
          role="alert"
          className="absolute right-3 bottom-3 left-16 z-40 flex min-h-10 items-center gap-2 rounded-md border border-amber-300/30 bg-[#1d1710]/95 px-3 py-2 text-xs text-amber-50 shadow-lg sm:right-4 sm:bottom-4 sm:left-auto sm:max-w-md"
        >
          <AlertTriangle className="size-4 shrink-0 text-amber-300" />
          <span className="min-w-0 flex-1">{recordingFailure}</span>
          <button
            type="button"
            onClick={() => setRecordingFailure(null)}
            className="grid size-7 shrink-0 place-items-center rounded hover:bg-white/10"
            aria-label="Dismiss message"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {sessionStatus !== 'error' &&
        audioStatus !== 'ready' &&
        !recordingFailure && (
          <button
            type="button"
            onClick={() => void enableAudio()}
            disabled={audioStatus === 'starting'}
            className={cn(
              'absolute right-3 bottom-3 z-30 inline-flex min-h-10 items-center gap-2 rounded-md border bg-[#07111f]/90 px-3 font-mono text-[10px] backdrop-blur transition-colors sm:right-4 sm:bottom-4 sm:text-xs',
              audioStatus === 'error'
                ? 'border-amber-300/35 text-amber-100 hover:bg-[#1d1710]'
                : 'border-white/10 text-white/65 hover:bg-white/10 hover:text-white'
            )}
            aria-label={audioActionLabel}
            title={audioFailure ?? 'Enable browser sound for Gesture Synth'}
          >
            {audioStatus === 'starting' ? (
              <LoaderCircle className="size-4 animate-spin text-[#75dfd2]" />
            ) : (
              <Volume2 className="size-4 text-[#75dfd2]" />
            )}
            {audioActionLabel}
          </button>
        )}

      {stageError && (
        <div
          role="alert"
          className="absolute top-[92px] right-3 left-3 z-40 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-amber-300/30 bg-[#15110d]/94 px-3 py-3 text-left text-xs text-amber-50 shadow-lg backdrop-blur sm:top-4 sm:right-auto sm:left-1/2 sm:w-[min(620px,calc(100%_-_12rem))] sm:-translate-x-1/2"
        >
          <AlertTriangle className="size-4 shrink-0 text-amber-300" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{stageError.title}</p>
            <p className="mt-0.5 leading-5 text-white/60">
              {stageError.message}
            </p>
          </div>
          {showCameraHelp && (
            <Link
              href="/camera-permission-help"
              className="font-semibold text-[#75dfd2] transition-colors hover:text-[#95eee4]"
            >
              Camera help
            </Link>
          )}
          <button
            type="button"
            onClick={() => void startSession('retry')}
            className="inline-flex min-h-9 items-center gap-2 rounded-md bg-[#75dfd2] px-3 font-semibold text-[#061a24] transition-colors hover:bg-[#95eee4]"
          >
            <RotateCcw className="size-3.5" />
            Try camera
          </button>
        </div>
      )}

      {helpOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="gesture-guide-title"
          onClick={closeHelp}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
        >
          <div className="max-h-[88%] w-full max-w-2xl overflow-y-auto rounded-md border border-[#e8a13d] bg-[#151515] p-5 font-mono text-sm text-white shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <h2
                id="gesture-guide-title"
                className="text-xl font-bold text-[#e8a13d]"
              >
                Gesture Synth Guide
              </h2>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="grid size-8 shrink-0 place-items-center rounded text-[#e8a13d] hover:bg-white/10"
                aria-label="Close gesture guide"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-7 sm:grid-cols-2">
              <section>
                <h3 className="font-bold text-[#e8a13d]">Left Hand</h3>
                <p className="mt-3 leading-6">
                  <strong>Tilt</strong>
                  <br />
                  Inward: Major
                  <br />
                  Outward: Minor
                </p>
                <p className="mt-4 leading-6">
                  <strong>Fingers (Scale Degree)</strong>
                  <br />
                  1: I
                  <br />
                  2: II
                  <br />
                  3: III
                  <br />
                  4: IV
                  <br />
                  5: V
                  <br />
                  Index + Pinky: VI
                  <br />
                  Index + Pinky + Thumb: VII
                </p>
              </section>

              <section>
                <h3 className="font-bold text-[#e8a13d]">Right Hand</h3>
                <p className="mt-3 leading-6">
                  <strong>Fingers (Chord Quality)</strong>
                  <br />
                  1: Root Position
                  <br />
                  2: 1st Inversion
                  <br />
                  3: Major/Minor 7th
                  <br />
                  4: Dominant/Diminished 7th
                </p>
                <p className="mt-4 leading-6">
                  <strong>Octave</strong>
                  <br />
                  Thumb In: Higher octave
                  <br />
                  Thumb Out: Lower octave
                </p>
                <p className="mt-4 leading-6">
                  <strong>Tilt</strong>
                  <br />
                  Inward: More Filter
                  <br />
                  Outward: Less Filter
                </p>
                <p className="mt-4 leading-6">
                  <strong>Height</strong>
                  <br />
                  Higher: Louder
                  <br />
                  Lower: Softer
                </p>
              </section>
            </div>

            <a
              href="https://www.instagram.com/p/DbH1BACxNCG/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex text-[#e8a13d] underline-offset-4 hover:underline"
            >
              Watch the original video tutorial
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
