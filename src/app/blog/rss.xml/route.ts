import site from '@site';
import { getBlogPosts } from '@/lib/content';
import { rss } from '@/lib/rss';

export const dynamic = 'force-static';

export function GET() {
  return rss(`${site.name}: Blog`, '/blog', site.sections.blog.description, getBlogPosts().filter((p) => !p.draft));
}
