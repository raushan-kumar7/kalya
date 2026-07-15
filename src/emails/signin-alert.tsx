/* eslint-disable react/no-unescaped-entities */
import {Text, Section, Row, Column} from "react-email";
import {Layout, Button, brand, baseUrl} from "./layout";

export default function SigninAlert({
  name = "there",
  timestamp = "15 July 2026, 6:42 PM IST",
  device = "Chrome on Windows",
  location = "Hyderabad, India",
  ipAddress = "49.37.XXX.XXX",
}: {
  name?: string;
  timestamp?: string;
  device?: string;
  location?: string;
  ipAddress?: string;
}) {
  return (
    <Layout preview="New sign-in to your Kalya account.">
      <Section style={{textAlign: "center", padding: "-28px 0 8px"}}>
        <div
          style={{
            display: "inline-block",
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: brand.color.infoSubtle,
            lineHeight: "48px",
            fontSize: 20,
            marginBottom: 16,
          }}
        >
          🛡️
        </div>
        <Text
          style={{
            margin: "0 0 4px",
            fontFamily: brand.font.display,
            fontSize: 22,
            fontWeight: 600,
            color: brand.color.textPrimary,
          }}
        >
          New sign-in to your account
        </Text>
        <Text
          style={{
            margin: 0,
            fontFamily: brand.font.body,
            fontSize: 14,
            lineHeight: "20px",
            color: brand.color.textSecondary,
          }}
        >
          Hi {name}, we noticed a new sign-in to your Kalya account.
        </Text>
      </Section>

      {/* Sign-in details card */}
      <Section
        style={{
          backgroundColor: brand.color.surfaceRaised,
          border: `1px solid ${brand.color.border}`,
          borderRadius: 10,
          padding: "18px 20px",
          margin: "20px 0",
        }}
      >
        <DetailRow label="Time" value={timestamp} />
        <DetailRow label="Device" value={device} />
        <DetailRow label="Location" value={location} />
        <DetailRow label="IP address" value={ipAddress} last />
      </Section>

      {/* This was me — reassurance, no CTA needed */}
      <Section
        style={{
          backgroundColor: brand.color.successSubtle,
          borderRadius: 10,
          padding: "14px 16px",
          margin: "0 0 12px",
        }}
      >
        <Text
          style={{
            margin: 0,
            fontFamily: brand.font.body,
            fontSize: 13,
            lineHeight: "19px",
            color: brand.color.textPrimary,
          }}
        >
          <strong>Recognize this?</strong> No action needed — your account
          stays secure.
        </Text>
      </Section>

      {/* Wasn't me — urgent path */}
      <Section
        style={{
          backgroundColor: brand.color.dangerSubtle,
          borderRadius: 10,
          padding: "14px 16px",
          margin: "0 0 24px",
        }}
      >
        <Text
          style={{
            margin: "0 0 12px",
            fontFamily: brand.font.body,
            fontSize: 13,
            lineHeight: "19px",
            color: brand.color.textPrimary,
          }}
        >
          <strong>Don't recognize this?</strong> Someone else may have
          access to your account. Secure it right away.
        </Text>
        <Button href={`${baseUrl}/account/security`}>
          Secure my account
        </Button>
      </Section>

      <Text
        style={{
          margin: 0,
          fontFamily: brand.font.body,
          fontSize: 12,
          lineHeight: "18px",
          color: brand.color.textMuted,
          textAlign: "center",
        }}
      >
        For your protection, we never ask for your password by email. If
        you're unsure about this activity, reset your password and contact
        support right away.
      </Text>
    </Layout>
  );
}

const DetailRow = ({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) => (
  <Row
    style={{
      borderBottom: last ? "none" : `1px solid ${brand.color.border}`,
      paddingBottom: last ? 0 : 10,
      marginBottom: last ? 0 : 10,
    }}
  >
    <Column>
      <Text
        style={{
          margin: 0,
          fontFamily: brand.font.body,
          fontSize: 12,
          color: brand.color.textMuted,
        }}
      >
        {label}
      </Text>
    </Column>
    <Column align="right">
      <Text
        style={{
          margin: 0,
          fontFamily: brand.font.numeric,
          fontSize: 13,
          color: brand.color.textPrimary,
        }}
      >
        {value}
      </Text>
    </Column>
  </Row>
);