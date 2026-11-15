import site from '@site';
import styles from './Footer.module.css';

export default function Footer({ variant = 'page' }: { variant?: 'page' | 'home' }) {
  if (variant === 'home') {
    return (
      <footer className={styles.home}>
        {site.social.map((s) => (
          <a key={s.href} className="mono" href={s.href} rel="me noopener">
            {s.label}
          </a>
        ))}
        <a className="mono" href={site.substack} rel="me noopener">
          Substack ↗
        </a>
      </footer>
    );
  }
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className="mono">{site.name}</span>
        <nav aria-label="Social" className={styles.social}>
          {site.social.map((s) => (
            <a key={s.href} className="mono" href={s.href} rel="me noopener">
              {s.label}
            </a>
          ))}
        </nav>
        <span className="mono label-dim" lang="en">EN</span>
      </div>
    </footer>
  );
}
