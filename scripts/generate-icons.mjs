// Generates the favicons in src/app/ (Next.js adds the <link> tags automatically):
//   icon1.svg (modern browsers), icon2.png (512×512, Android/search results), apple-icon.png (180×180, iOS),
//   favicon.ico (16–256 px).
// Run with `just icons` after changing the text or colours below. The output is committed.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import opentype from 'opentype.js';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'src', 'app');
const TEXT = 'HD';
const BG = '#100D0C';
const FG = '#EDE6DA';

const font = opentype.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'fonts', 'Newsreader-MediumItalic.ttf')).buffer);

/** SVG for the icon at a 64-unit viewBox; the text is scaled to fit and centred using its real bounding box. */
function svg() {
  // Largest size that keeps the text within 50 units wide and 40 tall.
  const ref = font.getPath(TEXT, 0, 0, 100).getBoundingBox();
  const size = Math.min(50, (100 * 50) / (ref.x2 - ref.x1), (100 * 40) / (ref.y2 - ref.y1));
  const bb = font.getPath(TEXT, 0, 0, size).getBoundingBox();
  const w = bb.x2 - bb.x1;
  const h = bb.y2 - bb.y1;
  const x = (64 - w) / 2 - bb.x1;
  const y = (58 - h) / 2 - bb.y1; // sit slightly high to leave room for the horizon line
  const d = font.getPath(TEXT, x, y, size).toPathData(2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="horizon" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#E4572E" stop-opacity="0"/>
      <stop offset="0.25" stop-color="#E4572E"/>
      <stop offset="0.5" stop-color="#F2C230"/>
      <stop offset="0.75" stop-color="#E4572E"/>
      <stop offset="1" stop-color="#E4572E" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="${BG}"/>
  <rect x="8" y="53" width="48" height="3" rx="1.5" fill="url(#horizon)"/>
  <path d="${d}" fill="${FG}"/>
</svg>
`;
}

/** Packs PNG images into a .ico (PNG-in-ICO is supported by every current browser). */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach(({ size, data }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2);
    dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...pngs.map((p) => p.data)]);
}

const source = svg();
fs.writeFileSync(path.join(OUT, 'icon1.svg'), source);

// Render well above the target size, then downscale, so edges stay crisp.
const png = (size, svgSource = source) => sharp(Buffer.from(svgSource), { density: Math.ceil(72 * (size / 64) * 4) }).resize(size, size).png().toBuffer();

fs.writeFileSync(path.join(OUT, 'icon2.png'), await png(512));

// iOS draws its own rounded corners, so the apple icon is a full square.
const square = source.replace('rx="14"', 'rx="0"');
const apple = await png(180, square);
fs.writeFileSync(path.join(OUT, 'apple-icon.png'), apple);

// Largest first: browsers pick the best fit, and Next.js reads the first entry for the sizes attribute.
const icoSizes = [256, 128, 64, 48, 32, 16];
fs.writeFileSync(path.join(OUT, 'favicon.ico'), ico(await Promise.all(icoSizes.map(async (size) => ({ size, data: await png(size) })))));

console.log('✓ src/app/icon1.svg, icon2.png, apple-icon.png and favicon.ico written');
