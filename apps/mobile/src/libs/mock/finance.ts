export interface Txn {
  id: string;
  title: string;
  subtitle: string;
  /** Integer paise. Negative represents an outflow */
  paise: number;
}

export const TRANSACTIONS: Txn[] = [
  { id: 't1', title: 'Apple Store', subtitle: 'Electronics · Today', paise: -129900 },
  { id: 't2', title: 'Salary Credited', subtitle: 'Apex Tech Corp · Yesterday', paise: 4500000 },
  { id: 't3', title: 'Blue Tokai Coffee', subtitle: 'Dining · 28 Oct', paise: -48000 },
  { id: 't4', title: 'Whole Foods Market', subtitle: 'Groceries · 29 Oct', paise: -84500 },
  { id: 't5', title: 'Consulting Retainer', subtitle: 'Direct Deposit · 27 Oct', paise: 1200000 },
  { id: 't6', title: 'Uber', subtitle: 'Transport · 26 Oct', paise: -38500 },
];

export const SUMMARY = {
  netWorth: 14829050,
  stats: [
    { label: 'Monthly Inflow', paise: 8500000, trend: '+8.2%', positive: true },
    { label: 'Monthly Spend', paise: 3245000, trend: '-3.1%', positive: true },
  ],
};

export const BUCKETS = [
  { key: 'needs', label: 'Needs (50%)', spent: 4200000, budget: 5000000, color: '#0d3e26' },
  { key: 'wants', label: 'Wants (30%)', spent: 2850000, budget: 3000000, color: '#d4af37' },
  { key: 'savings', label: 'Savings (20%)', spent: 2000000, budget: 2000000, color: '#2d7a50' },
];

export const SPLIT_GROUPS = [
  {
    id: 'g1',
    name: 'Goa Trip 2026',
    members: ['Rahul Sharma', 'Priya Patel', 'Ankit Verma', 'You'],
    pending: 145000,
  },
  {
    id: 'g2',
    name: 'Apartment Rent & Wifi',
    members: ['Karan Mehra', 'Siddharth Jain', 'You'],
    pending: 0,
  },
];

export const BALANCE_SHEET = [
  { label: 'Liquid Cash & Bank', paise: 3200000 },
  { label: 'Equity & Mutual Funds', paise: 11500000 },
  { label: 'Gold & Sovereign Bonds', paise: 3800000 },
  { label: 'Liabilities (Credit & Loans)', paise: -1200000 },
];
