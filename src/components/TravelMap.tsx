import Link from 'next/link';

export interface MapPin {
  key: string;
  label: string;
  lat: number;
  lon: number;
  href?: string;
  side: 'left' | 'right';
}

// Equirectangular, longitude −180…180, latitude 80…−58 (matches /images/worldmap.svg).
export const mapX = (lon: number) => `${(((lon + 180) / 360) * 100).toFixed(2)}%`;
export const mapY = (lat: number) => `${(((80 - lat) / 138) * 100).toFixed(2)}%`;

interface Props {
  pins: MapPin[];
  home: { name: string; lat: number; lon: number };
}

/** Dotted world map with a pin per story (links) and per visited place (no link), plus the home ring. */
export default function TravelMap({ pins, home }: Props) {
  return (
    <section className="map-section" aria-labelledby="map-h">
      <div className="map-head">
        <h2 id="map-h" className="mono label-accent">
          The map
        </h2>
        <p className="mono map-legend">
          <span>
            <span className="dot" aria-hidden="true" />
            Places
          </span>
          <span>
            <span className="dot dot--ring" aria-hidden="true" />
            Home, {home.name}
          </span>
        </p>
      </div>
      <div className="map">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="map__img" src="/images/worldmap.svg" alt="World map with a pin for each place I’ve been" width={1440} height={552} />
        <span className="map__home" aria-hidden="true" style={{ left: mapX(home.lon), top: mapY(home.lat) }} />
        {pins.map((p) => {
          const style = { left: mapX(p.lon), top: mapY(p.lat) };
          const cls = `pin${p.side === 'left' ? ' pin--left' : ''}`;
          const inner = (
            <>
              <span className="pin__dot" aria-hidden="true" />
              <span className="mono pin__label">{p.label}</span>
            </>
          );
          return p.href ? (
            <Link key={p.key} href={p.href} className={cls} style={style} aria-label={p.label}>
              {inner}
            </Link>
          ) : (
            <span key={p.key} className={cls} style={style} title={p.label}>
              {inner}
            </span>
          );
        })}
      </div>
    </section>
  );
}
