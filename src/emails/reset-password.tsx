/* eslint-disable react/no-unescaped-entities */
import {Text, Section} from "react-email";
import {Layout, Button, brand, baseUrl} from "./layout";

export default function ResetPassword({
  name = "there",
  resetUrl = `${baseUrl}/auth/reset-password?token=demo`,
  expiresInMinutes = 30,
}: {
  name?: string;
  resetUrl?: string;
  expiresInMinutes?: number;
}) {
  return (
    <Layout preview="Reset your Kalya password — this link expires soon.">
      <Section style={{textAlign: "center", padding: "-28px 0 8px"}}>
        <div
          style={{
            display: "inline-block",
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: brand.color.accentSubtle,
            lineHeight: "48px",
            fontSize: 20,
            marginBottom: 16,
          }}
        >
          🔑
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
          Reset your password
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
          Hi {name}, we received a request to reset the password on your
          Kalya account. Click below to choose a new one.
        </Text>
      </Section>

      <Section style={{textAlign: "center", margin: "24px 0 8px"}}>
        <Button href={resetUrl}>Reset password</Button>
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

      {/* Fallback URL — some clients strip button links or images */}
      <Section
        style={{
          backgroundColor: brand.color.surfaceRaised,
          border: `1px solid ${brand.color.border}`,
          borderRadius: 10,
          padding: "14px 16px",
          margin: "24px 0",
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
          {resetUrl}
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
        If you didn't request this, you can safely ignore this email — your
        password won't change unless you click the link above and set a new
        one. For your protection, we never ask for your password by email.
      </Text>
    </Layout>
  );
}