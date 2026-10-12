import ExcelJS from 'exceljs';
import type { StatementData } from '@/components/dashboard/finances/statement/types';

/**
 * Generates and downloads an authoritative, styled Excel workbook for the statement.
 * Strictly adheres to Kalya's design palette: Deep Emerald (#0D3E26) and Satin Gold (#B8912E).
 */
export async function exportStatementToExcel(
  statement: StatementData,
  filename?: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Kalya Platform';
  workbook.lastModifiedBy = statement.user.name || 'Kalya User';
  workbook.created = new Date();
  workbook.modified = new Date();

  const brandColorPrimary = '0D3E26'; // Leaf Green
  const brandColorSubtle = 'E4EEE8'; // Mint Subtle
  const brandColorAccent = 'B8912E'; // Satin Gold
  const brandBgSurface = 'FCFBFA';

  // ==========================================================
  // SHEET 1: EXECUTIVE SUMMARY
  // ==========================================================
  const summarySheet = workbook.addWorksheet('Summary', {
    views: [{ showGridLines: true }],
  });

  // Title Banner
  summarySheet.mergeCells('A1:E1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'KALYA FINANCIAL STATEMENT';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: brandColorPrimary },
  };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  summarySheet.getRow(1).height = 36;

  // Tagline
  summarySheet.mergeCells('A2:E2');
  const tagCell = summarySheet.getCell('A2');
  tagCell.value = 'READY FOR TOMORROW. — CONFIDENTIAL WEALTH DIGEST';
  tagCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF8A6A16' } };
  tagCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: brandColorSubtle },
  };
  tagCell.alignment = { horizontal: 'center', vertical: 'middle' };
  summarySheet.getRow(2).height = 20;

  // Metadata block
  summarySheet.addRow([]);
  summarySheet.addRow([
    'Statement Reference:',
    statement.meta.statementId,
    '',
    'Statement Period:',
    statement.period.label,
  ]);
  summarySheet.addRow([
    'Account Holder:',
    statement.user.name,
    '',
    'Generated At:',
    new Date(statement.meta.generatedAt).toLocaleString('en-IN'),
  ]);
  summarySheet.addRow([
    'Email Address:',
    statement.user.email,
    '',
    'Statement Type:',
    statement.meta.scope === 'full' ? 'Full Financial Digest' : 'Expenses & Outlays',
  ]);
  summarySheet.addRow([]);

  // Style metadata labels
  [4, 5, 6].forEach((rowNum) => {
    const row = summarySheet.getRow(rowNum);
    row.getCell(1).font = { bold: true, color: { argb: 'FF4E5D6C' } };
    row.getCell(4).font = { bold: true, color: { argb: 'FF4E5D6C' } };
  });

  // KPI Header
  summarySheet.addRow(['FINANCIAL SUMMARY & KEY METRICS']);
  const kpiTitleRow = summarySheet.lastRow!;
  summarySheet.mergeCells(`A${kpiTitleRow.number}:E${kpiTitleRow.number}`);
  kpiTitleRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  kpiTitleRow.getCell(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: brandColorPrimary },
  };
  kpiTitleRow.height = 24;

  // KPI Table
  summarySheet.addRow(['Metric', 'Amount (₹)', '', 'Key Metric', 'Value']);
  const kpiHeaderRow = summarySheet.lastRow!;
  kpiHeaderRow.font = { bold: true };
  kpiHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: brandColorSubtle } };

  summarySheet.addRow([
    'Total Income',
    statement.kpis.totalIncome,
    '',
    'Savings Rate',
    `${statement.kpis.savingsRate}%`,
  ]);
  summarySheet.addRow([
    'Total Spent',
    statement.kpis.totalExpenses,
    '',
    'Expense Transactions',
    statement.kpis.expensesCount,
  ]);
  summarySheet.addRow([
    'Net Savings',
    statement.kpis.netSavings,
    '',
    'Split Obligations',
    statement.kpis.unsettledSplits,
  ]);
  summarySheet.addRow([]);

  // Format currency in KPI
  [10, 11, 12].forEach((rowNum) => {
    summarySheet.getCell(`B${rowNum}`).numFmt = '₹#,##0.00';
    summarySheet.getCell(`B${rowNum}`).font = { bold: true };
  });

  // Category Breakdown Section
  summarySheet.addRow(['TOP EXPENSE CATEGORIES']);
  const catTitleRow = summarySheet.lastRow!;
  summarySheet.mergeCells(`A${catTitleRow.number}:E${catTitleRow.number}`);
  catTitleRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  catTitleRow.getCell(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: brandColorPrimary },
  };
  catTitleRow.height = 24;

  summarySheet.addRow(['Category', 'Amount Spent (₹)', '% of Expenses', 'Transactions', 'Share']);
  const catHeaderRow = summarySheet.lastRow!;
  catHeaderRow.font = { bold: true };
  catHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: brandColorSubtle } };

  statement.categories.forEach((cat) => {
    summarySheet.addRow([
      cat.label,
      cat.amount,
      `${cat.percent}%`,
      cat.count,
      cat.percent >= 25 ? 'High Share' : cat.percent >= 10 ? 'Moderate' : 'Discretionary',
    ]);
    const r = summarySheet.lastRow!;
    r.getCell(2).numFmt = '₹#,##0.00';
  });

  summarySheet.addRow([]);

  // Bucket Allocation Section
  if (statement.buckets.length > 0) {
    summarySheet.addRow(['BUDGET BREAKDOWN (50 / 30 / 20 RULE)']);
    const bktTitleRow = summarySheet.lastRow!;
    summarySheet.mergeCells(`A${bktTitleRow.number}:E${bktTitleRow.number}`);
    bktTitleRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    bktTitleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: brandColorPrimary },
    };
    bktTitleRow.height = 24;

    summarySheet.addRow(['Budget Bucket', 'Budgeted (₹)', 'Spent (₹)', 'Usage %', 'Status']);
    const bktHeaderRow = summarySheet.lastRow!;
    bktHeaderRow.font = { bold: true };
    bktHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: brandColorSubtle } };

    statement.buckets.forEach((b) => {
      summarySheet.addRow([b.name, b.budgeted, b.spent, `${b.percent}%`, b.status.toUpperCase()]);
      const r = summarySheet.lastRow!;
      r.getCell(2).numFmt = '₹#,##0.00';
      r.getCell(3).numFmt = '₹#,##0.00';
    });
  }

  // Adjust column widths for Sheet 1
  summarySheet.columns = [
    { width: 28 },
    { width: 22 },
    { width: 18 },
    { width: 24 },
    { width: 26 },
  ];

  // ==========================================================
  // SHEET 2: ITEMIZED EXPENSES
  // ==========================================================
  const expensesSheet = workbook.addWorksheet('Itemized Expenses', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
  });

  const expenseColumns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Description', key: 'description', width: 34 },
    { header: 'Category', key: 'categoryName', width: 20 },
    { header: 'Payment Mode', key: 'paymentMethod', width: 16 },
    { header: 'Bill Type', key: 'type', width: 14 },
    { header: 'Total Bill (₹)', key: 'totalBill', width: 18 },
    { header: 'Amount Paid (₹)', key: 'yourShare', width: 18 },
    { header: 'Status', key: 'splitStatus', width: 24 },
    { header: 'Paid By', key: 'paidBy', width: 14 },
  ];
  expensesSheet.columns = expenseColumns;

  // Header row formatting
  const expHeaderRow = expensesSheet.getRow(1);
  expHeaderRow.height = 28;
  expHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  expHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: brandColorPrimary },
  };
  expHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // Add expense rows with zebra striping
  statement.expenses.forEach((item, index) => {
    const row = expensesSheet.addRow({
      date: item.date,
      description: item.description,
      categoryName: item.categoryName,
      paymentMethod: item.paymentMethod,
      type: item.isSplit ? 'Split Bill' : 'Personal',
      totalBill: item.totalBill,
      yourShare: item.yourShare,
      splitStatus: item.splitStatus,
      paidBy: item.paidBy,
    });

    row.height = 20;
    row.getCell('totalBill').numFmt = '₹#,##0.00';
    row.getCell('yourShare').numFmt = '₹#,##0.00';
    row.getCell('yourShare').font = { bold: true };

    if (index % 2 === 1) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: brandBgSurface },
      };
    }
  });

  // Summary row at bottom of expenses
  const expLastRowNum = statement.expenses.length + 1;
  const expTotalRow = expensesSheet.addRow({
    date: 'TOTAL',
    description: `Total Outlays (${statement.expenses.length} transactions)`,
    categoryName: '',
    paymentMethod: '',
    type: '',
    totalBill: '',
    yourShare: statement.kpis.totalExpenses,
    splitStatus: '',
    paidBy: '',
  });
  expTotalRow.height = 24;
  expTotalRow.font = { bold: true, color: { argb: 'FF0D3E26' } };
  expTotalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: brandColorSubtle },
  };
  expTotalRow.getCell('yourShare').numFmt = '₹#,##0.00';

  // ==========================================================
  // SHEET 3: INCOMES & CASHFLOW (For Full Statement)
  // ==========================================================
  if (statement.meta.scope === 'full' && statement.incomes.length > 0) {
    const incomeSheet = workbook.addWorksheet('Inflow Streams', {
      views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
    });

    incomeSheet.columns = [
      { header: 'Credit Date', key: 'date', width: 14 },
      { header: 'Income Source / Description', key: 'source', width: 34 },
      { header: 'Total Deposited (₹)', key: 'amount', width: 22 },
      { header: 'Salary (₹)', key: 'salary', width: 22 },
      { header: 'Other Inflow (₹)', key: 'other', width: 22 },
    ];

    const incHeaderRow = incomeSheet.getRow(1);
    incHeaderRow.height = 28;
    incHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    incHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: brandColorPrimary },
    };
    incHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };

    statement.incomes.forEach((inc, index) => {
      const row = incomeSheet.addRow({
        date: inc.date,
        source: inc.source,
        amount: inc.amount,
        salary: inc.salary,
        other: inc.other,
      });

      row.height = 20;
      row.getCell('amount').numFmt = '₹#,##0.00';
      row.getCell('salary').numFmt = '₹#,##0.00';
      row.getCell('other').numFmt = '₹#,##0.00';

      if (index % 2 === 1) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: brandBgSurface },
        };
      }
    });

    const incTotalRow = incomeSheet.addRow({
      date: 'TOTAL',
      source: `Total Income Received (${statement.incomes.length} ${statement.incomes.length === 1 ? 'deposit' : 'deposits'})`,
      amount: statement.kpis.totalIncome,
      salary: '',
      other: '',
    });
    incTotalRow.height = 24;
    incTotalRow.font = { bold: true, color: { argb: 'FF0D3E26' } };
    incTotalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: brandColorSubtle },
    };
    incTotalRow.getCell('amount').numFmt = '₹#,##0.00';
  }

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const defaultFilename = `kalya-statement-${statement.period.startDate}-to-${statement.period.endDate}.xlsx`;
  const exportFilename = filename || defaultFilename;

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = exportFilename.endsWith('.xlsx') ? exportFilename : `${exportFilename}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
