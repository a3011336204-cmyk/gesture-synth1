import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/ads.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response('', {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        }),
    },
  },
});
