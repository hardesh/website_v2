import Link from 'next/link';
import site from '@site';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import styles from '@/components/BlogPost.module.css';

export const metadata = { title: 'Not found', robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <TopBar name={site.name} nav={site.nav} />
      <main id="main" className={`${styles.head} ${styles.headText}`}>
        <div className={styles.meta}>
          <p className="mono label-accent">404</p>
        </div>
        <div className={styles.titleCol}>
          <h1 className={styles.title}>
            <em>Nothing here.</em>
          </h1>
          <p className={styles.standfirst}>
            That page doesn’t exist. <Link href="/" style={{ textDecoration: 'underline' }}>Go home</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
