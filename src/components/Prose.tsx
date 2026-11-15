import path from 'node:path';
import Image from 'next/image';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { imageInfo } from '@/lib/content';
import styles from './Prose.module.css';

interface Props {
  markdown: string;
  /** Public URL prefix for relative image paths, e.g. "/travel/amsterdam-2026/". */
  baseUrl?: string;
  /** Folder on disk that relative image paths resolve against (for width/height). */
  baseDir?: string;
  /** Extra class for the wrapper. */
  className?: string;
  /** Skip the long-form prose styles (for short markdown snippets styled by the caller). */
  bare?: boolean;
}

type ImgNode = { type: string; tagName?: string; properties?: Record<string, unknown> };

function resolve(src: string, baseUrl: string, baseDir?: string) {
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) return { url: src };
  if (src.startsWith('/')) return { url: src, file: path.join(process.cwd(), 'public', src) };
  const clean = src.replace(/^\.\//, '');
  return { url: baseUrl + clean, file: baseDir ? path.join(baseDir, clean) : undefined };
}

/** Renders post/page markdown with the site's typography. Lone images become captioned figures. */
export default function Prose({ markdown, baseUrl = '/', baseDir, className, bare = false }: Props) {
  const components: Components = {
    p({ node, children }) {
      const kids = (node?.children ?? []).filter((c) => !(c.type === 'text' && !String((c as { value?: string }).value).trim()));
      const only = kids.length === 1 ? (kids[0] as ImgNode) : undefined;
      if (only?.type === 'element' && only.tagName === 'img') {
        const caption = String(only.properties?.title || only.properties?.alt || '');
        return (
          <figure>
            {children}
            {caption && <figcaption className="mono">{caption}</figcaption>}
          </figure>
        );
      }
      return <p>{children}</p>;
    },
    img({ src, alt }) {
      if (typeof src !== 'string') return null;
      const { url, file } = resolve(src, baseUrl, baseDir);
      const info = file ? imageInfo(url, alt ?? '', file) : undefined;
      if (info) {
        return <Image src={info.src} alt={alt ?? ''} width={info.width} height={info.height} sizes="(max-width: 760px) 100vw, 680px" />;
      }
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={url} alt={alt ?? ''} loading="lazy" decoding="async" />;
    },
    a({ href, children }) {
      const external = !!href && /^https?:\/\//.test(href);
      return (
        <a href={href} {...(external ? { rel: 'noopener' } : {})}>
          {children}
        </a>
      );
    },
  };
  return (
    <div className={[bare ? '' : styles.prose, className].filter(Boolean).join(' ')}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
