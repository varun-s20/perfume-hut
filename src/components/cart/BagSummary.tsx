import Link from 'next/link';
import { buttonClassName, ButtonIcon } from '@/components/ui/ButtonLink';
import { routes } from '@/content/routes';
import { formatMoney, type Money } from '@/lib/money';
import styles from './BagSummary.module.css';

type BagSummaryProps = {
  subtotal: Money;
  onNavigate?: () => void;
};

/**
 * Checkout is not wired to a payment provider yet; the CTA is disabled and
 * customers are pointed to an advisor instead of a dead end.
 */
export function BagSummary({ subtotal, onNavigate }: BagSummaryProps) {
  return (
    <div className={styles.summary}>
      <dl className={styles.row}>
        <dt>Subtotal</dt>
        <dd>{formatMoney(subtotal)}</dd>
      </dl>
      <p className={styles.note}>Shipping and taxes are calculated at checkout.</p>
      <button
        type="button"
        className={buttonClassName({ size: 'large', block: true })}
        disabled
        aria-describedby="checkout-status"
      >
        Checkout
        <ButtonIcon />
      </button>
      <p id="checkout-status" className={styles.status}>
        Online checkout opens soon. Want it today?{' '}
        <Link href={routes.contact} onClick={onNavigate}>
          Reserve with an advisor
        </Link>
        .
      </p>
    </div>
  );
}
