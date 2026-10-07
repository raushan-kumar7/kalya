import type { UnifiedTransactionItem } from '../types';

export function exportTransactionsToCsv(
  items: UnifiedTransactionItem[],
  filename = 'kalya-transactions.csv'
) {
  const headers = [
    'Date',
    'Description',
    'Category',
    'Type',
    'Payment Method',
    'Total Amount',
    'Your Share',
    'Status',
    'Paid By',
    'Notes / Details',
  ];

  const rows = items.map((item) => {
    const date = item.date;
    const description = `"${(item.description || '').replace(/"/g, '""')}"`;
    const category = item.kind !== 'income' ? item.category?.label || 'General' : 'Income Streams';
    const type =
      item.kind === 'personal_expense'
        ? 'Expense'
        : item.kind === 'split_bill'
          ? 'Split Bill'
          : 'Income';
    const method = item.kind !== 'income' ? item.paymentMethod || 'UPI' : 'Bank Credit';
    const totalAmount = item.kind === 'split_bill' ? item.totalBill : item.amount;
    const yourShare = item.amount;
    const status =
      item.kind === 'split_bill'
        ? item.isSettled
          ? 'Settled'
          : item.pendingDuesNarration || 'Pending'
        : '-';
    const paidBy = item.kind === 'split_bill' ? (item.isUserPayer ? 'You' : item.payerName) : 'You';
    const notes =
      item.kind === 'income'
        ? `Salary: ${item.salary}, Other: ${item.other}`
        : item.kind === 'split_bill'
          ? `${item.participantsCount} participants`
          : '';

    return [
      date,
      description,
      `"${category}"`,
      type,
      method,
      totalAmount,
      yourShare,
      `"${status}"`,
      `"${paidBy}"`,
      `"${notes}"`,
    ];
  });

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
