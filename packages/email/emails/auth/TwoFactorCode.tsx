import * as React from 'react';
import { Heading, Section, Text } from 'react-email';
import { Button, Callout, DetailRow, Layout, OtpCode } from '../components';

export interface TwoFactorCodeProps {
  userName?: string;
  userEmail?: string;
  otpCode?: string;
  expiresInMinutes?: number;
  requestedTime?: string;
  device?: string;
  location?: string;
  ipAddress?: string;
  /** Where the user goes to lock down their account if this wasn't them. */
  secureAccountUrl?: string;
}

export const TwoFactorCode = ({
  userName = 'Kalya Member',
  userEmail = 'user@example.com',
  otpCode,
  expiresInMinutes = 5,
  requestedTime = 'Just now',
  device,
  location,
  ipAddress,
  secureAccountUrl,
}: TwoFactorCodeProps) => {
  return (
    <Layout preview="Your Kalya two-factor authentication code">
      <Section className="text-center">
        <Heading className="m-0 mb-2 font-display text-[24px] font-semibold text-brand-textPrimary">
          Two-Factor Authentication
        </Heading>
        <Text className="m-0 mb-6 font-body text-[15px] leading-6 text-brand-textSecondary">
          Hello {userName}, enter the code below to finish signing in. We ask for this extra step to
          keep your finances secure.
        </Text>
      </Section>

      {otpCode && (
        <OtpCode
          code={otpCode}
          tone="warning"
          label="Your two-factor code:"
          expiresInMinutes={expiresInMinutes}
          footnote="Kalya will never ask for this code by phone, chat, or email."
        />
      )}

      <Callout tone="danger">
        Not you? Someone may have your password. Do not share this code. Change your password right
        away and review your active sessions.
      </Callout>

      <Section className="my-6">
        <DetailRow label="Account" value={userEmail} />
        <DetailRow
          label="Requested"
          value={requestedTime}
          last={!device && !location && !ipAddress}
        />
        {device && <DetailRow label="Device" value={device} last={!location && !ipAddress} />}
        {location && <DetailRow label="Approximate Location" value={location} last={!ipAddress} />}
        {ipAddress && <DetailRow label="IP Address" value={ipAddress} last />}
      </Section>

      {secureAccountUrl && (
        <Section className="text-center my-8">
          <Button href={secureAccountUrl} tone="danger">
            Secure My Account
          </Button>
        </Section>
      )}
    </Layout>
  );
};

export default TwoFactorCode;
