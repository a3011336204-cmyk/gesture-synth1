export type Handedness = 'Left' | 'Right';

export type HandLandmark = {
  x: number;
  y: number;
  z?: number;
};

export type ScaleDegree = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII';

export type ChordState = {
  degree: ScaleDegree;
  isMajorMode: boolean;
  qualityIndex: number;
  octaveDown: boolean;
};

export type KeyOption = {
  label: string;
  name: KeyName;
  tonicFrequency: number;
};

export type KeyName =
  | 'A'
  | 'Bb'
  | 'B'
  | 'C'
  | 'Db'
  | 'D'
  | 'Eb'
  | 'E'
  | 'F'
  | 'Gb'
  | 'G'
  | 'Ab';

type FingerName = 'index' | 'middle' | 'ring' | 'pinky';

const FINGER_JOINTS: Record<FingerName, { pip: number; tip: number }> = {
  index: { pip: 6, tip: 8 },
  middle: { pip: 10, tip: 12 },
  ring: { pip: 14, tip: 16 },
  pinky: { pip: 18, tip: 20 },
};

const DEGREE_BY_FINGER_COUNT: Partial<Record<number, ScaleDegree>> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
};

const DEGREE_SEMITONES: Record<number, number> = {
  1: 0,
  2: 2,
  3: 4,
  4: 5,
  5: 7,
  6: 9,
  7: -1,
};

const DEGREE_NUMBER: Record<ScaleDegree, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
};

const MAJOR_SCALE: Record<KeyName, string[]> = {
  A: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
  Bb: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
  B: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
  C: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  Db: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
  D: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  Eb: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
  E: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
  F: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
  Gb: ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'],
  G: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  Ab: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
};

const LOWER_OCTAVE_TONICS = new Set([369.99, 392, 415.3]);

export const KEY_OPTIONS: KeyOption[] = [
  { label: 'A', name: 'A', tonicFrequency: 220 },
  { label: 'A#/Bb', name: 'Bb', tonicFrequency: 233.08 },
  { label: 'B', name: 'B', tonicFrequency: 246.94 },
  { label: 'C', name: 'C', tonicFrequency: 261.63 },
  { label: 'C#/Db', name: 'Db', tonicFrequency: 277.18 },
  { label: 'D', name: 'D', tonicFrequency: 293.66 },
  { label: 'D#/Eb', name: 'Eb', tonicFrequency: 311.13 },
  { label: 'E', name: 'E', tonicFrequency: 329.63 },
  { label: 'F', name: 'F', tonicFrequency: 349.23 },
  { label: 'F#/Gb', name: 'Gb', tonicFrequency: 369.99 },
  { label: 'G', name: 'G', tonicFrequency: 392 },
  { label: 'G#/Ab', name: 'Ab', tonicFrequency: 415.3 },
];

export const WAVEFORM_OPTIONS: {
  label: string;
  value: OscillatorType;
}[] = [
  { label: 'Warm Synth', value: 'triangle' },
  { label: 'Bright Synth', value: 'sawtooth' },
  { label: 'Retro Synth', value: 'square' },
];

function requireHandLandmarks(landmarks: readonly HandLandmark[]): void {
  if (landmarks.length < 21) {
    throw new RangeError(
      `Expected 21 hand landmarks, received ${landmarks.length}`
    );
  }
}

export function isFingerExtended(
  landmarks: readonly HandLandmark[],
  fingerName: FingerName
): boolean {
  requireHandLandmarks(landmarks);
  const { pip, tip } = FINGER_JOINTS[fingerName];
  return landmarks[tip].y < landmarks[pip].y;
}

export function isThumbExtended(
  landmarks: readonly HandLandmark[],
  handedness: Handedness
): boolean {
  requireHandLandmarks(landmarks);
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  return handedness === 'Right'
    ? thumbTip.x > thumbIp.x
    : thumbTip.x < thumbIp.x;
}

export function classifyScaleDegree(
  landmarks: readonly HandLandmark[],
  handedness: Handedness
): ScaleDegree | null {
  const thumb = isThumbExtended(landmarks, handedness);
  const index = isFingerExtended(landmarks, 'index');
  const middle = isFingerExtended(landmarks, 'middle');
  const ring = isFingerExtended(landmarks, 'ring');
  const pinky = isFingerExtended(landmarks, 'pinky');

  if (index && pinky && !middle && !ring) {
    return thumb ? 'VII' : 'VI';
  }

  const extendedFingerCount = [thumb, index, middle, ring, pinky].filter(
    Boolean
  ).length;
  return DEGREE_BY_FINGER_COUNT[extendedFingerCount] ?? null;
}

