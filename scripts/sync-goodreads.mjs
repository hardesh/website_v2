// Pulls the Goodreads shelves (read, currently-reading, to-read) from their public RSS feeds into data/books.json.
// Used by `just books` and the nightly GitHub Action. Needs GOODREADS_USER_ID (env or .env).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
if (!process.env.GOODREADS_USER_ID && fs.existsSync(path.join(ROOT, '.env'))) {
  for (const l of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
    const m = l.match(/^\s*GOODREADS_USER_ID\s*=\s*"?([^"\s#]*)/);
    if (m) process.env.GOODREADS_USER_ID = m[1];
  }
}
const USER = (process.env.GOODREADS_USER_ID || '').trim();
if (!USER) {
  console.error('✗ Set GOODREADS_USER_ID (in .env locally, or as a repository variable/secret in GitHub).');
  process.exit(1);
}

const SHELVES = ['currently-reading', 'read', 'to-read'];
const OUT = path.join(ROOT, 'data', 'books.json');
const UA = 'harshaldeshpande.info bookshelf sync';

const decode = (s) =>
  s
    .replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&amp;/g, '&')
    .trim();
const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]) : '';
};
// Goodreads serves tiny thumbnails (…_SX50_.jpg); strip the size suffix for the full cover.
const bigCover = (u) => u.replace(/\._S[XY]\d+(_S[XY]\d+)?_\./, '.').replace(/\._SY\d+_\./, '.');

async function shelf(name) {
  const books = [];
  for (let page = 1; page <= 20; page++) {
    const url = `https://www.goodreads.com/review/list_rss/${USER}?shelf=${name}&page=${page}`;
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
    const xml = await res.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
    for (const it of items) {
      const cover = tag(it, 'book_large_image_url') || tag(it, 'book_medium_image_url') || tag(it, 'book_image_url');
      books.push({
        title: tag(it, 'title'),
        author: tag(it, 'author_name'),
        cover: cover && !/nophoto/.test(cover) ? bigCover(cover) : '',
        url: tag(it, 'link').split('?')[0],
        shelf: name,
        readAt: tag(it, 'user_read_at') ? new Date(tag(it, 'user_read_at')).toISOString().slice(0, 10) : undefined,
        addedAt: tag(it, 'user_date_added') ? new Date(tag(it, 'user_date_added')).toISOString().slice(0, 10) : undefined,
      });
    }
    if (items.length < 100) break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return books;
}

const all = [];
for (const s of SHELVES) {
  const books = await shelf(s);
  // Most recently read/added first within each shelf.
  books.sort((a, b) => (b.readAt || b.addedAt || '').localeCompare(a.readAt || a.addedAt || ''));
  all.push(...books);
  console.log(`  ${s}: ${books.length}`);
}

const next = JSON.stringify(all, null, 2) + '\n';
const prev = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
if (next === prev) {
  console.log('✓ data/books.json is already up to date');
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, next);
  console.log(`✓ Wrote ${all.length} books to data/books.json`);
}
