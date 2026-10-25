import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTransition } from '@/components/ui/PageTransition';
import { BagView } from './BagView';

export const metadata: Metadata = {
  title: 'Your bag',
  robots: { index: false },
};

export default function BagPage() {
  return (
    <PageTransition>
      <PageHeader eyebrow="Checkout" title={['Your bag']} />
      <BagView />
    </PageTransition>
  );
}
