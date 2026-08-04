import {
  AudioLines,
  Camera,
  Download,
  Hand,
  LockKeyhole,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
  Waves,
} from 'lucide-react';

import { envConfigs } from '@/config';
import { GestureSynthStage } from '@/components/gesture-synth/gesture-synth-stage';

const FEATURES = [
  {
    icon: Hand,
    title: 'Two-hand control',
    description:
      'Shape harmony with your left hand, then control voicing, octave, volume, and filter with your right.',
  },
  {
    icon: AudioLines,
    title: 'Playable sound engine',
    description:
      'Choose any of 12 keys and switch between warm, bright, and retro synth voices while you perform.',
  },
  {
    icon: Download,
    title: 'Local MP4 performance recording',
    description:
      'Capture the live synth display with its generated audio for up to five minutes, then download a real MP4.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    description:
      'Camera frames, microphone audio, synth audio, hand landmarks, and recordings stay local and are never uploaded.',
  },
] as const;

const STEPS = [
  {
    icon: MousePointerClick,
    title: 'Start the instrument',
    description: 'Open the stage and click Start playing. No account or setup.',
  },
  {
    icon: Camera,
    title: 'Allow camera access',
    description:
      'Your browser connects the front camera for on-device tracking.',
  },
  {
    icon: Waves,
    title: 'Move, listen, record',
    description:
      'Bring both hands into view, then allow microphone access only when you choose to record.',
  },
] as const;

const FAQ_ITEMS = [
  {
    question: 'Is Gesture Synth really free?',
    answer:
      'Yes. The instrument is free to use and does not require an account, subscription, or payment method.',
  },
  {
    question: 'Does my camera footage leave my device?',
    answer:
      'No. Hand detection, microphone mixing, and recording run in your browser. Camera frames, landmarks, microphone audio, synth audio, and recordings are not sent to our servers.',
  },
  {
    question: 'Which browsers work best?',
    answer:
      'Use the latest or previous major release of Chrome, Edge, or Safari. MP4 recording requires microphone access, canvas capture, and MP4 MediaRecorder support. Firefox and mobile recording are supported on a best-effort basis.',
  },
  {
    question: 'What do my hands control?',
    answer:
      'Your left hand selects scale degree and major or minor mode. Your right hand controls chord voicing, octave, volume, and filter.',
  },
  {
    question: 'What does the recording include?',
    answer:
      'The live synth canvas, including camera video, hand landmarks, and visual feedback, plus microphone audio and the generated synth output. Page controls, other tabs, and your desktop are not included. Recording stops automatically after five minutes.',
  },
  {
    question: 'Why does camera access require HTTPS?',
    answer:
      'Modern browsers only expose cameras to secure pages. Localhost works during development; public deployments must use HTTPS.',
  },
] as const;

