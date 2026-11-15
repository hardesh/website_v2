import type { MetadataRoute } from 'next';
import site from '@site';
import { getBlogPosts, getPage, getTravelPosts } from '@/lib/content';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const travel = getTravelPosts().filter((p) => !p.draft);
  const blog = getBlogPosts().filter((p) => !p.draft);
  const latest = (list: { date: string }[]) => list[0]?.date;
  const pageDate = (slug: string) => getPage(slug).updated;

  const entries: { path: string; date?: string }[] = [
    { path: '/' },
    { path: '/now', date: pageDate('now') },
    { path: '/work', date: pageDate('work') },
    { path: '/travel', date: latest(travel) },
    { path: '/blog', date: latest(blog) },
    { path: '/notes', date: pageDate('notes') },
    { path: '/bookshelf' },
    { path: '/podcasts', date: pageDate('podcasts') },
    ...travel.map((p) => ({ path: p.url, date: p.date })),
    ...blog.map((p) => ({ path: p.url, date: p.date })),
  ];
  return entries.map((e) => ({ url: site.url + (e.path === '/' ? '' : e.path), ...(e.date ? { lastModified: e.date } : {}) }));
}
