import type { ReactNode } from 'react';
import styles from './Split.module.css';

/** Two-column block used across pages: a small accent label on the left, content on the right. */
export default function Split({ label, children, as: Tag = 'section', labelAs: Label = 'h2' }: { label: string; children: ReactNode; as?: 'section' | 'div'; labelAs?: 'h2' | 'p' }) {
  return (
    <Tag className={styles.split}>
      <div className={styles.label}>
        <Label className="mono label-accent">{label}</Label>
      </div>
      <div className={styles.body}>{children}</div>
    </Tag>
  );
}
