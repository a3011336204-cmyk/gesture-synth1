import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { Footer } from '@/blocks/footer';
import { GestureSynthHome } from '@/blocks/gesture-synth-home';
import { Header } from '@/blocks/header';

function getHomepageUrl() {
  return new URL('/', envConfigs.app_url).href;
}

function HomePage() {
  const webApplicationJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: envConfigs.app_name,
    url: getHomepageUrl(),
    description: envConfigs.app_description,
    applicationCategory: 'Music application',
    applicationSubCategory: 'Online gesture synthesizer',
    isAccessibleForFree: true,
    browserRequirements: 'Tested in Google Chrome',
    featureList: [
      'No sign-in required',
      'Two-hand gesture control for chords, voicing, octave, volume, and filter',
      'Local browser processing',
    ],
    creator: {
      '@type': 'Person',
      name: 'Cian',
    },
  }).replace(/</g, '\\u003c');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: webApplicationJsonLd }}
      />
      <div className="min-h-screen bg-[#f4f8f7] text-[#17292c]">
        <Header />
        <main>
          <GestureSynthHome />
        </main>
        <Footer />
      </div>
    </>
  );
}

export const Route = createFileRoute('/')({
  head: () => {
    const homepageUrl = getHomepageUrl();
    const socialImageUrl = new URL(
      '/images/gesture-synth-hand-tracking.jpg',
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
