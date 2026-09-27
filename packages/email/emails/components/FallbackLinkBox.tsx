import * as React from 'react';
import { Section, Text } from 'react-email';

export const FallbackLinkBox = ({
  url,
  label = 'Button not working? Paste this link into your browser:',
}: {
  url: string;
  label?: string;
}) => (
  <Section className="bg-brand-surfaceRaised border border-solid border-brand-border rounded-[10px] py-[14px] px-4 my-6">
    <Text className="m-0 mb-1 font-body text-[11px] text-brand-textMuted">{label}</Text>
    <Text className="m-0 font-numeric text-[12px] text-brand-info break-all">{url}</Text>
  </Section>
);
