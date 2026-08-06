import { createFileRoute } from '@tanstack/react-router';

import { CANONICAL_SITE_URL, envConfigs } from '@/config';

export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      GET: () => {
        const lines = [
          `# ${envConfigs.app_name}`,
          '',
          `> ${envConfigs.app_description}`,
          '',
          'Maintained by Cian. Updated 2026-08-05. Contact: a3011336204@gmail.com.',
          '',
          'Gesture Synth is a free online gesture synthesizer that maps two-hand gestures to chords, voicing, octave, volume, and filter controls.',
          '',
          'Camera frames and hand landmarks are processed locally with MediaPipe. Synth audio is generated with Web Audio. Optional recordings request microphone access and combine the live synth canvas with microphone and synth audio. Recordings remain local, download as MP4, and stop after five minutes. Recording does not request screen sharing or capture other tabs, windows, or the desktop.',
          '',
          'No account, payment, database, media upload, or cloud recording is required.',
          '',
          `How it works: ${CANONICAL_SITE_URL}/how-it-works`,
          `Compatibility: ${CANONICAL_SITE_URL}/compatibility`,
          `Camera permission help: ${CANONICAL_SITE_URL}/camera-permission-help`,
          `About the creator: ${CANONICAL_SITE_URL}/about`,
          `Contact: ${CANONICAL_SITE_URL}/contact`,
          `Privacy: ${CANONICAL_SITE_URL}/privacy-policy`,
          `Terms: ${CANONICAL_SITE_URL}/terms-of-service`,
          '',
          'Primary references:',
          '- MediaPipe Hand Landmarker for web: https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js',
          '- MDN getUserMedia: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia',
          '- MDN Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API',
          '- MDN MediaRecorder: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder',
          '',
        ];
        return new Response(lines.join('\n'), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      },
    },
  },
});
