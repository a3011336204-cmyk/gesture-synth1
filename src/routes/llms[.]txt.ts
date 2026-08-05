import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';

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
          `- [Gesture Synth](${envConfigs.app_url}/): Free online gesture synthesizer with no login required.`,
          `- [How Gesture Synth Works](${envConfigs.app_url}/how-it-works): Hand controls, browser requirements, local processing, and recording guidance.`,
          `- [Browser and Device Compatibility](${envConfigs.app_url}/compatibility): The verified browser boundary, prerequisites, and first-party feature limits.`,
          `- [Camera Permission Help](${envConfigs.app_url}/camera-permission-help): Practical recovery steps when browser camera access is blocked.`,
          `- [About Cian and Gesture Synth](${envConfigs.app_url}/about): Independent creator, maintainer, and product contact.`,
          `- [Contact Gesture Synth](${envConfigs.app_url}/contact): Help with playing, camera access, recording, privacy, or feedback.`,
          `- [Privacy Policy](${envConfigs.app_url}/privacy-policy): Local media processing and anonymous analytics.`,
          `- [Terms of Service](${envConfigs.app_url}/terms-of-service): Terms for using the free instrument.`,
          '',
          '## Full reference',
          '',
          `- [Full Gesture Synth reference](${envConfigs.app_url}/llms-full.txt): Product facts, local-processing boundaries, verified compatibility, and source links.`,
          '',
        ];
        return new Response(lines.join('\n'), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      },
    },
  },
});
