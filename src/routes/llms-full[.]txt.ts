import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';

export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      GET: () => {
        const lines = [
          `# ${envConfigs.app_name}`,
          '',
          `> ${envConfigs.app_description}`,
          '',
          'Gesture Synth is a free browser instrument that maps two-hand gestures to chords, voicing, octave, volume, and filter controls.',
          '',
          'Camera frames and hand landmarks are processed locally with MediaPipe. Synth audio is generated with Web Audio. Optional recordings request microphone access and combine the live synth canvas with microphone and synth audio. Recordings remain local, download as MP4, and stop after five minutes. Recording does not request screen sharing or capture other tabs, windows, or the desktop.',
          '',
          'No account, payment, database, media upload, or cloud recording is required.',
          '',
          `Privacy: ${envConfigs.app_url}/privacy-policy`,
          `Terms: ${envConfigs.app_url}/terms-of-service`,
          '',
        ];
        return new Response(lines.join('\n'), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      },
    },
  },
});
