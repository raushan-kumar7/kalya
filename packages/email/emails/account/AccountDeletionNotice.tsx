import * as React from 'react';
import { Text, Section, Heading } from 'react-email';
import { AlertTriangle } from 'lucide-react';
import {
  Layout,
  Callout,
  DetailRow,
  ListRow,
  IconBadge,
  Button,
} from '../components';
import { EMAILS_CONFIG } from '../constants';

export interface AccountDeletionNoticeProps {
  userName?: string;
  userEmail?: string;
  requestedAt?: string;
  scheduledDeletionDate?: string;
  gracePeriodDays?: number;
  cancelDeletionUrl?: string;
}

export const AccountDeletionNotice = ({
  userName = 'Arjun Sharma',
  userEmail = 'arjun.sharma@example.com',
  requestedAt = '29 Sep 2026, 11:30 AM IST',
  scheduledDeletionDate = '13 Oct 2026',
  gracePeriodDays = 14,
  cancelDeletionUrl = 'https://kalya.app/settings/account/cancel-deletion',
}: AccountDeletionNoticeProps) => {
  return (
    <Layout preview="Important: Your Kalya account deletion request has been received">
      <Section className="text-center">
        <IconBadge
          icon={AlertTriangle}
          background={EMAILS_CONFIG.color.dangerSubtle}
          color={EMAILS_CONFIG.color.danger}
          size={24}
        />
        <Heading className="m-0 font-display text-[22px] font-semibold text-brand-textPrimary mb-2">
          Account Deletion Scheduled
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-[24px] text-brand-textSecondary mb-6">
          Hello {userName}, we received a request to permanently delete your Kalya account and erase
          all associated data.
        </Text>
      </Section>

      <Section className="my-6">
        <DetailRow label="Account Email" value={userEmail} />
        <DetailRow label="Request Timestamp" value={requestedAt} />
        <DetailRow label="Permanent Purge Date" value={scheduledDeletionDate} />
        <DetailRow label="Grace Period" value={`${gracePeriodDays} days`} last />
      </Section>

      <Section className="my-6">
        <Heading className="m-0 font-display text-[15px] font-semibold text-brand-textPrimary mb-3">
          What will be deleted?
        </Heading>
        <ListRow text="All expense history, budgets, and goal plans" tone="negative" />
        <ListRow text="Digital gold, silver, and stock portfolio records" tone="negative" />
        <ListRow text="Shared split ledger records and contact linkages" tone="negative" last />
      </Section>

      <Callout tone="danger">
        If you changed your mind or did not request this deletion, you can cancel this request at any
        time before {scheduledDeletionDate} simply by logging in.
      </Callout>

      <Section className="text-center my-8">
        <Button href={cancelDeletionUrl}>Cancel Account Deletion</Button>
      </Section>
    </Layout>
  );
};

export default AccountDeletionNotice;
