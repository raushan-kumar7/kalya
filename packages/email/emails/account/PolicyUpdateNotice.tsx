import * as React from 'react';
import { Text, Section, Heading } from 'react-email';
import { FileText } from 'lucide-react';
import { Layout, Callout, DetailRow, ListRow, IconBadge, Button } from '../components';
import { EMAILS_CONFIG } from '../constants';

export interface PolicyUpdateNoticeProps {
  userName?: string;
  effectiveDate?: string;
  termsUrl?: string;
  privacyUrl?: string;
}

export const PolicyUpdateNotice = ({
  userName = 'Arjun',
  effectiveDate = '15 October 2026',
  termsUrl = 'https://kalya.app/terms',
  privacyUrl = 'https://kalya.app/privacy',
}: PolicyUpdateNoticeProps) => {
  return (
    <Layout preview="Important updates to Kalya's Terms of Service and Privacy Policy">
      <Section className="text-center">
        <IconBadge
          icon={FileText}
          background={EMAILS_CONFIG.color.primarySubtle}
          color={EMAILS_CONFIG.color.primary}
          size={24}
        />
        <Heading className="m-0 font-display text-[22px] font-semibold text-brand-textPrimary mb-2">
          Terms & Privacy Updates
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-[24px] text-brand-textSecondary mb-6">
          Hello {userName}, we are updating our Terms of Service and Privacy Policy to provide
          greater clarity on how we protect your personal financial records.
        </Text>
      </Section>

      <Section className="my-6">
        <DetailRow label="Effective Date" value={effectiveDate} />
        <DetailRow label="Applicable To" value="All Registered Accounts" last />
      </Section>

      <Section className="my-6">
        <Heading className="m-0 font-display text-[15px] font-semibold text-brand-textPrimary mb-3">
          Summary of Key Changes
        </Heading>
        <ListRow text="Enhanced data retention rules and simplified account erasure procedures" />
        <ListRow text="Clearer disclosures on local encryption for split payments and asset tracking" />
        <ListRow
          text="Updated compliance with Indian digital personal data protection norms"
          last
        />
      </Section>

      <Callout tone="info">
        No action is required from you if you agree with these changes. By continuing to use Kalya
        after {effectiveDate}, you accept the updated terms.
      </Callout>

      <Section className="text-center my-8">
        <Button href={termsUrl}>Review Updated Terms</Button>
      </Section>
    </Layout>
  );
};

export default PolicyUpdateNotice;
