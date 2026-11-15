import Link from 'next/link';
import site from '@site';
import { getBooks } from '@/lib/content';
import { breadcrumbs, pageMeta } from '@/lib/seo';
import PageHeading from '@/components/PageHeading';
import BookShelf from '@/components/BookShelf';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';

const s = site.sections.wantToRead;

export const metadata = pageMeta({ title: 'Want to read', description: s.description, path: '/bookshelf/want-to-read' });

export default function WantToRead() {
  const books = getBooks().filter((b) => b.shelf === 'to-read');
  return (
    <>
      <PageHeading eyebrow="Bookshelf" heading={s.heading} headingEm={s.headingEm} intro={s.intro} />
      <main id="main" className="wrap">
        <p className="shelf" style={{ paddingTop: 'clamp(40px, 6vw, 72px)', margin: 0 }}>
          <Link className="mono label-dim" href="/bookshelf">
            ← Back to the bookshelf
          </Link>
        </p>
        {books.length ? (
          <BookShelf id="to-read" label="Want to read" books={books} eagerCount={8} />
        ) : (
          <p className="empty shelf">Nothing on the list right now.</p>
        )}
      </main>
      <Footer />
      <JsonLd
        data={breadcrumbs([
          { name: 'Home', path: '/' },
          { name: 'Bookshelf', path: '/bookshelf' },
          { name: 'Want to read', path: '/bookshelf/want-to-read' },
        ])}
      />
    </>
  );
}
