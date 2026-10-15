import * as React from 'react';
import { Section, Row, Column, Img, Text, Link, Hr } from 'react-email';
import { BASE_URL, getBaseUrl, EMAIL_ASSETS } from '../constants';

export const Footer = () => {
  const baseUrl = getBaseUrl() || BASE_URL;
  const currentYear = new Date().getFullYear();

  return (
    <Section className="bg-brand-bg border-t border-solid border-brand-border pt-8 px-8 pb-10 text-center">
      <Row>
        <Column align="center">
          {/* Brand Icon */}
          <Link href={baseUrl} target="_blank" className="inline-block">
            <Img
              src={EMAIL_ASSETS.icon}
              alt="Kalya"
              width="28"
              height="28"
              className="block mx-auto mb-2"
            />
          </Link>

          {/* Brand Taglines from apps/web */}
          <Text className="m-0 mb-1 font-display text-[11px] font-semibold tracking-wider text-brand-accent uppercase">
            READY FOR TOMORROW.
          </Text>

          <Text className="m-0 mb-1 font-body text-[13px] font-medium text-brand-textPrimary">
            कल्य — ready for tomorrow; in sound condition.
          </Text>

          <Text className="m-0 mb-3 font-body text-[12px] text-brand-textSecondary max-w-[420px] mx-auto leading-relaxed">
            A free, private app to budget, split bills and track your wealth. Consolidate your
            wealth. Secure your tomorrow.
          </Text>

          {/* Trust Banner from apps/web */}
          <Text className="m-0 mb-4 font-body text-[11px] font-semibold text-brand-primary">
            🛡️ No ads. Your data stays yours.
          </Text>

          {/* Navigation Links (Matching verified routes in apps/web) */}
          <Row className="mb-4">
            <Column align="center">
              <Link
                href={`${baseUrl}/dashboard`}
                className="font-body text-[12px] text-brand-textMuted no-underline font-medium"
              >
                Dashboard
              </Link>
              <span className="text-brand-border"> &nbsp;|&nbsp; </span>
              <Link
                href={`${baseUrl}/about`}
                className="font-body text-[12px] text-brand-textMuted no-underline font-medium"
              >
                About
              </Link>
              <span className="text-brand-border"> &nbsp;|&nbsp; </span>
              <Link
                href={`${baseUrl}/contact`}
                className="font-body text-[12px] text-brand-textMuted no-underline font-medium"
              >
                Contact
              </Link>
              <span className="text-brand-border"> &nbsp;|&nbsp; </span>
              <Link
                href={`${baseUrl}/privacy`}
                className="font-body text-[12px] text-brand-textMuted no-underline font-medium"
              >
                Privacy Policy
              </Link>
              <span className="text-brand-border"> &nbsp;|&nbsp; </span>
              <Link
                href={`${baseUrl}/terms`}
                className="font-body text-[12px] text-brand-textMuted no-underline font-medium"
              >
                Terms of Service
              </Link>
            </Column>
          </Row>

          <Hr className="border-brand-border my-4" />

          {/* Security & Transactional Notice */}
          <Text className="m-0 mb-1.5 font-body text-[11px] leading-4 text-brand-textMuted max-w-[460px] mx-auto">
            This is an automated transactional notification regarding your Kalya account. For your
            security, Kalya will never ask for your password or credentials via email.
          </Text>

          {/* Copyright */}
          <Text className="m-0 font-body text-[11px] leading-4 text-brand-textMuted">
            © {currentYear} Kalya Technologies. All rights reserved.
          </Text>
        </Column>
      </Row>
    </Section>
  );
};