export function getHandHorizontalTilt(
  landmarks: readonly HandLandmark[],
  handedness: Handedness
): number {
  requireHandLandmarks(landmarks);
  const wristX = landmarks[0].x;
  const middleMcpX = landmarks[9].x;
  const ringMcpX = landmarks[13].x;
  const minimumKnuckleX = Math.min(middleMcpX, ringMcpX);
  const maximumKnuckleX = Math.max(middleMcpX, ringMcpX);
  const maximumTravel = 0.12;

  let tilt = 0;
  if (wristX < minimumKnuckleX) {
    tilt = (wristX - minimumKnuckleX) / maximumTravel;
  } else if (wristX > maximumKnuckleX) {
    tilt = (wristX - maximumKnuckleX) / maximumTravel;
  }

  const clampedTilt = Math.max(-1, Math.min(1, tilt));
  return handedness === 'Right' ? -clampedTilt : clampedTilt;
}

export function getRightHandQualityIndex(
  landmarks: readonly HandLandmark[]
): number {
  return (['index', 'middle', 'ring', 'pinky'] as const).filter((finger) =>
    isFingerExtended(landmarks, finger)
  ).length;
}

export function getVolumeFromHeight(
  landmarks: readonly HandLandmark[]
): number {
  requireHandLandmarks(landmarks);
  const top = 0.05;
  const bottom = 0.95;
  const clampedWristY = Math.max(top, Math.min(bottom, landmarks[0].y));
  return 1 - (clampedWristY - top) / (bottom - top);
}

function sameChordState(
  first: ChordState | null,
  second: ChordState | null
): boolean {
  if (first === null || second === null) return first === second;
  return (
    first.degree === second.degree &&
    first.isMajorMode === second.isMajorMode &&
    first.qualityIndex === second.qualityIndex &&
    first.octaveDown === second.octaveDown
  );
}

export function createChordStabilizer(holdTimeMs = 100, nullWindowMs = 50) {
  if (holdTimeMs < 0 || nullWindowMs < 0) {
    throw new RangeError(
      `Stabilizer durations must be non-negative; received hold=${holdTimeMs}, nullWindow=${nullWindowMs}`
    );
  }

  let stableState: ChordState | null = null;
  let candidateState: ChordState | null = null;
  let candidateSince = 0;
  let lastValidStateAt = Number.NEGATIVE_INFINITY;

  return {
    update(rawState: ChordState | null, nowMs: number): ChordState | null {
      if (!Number.isFinite(nowMs)) {
        throw new TypeError(`Expected a finite timestamp, received ${nowMs}`);
      }

      if (rawState !== null) lastValidStateAt = nowMs;
      const effectiveState =
        rawState === null && nowMs - lastValidStateAt < nullWindowMs
          ? candidateState
          : rawState;

      if (!sameChordState(effectiveState, candidateState)) {
        candidateState = effectiveState;
        candidateSince = nowMs;
      }

      if (nowMs - candidateSince >= holdTimeMs) {
        stableState = candidateState;
      }

      return stableState;
    },
    reset(): void {
      stableState = null;
      candidateState = null;
      candidateSince = 0;
      lastValidStateAt = Number.NEGATIVE_INFINITY;
    },
  };
}

function getDegreeFrequency(
  degree: ScaleDegree,
  tonicFrequency: number
): number {
  if (!Number.isFinite(tonicFrequency) || tonicFrequency <= 0) {
    throw new RangeError(
      `Tonic frequency must be positive, received ${tonicFrequency}`
    );
  }

  const degreeNumber = DEGREE_NUMBER[degree];
  const tonic = LOWER_OCTAVE_TONICS.has(tonicFrequency)
    ? tonicFrequency / 2
    : tonicFrequency;
  return tonic * Math.pow(2, DEGREE_SEMITONES[degreeNumber] / 12);
}

type ChordTones = {
  root: number;
  third: number;
  fifth: number;
  octaveRoot: number;
  octaveThird: number;
  majorSeventh: number;
  dominantSeventh: number;
  diminishedSeventh: number;
  diminishedFifth: number;
};

