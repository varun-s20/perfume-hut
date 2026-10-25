'use server';

import { contactTopics } from '@/content/contact';
import { type FormState, isValidEmail, readField } from '@/lib/validation';

/*
 * Form handlers. Both validate on the server (never trust the client) and are
 * ready to forward to a provider. TODO before launch: connect the newsletter
 * to the email platform and route contact messages to the shared inbox.
 */

export async function subscribeToNewsletter(
  _previous: FormState<'email'>,
  formData: FormData,
): Promise<FormState<'email'>> {
  const email = readField(formData, 'email');
  if (!isValidEmail(email)) {
    return { status: 'error', fieldErrors: { email: 'Enter a valid email address.' } };
  }

  // Integration point: add `email` to the mailing list here.
  return { status: 'success', message: 'You’re on the list. Watch your inbox for the next drop.' };
}

export type ContactField = 'name' | 'email' | 'topic' | 'message';

export async function sendContactMessage(
  _previous: FormState<ContactField>,
  formData: FormData,
): Promise<FormState<ContactField>> {
  const name = readField(formData, 'name');
  const email = readField(formData, 'email');
  const topic = readField(formData, 'topic');
  const message = readField(formData, 'message');

  const fieldErrors: Partial<Record<ContactField, string>> = {};
  if (!name || name.length > 120) fieldErrors.name = 'Tell us your name.';
  if (!isValidEmail(email)) fieldErrors.email = 'Enter a valid email address.';
  if (!contactTopics.some((option) => option === topic)) fieldErrors.topic = 'Choose a topic.';
  if (message.length < 10 || message.length > 4000) {
    fieldErrors.message = 'Write at least a sentence (up to 4,000 characters).';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors };
  }

  // Integration point: deliver { name, email, topic, message } to the inbox here.
  return {
    status: 'success',
    message: `Thanks, ${name.split(' ')[0]}. An advisor will reply to ${email} soon.`,
  };
}
