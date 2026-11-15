import path from 'node:path';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/** Makes `next dev` reload the page when markdown in content/ or JSON in data/ changes (they're read with fs, not imported). */
class WatchContentPlugin {
  apply(compiler) {
    compiler.hooks.afterCompile.tap('WatchContentPlugin', (compilation) => {
      compilation.contextDependencies.add(path.resolve('content'));
      compilation.contextDependencies.add(path.resolve('data'));
    });
  }
}

/** @type {(phase: string) => import('next').NextConfig} */
export default function nextConfig(phase) {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    output: 'export',
    images: { unoptimized: true },
    trailingSlash: false,
    poweredByHeader: false,
    // `next dev` and `next build` use separate folders, so building while the dev server runs can't break it.
    distDir: dev ? '.next-dev' : '.next',
    // Builds use Turbopack (Next 16's default) with no webpack config. `npm run dev` runs `next dev --webpack`
    // so this plugin can reload the page when content/ or data/ changes.
    ...(dev && {
      webpack(config, { isServer }) {
        if (isServer) config.plugins.push(new WatchContentPlugin());
        return config;
      },
    }),
  };
}
