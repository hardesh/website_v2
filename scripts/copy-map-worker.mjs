// MapLibre GL 6 loads its web worker from a separate file, which the Next.js bundler doesn't emit.
// Copy it into public/maplibre/ so TravelMap can point MapLibre at it with setWorkerUrl().
// Runs on predev/prebuild; the copy is git-ignored.
import fs from 'node:fs';
import path from 'node:path';

const src = path.join(process.cwd(), 'node_modules', 'maplibre-gl', 'dist', 'maplibre-gl-worker.mjs');
const destDir = path.join(process.cwd(), 'public', 'maplibre');
fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, path.join(destDir, 'maplibre-gl-worker.mjs'));
console.log('✓ MapLibre worker copied to public/maplibre/');
