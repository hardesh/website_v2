// Generates the favicons in src/app/ (Next.js adds the <link> tags automatically):
//   icon1.svg (modern browsers), icon2.png (512×512, Android/search results), apple-icon.png (180×180, iOS),
//   favicon.ico (16–256 px).
// The icon is a glowing sun in the site's coral orange: a mottled disc, a bright gold rim and a wispy corona,
// modelled on a photo of the sun. Run `just icons` after changing the settings below. The output is committed.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'src', 'app');

// Colours (coral, matching the site's --accent orange).
const SUN = {
  core: '#F07A4F', // centre of the disc
  body: '#E4572E', // most of the disc (--accent)
  edge: '#EE7A3A', // just inside the rim
  limb: '#F2C230', // the bright rim (--yellow)
  corona: '#F07A4F', // the glow around the disc
  wisp: '#F6A65A', // the thin streaks in the corona
  spot: '#8A2410', // the darker mottling on the surface
};
const RADIUS = 19; // disc radius (the icon is a 64-unit box, so 32 reaches the edge)
const WISPS = 70; // number of streaks in the corona
const MOTTLE = 0.7; // strength of the surface mottling (0 = smooth disc)
const SEED = 11; // change for a different (but still fixed) arrangement of streaks
const APPLE_BG = '#100D0C'; // iOS fills transparent icons with black, so the home-screen icon gets the site's dark background

/** Small seeded random generator, so the streaks come out identical on every run. */
function random(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rgb = (hex) => [1, 3, 5].map((i) => (parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(3));

/** The sun at a 64-unit viewBox. `scale` shrinks everything around the centre (the apple icon needs padding). */
function svg({ background, scale = 1 } = {}) {
  const R = RADIUS;
  const rand = random(SEED);
  let wisps = '';
  for (let i = 0; i < WISPS; i++) {
    const a = rand() * Math.PI * 2;
    const len = 3 + rand() * 9;
    const w = 0.25 + rand() * 0.7;
    const r0 = R - 0.5;
    const r1 = R + len;
    const [x0, y0] = [32 + r0 * Math.cos(a), 32 + r0 * Math.sin(a)];
    const [x1, y1] = [32 + r1 * Math.cos(a), 32 + r1 * Math.sin(a)];
    const [px, py] = [-Math.sin(a) * w, Math.cos(a) * w];
    const f = (n) => n.toFixed(2);
    wisps += `    <path d="M${f(x0 + px)},${f(y0 + py)}L${f(x1)},${f(y1)}L${f(x0 - px)},${f(y0 - py)}Z" fill="${SUN.wisp}" opacity="${(0.15 + rand() * 0.35).toFixed(2)}"/>\n`;
  }
  const [sr, sg, sb] = rgb(SUN.spot);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <radialGradient id="corona" cx="32" cy="32" r="32" gradientUnits="userSpaceOnUse">
      <stop offset="0.55" stop-color="${SUN.limb}"/>
      <stop offset="0.63" stop-color="${SUN.corona}" stop-opacity="0.75"/>
      <stop offset="0.78" stop-color="${SUN.corona}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${SUN.corona}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="disc" cx="32" cy="32" r="${R}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${SUN.core}"/>
      <stop offset="0.75" stop-color="${SUN.body}"/>
      <stop offset="0.94" stop-color="${SUN.edge}"/>
      <stop offset="1" stop-color="${SUN.limb}"/>
    </radialGradient>
    <filter id="mottle" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.21" numOctaves="3" seed="5" result="noise"/>
      <feColorMatrix in="noise" type="matrix" values="0 0 0 0 ${sr}  0 0 0 0 ${sg}  0 0 0 0 ${sb}  0 0 0 -3.4 1.95"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="0.7"/></filter>
  </defs>
${background ? `  <rect width="64" height="64" fill="${background}"/>\n` : ''}  <g transform="translate(32 32) scale(${scale}) translate(-32 -32)">
    <circle cx="32" cy="32" r="32" fill="url(#corona)"/>
${wisps}    <circle cx="32" cy="32" r="${R}" fill="url(#disc)"/>
    <circle cx="32" cy="32" r="${R}" fill="#000" filter="url(#mottle)" opacity="${MOTTLE}"/>
    <circle cx="32" cy="32" r="${R - 0.3}" fill="none" stroke="${SUN.limb}" stroke-width="1.4" opacity="0.55" filter="url(#soft)"/>
  </g>
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

// The 512px icon is only for Android / search results; a 256-colour palette keeps it small with no visible loss.
fs.writeFileSync(path.join(OUT, 'icon2.png'), await sharp(await png(512)).png({ palette: true, colours: 256, compressionLevel: 9 }).toBuffer());

// iOS draws its own rounded corners, so the apple icon is a full square with padding around the star.
const apple = await png(180, svg({ background: APPLE_BG, scale: 0.9 }));
fs.writeFileSync(path.join(OUT, 'apple-icon.png'), apple);

// Only small sizes: browsers that want bigger use icon1.svg / icon2.png. Largest first (Next.js reads it for `sizes`).
const icoSizes = [48, 32, 16];
fs.writeFileSync(path.join(OUT, 'favicon.ico'), ico(await Promise.all(icoSizes.map(async (size) => ({ size, data: await png(size) })))));

console.log('✓ src/app/icon1.svg, icon2.png, apple-icon.png and favicon.ico written');
