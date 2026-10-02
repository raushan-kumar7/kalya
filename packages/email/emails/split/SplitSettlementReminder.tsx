import * as React from 'react';
import { Text, Section, Heading } from 'react-email';
import { Clock } from 'lucide-react';
import { Layout, Callout, DetailRow, IconBadge, Button } from '../components';
import { EMAILS_CONFIG } from '../constants';

export interface SplitSettlementReminderProps {
  payerName?: string;
  recipientName?: string;
  expenseDescription?: string;
  outstandingAmount?: string;
  daysPending?: number;
  settleUrl?: string;
  upiPaymentLink?: string;
}

export const SplitSettlementReminder = ({
  payerName = 'Priya Patel',
  recipientName = 'Arjun',
  expenseDescription = 'Weekend Dinner & Groceries',
  outstandingAmount = '₹1,200.00',
  daysPending = 5,
  settleUrl = 'https://kalya.app/split/settle?id=exp_split_88219',
  upiPaymentLink = 'upi://pay?pa=priya@okhdfcbank&pn=Priya%20Patel&am=1200.00&cu=INR',
}: SplitSettlementReminderProps) => {
  return (
    <Layout
      preview={`Reminder: Outstanding split balance of ${outstandingAmount} with ${payerName}`}
    >
      <Section className="text-center">
        <IconBadge
          icon={Clock}
          background={EMAILS_CONFIG.color.warningSubtle}
          color={EMAILS_CONFIG.color.warning}
          size={24}
        />
        <Heading className="m-0 font-display text-[22px] font-semibold text-brand-textPrimary mb-2">
          Friendly Settlement Reminder
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-6 text-brand-textSecondary mb-6">
          Hi {recipientName}, this is a gentle reminder that you have an open balance pending with{' '}
          <strong>{payerName}</strong>.
        </Text>
      </Section>

      <Section className="bg-brand-surfaceRaised border border-solid border-brand-border rounded-xl p-5 text-center mb-6">
        <Text className="m-0 font-body text-[13px] text-brand-textMuted uppercase tracking-wider mb-1">
          Pending Amount
        </Text>
        <Text className="m-0 font-numeric text-[32px] font-bold text-brand-warning leading-tight">
          {outstandingAmount}
        </Text>
        <Text className="m-0 font-body text-caption text-brand-textSecondary mt-1">
          Pending for {daysPending} days
        </Text>
      </Section>

      <Section className="my-6">
        <DetailRow label="Owed To" value={payerName} />
        <DetailRow label="Expense Description" value={expenseDescription} />
        <DetailRow label="Amount Due" value={outstandingAmount} last />
      </Section>

      <Callout tone="warning">
        Once you transfer the funds via your preferred payment app (GPay, PhonePe, Paytm, or UPI),
        click below to record it as settled.
      </Callout>

      <Section className="text-center my-8">
        <Button href={settleUrl}>Settle Up Now</Button>
      </Section>
    </Layout>
  );
};

export default SplitSettlementReminder;
