import Image from 'next/image';
import site from '@site';
import TopBar from './TopBar';

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
    <section className="heading-band on-image">
      <Image className="heading-band__img" src={image} alt="" fill priority sizes="100vw" />
      <div className="heading-band__scrim" aria-hidden="true" />
      <div className="heading-band__inner">
        <TopBar name={site.name} nav={site.nav} />
      </div>
      <div className="heading-band__title">
        <div style={{ flex: '999 1 560px', minWidth: 0 }}>
          {eyebrow && <p className="mono heading-band__eyebrow">{eyebrow}</p>}
          <h1 className="big-title">
            {heading}
            {heading && headingEm && <br />}
            {headingEm && <em>{headingEm}</em>}
          </h1>
        </div>
        {intro && <p className="heading-band__intro">{intro}</p>}
      </div>
    </section>
  );
}
