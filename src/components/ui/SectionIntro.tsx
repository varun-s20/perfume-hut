import { EyebrowPill } from './EyebrowPill';
import { Lines } from './Lines';
import styles from './SectionIntro.module.css';

type SectionIntroProps = {
  headingId: string;
  lines: readonly string[];
};

/** Centred eyebrow pill and display heading that opens a section. */
export function SectionIntro({ headingId, lines }: SectionIntroProps) {
  return (
    <header className={styles.intro}>
      <EyebrowPill />
      <h2 id={headingId} className={styles.heading}>
        <Lines lines={lines} breaks="always" />
      </h2>
    </header>
  );
}
