'use client';

import { useMemo, useState } from 'react';
import EntryCard, { type CardData } from './EntryCard';
import TravelMap, { type MapPin } from './TravelMap';

export interface TravelItem extends CardData {
  year: string;
  lat?: number;
  lon?: number;
  group?: string;
  pinSide?: 'left' | 'right';
}

interface Props {
  items: TravelItem[]; // newest first
  places: { name: string; lat: number; lon: number }[];
  home: { name: string; lat: number; lon: number };
}

const autoSide = (lon: number): 'left' | 'right' => (lon > 110 ? 'left' : 'right');

/** Map + year filter + cards. The filter updates pins and cards together; places without a story always show. */
export default function TravelIndex({ items, places, home }: Props) {
  const [year, setYear] = useState('All');
  const years = useMemo(() => ['All', ...Array.from(new Set(items.map((i) => i.year).filter(Boolean)))], [items]);
  const shown = year === 'All' ? items : items.filter((i) => i.year === year);

  const pins = useMemo(() => {
    const out: MapPin[] = [];
    const byKey = new Map<string, MapPin>();
    for (const e of shown) {
      if (e.lat == null || e.lon == null) continue;
      const key = e.group || e.url;
      const existing = byKey.get(key);
      if (existing) {
        existing.label += ` · ${e.title}`;
        continue;
      }
      const pin: MapPin = { key, label: e.title, lat: e.lat, lon: e.lon, href: e.url, side: e.pinSide ?? autoSide(e.lon) };
      byKey.set(key, pin);
      out.push(pin);
    }
    const storyLabels = new Set(out.map((p) => p.label.toLowerCase()));
    for (const p of places) {
      const label = p.name.split(',')[0].trim();
      if (storyLabels.has(label.toLowerCase())) continue;
      out.push({ key: `place:${p.name}`, label, lat: p.lat, lon: p.lon, side: autoSide(p.lon) });
    }
    return out;
  }, [shown, places]);

  return (
    <>
      <TravelMap pins={pins} home={home} />

      {years.length > 2 && (
        <section className="wrap" style={{ paddingTop: 56 }}>
          <div role="group" aria-label="Filter by year" className="years">
            {years.map((y) => (
              <button key={y} type="button" className="mono year-btn" aria-pressed={y === year} onClick={() => setYear(y)}>
                {y}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="wrap" style={{ paddingTop: 48 }} aria-label="Stories">
        <h2 className="visually-hidden">Stories</h2>
        {shown.length ? (
          <div className="cards">
            {shown.map((e, i) => (
              <EntryCard key={e.url} e={e} priority={i === 0} />
            ))}
          </div>
        ) : (
          <p className="empty">No stories yet.</p>
        )}
      </section>
    </>
  );
}
