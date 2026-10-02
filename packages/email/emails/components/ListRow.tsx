import * as React from 'react';
import { Row, Column, Text } from 'react-email';
import type { LucideIcon } from 'lucide-react';
import { Check, X } from 'lucide-react';
import { EMAILS_CONFIG } from '../constants';

export const ListRow = ({
  text,
  tone = 'positive',
  last = false,
}: {
  text: string;
  tone?: 'positive' | 'negative';
  last?: boolean;
}) => {
  const Icon: LucideIcon = tone === 'positive' ? Check : X;
  const color = tone === 'positive' ? EMAILS_CONFIG.color.primary : EMAILS_CONFIG.color.danger;

  return (
    <Row className={last ? 'mb-0' : 'mb-2.5'}>
      <Column width="22" className="align-top">
        <Icon size={14} color={color} strokeWidth={2.5} className="block mt-0.75" />
      </Column>
      <Column className="align-top">
        <Text className="m-0 font-body text-[13px] leading-4.75 text-brand-textSecondary">
          {text}
        </Text>
      </Column>
    </Row>
  );
};
