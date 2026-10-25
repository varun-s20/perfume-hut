import type { Route } from 'next';
import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { SendIcon } from '@/components/icons';
import { cx } from '@/lib/cx';
import styles from './Button.module.css';

export type ButtonVariant = {
  tone?: 'dark' | 'light';
  size?: 'default' | 'large';
  block?: boolean;
};

export function buttonClassName({ tone = 'dark', size = 'default', block }: ButtonVariant = {}) {
  return cx(
    styles.button,
    tone === 'light' && styles.light,
    size === 'large' && styles.large,
    block && styles.block,
  );
}

export function ButtonIcon({ children }: { children?: ReactNode }) {
  return <span className={styles.icon}>{children ?? <SendIcon />}</span>;
}

type ButtonLinkProps = ButtonVariant & {
  href: Route;
  children: ReactNode;
  className?: string;
  transitionTypes?: ComponentProps<typeof Link>['transitionTypes'];
};

export function ButtonLink({
  href,
  children,
  className,
  transitionTypes,
  ...variant
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      transitionTypes={transitionTypes}
      className={cx(buttonClassName(variant), className)}
    >
      {children}
      <ButtonIcon />
    </Link>
  );
}
