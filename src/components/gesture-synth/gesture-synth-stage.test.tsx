import { StrictMode, type AnchorHTMLAttributes, type ReactNode } from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GestureSynthStage } from './gesture-synth-stage';

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}));

const mediaPipeMocks = vi.hoisted(() => ({
  close: vi.fn(),
  createFromOptions: vi.fn(),
  detectForVideo: vi.fn(() => ({
    handedness: [],
    handednesses: [],
    landmarks: [],
    worldLandmarks: [],
  })),
  forVisionTasks: vi.fn(async () => ({})),
}));

vi.mock('@mediapipe/tasks-vision', () => ({
  FilesetResolver: {
    forVisionTasks: mediaPipeMocks.forVisionTasks,
  },
  HandLandmarker: {
    createFromOptions: mediaPipeMocks.createFromOptions,
  },
}));

const audioContextInstances: TestAudioContext[] = [];
const cameraTrackStop = vi.fn();
const canvasTrackStop = vi.fn();
const microphoneTrackStop = vi.fn();
const cancelVideoFrame = vi.fn();
const requestUserMedia = vi.fn();
const captureCanvas = vi.fn();

function audioNode() {
  return {
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

class TestMediaStreamTrack extends EventTarget {
  kind: 'audio' | 'video';
  readyState: MediaStreamTrackState = 'live';
  stop: ReturnType<typeof vi.fn>;

  constructor(kind: 'audio' | 'video', onStop = vi.fn()) {
    super();
    this.kind = kind;
    this.stop = vi.fn(() => {
      this.readyState = 'ended';
      onStop();
    });
  }
}

class TestMediaStream {
  constructor(private readonly tracks: TestMediaStreamTrack[] = []) {}

  getTracks() {
    return this.tracks;
  }

  getAudioTracks() {
    return this.tracks.filter((track) => track.kind === 'audio');
  }

  getVideoTracks() {
    return this.tracks.filter((track) => track.kind === 'video');
  }
}

class TestAudioContext {
  currentTime = 0;
  destination = {};
  gainNodes: Array<{ gain: { value: number } }> = [];
  microphoneSources: ReturnType<typeof audioNode>[] = [];
  state: AudioContextState = 'running';
  close = vi.fn(async () => {
    this.state = 'closed';
  });
  resume = vi.fn(async () => {
    this.state = 'running';
  });

  constructor() {
    audioContextInstances.push(this);
  }

  createWaveShaper() {
    return { ...audioNode(), curve: null, oversample: 'none' };
  }

  createBiquadFilter() {
    return {
      ...audioNode(),
      frequency: { setTargetAtTime: vi.fn(), value: 0 },
      Q: { setTargetAtTime: vi.fn(), value: 0 },
      type: 'lowpass',
    };
  }

  createGain() {
    const gainNode = {
      ...audioNode(),
      gain: { setTargetAtTime: vi.fn(), value: 0 },
    };
    this.gainNodes.push(gainNode);
    return gainNode;
  }

  createMediaStreamDestination() {
    return {
      ...audioNode(),
      stream: new TestMediaStream([new TestMediaStreamTrack('audio')]),
    };
  }

  createMediaStreamSource() {
    const source = audioNode();
    this.microphoneSources.push(source);
    return source;
  }

  createOscillator() {
    return {
      ...audioNode(),
      frequency: { value: 0 },
      start: vi.fn(),
      stop: vi.fn(),
      type: 'triangle',
    };
  }
}

class TestMediaRecorder {
  static instances: TestMediaRecorder[] = [];
  static isTypeSupported = vi.fn(() => true);

  mimeType: string;
  ondataavailable: ((event: BlobEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onstop: (() => void) | null = null;
  state: RecordingState = 'inactive';
  stream: MediaStream;

  constructor(stream: MediaStream, options?: MediaRecorderOptions) {
    this.stream = stream;
    this.mimeType = options?.mimeType ?? '';
    TestMediaRecorder.instances.push(this);
  }

  start = vi.fn(() => {
    this.state = 'recording';
  });

  stop = vi.fn(() => {
    this.state = 'inactive';
    this.ondataavailable?.({
      data: new Blob(['video'], { type: this.mimeType }),
    } as BlobEvent);
    this.onstop?.();
  });
}

function cameraStream(): MediaStream {
  return new TestMediaStream([
    new TestMediaStreamTrack('video', cameraTrackStop),
  ]) as unknown as MediaStream;
}

function canvasStream(): MediaStream {
  return new TestMediaStream([
    new TestMediaStreamTrack('video', canvasTrackStop),
  ]) as unknown as MediaStream;
}

function microphoneStream(): MediaStream {
  return new TestMediaStream([
    new TestMediaStreamTrack('audio', microphoneTrackStop),
  ]) as unknown as MediaStream;
}

function createDeferred<Value>() {
  let resolve!: (value: Value | PromiseLike<Value>) => void;
  const promise = new Promise<Value>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

async function findEnabledRecordButton() {
  const recordButton = await screen.findByRole('button', {
    name: 'Start MP4 performance recording',
  });
  await waitFor(() => expect(recordButton).toBeEnabled());
  return recordButton;
}

beforeEach(() => {
  vi.useRealTimers();
  audioContextInstances.length = 0;
  TestMediaRecorder.instances.length = 0;
  TestMediaRecorder.isTypeSupported.mockReset();
  TestMediaRecorder.isTypeSupported.mockReturnValue(true);
  cameraTrackStop.mockClear();
  canvasTrackStop.mockClear();
  microphoneTrackStop.mockClear();
  cancelVideoFrame.mockClear();
  requestUserMedia.mockReset();
  captureCanvas.mockReset();
  captureCanvas.mockImplementation(() => canvasStream());
  mediaPipeMocks.close.mockClear();
  mediaPipeMocks.forVisionTasks.mockClear();
  mediaPipeMocks.createFromOptions.mockReset();
  mediaPipeMocks.createFromOptions.mockResolvedValue({
    close: mediaPipeMocks.close,
    detectForVideo: mediaPipeMocks.detectForVideo,
  });

  vi.stubGlobal('AudioContext', TestAudioContext);
  vi.stubGlobal('MediaStream', TestMediaStream);
  vi.stubGlobal('MediaRecorder', TestMediaRecorder);
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn(() => 'blob:gesture-synth'),
    revokeObjectURL: vi.fn(),
  });
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia: requestUserMedia,
    },
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'readyState', {
    configurable: true,
    get: () => 1,
  });
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  Object.defineProperty(
    HTMLVideoElement.prototype,
    'requestVideoFrameCallback',
    {
      configurable: true,
      value: vi.fn(() => 7),
    }
  );
  Object.defineProperty(
    HTMLVideoElement.prototype,
    'cancelVideoFrameCallback',
    {
      configurable: true,
      value: cancelVideoFrame,
    }
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    fillRect: vi.fn(),
    fillStyle: '',
  } as unknown as CanvasRenderingContext2D);
  Object.defineProperty(HTMLCanvasElement.prototype, 'captureStream', {
    configurable: true,
    value: captureCanvas,
  });
});

