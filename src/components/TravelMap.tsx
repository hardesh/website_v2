'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type * as MapLibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface MapPin {
  key: string;
  label: string;
  lat: number;
  lon: number;
  /** Story URL; map-only places have none. */
  href?: string;
}

interface Props {
  pins: MapPin[];
  home: { name: string; lat: number; lon: number };
  /** Story for home (Pune); makes the home ring a link. */
  homeHref?: string;
}

type Mode = 'globe' | 'flat';

/** Which view the map opens in. */
const DEFAULT_MODE: Mode = 'globe';
/** Where each view is centred when it opens, as [longitude, latitude]. The globe faces India. */
const CENTER: Record<Mode, [number, number]> = { globe: [78.9, 21], flat: [30, 25] };

// Esri World Imagery (satellite). No API key needed; the attribution below is required.
// For a street map instead, swap the tile URL for 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' with
// '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'.
const TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const ATTRIBUTION = 'Tiles &copy; <a href="https://www.esri.com">Esri</a>. Sources: Esri, Maxar, Earthstar Geographics and the GIS User Community';

const MAX_ZOOM = 12;

/** Keeps a computed zoom valid for MapLibre (-2…MAX_ZOOM). A 0-sized map (mid-layout, hidden) gives -Infinity; use 0 then. */
const safeZoom = (z: number) => (Number.isFinite(z) ? Math.min(MAX_ZOOM - 1, Math.max(-2, z)) : 0);
/** Zoom at which the globe fills ~90% of the map's height. */
const globeZoom = (el: HTMLElement) => safeZoom(Math.log2((0.9 * el.clientHeight * Math.PI) / 512));
/** Zoom at which the flat world exactly fills the map's width (so it's never shown twice). */
const flatZoom = (el: HTMLElement) => safeZoom(Math.log2(el.clientWidth / 512));
const minZoomFor = (mode: Mode, el: HTMLElement) => safeZoom(mode === 'globe' ? globeZoom(el) - 0.6 : flatZoom(el));

