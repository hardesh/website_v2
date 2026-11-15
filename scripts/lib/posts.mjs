// Shared by the build scripts (the Next app has its own typed loader in src/lib/content.ts).
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export const ROOT = process.cwd();
export const CONTENT = path.join(ROOT, 'content');
export const PUBLIC = path.join(ROOT, 'public');

const iso = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : typeof v === 'string' ? v.slice(0, 10) : '');

export function firstSentence(md) {
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

function post(kind, slug, file, raw) {
  const { data, content } = matter(raw);
  return {
    kind,
    slug,
    file,
    raw,
    data,
    body: content.trim(),
    title: String(data.title || slug),
    date: iso(data.date),
    place: data.place ? String(data.place) : '',
    summary: (data.summary && String(data.summary).trim()) || firstSentence(content),
    draft: data.draft === true,
    url: `/${kind}/${slug}`,
    cover: data.cover ? String(data.cover) : '',
  };
}

/** Published posts (drafts excluded), newest first. */
export function travelPosts({ drafts = false } = {}) {
  const dir = path.join(CONTENT, 'travel');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !/^[_.]/.test(d.name) && fs.existsSync(path.join(dir, d.name, 'index.md')))
    .map((d) => {
      const file = path.join(dir, d.name, 'index.md');
      return post('travel', d.name, file, fs.readFileSync(file, 'utf8'));
    })
    .filter((p) => drafts || !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function blogPosts({ drafts = false } = {}) {
  const dir = path.join(CONTENT, 'blog');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => {
      const file = path.join(dir, f);
      return post('blog', path.basename(f, '.md'), file, fs.readFileSync(file, 'utf8'));
    })
    .filter((p) => drafts || !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function page(slug) {
  const raw = fs.readFileSync(path.join(CONTENT, `${slug}.md`), 'utf8');
  const { data, content } = matter(raw);
  return { slug, data, body: content.replace(/<!--[\s\S]*?-->/g, '').trim() };
}

/** Public URL of a post's cover image ('' if none). */
export function coverUrl(p) {
  if (!p.cover) return '';
  if (/^https?:|^\//.test(p.cover)) return p.cover;
  return `/travel/${p.slug}/${p.cover}`;
}

/** Filesystem path of a post's cover image ('' if none / missing). */
export function coverFile(p) {
  if (!p.cover || /^https?:/.test(p.cover)) return '';
  const f = p.cover.startsWith('/') ? path.join(PUBLIC, p.cover) : path.join(path.dirname(p.file), p.cover);
  return fs.existsSync(f) ? f : '';
}
