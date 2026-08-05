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
  head: () => {
    const homepageUrl = new URL('/', envConfigs.app_url).href;
    const socialImageUrl = new URL(
      '/images/gesture-synth-landscape.jpg',
      envConfigs.app_url
    ).href;

    return {
      meta: [
        {
          title: `${envConfigs.app_name} | Online Gesture Synthesizer`,
        },
        { name: 'description', content: envConfigs.app_description },
        {
          property: 'og:title',
          content: `${envConfigs.app_name} | Online Gesture Synthesizer`,
        },
        { property: 'og:description', content: envConfigs.app_description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: homepageUrl },
        { property: 'og:image', content: socialImageUrl },
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: `${envConfigs.app_name} | Online Gesture Synthesizer`,
        },
        { name: 'twitter:description', content: envConfigs.app_description },
        { name: 'twitter:image', content: socialImageUrl },
      ],
      links: [{ rel: 'canonical', href: homepageUrl }],
    };
  },
  component: HomePage,
});
