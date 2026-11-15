import Image from 'next/image';
import Link from 'next/link';
import path from 'node:path';
import site from '@site';
import { fmtDate, type Post } from '@/lib/content';
import TopBar from './TopBar';
import Prose from './Prose';
import styles from './BlogPost.module.css';

export type PostLayout = 'text' | 'cover';

interface Props {
  post: Post;
  /** "text": title, meta, body. "cover": a full-width cover photo above the title. Add new layouts here. */
  layout: PostLayout;
  older?: Post;
  newer?: Post;
}

/** One travel story or blog post. Both sections share this component; the layout prop switches the top. */
export default function BlogPost({ post, layout, older, newer }: Props) {
  const isTravel = post.kind === 'travel';
  const section = isTravel ? 'Travel' : 'Blog';
  const showCover = layout === 'cover' && post.cover;
  const baseUrl = isTravel ? `/travel/${post.slug}/` : '/';
  const baseDir = isTravel ? path.join(process.cwd(), 'content', 'travel', post.slug) : undefined;

  return (
    <>
      <TopBar name={site.name} nav={site.nav} />
      <main id="main">
        <article>
          {showCover && post.cover && (
            <div className={styles.cover}>
              <div className={styles.coverFrame}>
                <div className={styles.coverLeft} aria-hidden="true" />
                <div className={styles.coverPhoto}>
                  <Image src={post.cover.src} alt={post.cover.alt} fill priority sizes="(max-width: 1280px) 88vw, 1100px" />
                </div>
                <div className={styles.coverRight} aria-hidden="true" />
              </div>
            </div>
          )}

          <header className={`${styles.head}${showCover ? '' : ` ${styles.headText}`}`}>
            <div className={styles.meta}>
              <p className="mono label-accent">
                <Link href={isTravel ? '/travel' : '/blog'} style={{ color: 'inherit' }}>
                  {section}
                </Link>
              </p>
              {post.kind === 'travel' && post.place && <p className="mono label-muted">{post.place}</p>}
              <p className="mono label-dim">
                {post.date && (
                  <>
                    <time dateTime={post.date}>{fmtDate(post.date)}</time> ·{' '}
                  </>
                )}
                {post.readingMinutes} min read
              </p>
            </div>
            <div className={styles.titleCol}>
              <h1 className={styles.title}>
                <em>{post.title}</em>
              </h1>
              {post.standfirst && <p className={styles.standfirst}>{post.standfirst}</p>}
            </div>
          </header>

          <div className={styles.body}>
            <div className={styles.spacer} />
            <Prose markdown={post.body} baseUrl={baseUrl} baseDir={baseDir} className={styles.text} />
          </div>
        </article>

        {(older || newer) && (
          <nav className={styles.pager} aria-label={isTravel ? 'More stories' : 'More posts'}>
            {older && (
              <Link href={older.url}>
                <span className="mono label-dim">← Older</span>
                <span className={styles.pagerTitle}>{older.title}</span>
              </Link>
            )}
            {newer && (
              <Link href={newer.url} className={styles.next}>
                <span className="mono label-dim">Newer →</span>
                <span className={styles.pagerTitle}>{newer.title}</span>
              </Link>
            )}
          </nav>
        )}
      </main>
    </>
  );
}
