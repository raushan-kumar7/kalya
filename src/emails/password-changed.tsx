/* eslint-disable react/no-unescaped-entities */
import {Text, Section, Row, Column} from "react-email";
import {Layout, Button, brand, baseUrl} from "./layout";

export default function PasswordChanged({
  name = "there",
  timestamp = "15 July 2026, 6:42 PM IST",
  device = "Chrome on Windows",
  location = "Hyderabad, India",
}: {
  name?: string;
  timestamp?: string;
  device?: string;
  location?: string;
}) {
  return (
    <Layout preview="Your Kalya password was just changed.">
      {/* Status icon + heading */}
      <Section style={{textAlign: "center", padding: "20px 0 8px"}}>
        <div
          style={{
            display: "inline-block",
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: brand.color.successSubtle,
            lineHeight: "48px",
            fontSize: 22,
            marginBottom: 16,
          }}
        >
          ✓
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
          Your password was changed
        </Text>
        <Text
          style={{
            margin: 0,
            fontFamily: brand.font.body,
            fontSize: 14,
            color: brand.color.textSecondary,
          }}
        >
          Hi {name}, this confirms your Kalya password was updated
          successfully.
        </Text>
      </Section>

      {/* Change details card */}
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
        <DetailRow label="Location" value={location} last />
      </Section>

      <Text
        style={{
          margin: "0 0 24px",
          fontFamily: brand.font.body,
          fontSize: 14,
          lineHeight: "22px",
          color: brand.color.textSecondary,
        }}
      >
        If this was you, no further action is needed — your account stays
        secure. If you didn't make this change, please secure your account
        immediately below.
      </Text>

      <Section style={{textAlign: "center", margin: "0 0 8px"}}>
        <Button href={`${baseUrl}/account/security`}>
          Secure my account
        </Button>
      </Section>

      <Text
        style={{
          margin: "20px 0 0",
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