import React, { useMemo, useState } from 'react';
import { EmptyState, SearchInput, Tabs, UndoSnackBar } from '@/components/ui';
import { TabScreenWrapper } from '@/components/shared/tabs';
import { TransactionList } from '@/components/shared/transaction-list';
import { TRANSACTIONS, type Txn } from '@/libs/mock/finance';

type Filter = 'all' | 'expense' | 'income' | 'transfers';

const FILTER_TABS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'expense', label: 'Outflows' },
  { id: 'income', label: 'Inflows' },
  { id: 'transfers', label: 'Transfers' },
];

const matchesFilter = (txn: Txn, filter: Filter) => {
  if (filter === 'expense') return txn.paise < 0;
  if (filter === 'income') return txn.paise > 0;
  return filter === 'all';
};

export default function HistoryScreen() {
  const [items, setItems] = useState(TRANSACTIONS);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [removed, setRemoved] = useState<Txn | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (t) =>
        matchesFilter(t, filter) &&
        (!q || t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q))
    );
  }, [items, filter, query]);

  const handleDelete = (id: string) => {
    const txn = items.find((t) => t.id === id);
    if (!txn) return;
    setItems((prev) => prev.filter((t) => t.id !== id));
    setRemoved(txn);
  };

  const handleUndo = () => {
    if (removed) setItems((prev) => [removed, ...prev]);
    setRemoved(null);
  };

  return (
    <TabScreenWrapper
      title="Transaction Ledger"
      subtitle="Search and review all inflows and outflows"
      overlay={
        <UndoSnackBar
          visible={removed !== null}
          message="Transaction deleted"
          onUndo={handleUndo}
          onExpire={() => setRemoved(null)}
        />
      }
    >
      <SearchInput
        placeholder="Search merchants, categories..."
        value={query}
        onChangeText={setQuery}
      />
      <Tabs<Filter> variant="pill" activeTab={filter} onChange={setFilter} tabs={FILTER_TABS} />

      {visible.length > 0 ? (
        <TransactionList items={visible} onDelete={handleDelete} />
      ) : (
        <EmptyState
          title="No transactions found"
          description="Try adjusting your filter or search query to find transactions."
        />
      )}
    </TabScreenWrapper>
  );
}
