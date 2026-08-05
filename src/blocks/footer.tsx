import { envConfigs } from '@/config';

export function Footer() {
  return (
    <footer className="bg-[#071725] text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-10 border-b border-white/10 pb-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <a href="/" className="inline-flex items-center gap-2.5">
              <img
                src="/images/gesture-synth-logo.png"
                alt=""
                width={512}
                height={512}
                className="size-7 object-contain"
              />
              <span className="font-semibold">{envConfigs.app_name}</span>
            </a>
            <p className="mt-4 text-sm leading-6 text-white/55">
              A free online gesture synthesizer for music lovers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-8 text-sm sm:grid-cols-3 sm:gap-x-16">
            <div>
              <p className="font-semibold text-white">Explore</p>
              <div className="mt-4 flex flex-col gap-3 text-white/55">
                <a href="#features" className="hover:text-white">
                  Features
                </a>
                <a href="#tutorial" className="hover:text-white">
                  Tutorial
                </a>
                <a href="/how-it-works" className="hover:text-white">
                  How It Works
                </a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white">Details</p>
              <div className="mt-4 flex flex-col gap-3 text-white/55">
                <a href="#technology" className="hover:text-white">
                  Technology
                </a>
                <a href="#faq" className="hover:text-white">
                  FAQ
                </a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white">Legal</p>
              <div className="mt-4 flex flex-col gap-3 text-white/55">
                <a href="/privacy-policy" className="hover:text-white">
                  Privacy
                </a>
                <a href="/terms-of-service" className="hover:text-white">
                  Terms
                </a>
                <a href="/contact" className="hover:text-white">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <p className="text-right text-xs text-white/45">
            &copy; {new Date().getFullYear()} {envConfigs.app_name}. Free to
            play.
          </p>
        </div>
      </div>
    </footer>
  );
}
