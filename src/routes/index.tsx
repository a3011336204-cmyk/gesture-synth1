import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { Footer } from '@/blocks/footer';
import { FAQ_ITEMS, GestureSynthHome } from '@/blocks/gesture-synth-home';
import { Header } from '@/blocks/header';

function getHomepageUrl() {
  return new URL('/', envConfigs.app_url).href;
}

function getAssetUrl(path: string) {
  return new URL(path, envConfigs.app_url).href;
}

function HomePage() {
  const homepageUrl = getHomepageUrl();
  const socialImageUrl = getAssetUrl('/images/gesture-synth-hand-tracking.jpg');
  const structuredDataJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${homepageUrl}#website`,
        name: envConfigs.app_name,
        url: homepageUrl,
        inLanguage: 'en',
      },
      {
        '@type': 'WebApplication',
        '@id': `${homepageUrl}#webapplication`,
        name: envConfigs.app_name,
        url: homepageUrl,
        image: socialImageUrl,
        description: envConfigs.app_description,
        applicationCategory: 'Music application',
        applicationSubCategory: 'Online gesture synthesizer',
        operatingSystem: 'Web browser',
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
        isPartOf: {
          '@id': `${homepageUrl}#website`,
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${homepageUrl}#faq`,
        mainEntity: FAQ_ITEMS.map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: answer,
          },
        })),
      },
    ],
  }).replace(/</g, '\\u003c');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredDataJsonLd }}
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
    const socialImageUrl = getAssetUrl(
      '/images/gesture-synth-hand-tracking.jpg'
    );

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
