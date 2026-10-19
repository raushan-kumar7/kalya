import * as React from 'react';
import { Text, Section, Heading } from 'react-email';
import { Layout, Callout, DetailRow, Button } from '../components';

export interface NewDeviceLoginProps {
  userName?: string;
  userEmail?: string;
  loginTime?: string;
  device?: string;
  browser?: string;
  ipAddress?: string;
  location?: string;
  revokeSessionsUrl?: string;
}

export const NewDeviceLogin = ({
  userName = 'Arjun Sharma',
  userEmail = 'arjun.sharma@example.com',
  loginTime = 'Today at 02:18 PM IST',
  device = 'iPhone 15 Pro (iOS 18.2)',
  browser = 'Safari Mobile 18.0',
  ipAddress = '49.36.110.15',
  location = 'Bengaluru, Karnataka, India',
  revokeSessionsUrl = 'https://kalya.app/settings/security?action=revoke',
}: NewDeviceLoginProps) => {
  return (
    <Layout preview="Security Notice: New sign-in detected on your Kalya account">
      <Section className="text-center">
        <Heading className="m-0 font-display text-[24px] font-semibold text-brand-textPrimary mb-2">
          New Sign-In Detected
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-6 text-brand-textSecondary mb-6">
          Hello {userName}, we detected a sign-in to your Kalya account from a device or location we
          haven't seen before.
        </Text>
      </Section>

      <Section className="my-6">
        <DetailRow label="Account" value={userEmail} />
        <DetailRow label="Sign-In Time" value={loginTime} />
        <DetailRow label="Device" value={device} />
        <DetailRow label="Browser" value={browser} />
        <DetailRow label="Approximate Location" value={location} />
        <DetailRow label="IP Address" value={ipAddress} last />
      </Section>

      <Callout tone="info">
        If this was you, you can safely ignore this alert. If you don't recognize this activity,
        terminate this session immediately and update your password.
      </Callout>

      <Section className="text-center my-8">
        <Button href={revokeSessionsUrl} tone="danger">
          Review & Revoke Sessions
        </Button>
      </Section>
    </Layout>
  );
};

export default NewDeviceLogin;
