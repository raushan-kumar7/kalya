import * as React from 'react';
import { Text, Section, Heading } from 'react-email';
import { Layout, Callout, DetailRow, Button } from '../components';
import { EMAILS_CONFIG } from '../constants';

export interface PasswordChangedNoticeProps {
  userName?: string;
  userEmail?: string;
  changedAt?: string;
  device?: string;
  ipAddress?: string;
  supportUrl?: string;
}

export const PasswordChangedNotice = ({
  userName = 'Arjun Sharma',
  userEmail = 'arjun.sharma@example.com',
  changedAt = 'Today at 11:32 AM IST',
  device = 'Chrome on macOS (Sonoma)',
  ipAddress = '103.21.124.58 (Mumbai, IN)',
  supportUrl = 'https://kalya.app/security/compromised',
}: PasswordChangedNoticeProps) => {
  return (
    <Layout preview="Security Alert: Your Kalya account password has been changed">
      <Section className="text-center">
        <Heading className="m-0 font-display text-[24px] font-semibold text-brand-textPrimary mb-2">
          Password Updated Successfully
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-6 text-brand-textSecondary mb-6">
          Hello {userName}, the password for your Kalya account was recently changed. You can now
          use your new password to log in.
        </Text>
      </Section>

      <Section className="my-6">
        <DetailRow label="Account Email" value={userEmail} />
        <DetailRow label="Time of Change" value={changedAt} />
        <DetailRow label="Device / Browser" value={device} />
        <DetailRow label="IP Address" value={ipAddress} last />
      </Section>

      <Callout tone="danger">
        If you did NOT make this change, your account may have been compromised. Click below
        immediately to freeze your active sessions and secure your credentials.
      </Callout>

      <Section className="text-center my-8">
        <Button href={supportUrl} tone="danger">
          Secure My Account
        </Button>
      </Section>
    </Layout>
  );
};

export default PasswordChangedNotice;
