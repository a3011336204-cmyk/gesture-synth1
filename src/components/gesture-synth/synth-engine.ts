import { getFilterSettings } from './gesture-mapping';

export type RecordedVideo = {
  blob: Blob;
  extension: 'mp4';
  mimeType: string;
};

export type SynthEngine = ReturnType<typeof createSynthEngine>;

const MP4_RECORDING_MIME_TYPES = [
  'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
  'video/mp4;codecs=avc1.42001E,mp4a.40.2',
  'video/mp4;codecs=avc1,mp4a.40.2',
  'video/mp4',
] as const;

const RECORDING_SYNTH_GAIN = 0.35;

export function selectRecordingMimeType(
  supportsMimeType: (mimeType: string) => boolean
): string | null {
  return (
    MP4_RECORDING_MIME_TYPES.find((mimeType) => supportsMimeType(mimeType)) ??
    null
  );
}

export function createSynthEngine() {
  let audioContext: AudioContext | null = null;
  let waveShaper: WaveShaperNode | null = null;
  let lowPassFilter: BiquadFilterNode | null = null;
  let masterGain: GainNode | null = null;
  let recordingSynthGain: GainNode | null = null;
  let recordingDestination: MediaStreamAudioDestinationNode | null = null;
  let oscillators: OscillatorNode[] = [];
  let currentFrequencyKey: string | null = null;
  let waveform: OscillatorType = 'triangle';
  let mediaRecorder: MediaRecorder | null = null;
  let microphoneSource: MediaStreamAudioSourceNode | null = null;
  let recordingChunks: Blob[] = [];
  let recordingFailure: Error | null = null;

  function requireAudioContext(): AudioContext {
    if (!audioContext) {
      throw new Error('The audio engine has not been started');
    }
    return audioContext;
  }

  function stopOscillators(): void {
    for (const oscillator of oscillators) {
      oscillator.stop();
      oscillator.disconnect();
    }
    oscillators = [];
    currentFrequencyKey = null;
  }

  function disconnectMicrophoneSource(): void {
    microphoneSource?.disconnect();
    microphoneSource = null;
  }

  async function start(): Promise<void> {
    if (audioContext) {
      if (audioContext.state === 'suspended') await audioContext.resume();
      return;
    }

    const browserWindow = window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioContextConstructor =
      browserWindow.AudioContext ?? browserWindow.webkitAudioContext;
    if (!AudioContextConstructor) {
      throw new Error('Web Audio is unavailable in this browser');
    }

    audioContext = new AudioContextConstructor();
    waveShaper = audioContext.createWaveShaper();
    waveShaper.curve = null;
    waveShaper.oversample = '4x';

    lowPassFilter = audioContext.createBiquadFilter();
    lowPassFilter.type = 'lowpass';
    lowPassFilter.frequency.value = 1200;
    lowPassFilter.Q.value = 0.7;

    masterGain = audioContext.createGain();
    masterGain.gain.value = 0;
    recordingSynthGain = audioContext.createGain();
    recordingSynthGain.gain.value = RECORDING_SYNTH_GAIN;
    recordingDestination = audioContext.createMediaStreamDestination();

    waveShaper.connect(lowPassFilter);
    lowPassFilter.connect(masterGain);
    masterGain.connect(audioContext.destination);
    masterGain.connect(recordingSynthGain);
    recordingSynthGain.connect(recordingDestination);

    if (audioContext.state === 'suspended') await audioContext.resume();
    if (audioContext.state !== 'running') {
      throw new Error(
        `Web Audio did not start; state is ${audioContext.state}`
      );
    }
  }

  function setWaveform(nextWaveform: OscillatorType): void {
    waveform = nextWaveform;
    currentFrequencyKey = null;
  }

  function playNotes(frequencies: readonly number[]): void {
    const context = requireAudioContext();
    if (!waveShaper) throw new Error('The audio signal chain is unavailable');
    if (frequencies.length === 0) {
      stopOscillators();
      return;
    }
    if (
      frequencies.some(
        (frequency) => !Number.isFinite(frequency) || frequency <= 0
      )
    ) {
      throw new RangeError(
        `Note frequencies must be positive; received ${frequencies.join(',')}`
      );
    }

    const frequencyKey = frequencies
      .map((frequency) => frequency.toFixed(1))
      .join(',');
    if (frequencyKey === currentFrequencyKey) return;

    stopOscillators();
    oscillators = frequencies.map((frequency) => {
      const oscillator = context.createOscillator();
      oscillator.type = waveform;
      oscillator.frequency.value = frequency;
      oscillator.connect(waveShaper!);
      oscillator.start();
      return oscillator;
    });
    currentFrequencyKey = frequencyKey;
  }

  function setVolume(volume: number): void {
    const context = requireAudioContext();
    if (!masterGain) throw new Error('The master gain node is unavailable');
    const clampedVolume = Math.max(0, Math.min(1, volume));
    masterGain.gain.setTargetAtTime(clampedVolume, context.currentTime, 0.03);
  }

  function setFilterTilt(tilt: number): void {
    const context = requireAudioContext();
    if (!lowPassFilter) throw new Error('The low-pass filter is unavailable');
    const { frequency, resonance } = getFilterSettings(tilt);
    lowPassFilter.frequency.setTargetAtTime(
      frequency,
      context.currentTime,
      0.04
    );
    lowPassFilter.Q.setTargetAtTime(resonance, context.currentTime, 0.04);
  }

  function stopNotes(): void {
    if (!audioContext || !masterGain) return;
    masterGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.02);
    stopOscillators();
  }

  function startRecording(
    visualStream: MediaStream,
    microphoneStream: MediaStream,
    onFailure: (error: Error) => void
  ): void {
    const context = requireAudioContext();
    if (!recordingDestination) {
      throw new Error('The recording audio output is unavailable');
    }
    if (
      typeof MediaRecorder === 'undefined' ||
      typeof MediaRecorder.isTypeSupported !== 'function'
    ) {
      throw new Error(
        'MP4 performance recording is unsupported in this browser'
      );
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      throw new Error('A recording is already in progress');
    }

    const mimeType = selectRecordingMimeType((candidateMimeType) =>
      MediaRecorder.isTypeSupported(candidateMimeType)
    );
    if (!mimeType) {
      throw new Error(
        'This browser cannot encode performance recordings as MP4'
      );
    }

    const visualVideoTracks = visualStream.getVideoTracks();
    if (visualVideoTracks.length !== 1) {
      throw new Error(
        `Expected one performance video track, received ${visualVideoTracks.length}`
      );
    }
    const microphoneAudioTracks = microphoneStream.getAudioTracks();
    if (microphoneAudioTracks.length !== 1) {
      throw new Error(
        `Expected one microphone audio track, received ${microphoneAudioTracks.length}`
      );
    }
    const synthAudioTracks = recordingDestination.stream.getAudioTracks();
    if (synthAudioTracks.length !== 1) {
      throw new Error(
        `Expected one synth audio track, received ${synthAudioTracks.length}`
      );
    }

    recordingChunks = [];
    recordingFailure = null;
    disconnectMicrophoneSource();
    microphoneSource = context.createMediaStreamSource(microphoneStream);
    microphoneSource.connect(recordingDestination);

    try {
      const recordingStream = new MediaStream([
        visualVideoTracks[0],
        synthAudioTracks[0],
      ]);
      mediaRecorder = new MediaRecorder(recordingStream, {
        mimeType,
      });
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordingChunks.push(event.data);
      };
      mediaRecorder.onerror = (event) => {
        const failure =
          event.error ??
          new Error('The browser stopped the MP4 performance recording');
        recordingFailure = failure;
        disconnectMicrophoneSource();
        onFailure(failure);
      };
      mediaRecorder.start(1000);
    } catch (cause) {
      mediaRecorder = null;
      recordingChunks = [];
      recordingFailure = null;
      disconnectMicrophoneSource();
      throw cause;
    }
  }

  async function stopRecording(): Promise<RecordedVideo> {
    const recorder = mediaRecorder;
    if (!recorder || recorder.state === 'inactive') {
      throw new Error('No MP4 performance recording is in progress');
    }

    return new Promise<RecordedVideo>((resolve, reject) => {
      recorder.onstop = () => {
        const mimeType = recorder.mimeType;
        const failure = recordingFailure;
        const chunks = recordingChunks;
        mediaRecorder = null;
        recordingChunks = [];
        recordingFailure = null;
        disconnectMicrophoneSource();

        if (failure) {
          reject(failure);
          return;
        }
        if (chunks.length === 0) {
          reject(new Error('The recording ended without producing media data'));
          return;
        }

        resolve({
          blob: new Blob(chunks, { type: mimeType }),
          extension: 'mp4',
          mimeType,
        });
      };
      recorder.stop();
    });
  }

  async function close(): Promise<void> {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.ondataavailable = null;
      mediaRecorder.onerror = null;
      mediaRecorder.onstop = null;
      mediaRecorder.stop();
    }
    mediaRecorder = null;
    recordingChunks = [];
    recordingFailure = null;
    disconnectMicrophoneSource();

    if (!audioContext) return;
    stopNotes();
    const context = audioContext;
    audioContext = null;
    waveShaper = null;
    lowPassFilter = null;
    masterGain = null;
    recordingSynthGain = null;
    recordingDestination = null;
    if (context.state !== 'closed') await context.close();
  }

  return {
    close,
    playNotes,
    setFilterTilt,
    setVolume,
    setWaveform,
    start,
    startRecording,
    stopNotes,
    stopRecording,
  };
}
