import * as React from 'react';
import { Text, Section, Heading } from 'react-email';
import { CheckCircle2 } from 'lucide-react';
import { Layout, Callout, DetailRow, IconBadge, Button } from '../components';
import { EMAILS_CONFIG } from '../constants';

export interface SplitSettledReceiptProps {
  payerName?: string;
  recipientName?: string;
  settledAmount?: string;
  settledVia?: string;
  settledAt?: string;
  expenseDescription?: string;
  remainingNetBalance?: string;
  dashboardUrl?: string;
}

export const SplitSettledReceipt = ({
  payerName = 'Arjun Sharma',
  recipientName = 'Priya Patel',
  settledAmount = '₹1,200.00',
  settledVia = 'UPI (PhonePe)',
  settledAt = '29 Sep 2026, 11:20 AM IST',
  expenseDescription = 'Weekend Dinner at The Bombay Canteen',
  remainingNetBalance = '₹0.00 (All settled up)',
  dashboardUrl = 'https://kalya.app/split',
}: SplitSettledReceiptProps) => {
  return (
    <Layout preview={`Payment Receipt: ${settledAmount} settled between you and ${recipientName}`}>
      <Section className="text-center">
        <IconBadge
          icon={CheckCircle2}
          background={EMAILS_CONFIG.color.successSubtle}
          color={EMAILS_CONFIG.color.success}
          size={24}
        />
        <Heading className="m-0 font-display text-[22px] font-semibold text-brand-textPrimary mb-2">
          Payment Settled
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-[24px] text-brand-textSecondary mb-6">
          The split balance between <strong>{payerName}</strong> and{' '}
          <strong>{recipientName}</strong> has been marked as settled.
        </Text>
      </Section>

      <Section className="bg-brand-surfaceRaised border border-solid border-brand-border rounded-xl p-5 text-center mb-6">
        <Text className="m-0 font-body text-[13px] text-brand-textMuted uppercase tracking-wider mb-1">
          Amount Settled
        </Text>
        <Text className="m-0 font-numeric text-[32px] font-bold text-brand-success leading-tight">
          {settledAmount}
        </Text>
        <Text className="m-0 font-body text-[12px] text-brand-textSecondary mt-1">
          Settlement confirmed via {settledVia}
        </Text>
      </Section>

      <Section className="my-6">
        <DetailRow label="Paid By" value={payerName} />
        <DetailRow label="Received By" value={recipientName} />
        <DetailRow label="Original Expense" value={expenseDescription} />
        <DetailRow label="Settled On" value={settledAt} />
        <DetailRow label="Payment Method" value={settledVia} />
        <DetailRow label="Net Balance Between You" value={remainingNetBalance} last />
      </Section>

      <Callout tone="success">
        This transaction has been reflected in both of your Kalya ledger accounts and monthly
        expense balances.
      </Callout>

      <Section className="text-center my-8">
        <Button href={dashboardUrl}>View Split History</Button>
      </Section>
    </Layout>
  );
};

export default SplitSettledReceipt;
