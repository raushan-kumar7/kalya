import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';
import type { StatementData } from '@/components/dashboard/finances/statement/types';

export const KALYA_ICON_URL =
  'https://res.cloudinary.com/cloud-alpha/image/upload/v1784056074/kalya/kalya_icon_n6webd.png';
export const KALYA_LOGO_URL =
  'https://res.cloudinary.com/cloud-alpha/image/upload/v1784056067/kalya/kalya_logo_yxp1fz.png';

// Register application fonts matching Kalya's design system:
// 1. Inter (Body font - contains full Indian Rupee symbol ₹, U+20B9)
Font.register({
  family: 'Inter',
  fonts: [
    {
      src:
        typeof window !== 'undefined'
          ? `${window.location.origin}/fonts/Inter-Regular.ttf`
          : 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.21/files/inter-latin-400-normal.woff',
      fontWeight: 'normal',
    },
    {
      src:
        typeof window !== 'undefined'
          ? `${window.location.origin}/fonts/Inter-Bold.ttf`
          : 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.21/files/inter-latin-700-normal.woff',
      fontWeight: 'bold',
    },
  ],
});

// 2. Outfit (Display / Brand Headings)
Font.register({
  family: 'Outfit',
  fonts: [
    {
      src:
        typeof window !== 'undefined'
          ? `${window.location.origin}/fonts/Outfit-Regular.ttf`
          : 'https://raw.githubusercontent.com/Outfitio/Outfit-Fonts/main/fonts/ttf/Outfit-Regular.ttf',
      fontWeight: 'normal',
    },
    {
      src:
        typeof window !== 'undefined'
          ? `${window.location.origin}/fonts/Outfit-Bold.ttf`
          : 'https://raw.githubusercontent.com/Outfitio/Outfit-Fonts/main/fonts/ttf/Outfit-Bold.ttf',
      fontWeight: 'bold',
    },
  ],
});

