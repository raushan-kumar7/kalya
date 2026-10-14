export interface LegalSection {
  id: string;
  number: string;
  title: string;
}

export const PRIVACY_SECTIONS: readonly LegalSection[] = [
  { id: 'section-1', number: '01', title: 'Who we are' },
  { id: 'section-2', number: '02', title: 'What we collect' },
  { id: 'section-3', number: '03', title: 'How we use your data' },
  { id: 'section-4', number: '04', title: 'Your consent and your choices' },
  { id: 'section-5', number: '05', title: 'Who we share data with' },
  { id: 'section-6', number: '06', title: 'Where your data is stored' },
  { id: 'section-7', number: '07', title: 'How long we keep your data' },
  { id: 'section-8', number: '08', title: 'How we keep your data safe' },
  { id: 'section-9', number: '09', title: 'Your rights' },
  { id: 'section-10', number: '10', title: 'Children' },
  { id: 'section-11', number: '11', title: 'Cookies and similar tools' },
  { id: 'section-12', number: '12', title: 'Changes to this policy' },
  { id: 'section-13', number: '13', title: 'Contact and grievances' },
] as const;

export const TERMS_SECTIONS: readonly LegalSection[] = [
  { id: 'section-1', number: '01', title: 'Agreeing to these terms' },
  { id: 'section-2', number: '02', title: 'What Kalya is, and what it is not' },
  { id: 'section-3', number: '03', title: 'Your account' },
  { id: 'section-4', number: '04', title: 'Your data' },
  { id: 'section-5', number: '05', title: 'Splitting bills with friends' },
  { id: 'section-6', number: '06', title: 'Using Kalya properly' },
  { id: 'section-7', number: '07', title: 'Cost' },
  { id: 'section-8', number: '08', title: 'Our content and brand' },
  { id: 'section-9', number: '09', title: 'Other services' },
  { id: 'section-10', number: '10', title: 'Alerts and emails' },
  { id: 'section-11', number: '11', title: 'No advice' },
  { id: 'section-12', number: '12', title: 'Availability and changes' },
  { id: 'section-13', number: '13', title: 'Ending your use' },
  { id: 'section-14', number: '14', title: 'Disclaimer' },
  { id: 'section-15', number: '15', title: 'Limits on our responsibility' },
  { id: 'section-16', number: '16', title: 'Governing law and disputes' },
  { id: 'section-17', number: '17', title: 'Changes to these terms' },
  { id: 'section-18', number: '18', title: 'Contact' },
] as const;
