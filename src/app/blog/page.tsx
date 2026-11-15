import Link from 'next/link';
import site from '@site';
import { fmtDate, getBlogPosts, type BlogPost } from '@/lib/content';
import { pageMeta } from '@/lib/seo';
import PageHeading from '@/components/PageHeading';
import Split from '@/components/Split';
import Footer from '@/components/Footer';

const s = site.sections.blog;

export const metadata = pageMeta({ title: 'Blog', description: s.description, path: '/blog' });

export default function BlogIndex() {
  const posts = getBlogPosts();
  const byYear = new Map<string, BlogPost[]>();
  for (const p of posts) byYear.set(p.year, [...(byYear.get(p.year) ?? []), p]);

  return (
    <>
      <PageHeading eyebrow="Blog" heading={s.heading} headingEm={s.headingEm} intro={s.intro} />
      <main id="main">
        {posts.length === 0 && (
          <Split label="Coming soon">
            <p className="empty ul">
              The first posts are on their way. Until then, I write now and then on{' '}
              <a href={site.substack} rel="noopener">
                Substack ↗
              </a>
              .
            </p>
          </Split>
        )}
        {[...byYear].map(([year, list]) => (
          <Split key={year} label={`${year} · Posts`}>
            <ul className="rows">
              {list.map((p) => (
                <li key={p.slug}>
                  <Link className="row" href={p.url}>
                    <span className="row__title">{p.title}</span>
                    <span className="mono row__meta">
                      <time dateTime={p.date}>{fmtDate(p.date, 'day')}</time> · {p.readingMinutes} min
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Split>
        ))}
      </main>
      <Footer />
    </>
  );
}
