import React, { Fragment } from 'react';
import { Card, ListItem, MoneyText, SwipeableRow } from '@/components/ui';
import type { Txn } from '@/libs/mock/finance';

export interface TransactionListProps {
  items: Txn[];
  /** When provided, rows support swipe-to-delete */
  onDelete?: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ items, onDelete }) => (
  <Card padding="none" className="overflow-hidden">
    {items.map((txn, index) => {
      const row = (
        <ListItem
          title={txn.title}
          subtitle={txn.subtitle}
          trailing={<MoneyText paise={txn.paise} colored variant="numeral-sm" />}
          bottomDivider={index < items.length - 1}
        />
      );

      return onDelete ? (
        <SwipeableRow key={txn.id} onDelete={() => onDelete(txn.id)}>
          {row}
        </SwipeableRow>
      ) : (
        <Fragment key={txn.id}>{row}</Fragment>
      );
    })}
  </Card>
);
