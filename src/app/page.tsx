import Image from 'next/image';
import site from '@site';
import { getPage } from '@/lib/content';
import { pageMeta } from '@/lib/seo';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import Prose from '@/components/Prose';
import JsonLd from '@/components/JsonLd';
import horizon from '../../public/images/horizon.jpg';

export function generateMetadata() {
  const about = getPage('about');
  return pageMeta({ description: about.description || site.description, path: '/' });
}

export default function Home() {
  const about = getPage('about');
  const lead = typeof about.data.lead === 'string' ? about.data.lead : '';
  const image = about.headerImage;

  return (
    <div className="home">
      <div className="home__horizon">
        {image === site.headerImage ? (
          <Image src={horizon} alt="" priority sizes="100vw" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" />
        )}
        {site.homeFade > 0 && <div className="home__fade" aria-hidden="true" style={{ height: `calc(${Math.min(1, site.homeFade) * 100}% + 2px)` }} />}
      </div>

      <div className="home__top">
        <TopBar name={site.name} nav={site.nav} showToggle={false} />
      </div>

      <main id="main" className="home__main">
        <Image className="home__portrait" src="/images/portrait.jpg" alt={site.name} width={180} height={180} priority />
        <h1 className="mono home__label">About</h1>
        <Prose className="home__about ul" markdown={`${lead ? `**${lead}** ` : ''}${about.body}`} />
      </main>

      <Footer variant="home" />

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: site.name,
          url: site.url,
          image: `${site.url}/images/portrait.jpg`,
          jobTitle: site.jobTitle,
          worksFor: { '@type': 'Organization', name: site.worksFor },
          homeLocation: { '@type': 'Place', name: site.home.name },
          sameAs: [...site.social.map((s) => s.href), site.substack],
        }}
      />
    </div>
  );
}
