/* eslint-disable react/no-unescaped-entities */
import {Text, Section} from "react-email";
import {Layout, Button, brand, baseUrl} from "./layout";

export default function VerifyEmail({
  name = "there",
  verifyUrl = `${baseUrl}/auth/verify-email?token=demo`,
  expiresInMinutes = 30,
}: {
  name?: string;
  verifyUrl?: string;
  expiresInMinutes?: number;
}) {
  return (
    <Layout preview="Verify your email to activate your Kalya account.">
      <Section style={{textAlign: "center", padding: "-28px 0 8px"}}>
        <div
          style={{
            display: "inline-block",
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: brand.color.primarySubtle,
            lineHeight: "48px",
            fontSize: 20,
            marginBottom: 16,
          }}
        >
          ✉️
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
          Welcome to Kalya
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
          Hi {name}, one last step — verify your email to activate your
          financial command center.
        </Text>
      </Section>

      <Section style={{textAlign: "center", margin: "24px 0 8px"}}>
        <Button href={verifyUrl}>Verify email</Button>
      </Section>

      <Text
        style={{
          margin: "16px 0 0",
          fontFamily: brand.font.body,
          fontSize: 12,
          color: brand.color.textMuted,
          textAlign: "center",
        }}
      >
        This link expires in {expiresInMinutes} minutes.
      </Text>

      {/* What's waiting on the other side — sets expectations, low-key */}
      <Section
        style={{
          backgroundColor: brand.color.surfaceRaised,
          border: `1px solid ${brand.color.border}`,
          borderRadius: 10,
          padding: "18px 20px",
          margin: "28px 0 24px",
        }}
      >
        <Text
          style={{
            margin: "0 0 10px",
            fontFamily: brand.font.body,
            fontSize: 12,
            fontWeight: 600,
            color: brand.color.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Once you're in
        </Text>
        <ChecklistItem text="Consolidate accounts, gold, equity, and loans in one view" />
        <ChecklistItem text="Set budgets and catch overspending before it happens" />
        <ChecklistItem text="Track EPF, PPF, NPS, and insurance — all in one place" last />
      </Section>

      {/* Fallback URL — some clients strip button links or images */}
      <Section
        style={{
          backgroundColor: brand.color.surfaceRaised,
          border: `1px solid ${brand.color.border}`,
          borderRadius: 10,
          padding: "14px 16px",
          margin: "0 0 24px",
        }}
      >
        <Text
          style={{
            margin: "0 0 4px",
            fontFamily: brand.font.body,
            fontSize: 11,
            color: brand.color.textMuted,
          }}
        >
          Button not working? Paste this link into your browser:
        </Text>
        <Text
          style={{
            margin: 0,
            fontFamily: brand.font.numeric,
            fontSize: 12,
            color: brand.color.info,
            wordBreak: "break-all",
          }}
        >
          {verifyUrl}
        </Text>
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
        Didn't create a Kalya account? You can safely ignore this email.
      </Text>
    </Layout>
  );
}

const ChecklistItem = ({text, last = false}: {text: string; last?: boolean}) => (
  <Text
    style={{
      margin: last ? 0 : "0 0 8px",
      fontFamily: brand.font.body,
      fontSize: 13,
      lineHeight: "19px",
      color: brand.color.textPrimary,
      paddingLeft: 20,
      position: "relative",
    }}
  >
    <span style={{color: brand.color.primary, marginRight: 8}}>✓</span>
    {text}
  </Text>
);