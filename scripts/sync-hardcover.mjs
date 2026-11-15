// Pulls your Hardcover library (Currently Reading + Read) into data/books.json.
// Used by `just books` and the nightly GitHub Action.
//
// Needs a Hardcover API token in HARDCOVER_TOKEN:
//   - locally: put `HARDCOVER_TOKEN=...` in .env (git-ignored)
//   - on GitHub: a repository secret named HARDCOVER_TOKEN
// Create one at https://hardcover.app/account/api ("New API Key"); read-only access to your library is enough.
// Tokens expire: when the sync starts failing with 401, make a new one and update both places.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'data', 'books.json');
const API = 'https://api.hardcover.app/v1/graphql';
const UA = 'harshaldeshpande.info bookshelf sync (github.com/hardesh/website_v2)';

// Hardcover status ids → shelf names used by the Bookshelf page.
// Add 1 ("Want to Read") → 'to-read' here to also show books as "Up next".
const STATUSES = { 2: 'currently-reading', 3: 'read' };

function token() {
  let t = process.env.HARDCOVER_TOKEN || '';
  const envFile = path.join(ROOT, '.env');
  if (!t && fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
      const m = line.match(/^\s*HARDCOVER_TOKEN\s*=\s*"?([^"#\n]*)"?/);
      if (m) t = m[1];
    }
  }
  t = t.trim().replace(/^Bearer\s+/i, '');
  if (!t) {
    console.error('✗ Set HARDCOVER_TOKEN (in .env locally, or as a repository secret on GitHub).');
    console.error('  Create a token at https://hardcover.app/account/api');
    process.exit(1);
  }
  return t;
}

async function gql(query, variables = {}) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token()}`, 'User-Agent': UA },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error('Hardcover rejected the token (expired or invalid). Create a new one at https://hardcover.app/account/api');
  if (res.status === 403) throw new Error(`Hardcover refused the request: ${body.error_description || body.error || 'forbidden'}${body.scope ? ` (token needs: ${body.scope})` : ''}`);
  if (!res.ok) throw new Error(`Hardcover API: HTTP ${res.status} ${body.error || ''}`.trim());
  if (body.errors?.length) throw new Error(`Hardcover API: ${body.errors.map((e) => e.message || e).join('; ')}`);
  return body.data;
}

const { me } = await gql('query { me { id username } }');
const user = Array.isArray(me) ? me[0] : me;
if (!user?.id) throw new Error('Hardcover API: could not read your account (query `me` returned nothing).');

const data = await gql(
  `query Shelf($userId: Int!, $statuses: [Int!]) {
    user_books(
      where: { user_id: { _eq: $userId }, status_id: { _in: $statuses } }
      order_by: [{ last_read_date: desc_nulls_last }, { date_added: desc }]
    ) {
      status_id
      date_added
      last_read_date
      edition { image { url } }
      book {
        title
        slug
        image { url }
        contributions { author { name } }
      }
    }
  }`,
  { userId: user.id, statuses: Object.keys(STATUSES).map(Number) },
);

const books = data.user_books.map((ub) => {
  const authors = [...new Set((ub.book.contributions || []).map((c) => c.author?.name).filter(Boolean))];
  return {
    title: ub.book.title,
    author: authors.slice(0, 2).join(' & '),
    cover: ub.edition?.image?.url || ub.book.image?.url || '',
    url: ub.book.slug ? `https://hardcover.app/books/${ub.book.slug}` : undefined,
    shelf: STATUSES[ub.status_id],
    readAt: ub.last_read_date || undefined,
    addedAt: ub.date_added || undefined,
  };
});

for (const shelf of Object.values(STATUSES)) {
  console.log(`  ${shelf}: ${books.filter((b) => b.shelf === shelf).length}`);
}

const next = JSON.stringify(books, null, 2) + '\n';
const prev = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
if (next === prev) {
  console.log(`✓ data/books.json is already up to date (@${user.username})`);
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, next);
  console.log(`✓ Wrote ${books.length} books from @${user.username}'s Hardcover library to data/books.json`);
}
