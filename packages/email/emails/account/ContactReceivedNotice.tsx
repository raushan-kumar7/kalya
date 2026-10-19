import * as React from 'react';
import { Text, Section, Heading } from 'react-email';
import { Layout, DetailRow, Callout, Button } from '../components';

export interface ContactReceivedNoticeProps {
  userName?: string;
  userEmail?: string;
  referenceNumber?: string;
  topic?: string;
  message?: string;
  expectedResponse?: string;
}

export const ContactReceivedNotice = ({
  userName = 'Valued User',
  userEmail = 'user@example.com',
  referenceNumber = 'KAL-83921',
  topic = 'General Inquiry',
  message = 'Hello Kalya team, I have a question about budget limits.',
  expectedResponse = 'Within 2 working days',
}: ContactReceivedNoticeProps) => {
  return (
    <Layout preview={`We received your inquiry (${referenceNumber}) - Kalya Support`}>
      <Section className="text-center">
        <Heading className="m-0 font-display text-[22px] font-semibold text-brand-textPrimary mb-2">
          Message Received
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-6 text-brand-textSecondary mb-6">
          Hello {userName}, thanks for reaching out. We have logged your request and our team is
          reviewing it.
        </Text>
      </Section>

      <Section className="my-6">
        <DetailRow label="Reference Ticket" value={referenceNumber} />
        <DetailRow label="Sender Email" value={userEmail} />
        <DetailRow label="Topic" value={topic} />
        <DetailRow label="Expected SLA" value={expectedResponse} last />
      </Section>

      <Section className="my-6">
        <Heading className="m-0 font-display text-[15px] font-semibold text-brand-textPrimary mb-2">
          Your Submitted Message:
        </Heading>
        <Section className="bg-[#f8fafc] border border-solid border-[#e2e8f0] rounded-lg p-4">
          <Text className="m-0 font-body text-[14px] leading-6 text-[#334155] whitespace-pre-wrap">
            {message}
          </Text>
        </Section>
      </Section>

      <Callout tone="info">
        We read every message carefully. If you have any extra details or screenshots to add, simply
        reply directly to this email.
      </Callout>

      <Section className="text-center my-8">
        <Button href="https://kalya.app">Visit Kalya Dashboard</Button>
      </Section>
    </Layout>
  );
};

export default ContactReceivedNotice;
