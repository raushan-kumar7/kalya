import * as React from 'react';
import { Button as EmailButton } from 'react-email';

export const Button = ({
  href,
  children,
  tone = 'primary',
}: {
  href: string;
  children: React.ReactNode;
  tone?: 'primary' | 'danger';
}) => {
  const bgClass = tone === 'danger' ? 'bg-brand-danger' : 'bg-brand-primary';
  const textClass = tone === 'danger' ? 'text-brand-onDanger' : 'text-brand-onPrimary';

  return (
    <EmailButton
      href={href}
      className={`inline-block font-body text-[15px] font-semibold no-underline py-3 px-7 rounded-lg ${bgClass} ${textClass}`}
    >
      {children}
    </EmailButton>
  );
};
