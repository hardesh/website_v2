import type { ReactNode } from 'react';

/** Two-column block used across pages: a small accent label on the left, content on the right. */
export default function Split({ label, children, as: Tag = 'section', labelAs: Label = 'h2' }: { label: string; children: ReactNode; as?: 'section' | 'div'; labelAs?: 'h2' | 'p' }) {
  return (
    <Tag className="split">
      <div className="split__label">
        <Label className="mono label-accent">{label}</Label>
      </div>
      <div className="split__body">{children}</div>
    </Tag>
  );
}
