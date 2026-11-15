import Link from 'next/link';
import site from '@site';
import { getBooks, type Book } from '@/lib/content';
import { pageMeta } from '@/lib/seo';
import PageHeading from '@/components/PageHeading';
import BookShelf from '@/components/BookShelf';
import shelfStyles from '@/components/BookShelf.module.css';
import Footer from '@/components/Footer';

const s = site.sections.bookshelf;

/** Shelves on this page, in order. "Want to read" has its own page (/bookshelf/want-to-read). */
const SHELVES: { shelf: Book['shelf']; label: string }[] = [
  { shelf: 'currently-reading', label: 'Reading' },
  { shelf: 'read', label: 'Read' },
];

export const metadata = pageMeta({ title: 'Bookshelf', description: s.description, path: '/bookshelf' });

export default function Bookshelf() {
  const books = getBooks();
  const groups = SHELVES.map((g) => ({ ...g, books: books.filter((b) => b.shelf === g.shelf) })).filter((g) => g.books.length);
  const wantCount = books.filter((b) => b.shelf === 'to-read').length;

  return (
    <>
      <PageHeading eyebrow="Bookshelf" heading={s.heading} headingEm={s.headingEm} intro={s.intro} />
      <main id="main" className="wrap">
        {groups.length ? (
          groups.map((g, i) => (
            <BookShelf key={g.shelf} id={g.shelf} label={`${String(i + 1).padStart(2, '0')} · ${g.label}`} books={g.books} eagerCount={i === 0 ? 8 : 0} />
          ))
        ) : (
          <p className={`empty ${shelfStyles.shelf}`}>The shelf syncs from Hardcover every night. Nothing here yet.</p>
        )}

        {wantCount > 0 && (
          <div className={shelfStyles.shelf}>
            <Link className={`row ${shelfStyles.more}`} href="/bookshelf/want-to-read">
              <span className="row__title">Want to read</span>
              <span className="mono row__meta">{wantCount} books →</span>
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
