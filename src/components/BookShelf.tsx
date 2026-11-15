import Image from 'next/image';
import type { Book } from '@/lib/content';

/** "Zero to One: Notes on Startups…" → "Zero to One" (the full title stays in the tooltip and the data). */
const shortTitle = (t: string) => t.split(/:\s/)[0].trim() || t;

function BookCard({ b, eager }: { b: Book; eager: boolean }) {
  const inner = (
    <>
      {b.cover ? (
        <Image className="book__cover" src={b.cover} alt={`Cover of ${b.title}`} width={300} height={450} sizes="(max-width: 760px) 33vw, 180px" loading={eager ? 'eager' : 'lazy'} />
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

/** One labelled shelf ("01 · Reading · 9") with its grid of covers. */
export default function BookShelf({ id, label, books, eagerCount = 0 }: { id: string; label: string; books: Book[]; eagerCount?: number }) {
  return (
    <section className="shelf" aria-labelledby={`shelf-${id}`}>
      <h2 id={`shelf-${id}`} className="mono label-accent shelf__label">
        {label}
        <span className="label-dim"> · {books.length}</span>
      </h2>
      <ul className="books">
        {books.map((b, i) => (
          <li key={`${b.shelf}:${b.title}`}>
            <BookCard b={b} eager={i < eagerCount} />
          </li>
        ))}
      </ul>
    </section>
  );
}
