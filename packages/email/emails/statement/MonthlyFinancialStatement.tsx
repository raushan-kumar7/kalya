import * as React from 'react';
import { Text, Section, Heading, Row, Column } from 'react-email';
import { BarChart3 } from 'lucide-react';
import { Layout, Callout, DetailRow, ListRow, IconBadge, Button } from '../components';
import { EMAILS_CONFIG } from '../constants';

export interface MonthlyFinancialStatementProps {
  userName?: string;
  monthName?: string;
  year?: string;
  totalIncome?: string;
  totalExpenses?: string;
  netSavings?: string;
  savingsRate?: string;
  needsSpend?: string;
  wantsSpend?: string;
  investmentsTotal?: string;
  topCategory?: string;
  topCategoryAmount?: string;
  dashboardUrl?: string;
}

export const MonthlyFinancialStatement = ({
  userName = 'Arjun',
  monthName = 'September',
  year = '2026',
  totalIncome = '₹1,50,000.00',
  totalExpenses = '₹92,400.00',
  netSavings = '₹57,600.00',
  savingsRate = '38.4%',
  needsSpend = '₹52,000.00 (34.7%)',
  wantsSpend = '₹40,400.00 (26.9%)',
  investmentsTotal = '₹45,000.00',
  topCategory = 'Rent & Housing',
  topCategoryAmount = '₹32,000.00',
  dashboardUrl = 'https://kalya.app/dashboard',
}: MonthlyFinancialStatementProps) => {
  return (
    <Layout preview={`Your Kalya Monthly Wealth Digest for ${monthName} ${year}`}>
      <Section className="text-center">
        <IconBadge
          icon={BarChart3}
          background={EMAILS_CONFIG.color.primarySubtle}
          color={EMAILS_CONFIG.color.primary}
          size={24}
        />
        <Heading className="m-0 font-display text-[22px] font-semibold text-brand-textPrimary mb-2">
          {monthName} {year} Wealth Digest
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-6 text-brand-textSecondary mb-6">
          Hi {userName}, here is your consolidated financial summary for {monthName}.
        </Text>
      </Section>

      {/* High-level Metric Cards */}
      <Section className="bg-brand-surfaceRaised border border-solid border-brand-border rounded-xl p-5 mb-6">
        <Row className="mb-4">
          <Column className="text-center border-r border-solid border-brand-border pr-2">
            <Text className="m-0 font-body text-[11px] text-brand-textMuted uppercase tracking-wider mb-1">
              Total Inflow
            </Text>
            <Text className="m-0 font-numeric text-body-lg font-bold text-brand-primary">
              {totalIncome}
            </Text>
          </Column>
          <Column className="text-center pl-2">
            <Text className="m-0 font-body text-[11px] text-brand-textMuted uppercase tracking-wider mb-1">
              Total Outflow
            </Text>
            <Text className="m-0 font-numeric text-body-lg font-bold text-brand-textPrimary">
              {totalExpenses}
            </Text>
          </Column>
        </Row>
        <Row className="pt-3 border-t border-solid border-brand-border text-center">
          <Column>
            <Text className="m-0 font-body text-caption text-brand-textSecondary">
              Net Savings: <strong className="text-brand-success">{netSavings}</strong> (
              {savingsRate} savings rate)
            </Text>
          </Column>
        </Row>
      </Section>

      <Section className="my-6">
        <Heading className="m-0 font-display text-[15px] font-semibold text-brand-textPrimary mb-3">
          Bucket Allocation Breakdown
        </Heading>
        <DetailRow label="Needs (Essentials)" value={needsSpend} />
        <DetailRow label="Wants (Discretionary)" value={wantsSpend} />
        <DetailRow label="Investments / Asset Additions" value={investmentsTotal} />
        <DetailRow
          label="Highest Spending Category"
          value={`${topCategory} (${topCategoryAmount})`}
          last
        />
      </Section>

      <Section className="my-6">
        <Heading className="m-0 font-display text-[15px] font-semibold text-brand-textPrimary mb-3">
          Key Insights for this Month
        </Heading>
        <ListRow text="Your savings rate exceeded your target benchmark of 30%" />
        <ListRow text="Discretionary spending was within the amber budget limit" />
        <ListRow text="All group split expenses for the month have been reconciled" last />
      </Section>

      <Callout tone="info">
        Full breakdowns by categories, tags, and digital asset valuations (Gold, Silver, Equities)
        are available in your interactive monthly report.
      </Callout>

      <Section className="text-center my-8">
        <Button href={dashboardUrl}>View Full Monthly Report</Button>
      </Section>
    </Layout>
  );
};

export default MonthlyFinancialStatement;
