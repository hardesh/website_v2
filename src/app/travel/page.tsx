import site from '@site';
import { fmtDate, getPlaces, getTravelPosts } from '@/lib/content';
import { pageMeta } from '@/lib/seo';
import PageHeading from '@/components/PageHeading';
import TravelIndex, { type TravelItem } from '@/components/TravelIndex';
import Footer from '@/components/Footer';

const s = site.sections.travel;

export const metadata = pageMeta({ title: 'Travel', description: s.description, path: '/travel' });

export default function TravelPage() {
  const posts = getTravelPosts();
  const items: TravelItem[] = posts.map((p) => ({
    url: p.url,
    title: p.title,
    place: p.place,
    date: p.date,
    dateLabel: fmtDate(p.date, 'month'),
    summary: p.summary,
    cover: p.cover,
    year: p.year,
    lat: p.lat,
    lon: p.lon,
    group: p.group,
    pinSide: p.pinSide,
  }));
  return (
    <>
      <PageHeading eyebrow={`Travel · ${posts.length} ${posts.length === 1 ? 'story' : 'stories'}`} heading={s.heading} headingEm={s.headingEm} intro={s.intro} />
      <main id="main">
        <TravelIndex items={items} places={getPlaces()} home={site.home} />
      </main>
      <Footer />
    </>
  );
}
