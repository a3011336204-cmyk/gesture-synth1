import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

class TestResizeObserver implements ResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(target: Element): void {
    this.callback(
      [
        {
          target,
          contentRect: target.getBoundingClientRect(),
        } as ResizeObserverEntry,
      ],
      this
    );
  }

  disconnect(): void {}
  unobserve(): void {}
}

vi.stubGlobal('ResizeObserver', TestResizeObserver);

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
