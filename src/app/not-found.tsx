import Link from 'next/link';
import site from '@site';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';

export const metadata = { title: 'Not found', robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <TopBar name={site.name} nav={site.nav} />
      <main id="main" className="post-head post-head--text">
        <div className="post-head__meta">
          <p className="mono label-accent">404</p>
        </div>
        <div className="post-head__title">
          <h1 className="post-title">
            <em>Nothing here.</em>
          </h1>
          <p className="standfirst">
            That page doesn’t exist. <Link href="/" style={{ textDecoration: 'underline' }}>Go home</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
