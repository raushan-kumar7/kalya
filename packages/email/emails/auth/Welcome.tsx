import * as React from 'react';
import { Text, Section, Heading } from 'react-email';
import { Layout, Callout, DetailRow, ListRow, FallbackLinkBox, Button } from '../components';

export interface WelcomeProps {
  userName?: string;
  userEmail?: string;
  dashboardUrl?: string;
  supportEmail?: string;
}

export const Welcome = ({
  userName = 'Arjun Sharma',
  userEmail = 'arjun.sharma@example.com',
  dashboardUrl = 'https://kalya.app/dashboard',
  supportEmail = 'support@kalya.io',
}: WelcomeProps) => {
  return (
    <Layout preview="Welcome to Kalya — Your personal wealth and finance command center">
      <Section className="text-center">
        <Heading className="m-0 font-display text-[26px] font-semibold text-brand-textPrimary mb-2">
          Welcome to Kalya! ✨
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-6 text-brand-textSecondary mb-6">
          Hello {userName}, your account is officially verified and secured. You now have full
          access to a modern, private command center for your budgets, bill splitting, and
          investments.
        </Text>
      </Section>

      <Callout tone="success">
        ✓ Your email address ({userEmail}) has been confirmed. Your account is fully active.
      </Callout>

      <Section className="my-6">
        <Heading className="m-0 font-display text-[16px] font-semibold text-brand-textPrimary mb-3">
          3 Quick Steps to Get Started:
        </Heading>
        <ListRow text="Establish your 50/30/20 Budget: Allocate monthly income across Needs, Wants, and Savings." />
        <ListRow text="Track Everyday Expenses & Splits: Log daily spending and settle split debts with zero hassle." />
        <ListRow
          text="Consolidate Assets: Monitor your portfolio of Stocks, physical Gold, and Silver in real time."
          last
        />
      </Section>

      <Section className="my-6">
        <DetailRow label="Account Holder" value={userName} />
        <DetailRow label="Primary Email" value={userEmail} />
        <DetailRow label="Account Status" value="Active & Verified" last />
      </Section>

      <Section className="text-center my-8">
        <Button href={dashboardUrl}>Open My Dashboard</Button>
      </Section>

      <FallbackLinkBox url={dashboardUrl} />

      <Section className="text-center mt-6">
        <Text className="m-0 font-body text-[13px] leading-5 text-brand-textSecondary">
          Have questions or need assistance? Reach out to our team anytime at{' '}
          <a href={`mailto:${supportEmail}`} className="text-brand-primary font-medium underline">
            {supportEmail}
          </a>
          .
        </Text>
      </Section>
    </Layout>
  );
};

export default Welcome;
