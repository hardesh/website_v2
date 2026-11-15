# harshaldeshpande.info

Next.js (App Router, static export) site, deployed to GitHub Pages by `.github/workflows/deploy.yml`.

- Run `just` to see the everyday commands (`just travel`, `just blog`, `just photo`, `just place`, `just ship`, `just publish` …).
- Content: `content/*.md` (pages), `content/travel/<slug>/index.md` (+ photos), `content/blog/<slug>.md`.
- Data: `data/places.json` (map pins without a story), `data/books.json` (Hardcover, synced weekly, never edit by hand).
- Settings: `site.config.ts` (header image, home fade, default blog layout, nav, socials).
- On `npm run build`, `prebuild` writes `public/llms.txt`, `public/llms-full.txt`, post `.md` copies, OG images and travel photos (all git-ignored).

Structured pages (Now, Work, Podcasts): `## Section`, then `### Entry | right-hand label` with bullets,
or a section that is only a list of `- [Link](url) | label` rows.

### Removing a page

1. Delete its markdown in `content/` (e.g. `content/podcasts.md`) and its folder in `src/app/` (e.g. `src/app/podcasts/`).
2. Remove its tab from `nav` in `site.config.ts`.
3. Remove its line from `src/app/sitemap.ts` and from the `pages` list in `scripts/generate-llms.mjs`.
4. Run `just check`. If TypeScript complains about the deleted page under `.next/types` or `.next-dev/types`,
   those are stale generated files: delete those folders and restart `just dev`.

To bring a removed page back, restore its files from git (e.g. `git checkout <commit> -- content/notes.md src/app/notes`)
and re-add the nav, sitemap and `generate-llms.mjs` entries.

Setup on GitHub: Settings → Pages → Source: GitHub Actions. The bookshelf also needs a Hardcover token (below).

## Travel: stories and map

Cities live in two places, depending on whether they have a story:

| | Where | Shows as |
|---|---|---|
| **With a story** | one folder per city in `content/travel/<slug>/` (`index.md` + photos) | a card on `/travel`, a page at `/travel/<slug>`, and a clickable pin |
| **Map-only** | an entry in `data/places.json` (name + coordinates) | a pin with no link; not affected by the year filter |

Coordinates always come from OpenStreetMap (Nominatim); never type them by hand.

```bash
just travel kyoto-2027 "Kyoto" "Kyoto, Japan"        # new story (created as a draft) + map pin
just photo kyoto-2027 ~/Pictures/kyoto.jpg --cover   # add a photo; --cover makes it the card/page cover
just ship content/travel/kyoto-2027/index.md         # publish it (removes draft: true)
just place "Chennai, India"                          # map-only pin
just locate kyoto-2027                               # redo a story's pin after editing its place:
```

- **Story front matter:** `title`, `place`, `date` (YYYY-MM-DD; drives sorting and the year filter), `cover`,
  `summary` (the line on the card), `lat`/`lon` (filled in by `just locate`), optional `group` (stories sharing one pin).
  A story without a `date` still works: it shows no date, appears only under "All", and sorts last.
- **Map-only → story:** delete the city's entry from `data/places.json`, then `just travel <slug> "Title" "City, Country"`.
  (If both exist with the same name, the map shows one pin: the story's.)
- **Story → map-only:** delete `content/travel/<slug>/`, then `just place "City, Country"`.
- **Removing a map-only city:** delete its entry from `data/places.json`.
- **Pin in the wrong spot:** make the place more specific ("Greenville, South Carolina, USA") and run `just locate <slug>`;
  for a map-only city, delete its entry and run `just place` again with the more specific name.
- **Home ring (Pune):** set in `home` in `site.config.ts`.

The map (`src/components/TravelMap.tsx`) uses MapLibre GL JS with Esri satellite tiles (no API key; keep the attribution).
It opens as a 3D globe with a Globe / Flat switch (change `DEFAULT_MODE` in that file to open flat), zooms with the
+/− buttons, Shift + scroll, pinch or double-click, and loads only when scrolled into view.

## Bookshelf (Hardcover)

`/bookshelf` (Reading, Read) and `/bookshelf/want-to-read` are built from `data/books.json`, which
`scripts/sync-hardcover.mjs` fills from your [Hardcover](https://hardcover.app) library. Never edit the JSON by hand.

| Hardcover status | Shown as | Page |
|---|---|---|
| Currently Reading | Reading | `/bookshelf` |
| Read | Read | `/bookshelf` |
| Want to Read | Want to read | `/bookshelf/want-to-read` |

To change which statuses are synced, edit `STATUSES` in `scripts/sync-hardcover.mjs`
(Hardcover ids: 1 Want to Read, 2 Currently Reading, 3 Read, 4 Paused, 5 Did Not Finish).

**How it updates:** `.github/workflows/books.yml` runs once a week, on Mondays at 03:17 UTC. If anything changed, it
commits `data/books.json` and starts the deploy workflow, so a book you mark in Hardcover shows up within a week.
Run it sooner from Actions → "Sync bookshelf from Hardcover" → Run workflow.

**Token setup** (and again whenever the token expires):

1. Create a token at https://hardcover.app/account/api → "New API Key". Read access to your library is enough;
   pick an expiry and put a reminder in your calendar for it.
2. Locally: add it to `.env` (git-ignored) in the repo root:
   ```
   HARDCOVER_TOKEN=hc_pat_...
   ```
   Then `just books` pulls your library into `data/books.json`.
3. On GitHub: save it as the repository secret `HARDCOVER_TOKEN`:
   ```bash
   sed -n 's/^HARDCOVER_TOKEN=//p' .env | gh secret set HARDCOVER_TOKEN -R hardesh/website_v2
   ```
   (or Settings → Secrets and variables → Actions → New repository secret).
4. Revoke the old token on the same Hardcover page.

**When the sync fails:** `just books` and the Action print the reason:
- *rejected the token (expired or invalid)*: the token expired or was revoked. Repeat the token setup.
- *refused the request … (token needs: …)*: the token is missing a permission. Create one with that access.
- *Set HARDCOVER_TOKEN*: `.env` or the GitHub secret is missing.

**Kindle:** Kindle doesn't sync with Hardcover. Mark books in the Hardcover app as you start and finish them
(or use KOReader with its Hardcover plugin on a jailbroken Kindle).
