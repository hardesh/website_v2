import site from '@site';

export default function Footer({ variant = 'page' }: { variant?: 'page' | 'home' }) {
  if (variant === 'home') {
    return (
      <footer className="home-footer">
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
    <footer className="footer">
      <div className="footer__inner">
        <span className="mono">{site.name}</span>
        <nav aria-label="Social" className="footer__social">
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
