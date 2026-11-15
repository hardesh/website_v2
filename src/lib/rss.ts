import site from '@site';
import type { Post } from './content';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function rss(title: string, path: string, description: string, posts: Post[]) {
  const link = site.url + path;
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${site.url}${p.url}</link>
      <guid isPermaLink="true">${site.url}${p.url}</guid>
${p.date ? `      <pubDate>${new Date(p.date + 'T00:00:00Z').toUTCString()}</pubDate>\n` : ''}      <description>${esc(p.summary)}</description>
    </item>`,
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(title)}</title>
    <link>${link}</link>
    <description>${esc(description)}</description>
    <language>en</language>
    <atom:link href="${link}/rss.xml" rel="self" type="application/rss+xml"/>
${posts[0]?.date ? `    <lastBuildDate>${new Date(posts[0].date + 'T00:00:00Z').toUTCString()}</lastBuildDate>\n` : ''}${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
