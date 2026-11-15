import type { Metadata, Viewport } from 'next';
import { Newsreader, IBM_Plex_Mono } from 'next/font/google';
import site from '@site';
import ThemeSync from '@/components/ThemeSync';
import './globals.css';

const serif = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-serif',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/blog/rss.xml', title: `${site.name}: Blog` },
        { url: '/travel/rss.xml', title: `${site.name}: Travel` },
      ],
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#100D0C' },
    { media: '(prefers-color-scheme: light)', color: '#F4EFE7' },
  ],
};

// Runs before first paint: Home is always dark; elsewhere the stored choice, else the system setting.
const themeScript = `(function(){try{var d=document.documentElement,p=location.pathname.replace(/\\/$/,'');if(p===''||p==='/index.html'){d.dataset.theme='dark';return}var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';d.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main" className="skip mono">
          Skip to content
        </a>
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
