import type { CSSProperties } from 'react';
import Image from 'next/image';
import site from '@site';
import { getPage } from '@/lib/content';
import { pageMeta } from '@/lib/seo';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import Prose from '@/components/Prose';
import JsonLd from '@/components/JsonLd';
import horizon from '../../public/images/horizon.jpg';
import styles from './page.module.css';

/** Turns the `label:` settings in about.md into CSS variables for the "About" label. Unknown or empty values are skipped. */
function labelVars(raw: unknown): CSSProperties {
  if (!raw || typeof raw !== 'object') return {};
  const o = raw as Record<string, unknown>;
  const text = (v: unknown) => (typeof v === 'number' || typeof v === 'string' ? String(v).trim() : '');
  const vars: Record<string, string> = {};
  const set = (name: string, value: string) => {
    if (value && /^[#a-zA-Z0-9.,()%\s-]+$/.test(value)) vars[name] = value;
  };
  set('--label-size', /^\d+(\.\d+)?$/.test(text(o.size)) ? `${text(o.size)}px` : text(o.size));
  set('--label-weight', text(o.weight));
  set('--label-spacing', text(o.spacing));
  if (o.font === 'serif' || o.font === 'mono') vars['--label-font'] = `var(--${o.font})`;
  if (o.case === 'uppercase' || o.case === 'none') vars['--label-case'] = o.case;
  set('--label-color', text(o.color));
  if (o.shadow === false) vars['--label-shadow'] = 'none';
  return vars as CSSProperties;
}

export function generateMetadata() {
  const about = getPage('about');
  return pageMeta({ description: about.description || site.description, path: '/' });
}

export default function Home() {
  const about = getPage('about');
  const lead = typeof about.data.lead === 'string' ? about.data.lead : '';
  const labelStyle = labelVars(about.data.label);
  const image = about.headerImage;

  return (
    <div className={styles.home}>
      <div className={styles.horizon}>
        {image === site.headerImage ? (
          <Image src={horizon} alt="" priority sizes="100vw" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" />
        )}
        {site.homeFade > 0 && <div className={styles.fade} aria-hidden="true" style={{ height: `calc(${Math.min(1, site.homeFade) * 100}% + 2px)` }} />}
      </div>

      <div className={styles.top}>
        <TopBar name={site.name} nav={site.nav} showToggle={false} />
      </div>

      <main id="main" className={styles.main}>
        <Image className={styles.portrait} src="/images/portrait.jpg" alt={site.name} width={180} height={180} priority />
        <h1 className={`mono ${styles.label}`} style={labelStyle}>
          {about.title}
        </h1>
        <Prose bare className={`${styles.about} ul`} markdown={`${lead ? `**${lead}** ` : ''}${about.body}`} />
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
