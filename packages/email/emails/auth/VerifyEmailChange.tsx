// import * as React from 'react';
// import { Text, Section, Heading } from 'react-email';
// import { Layout, Callout, DetailRow, FallbackLinkBox, Button } from '../components';

// export interface VerifyEmailChangeProps {
//   userName?: string;
//   currentEmail?: string;
//   newEmail?: string;
//   verificationUrl?: string;
//   expiresInHours?: number;
// }

// export const VerifyEmailChange = ({
//   userName = 'Arjun Sharma',
//   currentEmail = 'arjun.old@example.com',
//   newEmail = 'arjun.new@example.com',
//   verificationUrl = 'https://kalya.app/verify-email-change?token=chg_tok_881923',
//   expiresInHours = 24,
// }: VerifyEmailChangeProps) => {
//   return (
//     <Layout preview="Confirm your new email address for your Kalya account">
//       <Section className="text-center">
//         <Heading className="m-0 font-display text-[24px] font-semibold text-brand-textPrimary mb-2">
//           Confirm Your New Email
//         </Heading>
//         <Text className="m-0 font-body text-[15px] leading-6 text-brand-textSecondary mb-6">
//           Hello {userName}, we received a request to update your primary email address for your
//           Kalya account. Please confirm that you own this email address.
//         </Text>
//       </Section>

//       <Section className="my-6">
//         <DetailRow label="Previous Email" value={currentEmail} />
//         <DetailRow label="New Email Address" value={newEmail} last />
//       </Section>

//       <Callout tone="info">
//         This link will expire in {expiresInHours} hours. Once confirmed, your login identifier and
//         all financial notifications will be directed to this new address.
//       </Callout>

//       <Section className="text-center my-8">
//         <Button href={verificationUrl}>Confirm Email Change</Button>
//       </Section>

//       <FallbackLinkBox url={verificationUrl} />
//     </Layout>
//   );
// };

// export default VerifyEmailChange;

import * as React from 'react';
import { Heading, Section, Text } from 'react-email';
import { Button, Callout, DetailRow, FallbackLinkBox, Layout, OtpCode } from '../components';

export interface VerifyEmailChangeProps {
  userName?: string;
  currentEmail?: string;
  newEmail?: string;
  verificationUrl?: string;
  otpCode?: string;
  expiresInMinutes?: number;
}

export const VerifyEmailChange = ({
  userName = 'Kalya Member',
  currentEmail = 'old@example.com',
  newEmail = 'new@example.com',
  verificationUrl,
  otpCode,
  expiresInMinutes = 10,
}: VerifyEmailChangeProps) => {
  return (
    <Layout preview="Confirm your new email address for your Kalya account">
      <Section className="text-center">
        <Heading className="m-0 mb-2 font-display text-[24px] font-semibold text-brand-textPrimary">
          Confirm Your New Email
        </Heading>
        <Text className="m-0 mb-6 font-body text-[15px] leading-6 text-brand-textSecondary">
          Hello {userName}, we received a request to change the primary email on your Kalya account.
          Please confirm that you own this address.
        </Text>
      </Section>

      <Section className="my-6">
        <DetailRow label="Previous Email" value={currentEmail} />
        <DetailRow label="New Email Address" value={newEmail} last />
      </Section>

      {otpCode && (
        <OtpCode
          code={otpCode}
          label="Enter this code in the Kalya app to confirm:"
          expiresInMinutes={expiresInMinutes}
        />
      )}

      {verificationUrl && (
        <Section className="my-6 text-center">
          <Button href={verificationUrl}>Confirm Email Change</Button>
        </Section>
      )}

      <Callout tone="info">
        Once confirmed, your login email and all financial notifications will go to this new
        address. If you did not request this, you can ignore this email.
      </Callout>

      {verificationUrl && <FallbackLinkBox url={verificationUrl} />}
    </Layout>
  );
};

export default VerifyEmailChange;
