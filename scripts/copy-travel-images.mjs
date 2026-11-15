// Copies every travel story's photos into public/travel/<slug>/ so `cover: cover.jpg` and ![](photo.jpg) resolve.
import fs from 'node:fs';
import path from 'node:path';
import { CONTENT, PUBLIC } from './lib/posts.mjs';

const src = path.join(CONTENT, 'travel');
const dest = path.join(PUBLIC, 'travel');
const IMG = /\.(jpe?g|png|webp|avif|gif|svg)$/i;
let n = 0;

if (fs.existsSync(src)) {
  for (const d of fs.readdirSync(src, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const from = path.join(src, d.name);
    const to = path.join(dest, d.name);
    for (const f of fs.readdirSync(from)) {
      if (!IMG.test(f)) continue;
      const a = path.join(from, f);
      const b = path.join(to, f);
      if (fs.existsSync(b) && fs.statSync(b).mtimeMs >= fs.statSync(a).mtimeMs) continue;
      fs.mkdirSync(to, { recursive: true });
      fs.copyFileSync(a, b);
      n++;
    }
  }
}
console.log(`✓ travel images: ${n} copied to public/travel/`);
