import Image from 'next/image';
import Link from 'next/link';
import styles from './EntryCard.module.css';

export interface CardData {
  url: string;
  title: string;
  place: string;
  dateLabel: string;
  date: string;
  summary: string;
  cover?: { src: string; width: number; height: number; alt: string };
}

/** One travel story on the index: photo, title + date, place, summary. */
export default function EntryCard({ e, priority = false }: { e: CardData; priority?: boolean }) {
  return (
    <Link href={e.url} className={styles.card}>
      {e.cover ? (
        <Image className={styles.img} src={e.cover.src} alt={e.cover.alt} width={e.cover.width} height={e.cover.height} sizes="(max-width: 760px) 100vw, 400px" priority={priority} />
      ) : (
        <div className={styles.placeholder} aria-hidden="true" />
      )}
      <div className={styles.head}>
        <h3 className={styles.title}>{e.title}</h3>
        {e.date && (
          <time className="mono label-dim" dateTime={e.date}>
            {e.dateLabel}
          </time>
        )}
      </div>
      {e.place && <p className={`mono ${styles.place}`}>{e.place}</p>}
      {e.summary && <p className={styles.summary}>{e.summary}</p>}
    </Link>
  );
}
