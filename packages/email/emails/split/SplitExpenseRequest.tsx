import * as React from 'react';
import { Text, Section, Heading } from 'react-email';
import { Layout, Callout, DetailRow, Button } from '../components';

export interface SplitExpenseRequestProps {
  payerName?: string;
  recipientName?: string;
  expenseDescription?: string;
  totalBillAmount?: string;
  recipientShareAmount?: string;
  expenseDate?: string;
  splitMethod?: string;
  paymentMethod?: string;
  settleUrl?: string;
  upiPaymentLink?: string;
}

export const SplitExpenseRequest = ({
  payerName = 'Priya Patel',
  recipientName = 'Arjun',
  expenseDescription = 'Weekend Dinner at The Bombay Canteen',
  totalBillAmount = '₹4,800.00',
  recipientShareAmount = '₹1,200.00',
  expenseDate = 'Sunday, 28 Sep 2026',
  splitMethod = 'Split Equally (4 people)',
  paymentMethod = 'UPI (Google Pay)',
  settleUrl = 'https://kalya.app/split/settle?id=exp_split_88219',
  upiPaymentLink:
    _upiPaymentLink = 'upi://pay?pa=priya@okhdfcbank&pn=Priya%20Patel&am=1200.00&cu=INR',
}: SplitExpenseRequestProps) => {
  return (
    <Layout preview={`${payerName} split a ${totalBillAmount} bill with you on Kalya`}>
      <Section className="text-center">
        <Heading className="m-0 font-display text-[22px] font-semibold text-brand-textPrimary mb-2">
          New Bill Split Request
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-6 text-brand-textSecondary mb-6">
          Hi {recipientName}, <strong>{payerName}</strong> added an expense on Kalya and assigned
          your portion.
        </Text>
      </Section>

      {/* Primary Highlight Card */}
      <Section className="bg-brand-surfaceRaised border border-solid border-brand-border rounded-xl p-5 text-center mb-6">
        <Text className="m-0 font-body text-[13px] text-brand-textMuted uppercase tracking-wider mb-1">
          Your Share To Settle
        </Text>
        <Text className="m-0 font-numeric text-[32px] font-bold text-brand-primary leading-tight">
          {recipientShareAmount}
        </Text>
        <Text className="m-0 font-body text-caption text-brand-textSecondary mt-1">
          for {expenseDescription}
        </Text>
      </Section>

      <Section className="my-6">
        <DetailRow label="Paid By" value={payerName} />
        <DetailRow label="Total Bill Amount" value={totalBillAmount} />
        <DetailRow label="Split Calculation" value={splitMethod} />
        <DetailRow label="Expense Date" value={expenseDate} />
        <DetailRow label="Paid Via" value={paymentMethod} last />
      </Section>

      <Callout tone="info">
        You can pay {payerName} directly via UPI or record a settlement if you have already
        transferred the amount.
      </Callout>

      <Section className="text-center my-8">
        <Button href={settleUrl}>Settle ₹{recipientShareAmount.replace('₹', '')}</Button>
      </Section>
    </Layout>
  );
};

export default SplitExpenseRequest;