// 3. IBM Plex Mono (Numeric figures, Currency amounts with ₹, Dates, Statement IDs)
Font.register({
  family: 'IBMPlexMono',
  fonts: [
    {
      src:
        typeof window !== 'undefined'
          ? `${window.location.origin}/fonts/IBMPlexMono-Regular.ttf`
          : 'https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-mono@5.0.8/files/ibm-plex-mono-latin-400-normal.woff',
      fontWeight: 'normal',
    },
    {
      src:
        typeof window !== 'undefined'
          ? `${window.location.origin}/fonts/IBMPlexMono-Bold.ttf`
          : 'https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-mono@5.0.8/files/ibm-plex-mono-latin-700-normal.woff',
      fontWeight: 'bold',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 44,
    paddingHorizontal: 36,
    fontFamily: 'Inter',
    fontSize: 9,
    color: '#16241D',
    backgroundColor: '#FFFFFF',
  },
  // Top Header Lockup
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1.5,
    borderBottomColor: '#E4E1DA',
    paddingBottom: 14,
    marginBottom: 14,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogo: {
    width: 38,
    height: 38,
    objectFit: 'contain',
    borderRadius: 6,
  },
  brandTextGroup: {
    flexDirection: 'column',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontFamily: 'Outfit',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#0D3E26',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    backgroundColor: '#E4EEE8',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  verifiedText: {
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontSize: 6.5,
    color: '#0D3E26',
    letterSpacing: 0.8,
  },
  brandEyebrow: {
    fontFamily: 'Outfit',
    fontWeight: 'bold',
    fontSize: 7.5,
    color: '#8A6A16',
    letterSpacing: 1.6,
    marginTop: 1.5,
  },
  brandSubtitle: {
    fontFamily: 'Inter',
    fontSize: 7.5,
    color: '#6A7279',
    marginTop: 1.5,
  },
  userBlock: {
    alignItems: 'flex-end',
  },
  userName: {
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontSize: 10.5,
    color: '#16241D',
  },
  userEmail: {
    fontFamily: 'Inter',
    fontSize: 8,
    color: '#4E5D6C',
    marginTop: 1,
  },
  periodBadge: {
    backgroundColor: '#FCFBFA',
    borderWidth: 1,
    borderColor: '#E4E1DA',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    marginTop: 4,
  },
  periodText: {
    fontSize: 8,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#0D3E26',
  },
  refNumber: {
    fontFamily: 'IBMPlexMono',
    fontSize: 7,
    color: '#6A7279',
    marginTop: 2,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E1DA',
    paddingBottom: 4,
    marginTop: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Outfit',
    fontWeight: 'bold',
    fontSize: 9.5,
    color: '#0D3E26',
  },
  sectionTag: {
    fontFamily: 'Inter',
    fontSize: 7,
    color: '#6A7279',
  },

  // KPI Deck
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  kpiCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E4E1DA',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#FCFBFA',
  },
  kpiLabel: {
    fontSize: 6.5,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#6A7279',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontFamily: 'IBMPlexMono',
    fontWeight: 'bold',
    fontSize: 11.5,
    color: '#16241D',
    marginTop: 3,
  },
  kpiSubtext: {
    fontFamily: 'Inter',
    fontSize: 6.5,
    color: '#6A7279',
    marginTop: 2,
  },

  // Two Column Grid
  twoCol: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  colBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E4E1DA',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  boxHeader: {
    fontFamily: 'Outfit',
    fontWeight: 'bold',
    fontSize: 8.5,
    color: '#16241D',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E4E1DA',
    paddingBottom: 4,
    marginBottom: 6,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F5F4F0',
  },
  listKey: {
    fontFamily: 'Inter',
    fontSize: 7.5,
    color: '#4E5D6C',
    maxWidth: '55%',
  },
  listVal: {
    fontFamily: 'IBMPlexMono',
    fontWeight: 'bold',
    fontSize: 7.5,
    color: '#16241D',
  },

  // Data Table
  tableContainer: {
    borderWidth: 1,
    borderColor: '#E4E1DA',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 3,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0D3E26',
    paddingVertical: 5.5,
    paddingHorizontal: 7,
  },
  thCell: {
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontSize: 7.5,
    color: '#FFFFFF',
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: '#E4E1DA',
    paddingVertical: 5,
    paddingHorizontal: 7,
    backgroundColor: '#FFFFFF',
  },
  tableRowAlt: {
    backgroundColor: '#FCFBFA',
  },
  tdCell: {
    fontFamily: 'Inter',
    fontSize: 7.5,
    color: '#16241D',
  },
  tdCellBold: {
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontSize: 7.5,
    color: '#16241D',
  },
  tdCellMuted: {
    fontFamily: 'Inter',
    fontSize: 7,
    color: '#6A7279',
  },
  tdCellDate: {
    fontFamily: 'IBMPlexMono',
    fontSize: 7,
    color: '#6A7279',
  },
  tdCellAmount: {
    fontFamily: 'IBMPlexMono',
    fontWeight: 'bold',
    fontSize: 7.5,
    color: '#16241D',
  },

  // Column Widths
  colDate: { width: '15%' },
  colDesc: { width: '31%' },
  colCat: { width: '18%' },
  colMethod: { width: '12%' },
  colType: { width: '10%' },
  colAmount: { width: '14%', textAlign: 'right' },

  // Summary Row
  summaryRow: {
    flexDirection: 'row',
    borderTopWidth: 1.5,
    borderTopColor: '#0D3E26',
    backgroundColor: '#E4EEE8',
    paddingVertical: 5.5,
    paddingHorizontal: 7,
  },
  summaryLabel: {
    width: '86%',
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontSize: 8,
    color: '#0D3E26',
    textAlign: 'right',
    paddingRight: 6,
  },
  summaryValue: {
    width: '14%',
    fontFamily: 'IBMPlexMono',
    fontWeight: 'bold',
    fontSize: 8.5,
    color: '#0D3E26',
    textAlign: 'right',
  },

  // Footer (Fixed across all pages)
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 36,
    right: 36,
    borderTopWidth: 0.5,
    borderTopColor: '#E4E1DA',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Inter',
    fontSize: 6.5,
    color: '#6A7279',
  },
  pageNumber: {
    fontSize: 6.5,
    fontFamily: 'IBMPlexMono',
    fontWeight: 'bold',
    color: '#4E5D6C',
  },
});

function formatPdfMoney(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `₹${safe.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const mIdx = parseInt(month, 10) - 1;
      return `${parseInt(day, 10)} ${months[mIdx] || month} ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

function formatPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    upi: 'UPI',
    phonepe: 'PhonePe',
    gpay: 'Google Pay',
    paytm: 'Paytm',
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    cash: 'Cash',
    net_banking: 'Net Banking',
  };
  return map[method?.toLowerCase()] || method?.toUpperCase() || 'UPI';
}

export interface StatementPdfDocumentProps {
  statement: StatementData;
}

