import Image from 'next/image';
import Link from 'next/link';

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
    <Link href={e.url} className="card">
      {e.cover ? (
        <Image className="card__img" src={e.cover.src} alt={e.cover.alt} width={e.cover.width} height={e.cover.height} sizes="(max-width: 760px) 100vw, 400px" priority={priority} />
      ) : (
        <div className="card__placeholder" aria-hidden="true" />
      )}
      <div className="card__head">
        <h3 className="card__title">{e.title}</h3>
        <time className="mono label-dim" dateTime={e.date}>
          {e.dateLabel}
        </time>
      </div>
      {e.place && <p className="mono card__place">{e.place}</p>}
      {e.summary && <p className="card__summary">{e.summary}</p>}
    </Link>
  );
}
