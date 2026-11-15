import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { imageSize } from 'image-size';
import site from '@site';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content');
const showDrafts = process.env.NODE_ENV !== 'production';

type FrontMatter = Record<string, unknown>;

export interface Page {
  slug: string;
  title: string;
  description: string;
  heading?: string;
  headingEm?: string;
  intro?: string;
  headerImage: string;
  updated?: string;
  data: FrontMatter;
  body: string;
}

export interface ImageInfo {
  src: string;
  width: number;
  height: number;
  alt: string;
}

interface PostBase {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  year: string;
  summary: string;
  draft: boolean;
  body: string;
  raw: string;
  readingMinutes: number;
  url: string;
  cover?: ImageInfo;
}

export interface TravelPost extends PostBase {
  kind: 'travel';
  place: string;
  lat?: number;
  lon?: number;
  group?: string;
  pinSide?: 'left' | 'right';
}

export interface BlogPost extends PostBase {
  kind: 'blog';
  layout: 'text' | 'cover';
}

export type Post = TravelPost | BlogPost;

/* ── helpers ─────────────────────────────────────────────────────────── */

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function num(v: unknown): number | undefined {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function isoDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = str(v);
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : '';
}

export function readingMinutes(md: string): number {
  const words = md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#>*_`[\]()-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** First sentence of a markdown body, for posts with no summary. */
export function firstSentence(md: string): string {
  const text = md
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#+\s.*$/gm, '')
    .replace(/[*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const m = text.match(/^(.+?[.!?])(\s|$)/);
  return (m ? m[1] : text).slice(0, 240);
}

/** Size of a file under public/ (or an absolute fs path). */
export function imageInfo(publicSrc: string, alt = '', fsPath?: string): ImageInfo | undefined {
  const file = fsPath ?? path.join(ROOT, 'public', publicSrc);
  try {
    const { width, height } = imageSize(fs.readFileSync(file));
    if (!width || !height) return undefined;
    return { src: publicSrc, width, height, alt };
  } catch {
    return undefined;
  }
}

/* ── pages (about, now, work, notes, podcasts) ───────────────────────── */

export function getPage(slug: string): Page {
  const raw = fs.readFileSync(path.join(CONTENT, `${slug}.md`), 'utf8');
  const { data, content } = matter(raw);
  return {
    slug,
    title: str(data.title) || slug,
    description: str(data.description),
    heading: str(data.heading) || undefined,
    headingEm: str(data.heading_em) || undefined,
    intro: str(data.intro) || undefined,
    headerImage: str(data.header_image) || site.headerImage,
    updated: isoDate(data.updated) || undefined,
    data,
    body: content.replace(/<!--[\s\S]*?-->/g, '').trim(),
  };
}

/* ── travel ──────────────────────────────────────────────────────────── */

const TRAVEL = path.join(CONTENT, 'travel');

function readTravel(slug: string): TravelPost | null {
  const file = path.join(TRAVEL, slug, 'index.md');
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const date = isoDate(data.date);
  const coverName = str(data.cover);
  const cover = coverName
    ? imageInfo(`/travel/${slug}/${coverName}`, str(data.cover_alt) || str(data.title), path.join(TRAVEL, slug, coverName))
    : undefined;
  const side = str(data.pin_side);
  return {
    kind: 'travel',
    slug,
    title: str(data.title) || slug,
    place: str(data.place),
    date,
    year: date.slice(0, 4),
    summary: str(data.summary) || firstSentence(content),
    draft: data.draft === true,
    body: content.trim(),
    raw,
    readingMinutes: readingMinutes(content),
    url: `/travel/${slug}`,
    cover,
    lat: num(data.lat),
    lon: num(data.lon),
    group: str(data.group) || undefined,
    pinSide: side === 'left' || side === 'right' ? side : undefined,
  };
}

export function getTravelPosts(): TravelPost[] {
  if (!fs.existsSync(TRAVEL)) return [];
  return fs
    .readdirSync(TRAVEL, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'))
    .map((d) => readTravel(d.name))
    .filter((p): p is TravelPost => !!p && (showDrafts || !p.draft))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getTravelPost(slug: string): TravelPost | undefined {
  return getTravelPosts().find((p) => p.slug === slug);
}

/* ── blog ────────────────────────────────────────────────────────────── */

const BLOG = path.join(CONTENT, 'blog');

function readBlog(file: string): BlogPost {
  const slug = path.basename(file, '.md');
  const raw = fs.readFileSync(path.join(BLOG, file), 'utf8');
  const { data, content } = matter(raw);
  const date = isoDate(data.date);
  const layoutRaw = str(data.layout);
  const layout = layoutRaw === 'cover' || layoutRaw === 'text' ? layoutRaw : site.blogLayout;
  const coverSrc = str(data.cover);
  return {
    kind: 'blog',
    slug,
    title: str(data.title) || slug,
    date,
    year: date.slice(0, 4),
    summary: str(data.summary) || firstSentence(content),
    draft: data.draft === true,
    body: content.trim(),
    raw,
    readingMinutes: readingMinutes(content),
    url: `/blog/${slug}`,
    layout,
    cover: coverSrc ? imageInfo(coverSrc, str(data.cover_alt) || str(data.title)) : undefined,
  };
}

export function getBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG)) return [];
  return fs
    .readdirSync(BLOG)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map(readBlog)
    .filter((p) => showDrafts || !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return getBlogPosts().find((p) => p.slug === slug);
}

/* ── data ────────────────────────────────────────────────────────────── */

export interface Place {
  name: string;
  lat: number;
  lon: number;
}

export interface Book {
  title: string;
  author: string;
  cover: string;
  url?: string;
  shelf: 'currently-reading' | 'read' | 'to-read';
}

function readJson<T>(rel: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')) as T;
  } catch {
    return fallback;
  }
}

export const getPlaces = () => readJson<Place[]>('data/places.json', []);
export const getBooks = () => readJson<Book[]>('data/books.json', []);

/* ── structured pages: ## sections, ### entries ──────────────────────── */

export interface Entry {
  title: string;
  meta?: string;
  body: string;
}

export interface LinkRow {
  label: string;
  href: string;
  meta: string;
}

export interface Section {
  title: string;
  /** Markdown before the first ### (or the whole section when it has no entries). */
  body: string;
  entries: Entry[];
  /** Set when the section body is nothing but a list of links. */
  links?: LinkRow[];
}

function platform(href: string): string {
  try {
    const host = new URL(href).hostname.replace(/^www\./, '');
    const known: Record<string, string> = {
      'youtube.com': 'YouTube',
      'youtu.be': 'YouTube',
      'open.spotify.com': 'Spotify',
      'podcasts.apple.com': 'Apple Podcasts',
      'notion.so': 'Notion',
      'drive.google.com': 'Google Drive',
    };
    return known[host] ?? host;
  } catch {
    return '';
  }
}

function parseLinkList(md: string): LinkRow[] | undefined {
  const lines = md.split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return undefined;
  const rows: LinkRow[] = [];
  for (const line of lines) {
    const m = line.match(/^(?:[-*+]|\d+\.)\s+\[([^\]]+)\]\(([^)\s]+)\)\s*(?:\|\s*(.*))?$/);
    if (!m) return undefined;
    const external = /^https?:/.test(m[2]);
    rows.push({ label: m[1], href: m[2], meta: m[3]?.trim() || (external ? `${platform(m[2])} ↗` : '') });
  }
  return rows;
}

