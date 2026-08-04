import { describe, expect, it } from 'vitest';

import { selectRecordingMimeType } from './synth-engine';

describe('recording MIME selection', () => {
  it('prefers MP4 with H.264 and AAC when available', () => {
    expect(selectRecordingMimeType(() => true)).toBe(
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2'
    );
  });

  it('falls back to generic MP4 support', () => {
    expect(
      selectRecordingMimeType((mimeType) => mimeType === 'video/mp4')
    ).toBe('video/mp4');
  });

  it('does not accept WebM when MP4 is unavailable', () => {
    expect(
      selectRecordingMimeType((mimeType) => mimeType === 'video/webm')
    ).toBeNull();
  });
});
