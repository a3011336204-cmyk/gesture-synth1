import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { Footer } from '@/blocks/footer';
import { GestureSynthHome } from '@/blocks/gesture-synth-home';
import { Header } from '@/blocks/header';

function HomePage() {
  return (
    <div className="min-h-screen bg-[#f4f8f7] text-[#17292c]">
      <Header />
      <main>
        <GestureSynthHome />
      </main>
      <Footer />
    </div>
  );
}

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: `${envConfigs.app_name} | Make music with both hands` },
      { name: 'description', content: envConfigs.app_description },
      { property: 'og:title', content: envConfigs.app_name },
      { property: 'og:description', content: envConfigs.app_description },
      { property: 'og:image', content: '/images/gesture-synth-landscape.jpg' },
    ],
    links: [{ rel: 'canonical', href: `${envConfigs.app_url}/` }],
  }),
  component: HomePage,
});
