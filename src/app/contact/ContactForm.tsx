'use client';

import { type ReactNode, useActionState } from 'react';
import { type ContactField, sendContactMessage } from '@/app/actions';
import { ChevronDownIcon } from '@/components/icons';
import { buttonClassName, ButtonIcon } from '@/components/ui/ButtonLink';
import { contactTopics } from '@/content/contact';
import { cx } from '@/lib/cx';
import type { FormState } from '@/lib/validation';
import styles from './page.module.css';

const initialState: FormState<ContactField> = { status: 'idle' };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);
  const errors = state.fieldErrors ?? {};

  if (state.status === 'success') {
    return (
      <div className={cx(styles.card, styles.success)} role="status">
        <p className={styles.successTitle}>Message received.</p>
        <p>{state.message}</p>
      </div>
    );
  }

  const describedBy = (field: ContactField) =>
    errors[field] ? `contact-${field}-error` : undefined;

  return (
    <form action={formAction} className={cx(styles.card, styles.form)} noValidate>
      {state.status === 'error' && state.message && (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      )}

      <div className={styles.row}>
        <Field label="Name" error={errors.name} id="contact-name" errorId={describedBy('name')}>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            autoCapitalize="words"
            required
            maxLength={120}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy('name')}
          />
        </Field>
        <Field label="Email" error={errors.email} id="contact-email" errorId={describedBy('email')}>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy('email')}
          />
        </Field>
      </div>

      <Field label="Topic" error={errors.topic} id="contact-topic" errorId={describedBy('topic')}>
        <span className={styles.select}>
          <select
            id="contact-topic"
            name="topic"
            required
            defaultValue=""
            aria-invalid={errors.topic ? true : undefined}
            aria-describedby={describedBy('topic')}
          >
            <option value="" disabled>
              Choose a topic
            </option>
            {contactTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
          <ChevronDownIcon className={styles.chevron} />
        </span>
      </Field>

      <Field
        label="Message"
        error={errors.message}
        id="contact-message"
        errorId={describedBy('message')}
      >
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          maxLength={4000}
          placeholder="Tell us what you wear now, what you love, or the bottle you’re hunting for."
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy('message')}
        />
      </Field>

      <button
        type="submit"
        className={cx(buttonClassName({ size: 'large' }), styles.submit)}
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? 'Sending…' : 'Send message'}
        <ButtonIcon />
      </button>
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  errorId?: string;
  children: ReactNode;
};

function Field({ id, label, error, errorId, children }: FieldProps) {
  return (
    <div className={styles.field} data-invalid={error ? true : undefined}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} className={styles.fieldError}>
          {error}
        </p>
      )}
    </div>
  );
}
