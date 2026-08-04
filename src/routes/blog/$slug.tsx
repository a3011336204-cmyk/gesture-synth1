import { createFileRoute, notFound } from '@tanstack/react-router';

export const Route = createFileRoute('/blog/$slug')({
  beforeLoad: () => {
    throw notFound();
  },
});
