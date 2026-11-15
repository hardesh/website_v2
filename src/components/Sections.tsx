import Link from 'next/link';
import type { Section } from '@/lib/content';
import Prose from './Prose';
import Split from './Split';

/** Renders a page's ## sections: entries (### Title | meta + bullets) or big link rows. */
export default function Sections({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((s, i) => (
        <Split key={i} label={`${String(i + 1).padStart(2, '0')}${s.title ? ` · ${s.title}` : ''}`}>
          {s.links ? (
            <ul className="rows">
              {s.links.map((l) => {
                const external = /^https?:/.test(l.href);
                const inner = (
                  <>
                    <span className="row__title">{l.label}</span>
                    {l.meta && <span className="mono row__meta">{l.meta}</span>}
                  </>
                );
                return (
                  <li key={l.href}>
                    {external ? (
                      <a className="row" href={l.href} rel="noopener">
                        {inner}
                      </a>
                    ) : (
                      <Link className="row" href={l.href}>
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <>
              {s.body && <Prose markdown={s.body} className="entry__body ul" />}
              {s.entries.map((e, j) => (
                <div key={j} className="entry">
                  <div className="entry__head">
                    <h3 className="section-h">{e.title}</h3>
                    {e.meta && <span className="mono label-dim">{e.meta}</span>}
                  </div>
                  {e.body && <Prose markdown={e.body} className="entry__body ul" />}
                </div>
              ))}
            </>
          )}
        </Split>
      ))}
    </>
  );
}