/** World map (3D globe or flat) with a pin per story (links) and per visited place, plus the home ring. */
export default function TravelMap({ pins, home, homeHref }: Props) {
  const node = useRef<HTMLDivElement>(null);
  const lib = useRef<typeof MapLibre | null>(null);
  const map = useRef<MapLibre.Map | null>(null);
  const markers = useRef<MapLibre.Marker[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mode, setMode] = useState<Mode>(DEFAULT_MODE);
  const modeRef = useRef<Mode>(DEFAULT_MODE);
  const router = useRouter();

  // Create the map once, loading MapLibre only when the map is about to scroll into view.
  useEffect(() => {
    const el = node.current;
    if (!el) return;
    let cancelled = false;
    let removeWheel: (() => void) | undefined;

    const init = async () => {
      let maplibregl: typeof MapLibre;
      try {
        const mod = await import('maplibre-gl');
        maplibregl = ((mod as unknown as { default?: typeof MapLibre }).default ?? mod) as typeof MapLibre;
      } catch {
        setFailed(true);
        return;
      }
      if (cancelled || map.current) return;
      lib.current = maplibregl;

      let m: MapLibre.Map;
      try {
        m = new maplibregl.Map({
          container: el,
          style: {
            version: 8,
            projection: { type: modeRef.current === 'globe' ? 'globe' : 'mercator' },
            sources: {
              satellite: { type: 'raster', tiles: [TILES], tileSize: 256, maxzoom: 18, attribution: ATTRIBUTION },
            },
            layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }],
            sky: { 'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0] },
          },
          center: CENTER[modeRef.current],
          zoom: modeRef.current === 'globe' ? globeZoom(el) : flatZoom(el),
          minZoom: minZoomFor(modeRef.current, el),
          maxZoom: MAX_ZOOM,
          renderWorldCopies: false, // flat mode: show the world once, so every pin has exactly one place
          scrollZoom: false, // plain scrolling scrolls the page; Shift + scroll zooms (handled below)
          dragRotate: false,
          pitchWithRotate: false,
          attributionControl: { compact: true },
        });
      } catch {
        setFailed(true); // e.g. WebGL unavailable
        return;
      }
      m.touchZoomRotate.disableRotation();
      m.keyboard.disableRotation();
      m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');

      // Home ring (Pune).
      const homeEl = document.createElement(homeHref ? 'a' : 'span');
      homeEl.className = `map-pin map-pin--home${homeHref ? ' map-pin--story' : ''}`;
      homeEl.innerHTML = '<span class="map-home"></span><span class="map-pin__label mono"></span>';
      homeEl.querySelector('.map-pin__label')!.textContent = `Home, ${home.name}`;
      if (homeEl instanceof HTMLAnchorElement && homeHref) {
        homeEl.href = homeHref;
        homeEl.setAttribute('aria-label', `Home, ${home.name}`);
        homeEl.addEventListener('click', (e) => {
          e.preventDefault();
          router.push(homeHref);
        });
      }
      new maplibregl.Marker({ element: homeEl, anchor: 'center', opacityWhenCovered: '0' }).setLngLat([home.lon, home.lat]).addTo(m);

      // Shift + scroll zooms around the cursor; plain scrolling still scrolls the page.
      // (macOS turns Shift + scroll into horizontal scroll, so read whichever axis moved.)
      let pending = 0;
      let frame = 0;
      let point: [number, number] = [0, 0];
      const onWheel = (e: WheelEvent) => {
        if (!e.shiftKey) return;
        e.preventDefault();
        const raw = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        pending += e.deltaMode === 1 ? raw * 16 : e.deltaMode === 2 ? raw * 400 : raw;
        const r = el.getBoundingClientRect();
        point = [e.clientX - r.left, e.clientY - r.top];
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const zoom = Math.min(m.getMaxZoom(), Math.max(m.getMinZoom(), m.getZoom() - pending / 200));
          pending = 0;
          m.zoomTo(zoom, { around: m.unproject(point), duration: 0 });
        });
      };
      el.addEventListener('wheel', onWheel, { passive: false });

      // Keep the zoom-out limit right when the map is resized (window resize, phone rotation).
      m.on('resize', () => {
        if (el.clientWidth && el.clientHeight) m.setMinZoom(minZoomFor(modeRef.current, el)); // skip while hidden / 0-sized
      });

      removeWheel = () => {
        el.removeEventListener('wheel', onWheel);
        cancelAnimationFrame(frame);
      };
      map.current = m;
      setReady(true);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          init();
        }
      },
      { rootMargin: '400px' },
    );
    io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
      removeWheel?.();
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the map is created once; router/homeHref are stable
  }, [home.lat, home.lon, home.name]);

  // Switch between the globe and the flat map.
  useEffect(() => {
    modeRef.current = mode;
    const m = map.current;
    const el = node.current;
    if (!ready || !m || !el) return;
    m.setProjection({ type: mode === 'globe' ? 'globe' : 'mercator' });
    const min = minZoomFor(mode, el);
    m.setMinZoom(min);
    if (mode === 'globe') m.jumpTo({ center: CENTER.globe, zoom: Math.max(min, Math.min(m.getZoom(), globeZoom(el))) });
    else m.jumpTo({ zoom: Math.max(min, m.getZoom()) });
  }, [mode, ready]);

  // (Re)draw the pins whenever they change (e.g. the year filter).
  useEffect(() => {
    const maplibregl = lib.current;
    const m = map.current;
    if (!ready || !maplibregl || !m) return;
    markers.current.forEach((mk) => mk.remove());
    markers.current = pins.map((p) => {
      const el = document.createElement(p.href ? 'a' : 'span');
      el.className = `map-pin${p.href ? ' map-pin--story' : ''}`;
      el.innerHTML = '<span class="pin__dot"></span><span class="map-pin__label mono"></span>';
      el.querySelector('.map-pin__label')!.textContent = p.label;
      if (el instanceof HTMLAnchorElement && p.href) {
        const href = p.href;
        el.href = href;
        el.setAttribute('aria-label', p.label);
        el.addEventListener('click', (e) => {
          e.preventDefault();
          router.push(href);
        });
      }
      return new maplibregl.Marker({ element: el, anchor: 'center', opacityWhenCovered: '0' }).setLngLat([p.lon, p.lat]).addTo(m);
    });
  }, [pins, ready, router]);

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
          <span className="map-hint">Shift + scroll to zoom</span>
        </p>
        <div role="group" aria-label="Map view" className="map-modes">
          {(['globe', 'flat'] as const).map((v) => (
            <button key={v} type="button" className="mono year-btn" aria-pressed={mode === v} onClick={() => setMode(v)}>
              {v === 'globe' ? 'Globe' : 'Flat'}
            </button>
          ))}
        </div>
      </div>
      <div ref={node} className="map" role="region" aria-label="Map of places I’ve been. Story pins open the story.">
        {!ready && <p className="mono map__loading">{failed ? 'The map couldn’t load in this browser.' : 'Loading map…'}</p>}
      </div>
    </section>
  );
}
