'use client';

import { useActionState } from 'react';
import { subscribeToNewsletter } from '@/app/actions';
import { ArrowRightIcon } from '@/components/icons';
import type { FormState } from '@/lib/validation';
import styles from './NewsletterForm.module.css';

const initialState: FormState<'email'> = { status: 'idle' };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);
  const error = state.fieldErrors?.email;

  return (
    <form action={formAction} className={styles.form} noValidate>
      <div className={styles.field} data-state={state.status}>
        <label htmlFor="newsletter-email" className="visually-hidden">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Your email"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby="newsletter-status"
          className={styles.input}
        />
        <button type="submit" className={styles.submit} disabled={pending}>
          <span className="visually-hidden">Subscribe</span>
          <ArrowRightIcon className={styles.arrow} />
        </button>
      </div>
      <p id="newsletter-status" className={styles.status} aria-live="polite">
        {error ?? state.message ?? ''}
      </p>
    </form>
  );
}
