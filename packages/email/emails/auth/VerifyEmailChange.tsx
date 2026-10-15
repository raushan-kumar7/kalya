import * as React from 'react';
import { Text, Section, Heading } from 'react-email';
import { Layout, Callout, DetailRow, FallbackLinkBox, Button } from '../components';
import { EMAILS_CONFIG } from '../constants';

export interface VerifyEmailChangeProps {
  userName?: string;
  currentEmail?: string;
  newEmail?: string;
  verificationUrl?: string;
  expiresInHours?: number;
}

export const VerifyEmailChange = ({
  userName = 'Arjun Sharma',
  currentEmail = 'arjun.old@example.com',
  newEmail = 'arjun.new@example.com',
  verificationUrl = 'https://kalya.app/verify-email-change?token=chg_tok_881923',
  expiresInHours = 24,
}: VerifyEmailChangeProps) => {
  return (
    <Layout preview="Confirm your new email address for your Kalya account">
      <Section className="text-center">
        <Heading className="m-0 font-display text-[24px] font-semibold text-brand-textPrimary mb-2">
          Confirm Your New Email
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-6 text-brand-textSecondary mb-6">
          Hello {userName}, we received a request to update your primary email address for your
          Kalya account. Please confirm that you own this email address.
        </Text>
      </Section>

      <Section className="my-6">
        <DetailRow label="Previous Email" value={currentEmail} />
        <DetailRow label="New Email Address" value={newEmail} last />
      </Section>

      <Callout tone="info">
        This link will expire in {expiresInHours} hours. Once confirmed, your login identifier and
        all financial notifications will be directed to this new address.
      </Callout>

      <Section className="text-center my-8">
        <Button href={verificationUrl}>Confirm Email Change</Button>
      </Section>

      <FallbackLinkBox url={verificationUrl} />
    </Layout>
  );
};

export default VerifyEmailChange;
