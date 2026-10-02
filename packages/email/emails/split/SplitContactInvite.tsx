import * as React from 'react';
import { Text, Section, Heading } from 'react-email';
import { UserPlus } from 'lucide-react';
import { Layout, Callout, DetailRow, ListRow, IconBadge, Button } from '../components';
import { EMAILS_CONFIG } from '../constants';

export interface SplitContactInviteProps {
  inviterName?: string;
  recipientEmail?: string;
  pendingBalance?: string;
  inviteUrl?: string;
}

export const SplitContactInvite = ({
  inviterName = 'Arjun Sharma',
  recipientEmail = 'rohit@example.com',
  pendingBalance = '₹1,450.00',
  inviteUrl = 'https://kalya.app/invite?code=inv_kalya_78219',
}: SplitContactInviteProps) => {
  return (
    <Layout preview={`${inviterName} invited you to track shared expenses on Kalya`}>
      <Section className="text-center">
        <IconBadge
          icon={UserPlus}
          background={EMAILS_CONFIG.color.primarySubtle}
          color={EMAILS_CONFIG.color.primary}
          size={24}
        />
        <Heading className="m-0 font-display text-[22px] font-semibold text-brand-textPrimary mb-2">
          Join {inviterName} on Kalya
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-6 text-brand-textSecondary mb-6">
          <strong>{inviterName}</strong> uses Kalya to manage personal finances, split household
          bills, and settle group payments seamlessly.
        </Text>
      </Section>

      <Section className="bg-brand-surfaceRaised border border-solid border-brand-border rounded-xl p-5 text-center mb-6">
        <Text className="m-0 font-body text-[13px] text-brand-textMuted uppercase tracking-wider mb-1">
          Shared Ledger Ready
        </Text>
        <Text className="m-0 font-numeric text-display-md font-bold text-brand-primary leading-tight">
          {pendingBalance}
        </Text>
        <Text className="m-0 font-body text-caption text-brand-textSecondary mt-1">
          in pending split expenses waiting for you
        </Text>
      </Section>

      <Section className="my-6">
        <DetailRow label="Invited By" value={inviterName} />
        <DetailRow label="Invited Email" value={recipientEmail} last />
      </Section>

      <Section className="my-6">
        <Heading className="m-0 font-display text-[15px] font-semibold text-brand-textPrimary mb-3">
          Why join Kalya?
        </Heading>
        <ListRow text="Track who owes whom with instant UPI settlement links" />
        <ListRow text="Automatic expense categorisation and real-time ledger updates" />
        <ListRow text="Completely free with privacy-first encryption" last />
      </Section>

      <Callout tone="info">
        Signing up takes less than 30 seconds. Your shared expense history with {inviterName} will
        be automatically linked.
      </Callout>

      <Section className="text-center my-8">
        <Button href={inviteUrl}>Accept Invite & Join Kalya</Button>
      </Section>
    </Layout>
  );
};

export default SplitContactInvite;
