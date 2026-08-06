import { useEffect } from 'react';
import {
  ArrowUpRight,
  AudioLines,
  Camera,
  CirclePlay,
  Download,
  Hand,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';

import { envConfigs } from '@/config';
import { GestureSynthStage } from '@/components/gesture-synth/gesture-synth-stage';

const FEATURES = [
  {
    icon: Hand,
    title: 'Two-hand control',
    description:
      'Shape harmony with your left hand, then control voicing, octave, volume, and filter with your right. The on-stage chord and quality readouts help you connect a steady hand shape with the sound you hear.',
  },
  {
    icon: AudioLines,
    title: 'Playable sound engine',
    description:
      'Choose any of 12 keys and switch between warm, bright, and retro synth voices while you perform. The browser-native sound engine responds as your hand position changes, so you can hear a progression take shape instead of programming it first.',
  },
  {
    icon: Download,
    title: 'Local MP4 performance recording',
    description:
      'Capture the live synth display with its generated audio for up to five minutes, then download a real MP4. When you choose Record, the browser asks for microphone access and combines that audio with the performance canvas.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    description:
      'Camera frames, microphone audio, synth audio, hand landmarks, and recordings stay local and are never uploaded. Gesture Synth requests camera access when the homepage opens, while microphone access is requested only when you choose Record.',
  },
] as const;

const FIRST_CHORD_STEPS = [
  {
    icon: Camera,
    number: '01',
    label: 'Set up',
    title: 'Allow the camera',
    description:
      'Gesture Synth requests camera access when the homepage opens. Allow it to see the live preview, then select the center play button while local hand tracking loads. Keep both hands in view, use clear lighting, and leave enough room to move comfortably.',
    practiceNote:
      'Select the center play button once, then use both hands to play a chord.',
    image: '/images/gesture-synth-tutorial-start.jpg',
    imageAlt:
      'Music lover seated at a laptop with both hands comfortably visible in front of the camera',
  },
  {
    icon: Hand,
    number: '02',
    label: 'Left hand',
    title: 'Make I major',
    description:
      'Extend one finger on your left hand for I. Tilt inward for Major; a neutral tilt is Major too. Keep the shape steady until the chord label settles, then try a small outward tilt to hear the minor color.',
    practiceNote:
      'The left hand chooses the chord degree and major or minor color.',
    image: '/images/gesture-synth-tutorial-left-hand.jpg',
    imageAlt:
      'Left hand with one index finger raised against a dark teal studio background',
  },
  {
    icon: AudioLines,
    number: '03',
    label: 'Right hand',
    title: 'Add the root',
    description:
      'Extend one non-thumb finger on your right hand for root position. Raise your right hand for more volume; lower it for less. Add another non-thumb finger to hear a first inversion, then change only one control at a time.',
    practiceNote:
      'Keep the left-hand I major shape steady while you change the sound.',
    image: '/images/gesture-synth-tutorial-right-hand.jpg',
    imageAlt:
      'Right hand with one index finger raised against a dark teal studio background',
  },
] as const;

const VIDEO_TUTORIAL_CHAPTERS = [
  {
    number: '01',
    title: 'Choose a chord degree',
    description: 'Use the left hand to move between the first few degrees.',
    time: '0:00 - 0:24',
  },
  {
    number: '02',
    title: 'Shape major or minor',
    description: 'Tilt the left hand to hear the harmony change color.',
    time: '0:25 - 0:48',
  },
  {
    number: '03',
    title: 'Bring in the right hand',
    description: 'Add a voicing, then move your hand to shape the sound.',
    time: '0:49 - 1:35',
  },
] as const;

const PLAY_IDEAS = [
  {
    number: '01',
    title: 'Find a progression',
    description:
      'Choose a key, then use the left hand to move between chord degrees and major or minor color. The chord readout gives you a note name and quality to follow as you move.',
  },
  {
    number: '02',
    title: 'Give it a character',
    description:
      'Use the right hand to change voicing, octave, volume, and filter one movement at a time. Thumb position changes octave, while right-hand tilt changes the filter response.',
  },
  {
    number: '03',
    title: 'Keep the moment',
    description:
      'When a short idea lands, record it locally as an MP4 on supported browsers and choose where to share it. The downloaded file stays on your device, and Gesture Synth has no publishing workflow.',
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: 'Is Gesture Synth really free?',
    answer:
      'Yes. The instrument is free to use and does not require an account, subscription, or payment method. After the camera preview appears, select the center play button, then choose a key and sound from the controls while local hand tracking finishes loading.',
  },
  {
    question: 'Does my camera footage leave my device?',
    answer:
      'No. Hand detection, microphone mixing, and recording run in your browser. Camera frames, landmarks, microphone audio, synth audio, and recordings are not sent to our servers. You can stop camera access by closing the page, revoking the browser permission, or disabling the camera on your device.',
  },
  {
    question: 'Which browsers work best?',
    answer:
      'Gesture Synth has been tested in Google Chrome. Camera access, hand tracking, sound, canvas capture, and MP4 recording depend on the browser and device you use, so other browsers are not promised. If a feature is unavailable, read the specific message shown in the instrument before trying again.',
  },
  {
    question: 'What do my hands control?',
    answer:
      'Your left hand selects scale degree and major or minor mode. Your right hand controls chord voicing, octave, volume, and filter. One non-thumb finger on the right selects root position, while two selects a first inversion.',
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

function HeroFacts({ className }: { className?: string }) {
  return (
    <dl
      className={`grid gap-4 border-t border-[#bda78b]/70 pt-5 text-sm leading-6 text-[#56574c] lg:pb-1 ${className ?? ''}`}
    >
      <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3">
        <Camera className="mt-0.5 size-4 text-[#9a4f2e]" aria-hidden="true" />
        <div>
          <dt className="font-semibold text-[#26352d]">Camera on arrival</dt>
          <dd>The browser asks for camera access as this page opens.</dd>
        </div>
      </div>
      <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3 border-t border-[#c6b299]/65 pt-4">
        <ShieldCheck
          className="mt-0.5 size-4 text-[#9a4f2e]"
          aria-hidden="true"
        />
        <div>
          <dt className="font-semibold text-[#26352d]">Free and local</dt>
          <dd>
            No sign-up; camera, sound, and recordings stay on your device.
          </dd>
        </div>
      </div>
    </dl>
  );
}

function focusSynthStart(options?: { preventScroll?: boolean }) {
  window.requestAnimationFrame(() => {
    const startButton = document.getElementById('gesture-synth-start');
    const focusTarget =
      startButton ?? document.getElementById('gesture-synth-stage');
    if (focusTarget instanceof HTMLElement) {
      focusTarget.focus({ preventScroll: options?.preventScroll ?? false });
    }
  });
}

export function GestureSynthHome() {
  useEffect(() => {
    const focusFromHash = () => {
      if (window.location.hash !== '#gesture-synth-stage') return;
      document
        .getElementById('gesture-synth-stage')
        ?.scrollIntoView({ block: 'start' });
      focusSynthStart({ preventScroll: true });
    };

    focusFromHash();
    window.addEventListener('hashchange', focusFromHash);
    return () => window.removeEventListener('hashchange', focusFromHash);
  }, []);

  return (
    <>
      <section
        id="play"
        className="relative isolate overflow-hidden bg-[#eee7da] text-[#1d2a24]"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[#e3d6c3]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1440px] px-5 pt-24 pb-10 sm:px-8 sm:pt-32 sm:pb-14 lg:px-12">
          <div className="grid gap-9 border-b border-[#bda78b]/65 pb-9 lg:grid-cols-[minmax(0,1.15fr)_minmax(17rem,0.55fr)] lg:items-end lg:gap-16 lg:pb-12">
            <div className="max-w-4xl">
              <h1 className="max-w-3xl font-serif text-[2.625rem] leading-[0.96] text-balance text-[#173329] sm:text-6xl lg:text-7xl">
                Gesture Synth, a free online gesture synthesizer.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#4e5147] sm:mt-6 sm:text-xl sm:leading-8">
                Make chords with your hands. Shape harmony, voicing, octave,
                volume, and filter in real time, then keep a short local take
                when an idea lands.
              </p>
            </div>

            <HeroFacts className="hidden lg:grid" />
          </div>

          <div className="mt-8 border border-[#846248]/45 bg-[#9b6a42] p-2 shadow-[0_24px_54px_rgba(78,52,30,0.22)] sm:mt-10 sm:p-3">
            <GestureSynthStage />
          </div>

          <HeroFacts className="mt-7 lg:hidden" />

          <div className="grid gap-4 border-x border-b border-[#bda78b]/65 bg-[#f4eee4] px-5 py-5 text-sm leading-6 text-[#5d5a50] sm:grid-cols-3 sm:px-7 sm:py-5">
            <p>
              <span className="font-semibold text-[#26352d]">1.</span> Keep both
              hands in frame with enough light to move comfortably.
            </p>
            <p>
              <span className="font-semibold text-[#26352d]">2.</span> Select
              the round center control once the preview is ready to start sound.
            </p>
            <p>
              <span className="font-semibold text-[#26352d]">3.</span> Use the
              red Record control when you want a local MP4 take.
            </p>
          </div>
        </div>
      </section>

      <section
        id="tutorial"
        aria-labelledby="tutorial-heading"
        className="scroll-mt-8 bg-[#1d2a24] py-16 text-white sm:py-20 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.6fr)] lg:items-center lg:gap-20 lg:px-12">
          <div className="max-w-2xl">
            <h2
              id="tutorial-heading"
              className="max-w-xl font-serif text-4xl leading-[1.02] text-[#f7f0e4] sm:text-5xl"
            >
              Learn your first Gesture Synth chord in 95 seconds.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#d9d1c4]">
              Learn the gesture map in 95 seconds, then open the instrument
              while the hand movement is still fresh. The written steps stay
              here when you need a quick reminder while you play.
            </p>

            <ol className="mt-9 divide-y divide-[#c3b59f]/35 border-y border-[#c3b59f]/35">
              {VIDEO_TUTORIAL_CHAPTERS.map(
                ({ number, title, description, time }) => (
                  <li
                    key={number}
                    className="grid grid-cols-[36px_minmax(0,1fr)_auto] gap-x-4 py-4 sm:grid-cols-[40px_minmax(0,1fr)_auto]"
                  >
                    <span className="font-serif text-xl text-[#e2a16c] sm:text-2xl">
                      {number}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[#f8f3eb] sm:text-base">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[#c8c1b5]">
                        {description}
                      </p>
                    </div>
                    <span className="pt-0.5 text-right font-mono text-xs text-[#bdb4a5]">
                      {time}
                    </span>
                  </li>
                )
              )}
            </ol>

            <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center">
              <a
                href="#gesture-synth-stage"
                onClick={() => focusSynthStart()}
                className="inline-flex min-h-12 w-fit items-center gap-2 rounded-md bg-[#a8502f] px-5 py-3 text-sm font-semibold text-[#fff7eb] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#913f24] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2c38d] active:translate-y-0"
              >
                <CirclePlay className="size-5" aria-hidden="true" />
                Try the first chord
              </a>
              <p className="inline-flex items-center gap-2 text-sm font-medium text-[#d7d0c3]">
                <span
                  className="size-2 rounded-full bg-[#d9a36f]"
                  aria-hidden="true"
                />
                Tested in Google Chrome
              </p>
            </div>
          </div>

          <figure className="mx-auto w-full max-w-[390px] lg:justify-self-end">
            <div className="border border-[#bda78b]/60 bg-[#e7dcc9] p-2 shadow-[0_22px_52px_rgba(0,0,0,0.3)] sm:p-3">
              <video
                controls
                playsInline
                preload="metadata"
                width={720}
                height={1280}
                poster="/images/gesture-synth-first-chord-tutorial-poster.jpg"
                aria-describedby="tutorial-video-summary"
                className="aspect-[9/16] w-full bg-black object-contain"
              >
                <source
                  src="/videos/gesture-synth-first-chord-tutorial.mp4"
                  type="video/mp4"
                />
                Your browser cannot play this tutorial video.
              </video>
            </div>
            <figcaption
              id="tutorial-video-summary"
              className="mt-4 text-sm leading-6 text-[#c9c0b3]"
            >
              A first-chord walkthrough with the live hand landmarks and chord
              feedback visible on screen.
            </figcaption>
          </figure>
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-8 bg-[#f4eee4] py-20 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div>
              <h2 className="max-w-md font-serif text-4xl leading-[1.02] text-[#213128] sm:text-5xl">
                A complete online gesture synthesizer, already in your browser
              </h2>
              <p className="mt-6 max-w-md text-base leading-7 text-[#5a564c]">
                Gesture Synth is a hand-tracking music tool that turns camera
                input into responsive musical control without accounts,
                downloads, or specialist hardware. Learn how hand tracking,
                browser support, recording, and privacy work before you play.
                Practice a progression, explore a sound, or sketch a musical
                idea from a laptop browser.
              </p>
              <a
                href="/how-it-works"
                className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-[#8c4529] transition-colors hover:text-[#69301d]"
              >
                Read how Gesture Synth works
              </a>
            </div>

            <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <article key={title} className="border-t border-[#c6b299] pt-5">
                  <Icon className="size-5 text-[#9a4f2e]" strokeWidth={1.6} />
                  <h3 className="mt-5 text-lg font-semibold text-[#26352d]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#615c51]">
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
        className="scroll-mt-8 bg-[#ded1bc] py-20 text-[#26352d] sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:gap-16">
            <div className="max-w-3xl">
              <h2 className="font-serif text-4xl leading-[1.02] sm:text-5xl">
                Play your first Gesture Synth chord, one movement at a time
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[#5c594f]">
              Allow camera access, select the center play button, make an I
              major chord with your left hand, then add a root-position voice
              with your right. This is the shortest path from camera permission
              to a playable sound. Let the visual readout settle before changing
              the next gesture; it makes the connection between movement and
              music easier to hear.
            </p>
          </div>

          <div className="mt-12 grid gap-10 md:grid-cols-[1.2fr_0.9fr_0.9fr] md:gap-6 lg:mt-14 lg:gap-8">
            {FIRST_CHORD_STEPS.map(
              ({
                icon: Icon,
                number,
                label,
                title,
                description,
                practiceNote,
                image,
                imageAlt,
              }) => (
                <article key={title} className="border-t border-[#a99072] pt-5">
                  <div className="relative aspect-[3/2] overflow-hidden bg-[#5f4836]">
                    <img
                      src={image}
                      alt={imageAlt}
                      width={1200}
                      height={800}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover"
                    />
                    <span className="absolute top-4 left-4 bg-[#f4eee4]/94 px-2.5 py-1 font-serif text-sm text-[#934826] shadow-[0_4px_12px_rgba(38,29,20,0.18)]">
                      {number}
                    </span>
                  </div>
                  <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#8c4529]">
                    <Icon className="size-4" strokeWidth={1.6} />
                    {label}
                  </div>
                  <h3 className="mt-3 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#5a574d]">
                    {description}
                  </p>
                  <p className="mt-4 border-t border-[#bf7650] pt-3 text-sm leading-6 text-[#333e34]">
                    {practiceNote}
                  </p>
                </article>
              )
            )}
          </div>

          <div className="mt-12 flex flex-col gap-6 border-y border-[#a99072] py-7 sm:mt-14 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-3xl text-sm leading-7 text-[#5a574d]">
              Ready to capture it? Use the red Record control to request
              microphone access and save a local MP4 on supported browsers. The
              downloaded MP4 captures the performance stage only, not the rest
              of your screen.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold">
              <a
                href="#gesture-synth-stage"
                onClick={() => focusSynthStart()}
                className="inline-flex min-h-11 items-center gap-2 text-[#8c4529] transition-colors hover:text-[#69301d]"
              >
                Try your first chord
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
              <a
                href="/how-it-works"
                className="inline-flex min-h-11 items-center gap-2 text-[#384e42] transition-colors hover:text-[#1d2a24]"
              >
                Read the full gesture guide
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        id="ways-to-play"
        className="scroll-mt-8 bg-[#f4eee4] py-20 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <figure>
              <img
                src="/images/gesture-synth-hand-tracking.jpg"
                alt="Two hands raised in front of a laptop with illustrated hand-tracking landmarks"
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
                className="aspect-[3/2] w-full border border-[#c6b299] object-cover"
              />
              <figcaption className="mt-4 max-w-lg text-sm leading-6 text-[#696359]">
                The left hand chooses the harmony. The right hand changes the
                chord&apos;s voicing, octave, volume, and filter.
              </figcaption>
            </figure>

            <div>
              <h2 className="max-w-xl font-serif text-4xl leading-[1.02] text-[#26352d] sm:text-5xl">
                Use an online gesture synthesizer to turn a small movement into
                a musical idea
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#5a564c]">
                Gesture Synth is built for the moment before an idea becomes a
                full track: explore a progression, shape its feel, then capture
                a short take while it is still fresh. Try a familiar I-IV-V
                movement, test a chord voicing, or find a texture before opening
                a larger music project.
              </p>

              <div className="mt-8 divide-y divide-[#c6b299] border-y border-[#c6b299]">
                {PLAY_IDEAS.map(({ number, title, description }) => (
                  <article
                    key={title}
                    className="grid gap-3 py-5 sm:grid-cols-[44px_1fr]"
                  >
                    <span className="font-serif text-lg text-[#9a4f2e]">
                      {number}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-[#26352d]">
                        {title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#615c51]">
                        {description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <a
                href="/how-it-works"
                className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#8c4529] transition-colors hover:text-[#69301d]"
              >
                Read the full gesture guide
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="mt-16 grid items-center gap-10 border-t border-[#c6b299] pt-16 lg:mt-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:pt-24">
            <div className="lg:order-2">
              <h2 className="max-w-xl font-serif text-4xl leading-[1.02] text-[#26352d] sm:text-5xl">
                Record a Gesture Synth idea locally, then decide what happens
                next
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#5a564c]">
                Recording starts only when you choose it and may ask for
                microphone access. On supported browsers, Gesture Synth mixes
                the live visual, your microphone, and the generated synth into a
                local MP4 download. There is no built-in publishing step. The
                MP4 captures only the performance canvas, not page controls,
                other tabs, application windows, or your desktop screen.
              </p>
              <a
                href="/how-it-works"
                className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#8c4529] transition-colors hover:text-[#69301d]"
              >
                See recording details
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>

            <figure className="lg:order-1">
              <img
                src="/images/gesture-synth-recording-idea.jpg"
                alt="Music maker seated at a laptop in a home studio"
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
                className="aspect-[3/2] w-full border border-[#c6b299] object-cover"
              />
              <figcaption className="mt-4 max-w-lg text-sm leading-6 text-[#696359]">
                Your recording stays under your control after the browser
                downloads it.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section
        id="technology"
        className="scroll-mt-8 bg-[#26352d] py-20 text-white sm:py-28"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-12">
          <div>
            <h2 className="max-w-xl font-serif text-4xl leading-[1.02] text-[#f6eee0] sm:text-5xl">
              How this hand-tracking music tool works locally
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#d6cdc0]">
              MediaPipe estimates 21 landmarks per hand. A lightweight gesture
              mapper turns those positions into stable musical states, then Web
              Audio responds without a server round trip. The tracker tries GPU
              processing first and falls back to CPU when needed, giving
              compatible devices a second path to start the instrument.
            </p>
          </div>

          <div className="divide-y divide-[#d8c7ae]/30 border-y border-[#d8c7ae]/30">
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
                <span className="font-mono text-xs text-[#e0a06d]">
                  {label}
                </span>
                <span className="text-sm text-[#e1d8cb]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-8 bg-[#eee7da] py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl leading-[1.02] text-[#26352d] sm:text-5xl">
              Before you start
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#5a564c]">
              A few practical details before you put your hands in frame.
            </p>
          </div>

          <div className="mt-12 border-t border-[#c6b299]">
            {FAQ_ITEMS.map(({ question, answer }) => (
              <details
                key={question}
                className="group border-b border-[#c6b299] py-1"
              >
                <summary className="cursor-pointer py-5 pr-6 text-base font-semibold text-[#26352d] marker:text-[#9a4f2e] sm:text-lg">
                  {question}
                </summary>
                <p className="max-w-3xl pb-6 text-sm leading-7 text-[#615c51]">
                  {answer}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-14 flex flex-col gap-6 border-t border-[#c6b299] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex max-w-xl gap-4">
              <LockKeyhole className="mt-0.5 size-6 shrink-0 text-[#9a4f2e]" />
              <div>
                <h3 className="font-semibold text-[#26352d]">
                  Your performance stays yours
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#615c51]">
                  Review how local media processing and anonymous usage metrics
                  work before you play.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#8c4529]">
              <a
                href="/how-it-works"
                className="transition-colors hover:text-[#69301d]"
              >
                How it works
              </a>
              <a
                href="/privacy-policy"
                className="transition-colors hover:text-[#69301d]"
              >
                Privacy
              </a>
              <a
                href="/terms-of-service"
                className="transition-colors hover:text-[#69301d]"
              >
                Terms
              </a>
              <a
                href="/contact"
                className="transition-colors hover:text-[#69301d]"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#a8502f] py-16 text-[#fff8ef] sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-12">
          <div className="max-w-2xl">
            <h2 className="max-w-xl font-serif text-4xl leading-[1.02] sm:text-5xl">
              Put your hands in frame and make the first chord.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#fff7eb]">
              No account is required. Camera access is requested as the homepage
              opens; sound starts after one click or touch.
            </p>
          </div>

          <a
            href="#gesture-synth-stage"
            onClick={() => focusSynthStart()}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-md bg-[#203128] px-5 py-3 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#14231c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffdab3] active:translate-y-0"
          >
            <CirclePlay className="size-5" aria-hidden="true" />
            Play Gesture Synth
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </section>
    </>
  );
}
