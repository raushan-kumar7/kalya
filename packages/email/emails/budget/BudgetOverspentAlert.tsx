import * as React from 'react';
import { Text, Section, Heading } from 'react-email';
import { AlertOctagon } from 'lucide-react';
import {
  Layout,
  Callout,
  DetailRow,
  IconBadge,
  Button,
} from '../components';
import { EMAILS_CONFIG } from '../constants';

export interface BudgetOverspentAlertProps {
  userName?: string;
  bucketName?: string;
  spentAmount?: string;
  budgetLimit?: string;
  overspentAmount?: string;
  topOverspentCategory?: string;
  period?: string;
  budgetUrl?: string;
}

export const BudgetOverspentAlert = ({
  userName = 'Arjun',
  bucketName = 'Wants & Discretionary',
  spentAmount = '₹32,450.00',
  budgetLimit = '₹30,000.00',
  overspentAmount = '₹2,450.00',
  topOverspentCategory = 'Dining Out & Entertainment',
  period = 'September 2026',
  budgetUrl = 'https://kalya.app/budget',
}: BudgetOverspentAlertProps) => {
  return (
    <Layout preview={`Budget Exceeded: You've gone over your ${bucketName} limit by ${overspentAmount}`}>
      <Section className="text-center">
        <IconBadge
          icon={AlertOctagon}
          background={EMAILS_CONFIG.color.dangerSubtle}
          color={EMAILS_CONFIG.color.danger}
          size={24}
        />
        <Heading className="m-0 font-display text-[22px] font-semibold text-brand-textPrimary mb-2">
          Budget Limit Exceeded
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-[24px] text-brand-textSecondary mb-6">
          Hi {userName}, your total spending in <strong>{bucketName}</strong> has exceeded the
          allocated budget limit for {period}.
        </Text>
      </Section>

      {/* Overspent Highlight Card */}
      <Section className="bg-brand-dangerSubtle border border-solid border-brand-border rounded-xl p-5 text-center mb-6">
        <Text className="m-0 font-body text-[13px] text-brand-danger uppercase tracking-wider font-semibold mb-1">
          Amount Over Budget
        </Text>
        <Text className="m-0 font-numeric text-[32px] font-bold text-brand-danger leading-tight">
          +{overspentAmount}
        </Text>
        <Text className="m-0 font-body text-[12px] text-brand-textSecondary mt-1">
          Total Spent: {spentAmount} of {budgetLimit}
        </Text>
      </Section>

      <Section className="my-6">
        <DetailRow label="Budget Category" value={bucketName} />
        <DetailRow label="Original Budget" value={budgetLimit} />
        <DetailRow label="Total Amount Spent" value={spentAmount} />
        <DetailRow label="Primary Driver" value={topOverspentCategory} />
        <DetailRow label="Budget Period" value={period} last />
      </Section>

      <Callout tone="danger">
        Excess spending in this bucket will draw against your target savings for the month. You can
        rebalance your buckets or adjust rollover limits in your Kalya settings.
      </Callout>

      <Section className="text-center my-8">
        <Button href={budgetUrl} tone="danger">
          Review & Rebalance Budget
        </Button>
      </Section>
    </Layout>
  );
};

export default BudgetOverspentAlert;
