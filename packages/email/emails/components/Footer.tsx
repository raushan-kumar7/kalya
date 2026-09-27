import * as React from 'react';
import { Section, Row, Column, Img, Text, Link, Hr } from 'react-email';
import { BASE_URL } from '../constants';

const icon = '/static/kalya_icon1.png';

export const Footer = () => {
  return (
    <Section className="bg-brand-bg border-t border-solid border-brand-border pt-8 px-10 pb-10">
      <Row>
        <Column align="center">
          <Img src={icon} alt="" width="30" height="30" className="block mx-auto mb-3" />
          <Text className="m-0 mb-0.5 font-body text-[13px] text-brand-textSecondary">
            कल्य — ready for tomorrow; in sound condition.
          </Text>
          <Text className="m-0 mb-5 font-body text-[13px] text-brand-textSecondary">
            Consolidate your wealth. Secure your tomorrow.
          </Text>
          <Row>
            <Column align="center">
              <Link
                href={`${BASE_URL}/dashboard`}
                className="font-body text-[12px] text-brand-textMuted no-underline"
              >
                Dashboard
              </Link>
              <span className="text-brand-border"> &nbsp;|&nbsp; </span>
              <Link
                href={`${BASE_URL}/help`}
                className="font-body text-[12px] text-brand-textMuted no-underline"
              >
                Help Center
              </Link>
              <span className="text-brand-border"> &nbsp;|&nbsp; </span>
              <Link
                href={`${BASE_URL}/privacy`}
                className="font-body text-[12px] text-brand-textMuted no-underline"
              >
                Privacy Policy
              </Link>
              <span className="text-brand-border"> &nbsp;|&nbsp; </span>
              <Link
                href={`${BASE_URL}/terms`}
                className="font-body text-[12px] text-brand-textMuted no-underline"
              >
                Terms of Service
              </Link>
            </Column>
          </Row>
          <Hr className="border-brand-border my-5" />
          <Text className="m-0 mb-1.5 font-body text-[11px] leading-[16px] text-brand-textMuted mt-3">
            Kalya Technologies Private Limited, [City, State, India]
          </Text>
        </Column>
      </Row>
    </Section>
  );
};
