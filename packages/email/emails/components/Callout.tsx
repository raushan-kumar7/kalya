import * as React from 'react';
import { Section, Text } from 'react-email';

export const Callout = ({
  tone,
  children,
}: {
  tone: 'info' | 'success' | 'danger' | 'warning';
  children: React.ReactNode;
}) => {
  const bgClass = {
    info: 'bg-brand-infoSubtle',
    success: 'bg-brand-successSubtle',
    danger: 'bg-brand-dangerSubtle',
    warning: 'bg-brand-warningSubtle',
  }[tone];

  return (
    <Section className={`${bgClass} rounded-[10px] py-[14px] px-4 mb-3`}>
      <Text className="m-0 font-body text-[13px] leading-[19px] text-brand-textPrimary">
        {children}
      </Text>
    </Section>
  );
};
