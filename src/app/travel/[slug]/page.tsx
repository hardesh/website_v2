import { notFound } from 'next/navigation';
import site from '@site';
import { getTravelPost, getTravelPosts } from '@/lib/content';
import { abs, breadcrumbs, pageMeta, person } from '@/lib/seo';
import BlogPost from '@/components/BlogPost';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';

export const dynamicParams = false;

export function generateStaticParams() {
  return getTravelPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getTravelPost(slug);
  if (!post) return {};
  return pageMeta({
    title: post.title,
    description: post.summary || `${post.title}: a travel story by ${site.name}.`,
    path: post.url,
    image: `/og/travel-${post.slug}.jpg`,
    type: 'article',
    publishedTime: post.date || undefined,
    markdownAlternate: `${post.url}.md`,
  });
}

export default async function TravelStory({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = getTravelPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) notFound();
  const post = posts[i];

  return (
    <>
      <BlogPost post={post} layout="cover" newer={posts[i - 1]} older={posts[i + 1]} />
      <Footer />
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.summary,
            ...(post.date ? { datePublished: post.date, dateModified: post.date } : {}),
            url: abs(post.url),
            mainEntityOfPage: abs(post.url),
            image: [abs(`/og/travel-${post.slug}.jpg`), ...(post.cover ? [abs(post.cover.src)] : [])],
            author: person(),
            publisher: person(),
            ...(post.place
              ? {
                  contentLocation: {
                    '@type': 'Place',
                    name: post.place,
                    ...(post.lat != null && post.lon != null ? { geo: { '@type': 'GeoCoordinates', latitude: post.lat, longitude: post.lon } } : {}),
                  },
                }
              : {}),
          },
          breadcrumbs([
            { name: 'Home', path: '/' },
            { name: 'Travel', path: '/travel' },
            { name: post.title, path: post.url },
          ]),
        ]}
      />
    </>
  );
}
