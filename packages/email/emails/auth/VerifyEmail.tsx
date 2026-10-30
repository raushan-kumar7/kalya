// import * as React from 'react';
// import { Text, Section, Heading } from 'react-email';
// import { Layout, Callout, DetailRow, ListRow, FallbackLinkBox, Button } from '../components';

// export interface VerifyEmailProps {
//   userName?: string;
//   userEmail?: string;
//   verificationUrl?: string;
//   expiresInHours?: number;
//   signUpTime?: string;
// }

// export const VerifyEmail = ({
//   userName = 'Arjun Sharma',
//   userEmail = 'arjun.sharma@example.com',
//   verificationUrl = 'https://kalya.app/verify?token=v_sample_tok_991823',
//   expiresInHours = 24,
//   signUpTime = 'Today, 10:45 AM IST',
// }: VerifyEmailProps) => {
//   return (
//     <Layout preview="Verify your email address to activate your Kalya account">
//       <Section className="text-center">
//         <Heading className="m-0 font-display text-[24px] font-semibold text-brand-textPrimary mb-2">
//           Verify your email address
//         </Heading>
//         <Text className="m-0 font-body text-[15px] leading-6 text-brand-textSecondary mb-6">
//           Welcome to Kalya, {userName}! Please verify your email to secure your account and start
//           consolidating your wealth across budgets, investments, and expenses.
//         </Text>
//       </Section>

//       <Callout tone="info">
//         This verification link will expire in {expiresInHours} hours. If you did not sign up for
//         Kalya, you can safely ignore this email.
//       </Callout>

//       <Section className="my-6">
//         <DetailRow label="Account Holder" value={userName} />
//         <DetailRow label="Email Address" value={userEmail} />
//         <DetailRow label="Registration Time" value={signUpTime} last />
//       </Section>

//       <Section className="my-6">
//         <Heading className="m-0 font-display text-[15px] font-semibold text-brand-textPrimary mb-3">
//           What you get with Kalya
//         </Heading>
//         <ListRow text="Real-time multi-bucket budgeting (Needs, Wants, Savings)" />
//         <ListRow text="Effortless expense tracking and automated bill splitting" />
//         <ListRow text="Consolidated tracking for BSE/NSE stocks, Gold, and Silver" last />
//       </Section>

//       <Section className="text-center my-8">
//         <Button href={verificationUrl}>Verify Email Address</Button>
//       </Section>

//       <FallbackLinkBox url={verificationUrl} />
//     </Layout>
//   );
// };

// export default VerifyEmail;

import * as React from 'react';
import { Heading, Section, Text } from 'react-email';
import { Button, Callout, DetailRow, FallbackLinkBox, Layout, OtpCode } from '../components';

export interface VerifyEmailProps {
  userName?: string;
  userEmail?: string;
  verificationUrl?: string;
  otpCode?: string;
  expiresInMinutes?: number;
  signUpTime?: string;
}

export const VerifyEmail = ({
  userName = 'Kalya Member',
  userEmail = 'user@example.com',
  verificationUrl,
  otpCode,
  expiresInMinutes = 10,
  signUpTime = 'Just now',
}: VerifyEmailProps) => {
  return (
    <Layout preview="Verify your email address to activate your Kalya account">
      <Section className="text-center">
        <Heading className="m-0 mb-2 font-display text-[24px] font-semibold text-brand-textPrimary">
          Verify your email address
        </Heading>
        <Text className="m-0 mb-6 font-body text-[15px] leading-6 text-brand-textSecondary">
          Welcome to Kalya, {userName}! Please verify your email to secure your account.
        </Text>
      </Section>

      {otpCode && (
        <OtpCode
          code={otpCode}
          label="Enter this code in the Kalya app:"
          expiresInMinutes={expiresInMinutes}
        />
      )}

      {verificationUrl && (
        <Section className="my-6 text-center">
          <Text className="m-0 mb-3 font-body text-[13px] text-brand-textSecondary">
            {otpCode
              ? 'Or verify instantly in your browser:'
              : 'Verify your email in your browser:'}
          </Text>
          <Button href={verificationUrl}>Verify Email Address</Button>
        </Section>
      )}

      <Callout tone="info">
        If you did not sign up for Kalya, you can safely ignore this email.
      </Callout>

      <Section className="my-6">
        <DetailRow label="Account Email" value={userEmail} />
        <DetailRow label="Requested Time" value={signUpTime} last />
      </Section>

      {verificationUrl && <FallbackLinkBox url={verificationUrl} />}
    </Layout>
  );
};

export default VerifyEmail;
