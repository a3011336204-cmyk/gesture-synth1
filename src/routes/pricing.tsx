import { createFileRoute, notFound } from '@tanstack/react-router';

export const Route = createFileRoute('/pricing')({
  beforeLoad: () => {
    throw notFound();
  },
});
