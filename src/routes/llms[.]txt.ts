import { createFileRoute } from '@tanstack/react-router';

import { CANONICAL_SITE_URL, envConfigs } from '@/config';

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: () => {
        const lines = [
          `# ${envConfigs.app_name}`,
          '',
          `> ${envConfigs.app_description}`,
          '',
          'Maintained by Cian. Updated 2026-08-05.',
          '',
          '## Pages',
          '',
          `- [Gesture Synth](${CANONICAL_SITE_URL}/): Free online gesture synthesizer with no login required.`,
          `- [How Gesture Synth Works](${CANONICAL_SITE_URL}/how-it-works): Hand controls, browser requirements, local processing, and recording guidance.`,
          `- [Browser and Device Compatibility](${CANONICAL_SITE_URL}/compatibility): The verified browser boundary, prerequisites, and first-party feature limits.`,
          `- [Camera Permission Help](${CANONICAL_SITE_URL}/camera-permission-help): Practical recovery steps when browser camera access is blocked.`,
          `- [About Cian and Gesture Synth](${CANONICAL_SITE_URL}/about): Independent creator, maintainer, and product contact.`,
          `- [Contact Gesture Synth](${CANONICAL_SITE_URL}/contact): Help with playing, camera access, recording, privacy, or feedback.`,
          `- [Privacy Policy](${CANONICAL_SITE_URL}/privacy-policy): Local media processing and anonymous analytics.`,
          `- [Terms of Service](${CANONICAL_SITE_URL}/terms-of-service): Terms for using the free instrument.`,
          '',
          '## Full reference',
          '',
          `- [Full Gesture Synth reference](${CANONICAL_SITE_URL}/llms-full.txt): Product facts, local-processing boundaries, verified compatibility, and source links.`,
          '',
        ];
        return new Response(lines.join('\n'), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      },
    },
  },
});
