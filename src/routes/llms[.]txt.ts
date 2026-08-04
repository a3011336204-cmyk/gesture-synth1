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
          '## Pages',
          '',
          `- [Gesture Synth](${envConfigs.app_url}/): Free, no-login, browser-based gesture instrument.`,
          `- [Privacy Policy](${envConfigs.app_url}/privacy-policy): Local media processing and anonymous analytics.`,
          `- [Terms of Service](${envConfigs.app_url}/terms-of-service): Terms for using the free instrument.`,
          '',
        ];
        return new Response(lines.join('\n'), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      },
    },
  },
});
