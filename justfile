# harshaldeshpande.info: everyday commands.  Run `just` to list them.
set dotenv-load
set shell := ["bash", "-euo", "pipefail", "-c"]

today := `date +%F`

# List all commands
default:
    @just --list --unsorted

# ── Writing ────────────────────────────────────────────────────────────

# New travel story: just travel amsterdam-2026 "Amsterdam" "Amsterdam, Netherlands"
travel slug title="" place="":
    #!/usr/bin/env bash
    set -euo pipefail
    dir="content/travel/{{slug}}"
    if [ -e "$dir" ]; then echo "✗ $dir already exists"; exit 1; fi
    title="{{title}}"; [ -z "$title" ] && title="{{slug}}"
    mkdir -p "$dir"
    {
      echo '---'
      echo "title: \"$title\""
      echo "place: \"{{place}}\""
      echo "date: {{today}}"
      echo "cover: cover.jpg"
      echo 'summary: ""'
      echo 'lat: '
      echo 'lon: '
      echo 'draft: true'
      echo '---'
      echo
      echo 'Start writing here.'
    } > "$dir/index.md"
    echo "✓ Created $dir/index.md"
    if [ -n "{{place}}" ]; then just locate "{{slug}}" || echo "  (couldn't look up the map pin; run: just locate {{slug}})"; fi
    echo "  Next: just photo {{slug}} <path-to-photo> --cover"

# Look up map coordinates for a travel story from its `place:` (OpenStreetMap): just locate amsterdam-2026
locate slug:
    #!/usr/bin/env node
    const fs = require('fs');
    const file = 'content/travel/{{slug}}/index.md';
    if (!fs.existsSync(file)) { console.error('✗ No travel story at ' + file); process.exit(1); }
    let md = fs.readFileSync(file, 'utf8');
    const m = md.match(/^place:\s*"?([^"\n]*)"?\s*$/m);
    const place = m && m[1].trim();
    if (!place) { console.error('✗ Set place: "City, Country" in ' + file + ' first'); process.exit(1); }
    const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(place);
    fetch(url, { headers: { 'User-Agent': 'harshaldeshpande.info travel map (just locate)' } })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(res => {
        if (!res.length) throw new Error('no match for "' + place + '"');
        const lat = (+res[0].lat).toFixed(4), lon = (+res[0].lon).toFixed(4);
        const set = (k, v) => { md = new RegExp('^' + k + ':.*$', 'm').test(md) ? md.replace(new RegExp('^' + k + ':.*$', 'm'), k + ': ' + v) : md.replace(/^---\n([\s\S]*?)\n---/, (a, b) => '---\n' + b + '\n' + k + ': ' + v + '\n---'); };
        set('lat', lat); set('lon', lon);
        fs.writeFileSync(file, md);
        console.log('✓ Map pin: ' + lat + ', ' + lon + '  (' + res[0].display_name + ')');
        console.log('  Wrong spot? Make place: more specific and run: just locate {{slug}}');
      })
      .catch(e => { console.error('✗ Lookup failed: ' + e.message); process.exit(1); });

# New blog post (add --cover for the cover-photo layout): just blog why-robots-fail "Why robots fail" [--cover]
blog slug title="" cover="":
    #!/usr/bin/env bash
    set -euo pipefail
    file="content/blog/{{slug}}.md"
    if [ -e "$file" ]; then echo "✗ $file already exists"; exit 1; fi
    title="{{title}}"; [ -z "$title" ] && title="{{slug}}"
    layout="text"; [ "{{cover}}" = "--cover" ] && layout="cover"
    mkdir -p content/blog
    {
      echo '---'
      echo "title: \"$title\""
      echo "date: {{today}}"
      echo 'summary: ""'
      echo "layout: $layout        # text | cover"
      [ "$layout" = "cover" ] && echo "cover: /images/blog/{{slug}}.jpg"
      echo 'draft: true'
      echo '---'
      echo
      echo 'Start writing here.'
    } > "$file"
    echo "✓ Created $file ($layout layout)"
    [ "$layout" = "cover" ] && echo "  Put the cover image at public/images/blog/{{slug}}.jpg" || true

