import * as React from 'react';
import { Text, Section, Heading } from 'react-email';
import { Layout, DetailRow, Callout } from '../components';

export interface ContactReplyNoticeProps {
  userName?: string;
  referenceNumber?: string;
  topic?: string;
  staffName?: string;
  replyMessage?: string;
  originalMessage?: string;
}

export const ContactReplyNotice = ({
  userName = 'Valued User',
  referenceNumber = 'KAL-83921',
  topic = 'General Inquiry',
  staffName = 'Kalya Support Team',
  replyMessage = 'Thank you for your inquiry. We have updated our records accordingly.',
  originalMessage = 'Hello Kalya team, I have a question.',
}: ContactReplyNoticeProps) => {
  return (
    <Layout preview={`Update on your inquiry (${referenceNumber}) - Kalya Support`}>
      <Section className="text-center">
        <Heading className="m-0 font-display text-[22px] font-semibold text-brand-textPrimary mb-2">
          Response to Your Inquiry
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-6 text-brand-textSecondary mb-6">
          Hello {userName}, our support team has reviewed your inquiry ({referenceNumber}).
        </Text>
      </Section>

      <Section className="my-6">
        <DetailRow label="Reference Ticket" value={referenceNumber} />
        <DetailRow label="Topic" value={topic} />
        <DetailRow label="Handled By" value={staffName} last />
      </Section>

      <Section className="my-6">
        <Heading className="m-0 font-display text-[15px] font-semibold text-brand-textPrimary mb-2">
          Team Response:
        </Heading>
        <Section className="bg-[#f0f9ff] border-l-4 border-solid border-[#0284c7] rounded-r-lg p-4">
          <Text className="m-0 font-body text-[15px] leading-6 text-[#0f172a] whitespace-pre-wrap">
            {replyMessage}
          </Text>
        </Section>
      </Section>

      {originalMessage && (
        <Section className="my-6">
          <Heading className="m-0 font-display text-[13px] font-medium text-brand-textSecondary mb-2">
            Original Inquiry:
          </Heading>
          <Section className="bg-[#f8fafc] border border-solid border-[#e2e8f0] rounded-lg p-3">
            <Text className="m-0 font-body text-[13px] leading-5 text-[#64748b] italic whitespace-pre-wrap">
              {originalMessage}
            </Text>
          </Section>
        </Section>
      )}

      <Callout tone="info">
        Need more help? You can continue this conversation anytime by replying directly to this
        email.
      </Callout>
    </Layout>
  );
};

export default ContactReplyNotice;
