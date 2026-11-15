import { notFound } from 'next/navigation';
import site from '@site';
import { getBlogPost, getBlogPosts } from '@/lib/content';
import { abs, breadcrumbs, pageMeta, person } from '@/lib/seo';
import BlogPost from '@/components/BlogPost';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';

export const dynamicParams = false;

export function generateStaticParams() {
  return getBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return pageMeta({
    title: post.title,
    description: post.summary || `${post.title}, by ${site.name}.`,
    path: post.url,
    image: `/og/blog-${post.slug}.jpg`,
    type: 'article',
    publishedTime: post.date,
    markdownAlternate: `${post.url}.md`,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = getBlogPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) notFound();
  const post = posts[i];

  return (
    <>
      <BlogPost post={post} layout={post.layout} newer={posts[i - 1]} older={posts[i + 1]} />
      <Footer />
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.summary,
            datePublished: post.date,
            dateModified: post.date,
            url: abs(post.url),
            mainEntityOfPage: abs(post.url),
            image: [abs(`/og/blog-${post.slug}.jpg`)],
            author: person(),
            publisher: person(),
          },
          breadcrumbs([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: post.url },
          ]),
        ]}
      />
    </>
  );
}
