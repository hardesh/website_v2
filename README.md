# harshaldeshpande.info

Next.js (App Router, static export) site, deployed to GitHub Pages by `.github/workflows/deploy.yml`.

- Run `just` to see the everyday commands (`just travel`, `just blog`, `just photo`, `just place`, `just ship`, `just publish` …).
- Content: `content/*.md` (pages), `content/travel/<slug>/index.md` (+ photos), `content/blog/<slug>.md`.
- Data: `data/places.json` (map pins without a story), `data/books.json` (Goodreads, synced nightly, never edit by hand).
- Settings: `site.config.ts` (header image, home fade, default blog layout, nav, socials).
- On `npm run build`, `prebuild` writes `public/llms.txt`, `public/llms-full.txt`, post `.md` copies, OG images and travel photos (all git-ignored).

Structured pages (Now, Work, Notes, Podcasts): `## Section`, then `### Entry | right-hand label` with bullets,
or a section that is only a list of `- [Link](url) | label` rows.

Setup on GitHub: Settings → Pages → Source: GitHub Actions. The Goodreads user id lives in `scripts/sync-goodreads.mjs`; the profile must be public for its shelf feeds to work.
