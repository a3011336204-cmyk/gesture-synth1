import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';

export function Footer() {
  return (
    <footer className="border-t-2 border-[#b95c33] bg-[#1d2a24] text-[#f4efe5]">
      <div className="mx-auto max-w-7xl px-5 pt-14 pb-7 sm:px-8 sm:pt-16 lg:px-12">
        <div className="grid gap-12 border-b border-[#e7dcc9]/25 pb-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <div className="max-w-sm">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7dcc9]"
            >
              <span className="grid size-10 place-items-center border border-[#9b6a42] bg-[#e7dcc9] p-1 shadow-[0_10px_22px_rgba(0,0,0,0.24)] transition-transform duration-200 group-hover:-translate-y-0.5">
                <img
                  src="/images/gesture-synth-logo.png"
                  alt={`${envConfigs.app_name} logo`}
                  width={512}
                  height={512}
                  className="size-full object-contain"
                />
              </span>
              <span className="font-serif text-2xl font-bold">
                {envConfigs.app_name}
              </span>
            </Link>
            <div className="mt-6 h-px w-16 bg-[#b95c33]" aria-hidden="true" />
            <p className="mt-5 text-sm leading-6 text-[#e7dcc9]/72">
              A free online gesture synthesizer for music lovers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 text-sm sm:grid-cols-3 sm:gap-x-12">
            <div>
              <p className="border-l border-[#9b6a42] pl-3 font-semibold text-[#f4efe5]">
                Explore
              </p>
              <div className="mt-4 flex flex-col gap-3 text-[#e7dcc9]/72">
                <Link
                  href="/#features"
                  className="w-fit rounded-sm transition-colors hover:text-[#f4efe5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7dcc9]"
                >
                  Features
                </Link>
                <Link
                  href="/#tutorial"
                  className="w-fit rounded-sm transition-colors hover:text-[#f4efe5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7dcc9]"
                >
                  Tutorial
                </Link>
                <Link
                  href="/how-it-works"
                  className="w-fit rounded-sm transition-colors hover:text-[#f4efe5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7dcc9]"
                >
                  How It Works
                </Link>
                <Link
                  href="/compatibility"
                  className="w-fit rounded-sm transition-colors hover:text-[#f4efe5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7dcc9]"
                >
                  Compatibility
                </Link>
              </div>
            </div>
            <div>
              <p className="border-l border-[#9b6a42] pl-3 font-semibold text-[#f4efe5]">
                Details
              </p>
              <div className="mt-4 flex flex-col gap-3 text-[#e7dcc9]/72">
                <Link
                  href="/#technology"
                  className="w-fit rounded-sm transition-colors hover:text-[#f4efe5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7dcc9]"
                >
                  Technology
                </Link>
                <Link
                  href="/#faq"
                  className="w-fit rounded-sm transition-colors hover:text-[#f4efe5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7dcc9]"
                >
                  FAQ
                </Link>
                <Link
                  href="/camera-permission-help"
                  className="w-fit rounded-sm transition-colors hover:text-[#f4efe5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7dcc9]"
                >
                  Camera help
                </Link>
              </div>
            </div>
            <div>
              <p className="border-l border-[#9b6a42] pl-3 font-semibold text-[#f4efe5]">
                Legal
              </p>
              <div className="mt-4 flex flex-col gap-3 text-[#e7dcc9]/72">
                <Link
                  href="/privacy-policy"
                  className="w-fit rounded-sm transition-colors hover:text-[#f4efe5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7dcc9]"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms-of-service"
                  className="w-fit rounded-sm transition-colors hover:text-[#f4efe5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7dcc9]"
                >
                  Terms
                </Link>
                <Link
                  href="/contact"
                  className="w-fit rounded-sm transition-colors hover:text-[#f4efe5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7dcc9]"
                >
                  Contact
                </Link>
                <Link
                  href="/about"
                  className="w-fit rounded-sm transition-colors hover:text-[#f4efe5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7dcc9]"
                >
                  About Cian
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 pt-6">
          <div className="h-px flex-1 bg-[#e7dcc9]/20" aria-hidden="true" />
          <p className="text-right text-xs text-[#e7dcc9]/60">
            &copy; {new Date().getFullYear()} {envConfigs.app_name}. Free to
            play.
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <a
            href="https://showmebest.ai"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Featured on ShowMeBestAI"
          >
            <img
              src="https://showmebest.ai/badge/feature-badge-white.webp"
              alt="Featured on ShowMeBestAI"
              width={220}
              height={60}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
