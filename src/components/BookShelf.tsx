import Image from 'next/image';
import type { Book } from '@/lib/content';
import styles from './BookShelf.module.css';

/** "Zero to One: Notes on Startups…" → "Zero to One" (the full title stays in the tooltip and the data). */
const shortTitle = (t: string) => t.split(/:\s/)[0].trim() || t;

function BookCard({ b, eager }: { b: Book; eager: boolean }) {
  const inner = (
    <>
      {b.cover ? (
        <Image className={styles.cover} src={b.cover} alt={`Cover of ${b.title}`} width={300} height={450} sizes="(max-width: 760px) 33vw, 180px" loading={eager ? 'eager' : 'lazy'} />
      ) : (
        <div className={styles.cover} aria-hidden="true" />
      )}
      <span className={styles.title} title={b.title}>
        {shortTitle(b.title)}
      </span>
      {b.author && <span className={`mono ${styles.meta}`}>{b.author}</span>}
    </>
  );
  return b.url ? (
    <a className={styles.book} href={b.url} rel="noopener">
      {inner}
    </a>
  ) : (
    <div className={styles.book}>{inner}</div>
  );
}

/** One labelled shelf ("01 · Reading · 9") with its grid of covers. */
export default function BookShelf({ id, label, books, eagerCount = 0 }: { id: string; label: string; books: Book[]; eagerCount?: number }) {
  return (
    <section className={styles.shelf} aria-labelledby={`shelf-${id}`}>
      <h2 id={`shelf-${id}`} className={`mono label-accent ${styles.label}`}>
        {label}
        <span className="label-dim"> · {books.length}</span>
      </h2>
      <ul className={styles.books}>
        {books.map((b, i) => (
          <li key={`${b.shelf}:${b.title}`}>
            <BookCard b={b} eager={i < eagerCount} />
          </li>
        ))}
      </ul>
    </section>
  );
}
