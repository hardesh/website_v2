// Generates public/llms.txt, public/llms-full.txt and a raw .md copy of every post.
// Runs as `prebuild`. Output is git-ignored: never edit these files by hand.
import fs from 'node:fs';
import path from 'node:path';
import { PUBLIC, blogPosts, page, travelPosts, firstSentence } from './lib/posts.mjs';

const SITE = 'https://harshaldeshpande.info';
const NAME = 'Harshal Deshpande';

const travel = travelPosts();
const blog = blogPosts();
const about = page('about');
const bio = [about.data.lead, about.body].filter(Boolean).join(' ').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim();

const pageSummary = (slug, fallback) => {
  try {
    const p = page(slug);
    return p.data.description || p.data.intro || firstSentence(p.body) || fallback;
  } catch {
    return fallback;
  }
};

const pages = [
  ['Home', '/', 'About Harshal Deshpande.'],
  ['Now', '/now', pageSummary('now', 'What I’m up to lately.')],
  ['Work', '/work', pageSummary('work', 'Work and experience.')],
  ['Travel', '/travel', 'Travel stories with a world map of places visited.'],
  ['Blog', '/blog', 'Essays and longer posts.'],
  ['Notes', '/notes', pageSummary('notes', 'Working notes.')],
  ['Bookshelf', '/bookshelf', 'Books read and currently being read (from Goodreads).'],
  ['Podcasts', '/podcasts', pageSummary('podcasts', 'Favourite podcasts.')],
];

const line = (title, url, summary) => `- [${title}](${SITE}${url})${summary ? `: ${summary}` : ''}`;

// Rewrites relative and root-relative image/link paths to absolute URLs.
function absolutize(md, p) {
  const base = p.kind === 'travel' ? `${SITE}/travel/${p.slug}/` : `${SITE}/`;
  return md.replace(/(!?\[[^\]]*\]\()([^)\s]+)/g, (all, pre, url) => {
    if (/^(https?:|mailto:|#|data:)/.test(url)) return all;
    if (url.startsWith('/')) return pre + SITE + url;
    return pre + (all.startsWith('!') || p.kind === 'travel' ? base : `${SITE}/${p.kind}/`) + url.replace(/^\.\//, '');
  });
}

function frontMatter(p) {
  const out = [`title: ${JSON.stringify(p.title)}`];
  if (p.date) out.push(`date: ${p.date}`);
  if (p.place) out.push(`place: ${JSON.stringify(p.place)}`);
  if (p.summary) out.push(`summary: ${JSON.stringify(p.summary)}`);
  out.push(`url: ${SITE}${p.url}`);
  return `---\n${out.join('\n')}\n---\n`;
}

// llms.txt
const llms = [
  `# ${NAME}`,
  '',
  `> ${bio}`,
  '',
  `Personal site of ${NAME}. Every post is also available as raw markdown by adding \`.md\` to its URL. Full text of all posts: ${SITE}/llms-full.txt`,
  '',
  '## Pages',
  '',
  ...pages.map(([t, u, s]) => line(t, u, s)),
  '',
  '## Travel',
  '',
  ...(travel.length ? travel.map((p) => line(p.title, p.url, p.summary)) : ['- (no stories yet)']),
  '',
  '## Blog',
  '',
  ...(blog.length ? blog.map((p) => line(p.title, p.url, p.summary)) : ['- (no posts yet)']),
  '',
  '## Optional',
  '',
  line('Travel RSS', '/travel/rss.xml', ''),
  line('Blog RSS', '/blog/rss.xml', ''),
  line('Sitemap', '/sitemap.xml', ''),
  '',
].join('\n');
fs.writeFileSync(path.join(PUBLIC, 'llms.txt'), llms);

// llms-full.txt: newest first across both sections
const all = [...travel, ...blog].sort((a, b) => b.date.localeCompare(a.date));
const full = [
  `# ${NAME}: all posts`,
  '',
  `> ${bio}`,
  '',
  ...all.map((p) => `${frontMatter(p)}\n# ${p.title}\n\n${absolutize(p.body, p)}\n`),
].join('\n');
fs.writeFileSync(path.join(PUBLIC, 'llms-full.txt'), full);

// Raw markdown copies: /blog/<slug>.md and /travel/<slug>.md
for (const dir of ['blog', 'travel']) {
  const d = path.join(PUBLIC, dir);
  if (fs.existsSync(d)) for (const f of fs.readdirSync(d)) if (f.endsWith('.md')) fs.rmSync(path.join(d, f));
}
for (const p of all) {
  const d = path.join(PUBLIC, p.kind);
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, `${p.slug}.md`), `${frontMatter(p)}\n${absolutize(p.body, p)}\n`);
}

console.log(`✓ llms.txt, llms-full.txt and ${all.length} post .md copies written to public/`);
