// Builds a 1200×630 Open Graph JPG per published post into public/og/ (static export can't do it at request time).
// Text is converted to SVG paths with opentype.js, so the output is identical on macOS and in CI.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import opentype from 'opentype.js';
import { PUBLIC, ROOT, blogPosts, coverFile, travelPosts } from './lib/posts.mjs';

const W = 1200;
const H = 630;
const PAD = 80;
const OUT = path.join(PUBLIC, 'og');
const FALLBACK = path.join(PUBLIC, 'images', 'horizon.jpg');
const loadFont = (f) => opentype.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'fonts', f)).buffer);
const serif = loadFont('Newsreader-MediumItalic.ttf');
const mono = loadFont('IBMPlexMono-Medium.ttf');

/** Greedy word wrap to a max width; returns lines. */
function wrap(font, text, size, maxW) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && font.getAdvanceWidth(next, size) > maxW) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** SVG path data for `text` with its baseline at (x, y); optional letter spacing in em. */
function pathFor(font, text, x, y, size, tracking = 0) {
  if (!tracking) return font.getPath(text, x, y, size).toPathData(2);
  // Merge glyph commands into one path (toPathData may emit relative commands, so strings can't be concatenated).
  const merged = new opentype.Path();
  let cx = x;
  for (const ch of text) {
    merged.extend(font.getPath(ch, cx, y, size));
    cx += font.getAdvanceWidth(ch, size) + tracking * size;
  }
  return merged.toPathData(2);
}

async function make(p) {
  const bg = coverFile(p) || FALLBACK;
  let size = p.title.length > 48 ? 64 : 84;
  let lines = wrap(serif, p.title, size, W - PAD * 2);
  if (lines.length > 3) {
    size = 56;
    lines = wrap(serif, p.title, size, W - PAD * 2).slice(0, 3);
  }
  const lh = size * 1.05;
  const lastBaseline = H - 72;
  const firstBaseline = lastBaseline - lh * (lines.length - 1);
  const titleD = lines.map((l, i) => pathFor(serif, l, PAD, firstBaseline + i * lh, size)).join('');
  const label = `${p.kind === 'travel' ? 'TRAVEL' : 'BLOG'}${p.place ? ' · ' + p.place.toUpperCase() : ''} · HARSHAL DESHPANDE`;
  const labelD = pathFor(mono, label, PAD, firstBaseline - size * 0.95 - 8, 20, 0.12);

  const overlay = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#100D0C" stop-opacity="0.05"/>
        <stop offset="0.45" stop-color="#100D0C" stop-opacity="0.35"/>
        <stop offset="1" stop-color="#100D0C" stop-opacity="0.92"/>
      </linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <rect x="0" y="0" width="${Math.round(W * 0.03)}" height="${H}" fill="#F2C230"/>
      <path d="${labelD}" fill="#F2C230"/>
      <path d="${titleD}" fill="#EDE6DA"/>
    </svg>`,
  );

  await sharp(bg)
    .resize(W, H, { fit: 'cover', position: 'attention' })
    .composite([{ input: overlay, top: 0, left: 0 }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT, `${p.kind}-${p.slug}.jpg`));
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const posts = [...travelPosts(), ...blogPosts()];
for (const p of posts) {
  try {
    await make(p);
  } catch (e) {
    console.warn(`  ! OG image for ${p.url} failed: ${e.message}`);
  }
}
console.log(`✓ ${posts.length} Open Graph images written to public/og/`);
