import { describe, expect, it } from 'vitest';

import { getCanonicalSiteRedirect } from './server';

describe('getCanonicalSiteRedirect', () => {
  it('redirects the legacy Vercel host and preserves the path and query', () => {
    const response = getCanonicalSiteRedirect(
      new Request(
        'https://gesture-synth-five.vercel.app/how-it-works?utm_source=test'
      )
    );

    expect(response?.status).toBe(308);
    expect(response?.headers.get('location')).toBe(
      'https://www.gesturesynth.co/how-it-works?utm_source=test'
    );
  });

  it('redirects the non-www host directly to the canonical origin', () => {
    const response = getCanonicalSiteRedirect(
      new Request('http://gesturesynth.co/robots.txt')
    );

    expect(response?.status).toBe(308);
    expect(response?.headers.get('location')).toBe(
      'https://www.gesturesynth.co/robots.txt'
    );
  });

  it('upgrades an HTTP request on the canonical hostname', () => {
    const response = getCanonicalSiteRedirect(
      new Request('http://www.gesturesynth.co/how-it-works')
    );

    expect(response?.status).toBe(308);
    expect(response?.headers.get('location')).toBe(
      'https://www.gesturesynth.co/how-it-works'
    );
  });

  it('does not redirect the canonical host or a similar hostname', () => {
    expect(
      getCanonicalSiteRedirect(new Request('https://www.gesturesynth.co/'))
    ).toBeNull();
    expect(
      getCanonicalSiteRedirect(
        new Request('https://gesture-synth-five.vercel.app.example.com/')
      )
    ).toBeNull();
  });

  it('keeps a double-slash path on the canonical host', () => {
    const response = getCanonicalSiteRedirect(
      new Request('https://gesture-synth-five.vercel.app//example.com/path')
    );

    expect(response?.headers.get('location')).toBe(
      'https://www.gesturesynth.co//example.com/path'
    );
  });
});
