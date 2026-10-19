import * as React from 'react';
import { Text, Section, Heading } from 'react-email';
import { Layout, Callout, DetailRow, FallbackLinkBox, Button } from '../components';

export interface ResetPasswordProps {
  userName?: string;
  userEmail?: string;
  resetUrl?: string;
  expiresInMinutes?: number;
  requestedAt?: string;
  ipAddress?: string;
}

export const ResetPassword = ({
  userName = 'Arjun Sharma',
  userEmail = 'arjun.sharma@example.com',
  resetUrl = 'https://kalya.app/reset-password?token=rst_sample_token_81729',
  expiresInMinutes = 30,
  requestedAt = 'Today at 11:15 AM IST',
  ipAddress = '103.21.124.58 (Mumbai, IN)',
}: ResetPasswordProps) => {
  return (
    <Layout preview="Reset your Kalya account password">
      <Section className="text-center">
        <Heading className="m-0 font-display text-[24px] font-semibold text-brand-textPrimary mb-2">
          Password Reset Request
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-6 text-brand-textSecondary mb-6">
          Hello {userName}, we received a request to reset the password associated with your Kalya
          account. Click below to choose a new password.
        </Text>
      </Section>

      <Callout tone="warning">
        This link is single-use and will expire in {expiresInMinutes} minutes. If you did not
        request a password reset, someone may have mistyped their email. Your account remains safe
        and no changes have been made.
      </Callout>

      <Section className="my-6">
        <DetailRow label="Account Email" value={userEmail} />
        <DetailRow label="Requested At" value={requestedAt} />
        <DetailRow label="Request Location/IP" value={ipAddress} last />
      </Section>

      <Section className="text-center my-8">
        <Button href={resetUrl}>Reset Password</Button>
      </Section>

      <FallbackLinkBox url={resetUrl} />
    </Layout>
  );
};

export default ResetPassword;
