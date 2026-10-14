export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: '1. Is Kalya really free?',
    a: 'Yes. Kalya is completely free for now, with every feature open and no credit card needed. If that ever changes, we will tell you first.',
  },
  {
    q: '2. Do I need to share my bank login?',
    a: 'No. You add your transactions yourself, and Kalya never asks for bank passwords or holds your money.',
  },
  {
    q: '3. Who can see my data?',
    a: "Only you. Each account's data is kept separate from every other user's. Friends see only the split details you share with them.",
  },
  {
    q: '4. Do you sell my data or show ads?',
    a: 'No. Kalya has no ads and does not sell your financial data to anyone.',
  },
  {
    q: '5. How is Kalya different from other expense apps?',
    a: 'Kalya puts budgeting, bill splitting, goals and wealth tracking in one place. Your splits and your budget talk to each other, so you do not copy numbers between apps.',
  },
  {
    q: '6. How does bill splitting connect to my own spending?',
    a: 'When you split an expense, your share goes into your budget and the rest is tracked as money friends owe you. Friends you invite see their side and can accept or decline.',
  },
  {
    q: '7. Which payment methods can I record?',
    a: 'UPI, PhonePe, Google Pay, Paytm, debit cards and credit cards.',
  },
  {
    q: '8. How does the gold and silver tracker handle GST?',
    a: 'You enter the weight, the rate and the platform. Kalya applies the 3% GST in its calculation so your value reflects what you actually paid.',
  },
  {
    q: '9. Can I take my data with me or delete it?',
    a: 'Yes. Export your ledger as CSV, JSON or PDF at any time.',
  },
  {
    q: '10. Is there an app for my phone?',
    a: "Kalya works in your phone's browser and is built for small screens. A native mobile app is in active development.",
  },
];
