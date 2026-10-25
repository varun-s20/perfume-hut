'use client';

import { useEffect } from 'react';
import styles from './status-page.module.css';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Replace with an error-reporting service (e.g. Sentry) once one is configured.
    console.error(error);
  }, [error]);

  return (
    <section className={styles.status} aria-labelledby="error-title">
      <h1 id="error-title" className={styles.title}>
        Something went wrong
      </h1>
      <p className={styles.text}>Please try again in a moment.</p>
      <button type="button" className={styles.retry} onClick={reset}>
        Try again
      </button>
    </section>
  );
}
