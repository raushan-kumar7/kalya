import * as React from 'react';
import { Row, Column, Text } from 'react-email';

export const DetailRow = ({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) => (
  <Row
    className={`${
      last ? 'border-none pb-0 mb-0' : 'border-b border-solid border-brand-border pb-2.5 mb-2.5'
    }`}
  >
    <Column>
      <Text className="m-0 font-body text-caption text-brand-textMuted">{label}</Text>
    </Column>
    <Column align="right">
      <Text className="m-0 font-numeric text-[13px] text-brand-textPrimary">{value}</Text>
    </Column>
  </Row>
);
