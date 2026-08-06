import { describe, expect, it } from 'vitest';

import { TUTORIAL_VIDEO_UPLOAD_DATE } from './index';

describe('homepage structured data', () => {
  it('uses a valid upload date with an explicit timezone', () => {
    expect(TUTORIAL_VIDEO_UPLOAD_DATE).toBe('2026-08-05T20:49:26+08:00');
    expect(TUTORIAL_VIDEO_UPLOAD_DATE).toMatch(/(?:Z|[+-]\d{2}:\d{2})$/);
    expect(Number.isNaN(Date.parse(TUTORIAL_VIDEO_UPLOAD_DATE))).toBe(false);
  });
});
