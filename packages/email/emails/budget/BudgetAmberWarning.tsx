import * as React from 'react';
import { Text, Section, Heading } from 'react-email';
import { AlertTriangle } from 'lucide-react';
import { Layout, Callout, DetailRow, IconBadge, Button } from '../components';
import { EMAILS_CONFIG } from '../constants';

export interface BudgetAmberWarningProps {
  userName?: string;
  bucketName?: string;
  spentAmount?: string;
  budgetLimit?: string;
  percentSpent?: number;
  remainingAmount?: string;
  daysRemainingInMonth?: number;
  recentExpenseDescription?: string;
  recentExpenseAmount?: string;
  budgetUrl?: string;
}

export const BudgetAmberWarning = ({
  userName = 'Arjun',
  bucketName = 'Wants & Discretionary',
  spentAmount = '₹24,200.00',
  budgetLimit = '₹30,000.00',
  percentSpent = 80.6,
  remainingAmount = '₹5,800.00',
  daysRemainingInMonth = 9,
  recentExpenseDescription = 'Concert Tickets & Dinner',
  recentExpenseAmount = '₹3,500.00',
  budgetUrl = 'https://kalya.app/budget',
}: BudgetAmberWarningProps) => {
  return (
    <Layout
      preview={`Budget Warning: You've reached ${percentSpent.toFixed(0)}% of your ${bucketName} budget`}
    >
      <Section className="text-center">
        <IconBadge
          icon={AlertTriangle}
          background={EMAILS_CONFIG.color.warningSubtle}
          color={EMAILS_CONFIG.color.warning}
          size={24}
        />
        <Heading className="m-0 font-display text-[22px] font-semibold text-brand-textPrimary mb-2">
          Approaching Budget Limit
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-[24px] text-brand-textSecondary mb-6">
          Hi {userName}, you have spent <strong>{percentSpent.toFixed(1)}%</strong> of your
          allocated <strong>{bucketName}</strong> budget for this month.
        </Text>
      </Section>

      {/* Progress Bar Card */}
      <Section className="bg-brand-surfaceRaised border border-solid border-brand-border rounded-xl p-5 mb-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text className="m-0 font-body text-[13px] font-medium text-brand-textPrimary">
            {bucketName}
          </Text>
          <Text className="m-0 font-numeric text-[13px] font-bold text-brand-warning">
            {percentSpent.toFixed(0)}% Used
          </Text>
        </div>

        {/* Custom Progress Bar */}
        <div
          style={{
            backgroundColor: EMAILS_CONFIG.color.border,
            borderRadius: 6,
            height: 10,
            overflow: 'hidden',
            width: '100%',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              backgroundColor: EMAILS_CONFIG.color.warning,
              width: `${Math.min(percentSpent, 100)}%`,
              height: '100%',
              borderRadius: 6,
            }}
          />
        </div>

        <Text className="m-0 font-body text-[12px] text-brand-textSecondary text-center">
          <strong>{remainingAmount}</strong> remaining for the next {daysRemainingInMonth} days.
        </Text>
      </Section>

      <Section className="my-6">
        <DetailRow label="Total Budget" value={budgetLimit} />
        <DetailRow label="Spent So Far" value={spentAmount} />
        <DetailRow label="Remaining Allowance" value={remainingAmount} />
        <DetailRow
          label="Triggering Expense"
          value={`${recentExpenseDescription} (${recentExpenseAmount})`}
          last
        />
      </Section>

      <Callout tone="warning">
        To stay on track for your monthly savings goal, consider pacing discretionary purchases over
        the next {daysRemainingInMonth} days.
      </Callout>

      <Section className="text-center my-8">
        <Button href={budgetUrl}>Manage Budget & Expenses</Button>
      </Section>
    </Layout>
  );
};

export default BudgetAmberWarning;
