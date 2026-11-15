import Image from 'next/image';
import site from '@site';
import { getBooks, type Book } from '@/lib/content';
import { pageMeta } from '@/lib/seo';
import PageHeading from '@/components/PageHeading';
import Footer from '@/components/Footer';

const s = site.sections.bookshelf;
const STATUS: Record<Book['shelf'], string> = { 'currently-reading': 'Reading', read: 'Read', 'to-read': 'Up next' };
const ORDER: Book['shelf'][] = ['currently-reading', 'read', 'to-read'];

export const metadata = pageMeta({ title: 'Bookshelf', description: s.description, path: '/bookshelf' });

export default function Bookshelf() {
  const books = [...getBooks()].sort((a, b) => ORDER.indexOf(a.shelf) - ORDER.indexOf(b.shelf));
  return (
    <>
      <PageHeading eyebrow="Bookshelf" heading={s.heading} headingEm={s.headingEm} intro={s.intro} />
      <main id="main" className="wrap" style={{ paddingTop: 'clamp(56px, 8vw, 100px)' }}>
        <h2 className="visually-hidden">Books</h2>
        {books.length ? (
          <ul className="books">
            {books.map((b, i) => {
              const inner = (
                <>
                  {b.cover ? (
                    <Image className="book__cover" src={b.cover} alt={`Cover of ${b.title}`} width={300} height={450} sizes="(max-width: 760px) 50vw, 240px" loading={i < 8 ? 'eager' : 'lazy'} />
                  ) : (
                    <div className="book__cover" aria-hidden="true" />
                  )}
                  <span className="book__title">{b.title}</span>
                  <span className="mono book__meta">
                    {b.author} · {STATUS[b.shelf]}
                  </span>
                </>
              );
              return (
                <li key={`${b.shelf}:${b.title}`}>
                  {b.url ? (
                    <a className="book" href={b.url} rel="noopener">
                      {inner}
                    </a>
                  ) : (
                    <div className="book">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="empty">The shelf syncs from Goodreads every night. Nothing here yet.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
