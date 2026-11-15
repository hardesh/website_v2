import { getPage, parseSections } from '@/lib/content';
import PageHeading from './PageHeading';
import Sections from './Sections';
import Footer from './Footer';

/** Now / Work / Podcasts: image heading + numbered sections from one markdown file. */
export default function StructuredPage({ slug }: { slug: string }) {
  const page = getPage(slug);
  const heading = page.heading ?? (page.headingEm ? '' : page.title);
  // Skip the small label above the title when it would just repeat the title.
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const repeats = norm(`${heading} ${page.headingEm ?? ''}`) === norm(page.title);
  return (
    <>
      <PageHeading eyebrow={repeats ? undefined : page.title} heading={heading} headingEm={page.headingEm} intro={page.intro} image={page.headerImage} />
      <main id="main">
        <Sections sections={parseSections(page.body)} />
      </main>
      <Footer />
    </>
  );
}

export function structuredMeta(slug: string) {
  const page = getPage(slug);
  return { title: page.title, description: page.description || page.intro || page.title, path: `/${slug}`, image: page.headerImage };
}
