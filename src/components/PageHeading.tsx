import Image from 'next/image';
import site from '@site';
import TopBar from './TopBar';
import styles from './PageHeading.module.css';

interface Props {
  eyebrow?: string;
  heading: string;
  headingEm?: string;
  intro?: string;
  image?: string;
}

/** The header-image band: top bar, eyebrow, big two-line title and intro. Always uses the dark palette. */
export default function PageHeading({ eyebrow, heading, headingEm, intro, image = site.headerImage }: Props) {
  return (
    <section className={styles.band}>
      <Image className={styles.img} src={image} alt="" fill priority sizes="100vw" />
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.fade} aria-hidden="true" />
      <div className={styles.inner}>
        <TopBar name={site.name} nav={site.nav} />
      </div>
      <div className={styles.title}>
        <div className={styles.titleText}>
          {eyebrow && <p className={`mono ${styles.eyebrow}`}>{eyebrow}</p>}
          <h1 className={styles.bigTitle}>
            {heading}
            {heading && headingEm && <br />}
            {headingEm && <em>{headingEm}</em>}
          </h1>
        </div>
        {intro && <p className={styles.intro}>{intro}</p>}
      </div>
    </section>
  );
}