describe('GestureSynthStage lifecycle', () => {
  it('requests the camera automatically and waits for permission before loading tracking', async () => {
    const cameraPermission = createDeferred<MediaStream>();
    requestUserMedia.mockReturnValue(cameraPermission.promise);
    render(<GestureSynthStage />);

    await waitFor(() => expect(requestUserMedia).toHaveBeenCalledTimes(1));
    expect(requestUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: {
        facingMode: 'user',
        height: { ideal: 720 },
        width: { ideal: 1280 },
      },
    });
    expect(mediaPipeMocks.forVisionTasks).not.toHaveBeenCalled();
    expect(mediaPipeMocks.createFromOptions).not.toHaveBeenCalled();
    expect(audioContextInstances).toHaveLength(0);

    await act(async () => {
      cameraPermission.resolve(cameraStream());
      await cameraPermission.promise;
    });

    await waitFor(() =>
      expect(mediaPipeMocks.createFromOptions).toHaveBeenCalledTimes(1)
    );
    expect(mediaPipeMocks.forVisionTasks).toHaveBeenCalledWith(
      '/mediapipe/wasm-0.10.35'
    );
    expect(mediaPipeMocks.createFromOptions).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        baseOptions: expect.objectContaining({
          modelAssetPath: '/models/hand_landmarker-0.10.35.task',
        }),
      })
    );
    expect(audioContextInstances).toHaveLength(0);
  });

  it('creates AudioContext only after Tap for sound is selected', async () => {
    requestUserMedia.mockResolvedValue(cameraStream());
    render(<GestureSynthStage />);

    const soundButton = await screen.findByRole('button', {
      name: 'Tap for sound',
    });
    expect(audioContextInstances).toHaveLength(0);

    fireEvent.click(soundButton);

    await waitFor(() => expect(audioContextInstances).toHaveLength(1));
    expect(
      screen.queryByRole('button', { name: 'Tap for sound' })
    ).not.toBeInTheDocument();
  });

  it('shows an actionable camera-denied error without loading tracking or audio', async () => {
    requestUserMedia.mockRejectedValue(
      new DOMException('Permission denied by test', 'NotAllowedError')
    );
    render(<GestureSynthStage />);

    expect(await screen.findByText('Camera access is blocked')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Camera help' })).toHaveAttribute(
      'href',
      '/camera-permission-help'
    );
    expect(screen.getByRole('button', { name: 'Try camera' })).toBeEnabled();
    expect(mediaPipeMocks.forVisionTasks).not.toHaveBeenCalled();
    expect(mediaPipeMocks.createFromOptions).not.toHaveBeenCalled();
    expect(audioContextInstances).toHaveLength(0);
  });

  it('keeps camera help out of tracking-model failures', async () => {
    requestUserMedia.mockResolvedValue(cameraStream());
    mediaPipeMocks.createFromOptions.mockRejectedValue(
      new Error('Tracking model test failure')
    );
    render(<GestureSynthStage />);

    expect(
      await screen.findByText('Hand tracking could not load')
    ).toBeVisible();
    expect(
      screen.queryByRole('link', { name: 'Camera help' })
    ).not.toBeInTheDocument();
  });

  it('stops camera, frame callbacks, audio, and tracking on unmount', async () => {
    requestUserMedia.mockResolvedValue(cameraStream());
    const view = render(<GestureSynthStage />);

    const soundButton = await screen.findByRole('button', {
      name: 'Tap for sound',
    });
    fireEvent.click(soundButton);
    await waitFor(() => expect(audioContextInstances).toHaveLength(1));

    view.unmount();
    expect(cameraTrackStop).toHaveBeenCalledTimes(1);
    expect(cancelVideoFrame).toHaveBeenCalledWith(7);
    expect(audioContextInstances[0].close).toHaveBeenCalledTimes(1);
    expect(mediaPipeMocks.close).toHaveBeenCalledTimes(1);
  });

  it('stops a camera stream that resolves after unmount', async () => {
    const cameraPermission = createDeferred<MediaStream>();
    requestUserMedia.mockReturnValue(cameraPermission.promise);
    const view = render(<GestureSynthStage />);

    await waitFor(() => expect(requestUserMedia).toHaveBeenCalledTimes(1));
    view.unmount();

    await act(async () => {
      cameraPermission.resolve(cameraStream());
      await cameraPermission.promise;
    });

    await waitFor(() => expect(cameraTrackStop).toHaveBeenCalledTimes(1));
    expect(mediaPipeMocks.createFromOptions).not.toHaveBeenCalled();
    expect(audioContextInstances).toHaveLength(0);
  });

  it('does not duplicate the automatic camera request in StrictMode', async () => {
    requestUserMedia.mockResolvedValue(cameraStream());

    render(
      <StrictMode>
        <GestureSynthStage />
      </StrictMode>
    );

    await waitFor(() => expect(requestUserMedia).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(mediaPipeMocks.createFromOptions).toHaveBeenCalledTimes(1)
    );
    expect(audioContextInstances).toHaveLength(0);
  });

  it('automatically stops and downloads recording at five minutes', async () => {
    requestUserMedia
      .mockResolvedValueOnce(cameraStream())
      .mockResolvedValueOnce(microphoneStream());
    let downloadedFileName = '';
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloadedFileName = this.download;
      });
    render(<GestureSynthStage />);

    const recordButton = await findEnabledRecordButton();
    const canvas = screen.getByTestId('gesture-canvas') as HTMLCanvasElement;
    canvas.width = 1280;
    canvas.height = 720;

    vi.useFakeTimers();
    await act(async () => {
      fireEvent.click(recordButton);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(requestUserMedia).toHaveBeenNthCalledWith(2, {
      audio: {
        autoGainControl: true,
        echoCancellation: true,
        noiseSuppression: true,
      },
      video: false,
    });
    expect(captureCanvas).toHaveBeenCalledWith(30);
    expect(TestMediaRecorder.instances[0].start).toHaveBeenCalledTimes(1);
    expect(
      (
        TestMediaRecorder.instances[0].stream as unknown as TestMediaStream
      ).getTracks()
    ).toHaveLength(2);
    expect(audioContextInstances[0].microphoneSources).toHaveLength(1);
    expect(audioContextInstances[0].gainNodes[1].gain.value).toBe(0.35);
    expect(
      audioContextInstances[0].microphoneSources[0].connect
    ).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    });

    expect(TestMediaRecorder.instances[0].stop).toHaveBeenCalledTimes(1);
    expect(anchorClick).toHaveBeenCalledTimes(1);
    expect(downloadedFileName).toMatch(/\.mp4$/);
    expect(canvasTrackStop).toHaveBeenCalledTimes(1);
    expect(microphoneTrackStop).toHaveBeenCalledTimes(1);
    expect(
      audioContextInstances[0].microphoneSources[0].disconnect
    ).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('fails before capturing the canvas when MP4 encoding is unsupported', async () => {
    requestUserMedia.mockResolvedValue(cameraStream());
    TestMediaRecorder.isTypeSupported.mockReturnValue(false);
    render(<GestureSynthStage />);

    const recordButton = await findEnabledRecordButton();
    const canvas = screen.getByTestId('gesture-canvas') as HTMLCanvasElement;
    canvas.width = 1280;
    canvas.height = 720;
    fireEvent.click(recordButton);

    expect(
      await screen.findByText(/cannot encode performance recordings as MP4/i)
    ).toBeVisible();
    expect(captureCanvas).not.toHaveBeenCalled();
    expect(requestUserMedia).toHaveBeenCalledTimes(1);
  });

  it('shows an actionable error when microphone permission is denied', async () => {
    requestUserMedia
      .mockResolvedValueOnce(cameraStream())
      .mockRejectedValueOnce(
        new DOMException('Microphone denied by test', 'NotAllowedError')
      );
    render(<GestureSynthStage />);

    const recordButton = await findEnabledRecordButton();
    const canvas = screen.getByTestId('gesture-canvas') as HTMLCanvasElement;
    canvas.width = 1280;
    canvas.height = 720;
    fireEvent.click(recordButton);

    expect(
      await screen.findByText(/microphone access is blocked/i)
    ).toBeVisible();
    expect(captureCanvas).not.toHaveBeenCalled();
    expect(TestMediaRecorder.instances).toHaveLength(0);
  });
});
