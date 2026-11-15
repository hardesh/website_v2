import Image from 'next/image';
import site from '@site';
import { getBooks, type Book } from '@/lib/content';
import { pageMeta } from '@/lib/seo';
import PageHeading from '@/components/PageHeading';
import Footer from '@/components/Footer';

const s = site.sections.bookshelf;

/** One section per shelf, in this order. Shelves with no books are skipped. */
const SHELVES: { shelf: Book['shelf']; label: string }[] = [
  { shelf: 'currently-reading', label: 'Reading' },
  { shelf: 'read', label: 'Read' },
  { shelf: 'to-read', label: 'Up next' },
];

/** "Zero to One: Notes on Startups…" → "Zero to One" (the full title stays in the tooltip and the data). */
const shortTitle = (t: string) => t.split(/:\s/)[0].trim() || t;

export const metadata = pageMeta({ title: 'Bookshelf', description: s.description, path: '/bookshelf' });

function BookCard({ b, eager }: { b: Book; eager: boolean }) {
  const inner = (
    <>
      {b.cover ? (
        <Image className="book__cover" src={b.cover} alt={`Cover of ${b.title}`} width={300} height={450} sizes="(max-width: 760px) 50vw, 240px" loading={eager ? 'eager' : 'lazy'} />
      ) : (
        <div className="book__cover" aria-hidden="true" />
      )}
      <span className="book__title" title={b.title}>
        {shortTitle(b.title)}
      </span>
      {b.author && <span className="mono book__meta">{b.author}</span>}
    </>
  );
  return b.url ? (
    <a className="book" href={b.url} rel="noopener">
      {inner}
    </a>
  ) : (
    <div className="book">{inner}</div>
  );
}

export default function Bookshelf() {
  const books = getBooks();
  const groups = SHELVES.map((g) => ({ ...g, books: books.filter((b) => b.shelf === g.shelf) })).filter((g) => g.books.length);
  let shown = 0;

  return (
    <>
      <PageHeading eyebrow="Bookshelf" heading={s.heading} headingEm={s.headingEm} intro={s.intro} />
      <main id="main" className="wrap">
        {groups.length ? (
          groups.map((g, i) => (
            <section key={g.shelf} className="shelf" aria-labelledby={`shelf-${g.shelf}`}>
              <h2 id={`shelf-${g.shelf}`} className="mono label-accent shelf__label">
                {String(i + 1).padStart(2, '0')} · {g.label}
                <span className="label-dim"> · {g.books.length}</span>
              </h2>
              <ul className="books">
                {g.books.map((b) => (
                  <li key={`${b.shelf}:${b.title}`}>
                    <BookCard b={b} eager={shown++ < 8} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        ) : (
          <p className="empty shelf">The shelf syncs from Hardcover every night. Nothing here yet.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