# Add a place you've visited (no story yet) to the map: just place "Tokyo, Japan"
place name:
    #!/usr/bin/env node
    const fs = require('fs');
    const file = 'data/places.json';
    const list = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
    const name = {{quote(name)}};
    if (list.some(p => p.name.toLowerCase() === name.toLowerCase())) { console.log('• ' + name + ' is already on the map'); process.exit(0); }
    fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(name), { headers: { 'User-Agent': 'harshaldeshpande.info travel map (just place)' } })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(res => {
        if (!res.length) throw new Error('no match for "' + name + '"');
        list.push({ name, lat: +(+res[0].lat).toFixed(4), lon: +(+res[0].lon).toFixed(4) });
        fs.mkdirSync('data', { recursive: true });
        fs.writeFileSync(file, JSON.stringify(list, null, 2) + '\n');
        console.log('✓ Added ' + name + ' (' + res[0].display_name + ') to ' + file);
      })
      .catch(e => { console.error('✗ Lookup failed: ' + e.message); process.exit(1); });

# Add a photo to a travel entry (add --cover to make it the cover): just photo amsterdam-2026 ~/Pictures/canal.jpg --cover
photo slug file cover="":
    #!/usr/bin/env bash
    set -euo pipefail
    dir="content/travel/{{slug}}"
    [ -d "$dir" ] || { echo "✗ No travel entry '{{slug}}'. Run: just travel {{slug}}"; exit 1; }
    src="{{file}}"; [ -f "$src" ] || { echo "✗ File not found: $src"; exit 1; }
    if [ "{{cover}}" = "--cover" ]; then name="cover.jpg"; else name="$(basename "$src" | tr '[:upper:] ' '[:lower:]-')"; name="${name%.*}.jpg"; fi
    dest="$dir/$name"
    if command -v magick >/dev/null; then
      magick "$src" -auto-orient -resize '2400x2400>' -strip -quality 82 "$dest"
    elif command -v convert >/dev/null; then
      convert "$src" -auto-orient -resize '2400x2400>' -strip -quality 82 "$dest"
    elif command -v sips >/dev/null; then
      sips -s format jpeg -s formatOptions 82 -Z 2400 "$src" --out "$dest" >/dev/null
    else
      ext="${src##*.}"; ext="$(echo "$ext" | tr '[:upper:]' '[:lower:]')"; dest="${dest%.jpg}.$ext"; name="$(basename "$dest")"
      cp "$src" "$dest"; echo "  (no ImageMagick/sips found: copied as-is, not resized)"
      [ "{{cover}}" = "--cover" ] && [ "$ext" != "jpg" ] && echo "  Note: set 'cover: $name' in index.md"
    fi
    echo "✓ Added $dest"
    [ "{{cover}}" = "--cover" ] || echo "  Use it in the post: ![caption]($name)"

# Publish a draft (removes `draft: true`): just ship content/blog/why-robots-fail.md
ship file:
    @sed -i.bak '/^draft: true$/d' "{{file}}" && rm -f "{{file}}.bak"
    @echo "✓ {{file}} is no longer a draft"

# List all drafts
drafts:
    @grep -rl '^draft: true$' content || echo "No drafts."

# ── Site ───────────────────────────────────────────────────────────────

# Swap the site-wide header image: just header-image ~/Pictures/new.jpg
header-image file:
    cp "{{file}}" public/images/horizon.jpg
    @echo "✓ Header image replaced (public/images/horizon.jpg)"

# Pull Goodreads shelves into data/books.json
books:
    node scripts/sync-goodreads.mjs

# ── Dev ────────────────────────────────────────────────────────────────

# Install dependencies
install:
    npm ci

# Run the dev server (drafts visible)
dev:
    npm run dev

# Static build into out/
build:
    npm run build

# Build, then serve out/ locally to check the real output
preview: build
    npx --yes serve out

# Regenerate llms.txt, llms-full.txt and the .md copies of posts (also runs on every build)
llms:
    node scripts/generate-llms.mjs
    @echo "✓ public/llms.txt, public/llms-full.txt and post .md copies regenerated"

# Lint, typecheck and build
check:
    npm run lint
    npx tsc --noEmit
    npm run build

# Commit content changes and push; CI deploys: just publish "Amsterdam diary"
publish msg="content update": check
    git add content data public
    git commit -m "{{msg}}"
    git push
