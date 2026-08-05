# Gesture Synth

Gesture Synth is a free, no-login browser instrument controlled with both
hands. Hand tracking, sound generation, and MP4 performance recording run locally in
the browser; camera frames, microphone audio, hand landmarks, and recordings are not uploaded.

The project uses the ShipAny TanStack Start scaffold with the original Gesture
Synth behavior migrated into native React and TypeScript modules. It does not
use an iframe or retain a second application build.

## Run Locally

Requirements: Node.js 20 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000/`. The first page render preloads the local
MediaPipe model, but camera permission and Web Audio only start after clicking
`Start playing`. Microphone permission is requested only when recording starts.

## Public Configuration

```env
VITE_APP_URL=http://localhost:3000
VITE_APP_NAME=Gesture Synth
VITE_APP_DESCRIPTION=Gesture Synth is a free online gesture synthesizer. Play music with both hands, shape chords and tone, and record performances locally in your browser.

# Optional anonymous analytics
VITE_PLAUSIBLE_DOMAIN=
VITE_PLAUSIBLE_SRC=
```

No database, authentication, payment, or storage secret is required for the
public application.

## Core Modules

- `src/components/gesture-synth/gesture-synth-stage.tsx`: camera, MediaPipe,
  canvas, UI state, recording controls, and lifecycle cleanup.
- `src/components/gesture-synth/gesture-mapping.ts`: hand classification,
  chord mapping, stabilization, filter values, and canvas crop calculations.
- `src/components/gesture-synth/synth-engine.ts`: Web Audio synthesis and local
  MP4 recording from the live synth canvas with mixed microphone and generated audio.
- `src/blocks/gesture-synth-home.tsx`: product homepage content.
- `public/mediapipe/wasm/` and `public/models/hand_landmarker.task`: self-hosted
  tracking runtime and model.

The unused ShipAny backend modules remain in the repository as scaffold code,
but they are not part of the public Gesture Synth startup path.

## Verification

```bash
pnpm test
pnpm exec tsc --noEmit
pnpm build
```

The production build uses Nitro's `vercel` preset and writes the deployable
output to `.vercel/output`.

Camera, microphone, canvas capture, and MP4 recording behavior must also be checked on real
current and previous major releases of Chrome, Edge, and Safari. Firefox
support is best effort.

## Deployment

Set the public configuration values in Vercel and deploy the repository. HTTPS
is required for camera access outside localhost. Plausible is not loaded unless
one of its optional environment variables is configured.

## Source And Licenses

See `THIRD_PARTY_NOTICES.md` and `docs/source-provenance.md` for the Gesture
Synth source record, MediaPipe license details, image source, and authorization
evidence requirement. Keep the original author's primary authorization record
before publishing.

The surrounding ShipAny scaffold remains subject to the repository's `LICENSE`.