function splitTitle(h: string): { title: string; meta?: string } {
  const i = h.indexOf(' | ');
  return i === -1 ? { title: h.trim() } : { title: h.slice(0, i).trim(), meta: h.slice(i + 3).trim() };
}

export function parseSections(md: string): Section[] {
  const sections: Section[] = [];
  let sec: Section | null = null;
  let entry: Entry | null = null;
  let buf: string[] = [];
  let fence = false;

  const flush = () => {
    const text = buf.join('\n').trim();
    buf = [];
    if (entry) entry.body = text;
    else if (sec) sec.body = text;
  };

  for (const line of md.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (!fence && /^##\s/.test(line)) {
      flush();
      entry = null;
      sec = { title: line.replace(/^##\s+/, '').trim(), body: '', entries: [] };
      sections.push(sec);
      continue;
    }
    if (!fence && /^###\s/.test(line)) {
      flush();
      if (!sec) {
        sec = { title: '', body: '', entries: [] };
        sections.push(sec);
      }
      entry = { ...splitTitle(line.replace(/^###\s+/, '')), body: '' };
      sec.entries.push(entry);
      continue;
    }
    if (!sec) {
      sec = { title: '', body: '', entries: [] };
      sections.push(sec);
    }
    buf.push(line);
  }
  flush();

  for (const s of sections) if (!s.entries.length) s.links = parseLinkList(s.body);
  return sections.filter((s) => s.body || s.entries.length);
}

/* ── formatting ──────────────────────────────────────────────────────── */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function fmtDate(iso: string, style: 'full' | 'month' | 'day' = 'full'): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const mon = MONTHS[m - 1];
  if (style === 'month') return `${mon} ${y}`;
  if (style === 'day') return `${d} ${mon}`;
  return `${d} ${mon} ${y}`;
}
