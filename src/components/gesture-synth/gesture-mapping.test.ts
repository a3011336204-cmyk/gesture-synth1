import { describe, expect, it } from 'vitest';

import {
  classifyScaleDegree,
  computeCoverRect,
  createChordStabilizer,
  getChordFrequencies,
  getChordName,
  getFilterSettings,
  getHandHorizontalTilt,
  getRightHandQualityIndex,
  getVolumeFromHeight,
  KEY_OPTIONS,
  type ChordState,
  type HandLandmark,
} from './gesture-mapping';

function handLandmarks(
  extendedFingers: Array<'index' | 'middle' | 'ring' | 'pinky'>,
  thumbExtended = false
): HandLandmark[] {
  const landmarks = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.7 }));
  const fingerJoints = {
    index: { pip: 6, tip: 8 },
    middle: { pip: 10, tip: 12 },
    ring: { pip: 14, tip: 16 },
    pinky: { pip: 18, tip: 20 },
  };
  for (const [finger, { pip, tip }] of Object.entries(fingerJoints)) {
    landmarks[pip].y = 0.55;
    landmarks[tip].y = extendedFingers.includes(
      finger as (typeof extendedFingers)[number]
    )
      ? 0.25
      : 0.75;
  }
  landmarks[3].x = 0.5;
  landmarks[4].x = thumbExtended ? 0.35 : 0.6;
  landmarks[9].x = 0.47;
  landmarks[13].x = 0.53;
  return landmarks;
}

describe('gesture mapping', () => {
  it('maps finger counts and special signs to I-VII', () => {
    expect(classifyScaleDegree(handLandmarks(['index']), 'Left')).toBe('I');
    expect(
      classifyScaleDegree(handLandmarks(['index', 'middle']), 'Left')
    ).toBe('II');
    expect(
      classifyScaleDegree(handLandmarks(['index', 'middle', 'ring']), 'Left')
    ).toBe('III');
    expect(
      classifyScaleDegree(
        handLandmarks(['index', 'middle', 'ring', 'pinky']),
        'Left'
      )
    ).toBe('IV');
    expect(
      classifyScaleDegree(
        handLandmarks(['index', 'middle', 'ring', 'pinky'], true),
        'Left'
      )
    ).toBe('V');
    expect(classifyScaleDegree(handLandmarks(['index', 'pinky']), 'Left')).toBe(
      'VI'
    );
    expect(
      classifyScaleDegree(handLandmarks(['index', 'pinky'], true), 'Left')
    ).toBe('VII');
  });

  it('inverts right-hand tilt and maps wrist height to volume', () => {
    const landmarks = handLandmarks([]);
    landmarks[0].x = 0.35;
    landmarks[0].y = 0.05;
    expect(getHandHorizontalTilt(landmarks, 'Left')).toBeCloseTo(-1);
    expect(getHandHorizontalTilt(landmarks, 'Right')).toBeCloseTo(1);
    expect(getVolumeFromHeight(landmarks)).toBe(1);
    landmarks[0].y = 0.95;
    expect(getVolumeFromHeight(landmarks)).toBe(0);
  });

  it('counts right-hand chord-quality fingers', () => {
    expect(
      getRightHandQualityIndex(handLandmarks(['index', 'middle', 'ring']))
    ).toBe(3);
  });

  it('stabilizes musical changes for 100ms and bridges short null gaps', () => {
    const stabilizer = createChordStabilizer();
    const state: ChordState = {
      degree: 'IV',
      isMajorMode: true,
      qualityIndex: 2,
      octaveDown: false,
    };
    expect(stabilizer.update(state, 0)).toBeNull();
    expect(stabilizer.update(null, 30)).toBeNull();
    expect(stabilizer.update(state, 99)).toBeNull();
    expect(stabilizer.update(state, 100)).toEqual(state);
    expect(stabilizer.update(null, 130)).toEqual(state);
    expect(stabilizer.update(null, 181)).toEqual(state);
    expect(stabilizer.update(null, 281)).toBeNull();
  });

  it('builds original voicings, octave shifts, and chord names', () => {
    const keyA = KEY_OPTIONS[0];
    const state: ChordState = {
      degree: 'I',
      isMajorMode: true,
      qualityIndex: 1,
      octaveDown: false,
    };
    const rootVoicing = getChordFrequencies(state, keyA.tonicFrequency);
    expect(rootVoicing[0]).toBeCloseTo(220);
    expect(rootVoicing[2]).toBeCloseTo(440);
    const lowered = getChordFrequencies(
      { ...state, octaveDown: true },
      keyA.tonicFrequency
    );
    expect(lowered[0]).toBeCloseTo(110);
    expect(getChordName('III', false, 'C')).toBe('Em');

    const diminished = getChordFrequencies(
      { ...state, isMajorMode: false, qualityIndex: 4 },
      keyA.tonicFrequency
    );
    expect(diminished[2] / diminished[0]).toBeCloseTo(Math.sqrt(2));
  });

  it('maps filter extremes and computes centered cover crops', () => {
    expect(getFilterSettings(-1)).toEqual({
      frequency: 250,
      resonance: 2.2,
    });
    expect(getFilterSettings(1)).toEqual({
      frequency: 5000,
      resonance: 5.2,
    });
    expect(computeCoverRect(1920, 1080, 600, 600)).toEqual({
      sx: 420,
      sy: 0,
      sourceWidth: 1080,
      sourceHeight: 1080,
    });
    expect(computeCoverRect(640, 480, 1280, 720)).toEqual({
      sx: 0,
      sy: 60,
      sourceWidth: 640,
      sourceHeight: 360,
    });
  });

  it('fails fast for malformed landmark input', () => {
    expect(() => classifyScaleDegree([], 'Left')).toThrow(
      'Expected 21 hand landmarks, received 0'
    );
  });
});
