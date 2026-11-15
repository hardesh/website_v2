import type { Metadata } from 'next';
import site from '@site';

interface MetaInput {
  title?: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  markdownAlternate?: string;
}

export const abs = (p: string) => new URL(p, site.url).toString();

/** Title, description, canonical, Open Graph and Twitter card for one route. */
export function pageMeta({ title, description, path, image = site.headerImage, type = 'website', publishedTime, markdownAlternate }: MetaInput): Metadata {
  const fullTitle = title ? `${title} | ${site.name}` : site.name;
  return {
    title: title ? title : { absolute: site.name },
    description,
    alternates: {
      canonical: path,
      ...(markdownAlternate ? { types: { 'text/markdown': markdownAlternate } } : {}),
    },
    openGraph: {
      type,
      url: path,
      siteName: site.name,
      title: fullTitle,
      description,
      locale: 'en_US',
      images: [{ url: image, width: image.startsWith('/og/') ? 1200 : undefined, height: image.startsWith('/og/') ? 630 : undefined }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [image] },
  };
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export const person = () => ({
  '@type': 'Person',
  name: site.name,
  url: site.url,
});
