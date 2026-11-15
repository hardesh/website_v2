// Site-wide settings. Content lives in content/ and data/; this file holds the knobs.
export const site = {
  name: 'Harshal Deshpande',
  url: 'https://harshaldeshpande.info',
  description:
    'Harshal Deshpande builds robots for a living. Travel stories, essays and what he is up to lately.',
  jobTitle: 'CTO',
  worksFor: 'Peppermint Robots',
  locale: 'en',

  /** One image for every page heading and the Home background. Pages can override with `header_image:`. */
  headerImage: '/images/horizon.jpg',
  /** Fraction of the Home image height that fades into the page colour (0 = no fade). */
  homeFade: 0.38,
  /** Blog post layout when a post has no `layout:` in its front matter. */
  blogLayout: 'text' as 'text' | 'cover',

  /** Home ring on the travel map. */
  home: { name: 'Pune', lat: 18.52, lon: 73.86 },

  nav: [
    { label: 'Now & Beliefs', href: '/now' },
    { label: 'Work', href: '/work' },
    { label: 'Travel', href: '/travel' },
    { label: 'Blog', href: '/blog' },
    { label: 'Bookshelf', href: '/bookshelf' },
    { label: 'Podcasts', href: '/podcasts' },
  ],

  social: [
    { label: 'GitHub', href: 'https://github.com/hardesh' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/harshal-deshpande/' },
    { label: 'Twitter', href: 'https://twitter.com/thehardesh' },
    { label: 'YouTube', href: 'https://www.youtube.com/user/StormyDoru' },
    { label: 'Instagram', href: 'https://www.instagram.com/thehardesh/' },
  ],
  substack: 'https://hardesh.substack.com/',

  /** Headings for the index pages that have no markdown file of their own. */
  sections: {
    travel: {
      description: 'Travel stories: places I’ve been, what I noticed, and a photograph from each.',
      heading: 'Notes from',
      headingEm: 'elsewhere.',
      intro: 'Places I’ve been, what I noticed, and a photograph from each. Written slowly, after the fact.',
    },
    blog: {
      description: 'Essays and longer posts by Harshal Deshpande.',
      heading: 'Long-form,',
      headingEm: 'now and then.',
      intro: 'Essays and longer posts. Each one is a single markdown file, written the same way as the travel diaries.',
    },
    wantToRead: {
      description: 'Books on my want-to-read list, synced from Hardcover.',
      heading: 'Want to',
      headingEm: 'read.',
      intro: 'Books I’ve lined up next, newest additions first. Recommendations still welcome.',
    },
    bookshelf: {
      description: 'Books I’ve read and am reading, synced from Hardcover.',
      heading: 'What I’m',
      headingEm: 'reading.',
      intro: 'Books I’ve read and the ones I’m reading now. Recommendations welcome.',
    },
  },
};

export type Site = typeof site;
export default site;
