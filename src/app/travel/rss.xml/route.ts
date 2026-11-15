import site from '@site';
import { getTravelPosts } from '@/lib/content';
import { rss } from '@/lib/rss';

export const dynamic = 'force-static';

export function GET() {
  return rss(`${site.name}: Travel`, '/travel', site.sections.travel.description, getTravelPosts().filter((p) => !p.draft));
}
