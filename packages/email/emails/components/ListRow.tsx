import * as React from 'react';
import { Row, Column, Text } from 'react-email';
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
  const symbol = tone === 'positive' ? '✓' : '✕';
  const color = tone === 'positive' ? EMAILS_CONFIG.color.primary : EMAILS_CONFIG.color.danger;

  return (
    <Row className={last ? 'mb-0' : 'mb-2.5'}>
      <Column width="20" className="align-top">
        <Text
          style={{
            margin: 0,
            fontSize: '13px',
            lineHeight: '19px',
            fontWeight: 700,
            color,
          }}
        >
          {symbol}
        </Text>
      </Column>
      <Column className="align-top">
        <Text className="m-0 font-body text-[13px] leading-4.75 text-brand-textSecondary">
          {text}
        </Text>
      </Column>
    </Row>
  );
};
