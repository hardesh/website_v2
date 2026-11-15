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
    webpack(config, { isServer }) {
      if (dev && isServer) config.plugins.push(new WatchContentPlugin());
      return config;
    },
  };
}