function getChordTones(
  degree: ScaleDegree,
  isMajorMode: boolean,
  tonicFrequency: number
): ChordTones {
  const root = getDegreeFrequency(degree, tonicFrequency);
  const third = root * Math.pow(2, (isMajorMode ? 4 : 3) / 12);
  const fifth = root * Math.pow(2, 7 / 12);

  return {
    root,
    third,
    fifth,
    octaveRoot: root * 2,
    octaveThird: third * 2,
    majorSeventh: root * Math.pow(2, 11 / 12),
    dominantSeventh: root * Math.pow(2, 10 / 12),
    diminishedSeventh: root * Math.pow(2, 9 / 12),
    diminishedFifth: root * Math.pow(2, 6 / 12),
  };
}

export function getChordFrequencies(
  chordState: ChordState,
  tonicFrequency: number
): number[] {
  const tones = getChordTones(
    chordState.degree,
    chordState.isMajorMode,
    tonicFrequency
  );

  const majorVoicings: Record<number, number[]> = {
    1: [tones.root, tones.fifth, tones.octaveRoot, tones.octaveThird],
    2: [tones.third, tones.fifth, tones.octaveRoot, tones.octaveThird],
    3: [tones.root, tones.third, tones.fifth, tones.majorSeventh],
    4: [tones.root, tones.third, tones.fifth, tones.dominantSeventh],
  };
  const minorVoicings: Record<number, number[]> = {
    1: [tones.root, tones.fifth, tones.octaveRoot, tones.octaveThird],
    2: [tones.third, tones.fifth, tones.octaveRoot, tones.octaveThird],
    3: [tones.root, tones.third, tones.fifth, tones.dominantSeventh],
    4: [
      tones.root,
      tones.third,
      tones.diminishedFifth,
      tones.diminishedSeventh,
    ],
  };

  const voicings = chordState.isMajorMode ? majorVoicings : minorVoicings;
  const frequencies = voicings[chordState.qualityIndex] ?? voicings[1];
  return chordState.octaveDown
    ? frequencies.map((frequency) => frequency / 2)
    : frequencies;
}

export function getChordName(
  degree: ScaleDegree,
  isMajorMode: boolean,
  keyName: KeyName
): string {
  const rootName = MAJOR_SCALE[keyName][DEGREE_NUMBER[degree] - 1];
  return isMajorMode ? rootName : `${rootName}m`;
}

export function getQualityLabel(chordState: ChordState | null): string {
  if (!chordState || chordState.qualityIndex === 0) return '--';

  const majorLabels: Record<number, string> = {
    1: 'Major',
    2: 'Major 1st Inv',
    3: 'Major 7th',
    4: 'Dominant 7th',
  };
  const minorLabels: Record<number, string> = {
    1: 'Minor',
    2: 'Minor 1st Inv',
    3: 'Minor 7th',
    4: 'Diminished 7th',
  };
  const label = (chordState.isMajorMode ? majorLabels : minorLabels)[
    chordState.qualityIndex
  ];
  return label ? `${label}${chordState.octaveDown ? ' (-8ve)' : ''}` : '--';
}

export function getFilterSettings(tilt: number): {
  frequency: number;
  resonance: number;
} {
  const clampedTilt = Math.max(-1, Math.min(1, tilt));
  if (clampedTilt < 0) {
    const intensity = Math.abs(clampedTilt);
    return {
      frequency: 1200 - intensity * 950,
      resonance: 0.7 + intensity * 1.5,
    };
  }
  return {
    frequency: 1200 + clampedTilt * 3800,
    resonance: 0.7 + clampedTilt * 4.5,
  };
}

export type CoverRect = {
  sx: number;
  sy: number;
  sourceWidth: number;
  sourceHeight: number;
};

export function computeCoverRect(
  sourceWidth: number,
  sourceHeight: number,
  destinationWidth: number,
  destinationHeight: number
): CoverRect {
  const dimensions = [
    sourceWidth,
    sourceHeight,
    destinationWidth,
    destinationHeight,
  ];
  if (
    dimensions.some(
      (dimension) => !Number.isFinite(dimension) || dimension <= 0
    )
  ) {
    throw new RangeError(
      `Cover dimensions must be positive; received ${dimensions.join('x')}`
    );
  }

  const sourceRatio = sourceWidth / sourceHeight;
  const destinationRatio = destinationWidth / destinationHeight;
  if (sourceRatio > destinationRatio) {
    const croppedWidth = sourceHeight * destinationRatio;
    return {
      sx: (sourceWidth - croppedWidth) / 2,
      sy: 0,
      sourceWidth: croppedWidth,
      sourceHeight,
    };
  }

  const croppedHeight = sourceWidth / destinationRatio;
  return {
    sx: 0,
    sy: (sourceHeight - croppedHeight) / 2,
    sourceWidth,
    sourceHeight: croppedHeight,
  };
}
