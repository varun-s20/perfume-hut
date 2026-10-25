import { Fragment } from 'react';
import styles from './Lines.module.css';

type LinesProps = {
  lines: readonly string[];
  /** `desktop` lets copy reflow naturally on small screens. */
  breaks?: 'always' | 'desktop';
};

/** Renders copy with the line breaks set in the design. */
export function Lines({ lines, breaks = 'desktop' }: LinesProps) {
  const breakClassName = breaks === 'desktop' ? styles.desktopBreak : undefined;

  return lines.map((line, index) => (
    <Fragment key={index}>
      {index > 0 && (
        <>
          <br className={breakClassName} />{' '}
        </>
      )}
      {line}
    </Fragment>
  ));
}
