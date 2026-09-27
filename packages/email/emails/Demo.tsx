import * as React from 'react';
import { Text, Section, Heading } from 'react-email';
import { User } from 'lucide-react';
import {
  Layout,
  Callout,
  DetailRow,
  ListRow,
  IconBadge,
  FallbackLinkBox,
  Button,
} from './components';
import { EMAILS_CONFIG } from './constants';

export const DemoEmail = () => {
  return (
    <Layout preview="Welcome to Kalya - Please verify your email">
      <Section className="text-center">
        <IconBadge
          icon={User}
          background={EMAILS_CONFIG.color.primarySubtle}
          color={EMAILS_CONFIG.color.primary}
          size={24}
        />
        <Heading className="m-0 font-display text-[24px] font-semibold text-brand-textPrimary mb-4">
          Verify your Kalya account
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-[24px] text-brand-textSecondary mb-6">
          Welcome aboard! Please verify your email address to unlock all features and start
          consolidating your wealth securely.
        </Text>
      </Section>

      <Callout tone="info">
        This link will expire in 24 hours. If you did not request this, you can safely ignore this
        email.
      </Callout>

      <Section className="my-8">
        <DetailRow label="Account Name" value="Jane Doe" />
        <DetailRow label="Email Address" value="jane@example.com" />
        <DetailRow label="Sign up Time" value="Today at 10:42 AM" last />
      </Section>

      <Section className="my-8">
        <Heading className="m-0 font-display text-[16px] font-semibold text-brand-textPrimary mb-4">
          What happens next?
        </Heading>
        <ListRow text="Secure your account with 2FA" />
        <ListRow text="Connect your first bank account" />
        <ListRow text="Set up your primary savings goal" last />
      </Section>

      <Section className="text-center mt-8">
        <Button href="https://kalya.app/verify">Verify Email Address</Button>
      </Section>

      <FallbackLinkBox url="https://kalya.app/verify?token=123456789" />
    </Layout>
  );
};

export default DemoEmail;