export function GestureSynthHome() {
  return (
    <>
      <section
        className="relative isolate overflow-hidden bg-[#176a98] bg-cover bg-center text-white"
        style={{
          backgroundImage: "url('/images/gesture-synth-landscape.jpg')",
        }}
      >
        <div className="absolute inset-0 -z-10 bg-[#0b5e91]/60" />
        <div className="mx-auto max-w-[1440px] px-4 pt-28 pb-12 sm:px-8 sm:pt-32 sm:pb-16 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur">
              <Sparkles className="size-3.5 text-[#a9fff6]" />
              Free in your browser. No sign-up.
            </p>
            <h1 className="mt-7 text-5xl font-bold sm:text-6xl lg:text-7xl">
              {envConfigs.app_name}
            </h1>
            <p className="mt-5 text-2xl font-semibold text-white/95 sm:text-3xl">
              Make music with both hands.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
              Turn gestures into chords, tone, and movement. Nothing to install,
              nothing to learn before you begin.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-7xl sm:mt-12">
            <GestureSynthStage />
          </div>
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-8 bg-[#f4f8f7] py-20 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <div>
              <p className="text-xs font-bold text-[#137b75] uppercase">
                Features
              </p>
              <h2 className="mt-4 max-w-md text-3xl font-bold text-[#102a2c] sm:text-4xl">
                A complete instrument, already in your browser
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-[#496266]">
                Gesture Synth turns camera input into responsive musical control
                without accounts, downloads, or specialist hardware.
              </p>
            </div>

            <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <article key={title} className="border-t border-[#b8ccca] pt-5">
                  <Icon className="size-6 text-[#137b75]" strokeWidth={1.8} />
                  <h3 className="mt-5 text-lg font-bold text-[#102a2c]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#5a7073]">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-8 bg-white py-20 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <p className="text-xs font-bold text-[#b26026] uppercase">
              How It Works
            </p>
            <h2 className="mt-4 text-3xl font-bold text-[#17292c] sm:text-4xl">
              From first click to first chord
            </h2>
          </div>

          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-0">
            {STEPS.map(({ icon: Icon, title, description }, index) => (
              <article
                key={title}
                className="relative border-t border-[#d9e2e0] pt-6 md:border-t-0 md:border-l md:px-8 md:first:border-l-0 md:first:pl-0"
              >
                <div className="flex items-center justify-between">
                  <Icon className="size-6 text-[#b26026]" strokeWidth={1.8} />
                  <span className="font-mono text-xs text-[#8a9a9c]">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-bold text-[#17292c]">
                  {title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-[#637477]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="technology"
        className="scroll-mt-8 bg-[#0d282b] py-20 text-white sm:py-28"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-12">
          <div>
            <p className="text-xs font-bold text-[#75dfd2] uppercase">
              Technology
            </p>
            <h2 className="mt-4 max-w-xl text-3xl font-bold sm:text-4xl">
              Real-time music, computed locally
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/60">
              MediaPipe estimates 21 landmarks per hand. A lightweight gesture
              mapper turns those positions into stable musical states, then Web
              Audio responds without a server round trip.
            </p>
          </div>

          <div className="divide-y divide-white/12 border-y border-white/12">
            {[
              ['Tracking', 'MediaPipe Tasks Vision, GPU with CPU fallback'],
              ['Sound', 'Browser-native Web Audio synthesis'],
              ['Recording', 'Canvas, microphone, and synth audio MP4'],
              ['Network', 'No camera, landmark, or recording uploads'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="grid gap-2 py-5 sm:grid-cols-[120px_1fr] sm:items-center"
              >
                <span className="font-mono text-xs text-[#75dfd2]">
                  {label}
                </span>
                <span className="text-sm text-white/72">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-8 bg-[#f4f8f7] py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center">
            <p className="text-xs font-bold text-[#137b75] uppercase">FAQ</p>
            <h2 className="mt-4 text-3xl font-bold text-[#17292c] sm:text-4xl">
              Before you start
            </h2>
          </div>

          <div className="mt-12 border-t border-[#becdcb]">
            {FAQ_ITEMS.map(({ question, answer }) => (
              <details
                key={question}
                className="group border-b border-[#becdcb] py-1"
              >
                <summary className="cursor-pointer py-5 pr-6 text-base font-semibold text-[#17292c] marker:text-[#137b75] sm:text-lg">
                  {question}
                </summary>
                <p className="max-w-3xl pb-6 text-sm leading-7 text-[#5b7073]">
                  {answer}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-14 flex flex-col gap-6 border-t border-[#becdcb] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex max-w-xl gap-4">
              <LockKeyhole className="mt-0.5 size-6 shrink-0 text-[#137b75]" />
              <div>
                <h3 className="font-bold text-[#17292c]">
                  Your performance stays yours
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#5b7073]">
                  Review how local media processing and anonymous usage metrics
                  work before you play.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-5 text-sm font-semibold text-[#137b75]">
              <a href="/privacy-policy" className="hover:text-[#0b5550]">
                Privacy
              </a>
              <a href="/terms-of-service" className="hover:text-[#0b5550]">
                Terms
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
