// import * as React from 'react';
// import { Text, Section, Heading } from 'react-email';
// import { Layout, Callout, DetailRow, FallbackLinkBox, Button } from '../components';

// export interface ResetPasswordProps {
//   userName?: string;
//   userEmail?: string;
//   resetUrl?: string;
//   expiresInMinutes?: number;
//   requestedAt?: string;
//   ipAddress?: string;
// }

// export const ResetPassword = ({
//   userName = 'Arjun Sharma',
//   userEmail = 'arjun.sharma@example.com',
//   resetUrl = 'https://kalya.app/reset-password?token=rst_sample_token_81729',
//   expiresInMinutes = 30,
//   requestedAt = 'Today at 11:15 AM IST',
//   ipAddress = '103.21.124.58 (Mumbai, IN)',
// }: ResetPasswordProps) => {
//   return (
//     <Layout preview="Reset your Kalya account password">
//       <Section className="text-center">
//         <Heading className="m-0 font-display text-[24px] font-semibold text-brand-textPrimary mb-2">
//           Password Reset Request
//         </Heading>
//         <Text className="m-0 font-body text-[15px] leading-6 text-brand-textSecondary mb-6">
//           Hello {userName}, we received a request to reset the password associated with your Kalya
//           account. Click below to choose a new password.
//         </Text>
//       </Section>

//       <Callout tone="warning">
//         This link is single-use and will expire in {expiresInMinutes} minutes. If you did not
//         request a password reset, someone may have mistyped their email. Your account remains safe
//         and no changes have been made.
//       </Callout>

//       <Section className="my-6">
//         <DetailRow label="Account Email" value={userEmail} />
//         <DetailRow label="Requested At" value={requestedAt} />
//         <DetailRow label="Request Location/IP" value={ipAddress} last />
//       </Section>

//       <Section className="text-center my-8">
//         <Button href={resetUrl}>Reset Password</Button>
//       </Section>

//       <FallbackLinkBox url={resetUrl} />
//     </Layout>
//   );
// };

// export default ResetPassword;

import * as React from 'react';
import { Heading, Section, Text } from 'react-email';
import { Button, Callout, DetailRow, FallbackLinkBox, Layout, OtpCode } from '../components';

export interface ResetPasswordProps {
  userName?: string;
  userEmail?: string;
  resetUrl?: string;
  otpCode?: string;
  expiresInMinutes?: number;
  requestedTime?: string;
  ipAddress?: string;
}

export const ResetPassword = ({
  userName = 'Kalya Member',
  userEmail = 'user@example.com',
  resetUrl,
  otpCode,
  expiresInMinutes = 10,
  requestedTime = 'Just now',
  ipAddress = 'Unknown IP',
}: ResetPasswordProps) => {
  return (
    <Layout preview="Reset your Kalya account password">
      <Section className="text-center">
        <Heading className="m-0 mb-2 font-display text-[24px] font-semibold text-brand-textPrimary">
          Password Reset Request
        </Heading>
        <Text className="m-0 mb-6 font-body text-[15px] leading-6 text-brand-textSecondary">
          Hello {userName}, we received a request to reset your Kalya account password.
        </Text>
      </Section>

      {otpCode && (
        <OtpCode
          code={otpCode}
          label="Enter this code in the Kalya app to set a new password:"
          expiresInMinutes={expiresInMinutes}
          footnote="Never share this code with anyone."
        />
      )}

      {resetUrl && (
        <Section className="my-6 text-center">
          <Text className="m-0 mb-3 font-body text-[13px] text-brand-textSecondary">
            {otpCode
              ? 'Or reset your password in your browser:'
              : 'Reset your password in your browser:'}
          </Text>
          <Button href={resetUrl}>Reset Password</Button>
        </Section>
      )}

      <Callout tone="warning">
        If you did not request a password reset, someone may be trying to access your account. No
        changes have been made, and you can safely ignore this email.
      </Callout>

      <Section className="my-6">
        <DetailRow label="Account Email" value={userEmail} />
        <DetailRow label="IP Address" value={ipAddress} />
        <DetailRow label="Requested Time" value={requestedTime} last />
      </Section>

      {resetUrl && <FallbackLinkBox url={resetUrl} />}
    </Layout>
  );
};

export default ResetPassword;