export function StatementPdfDocument({ statement }: StatementPdfDocumentProps) {
  const { kpis, buckets, categories, expenses, incomes, period, user, meta } = statement;

  return (
    <Document
      title={`Kalya Financial Statement - ${period.label}`}
      author="Kalya Platform"
      subject="Personal Financial Statement & Expense Summary"
      keywords="kalya, personal finance, statement, net savings, budget"
      creator="Kalya Platform"
      producer="Kalya Statement Engine"
      language="en-IN"
    >
      <Page size="A4" style={styles.page} wrap>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.brandGroup}>
            <Image src={KALYA_ICON_URL} style={styles.brandLogo} />
            <View style={styles.brandTextGroup}>
              <View style={styles.titleRow}>
                <Text style={styles.brandTitle}>KALYA</Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>VERIFIED</Text>
                </View>
              </View>
              <Text style={styles.brandEyebrow}>READY FOR TOMORROW.</Text>
              <Text style={styles.brandSubtitle}>
                Personal Financial Statement &amp; Expense Summary
              </Text>
            </View>
          </View>

          <View style={styles.userBlock}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.periodBadge}>
              <Text style={styles.periodText}>Period: {period.label}</Text>
            </View>
            <Text style={styles.refNumber}>Statement ID: {meta.statementId}</Text>
          </View>
        </View>

        {/* SECTION 1: FINANCIAL SUMMARY */}
        <View style={styles.sectionHeader} wrap={false}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <Text style={styles.sectionTag}>
            Section 1 · Overview of Inflows, Outflows &amp; Savings
          </Text>
        </View>

        <View style={styles.kpiRow} wrap={false}>
          {/* Total Income */}
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Income</Text>
            <Text style={[styles.kpiValue, { color: '#1E7A4C' }]}>
              {formatPdfMoney(kpis.totalIncome)}
            </Text>
            <Text style={styles.kpiSubtext}>
              {kpis.incomesCount} {kpis.incomesCount === 1 ? 'income deposit' : 'income deposits'}
            </Text>
          </View>

          {/* Total Spent */}
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Spent</Text>
            <Text style={styles.kpiValue}>{formatPdfMoney(kpis.totalExpenses)}</Text>
            <Text style={styles.kpiSubtext}>
              {kpis.expensesCount}{' '}
              {kpis.expensesCount === 1 ? 'expense recorded' : 'expenses recorded'}
            </Text>
          </View>

          {/* Net Savings */}
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Net Savings</Text>
            <Text
              style={[styles.kpiValue, { color: kpis.netSavings >= 0 ? '#1E7A4C' : '#B00020' }]}
            >
              {formatPdfMoney(kpis.netSavings)}
            </Text>
            <Text style={styles.kpiSubtext}>{kpis.savingsRate}% of income saved</Text>
          </View>

          {/* Savings Rate */}
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Savings Rate</Text>
            <Text style={[styles.kpiValue, { color: '#8A6A16' }]}>{kpis.savingsRate}%</Text>
            <Text style={styles.kpiSubtext}>
              {kpis.unsettledSplits > 0
                ? `${formatPdfMoney(kpis.unsettledSplits)} in split bills`
                : 'All split bills settled ✓'}
            </Text>
          </View>
        </View>

        {/* TWO COLUMN BREAKDOWN: Buckets & Categories */}
        <View style={styles.twoCol} wrap={false}>
          {/* Budget Rule Breakdown (50 / 30 / 20) */}
          <View style={styles.colBox}>
            <Text style={styles.boxHeader}>Budget Rule Breakdown (50 / 30 / 20)</Text>
            {buckets.length === 0 ? (
              <Text style={styles.tdCellMuted}>No budget allocations recorded.</Text>
            ) : (
              buckets.slice(0, 4).map((b) => (
                <View key={b.id} style={styles.listItem}>
                  <Text style={styles.listKey}>{b.name}</Text>
                  <Text style={styles.listVal}>
                    {formatPdfMoney(b.spent)}{' '}
                    <Text style={{ color: '#6A7279', fontSize: 7, fontFamily: 'Inter' }}>
                      ({b.percent}%)
                    </Text>
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Top Expense Categories */}
          <View style={styles.colBox}>
            <Text style={styles.boxHeader}>Top Expense Categories</Text>
            {categories.length === 0 ? (
              <Text style={styles.tdCellMuted}>No categorized expenses logged.</Text>
            ) : (
              categories.slice(0, 4).map((c) => (
                <View key={c.id} style={styles.listItem}>
                  <Text style={styles.listKey}>
                    {c.label}{' '}
                    <Text style={{ color: '#6A7279', fontSize: 6.5, fontFamily: 'Inter' }}>
                      ({c.count} {c.count === 1 ? 'item' : 'items'})
                    </Text>
                  </Text>
                  <Text style={styles.listVal}>
                    {formatPdfMoney(c.amount)}{' '}
                    <Text style={{ color: '#6A7279', fontSize: 7, fontFamily: 'Inter' }}>
                      ({c.percent}%)
                    </Text>
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* SECTION 2: ITEMIZED EXPENSES TABLE */}
        <View style={styles.sectionHeader} wrap={false}>
          <Text style={styles.sectionTitle}>Itemized Expense History</Text>
          <Text style={styles.sectionTag}>
            Section 2 · {expenses.length}{' '}
            {expenses.length === 1 ? 'Recorded Transaction' : 'Recorded Transactions'}
          </Text>
        </View>

        <View style={styles.tableContainer}>
          {/* Repeating Table Header */}
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.thCell, styles.colDate]}>Date</Text>
            <Text style={[styles.thCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.thCell, styles.colCat]}>Category</Text>
            <Text style={[styles.thCell, styles.colMethod]}>Payment Mode</Text>
            <Text style={[styles.thCell, styles.colType]}>Bill Type</Text>
            <Text style={[styles.thCell, styles.colAmount]}>Amount Paid</Text>
          </View>

          {/* Table Data Rows with break protection */}
          {expenses.map((item, index) => (
            <View
              key={item.id || index}
              style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
              wrap={false}
            >
              <Text style={[styles.tdCellDate, styles.colDate]}>
                {formatDisplayDate(item.date)}
              </Text>
              <Text style={[styles.tdCellBold, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.tdCell, styles.colCat]}>{item.categoryName}</Text>
              <Text style={[styles.tdCellMuted, styles.colMethod]}>
                {formatPaymentMethod(item.paymentMethod)}
              </Text>
              <Text style={[styles.tdCellMuted, styles.colType]}>
                {item.isSplit ? 'Split Bill' : 'Personal'}
              </Text>
              <Text style={[styles.tdCellAmount, styles.colAmount]}>
                {formatPdfMoney(item.yourShare)}
              </Text>
            </View>
          ))}

          {/* Table Total Row */}
          <View style={styles.summaryRow} wrap={false}>
            <Text style={styles.summaryLabel}>
              Total Expenses ({expenses.length}{' '}
              {expenses.length === 1 ? 'transaction' : 'transactions'}):
            </Text>
            <Text style={styles.summaryValue}>{formatPdfMoney(kpis.totalExpenses)}</Text>
          </View>
        </View>

        {/* SECTION 3: INCOMES (when full statement and records exist) */}
        {meta.scope === 'full' && incomes.length > 0 && (
          <View wrap={false}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Income Streams &amp; Deposits</Text>
              <Text style={styles.sectionTag}>
                Section 3 · {incomes.length} {incomes.length === 1 ? 'Deposit' : 'Deposits'}
              </Text>
            </View>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader} fixed>
                <Text style={[styles.thCell, styles.colDate]}>Credit Date</Text>
                <Text style={[styles.thCell, { width: '51%' }]}>Source / Description</Text>
                <Text style={[styles.thCell, { width: '34%', textAlign: 'right' }]}>
                  Credited Amount
                </Text>
              </View>
              {incomes.map((inc, index) => (
                <View
                  key={inc.id || index}
                  style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
                  wrap={false}
                >
                  <Text style={[styles.tdCellDate, styles.colDate]}>
                    {formatDisplayDate(inc.date)}
                  </Text>
                  <Text style={[styles.tdCellBold, { width: '51%' }]}>{inc.source}</Text>
                  <Text
                    style={[
                      styles.tdCellAmount,
                      { width: '34%', textAlign: 'right', color: '#1E7A4C' },
                    ]}
                  >
                    {formatPdfMoney(inc.amount)}
                  </Text>
                </View>
              ))}
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { width: '66%' }]}>
                  Total Income Received ({incomes.length} {incomes.length === 1 ? 'item' : 'items'}
                  ):
                </Text>
                <Text style={[styles.summaryValue, { width: '34%', color: '#1E7A4C' }]}>
                  {formatPdfMoney(kpis.totalIncome)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* FIXED FOOTER WITH PAGE NUMBERS */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated by Kalya · Verified personal financial statement · Statement ID:{' '}
            {meta.statementId}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
