/* eslint-disable react/no-unescaped-entities */
import {Text, Section, Row, Column, Button as EmailButton} from "react-email";
import {Layout, brand, baseUrl} from "./layout";

export default function DeleteAccount({
  name = "there",
  deleteUrl,
}: {
  name?: string;
  deleteUrl: string;
}) {
  return (
    <Layout preview="Confirm you want to permanently delete your Kalya account.">
      <Section style={{textAlign: "center", padding: "8px 0 8px"}}>
        <div
          style={{
            display: "inline-block",
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: brand.color.dangerSubtle,
            lineHeight: "48px",
            fontSize: 20,
            marginBottom: 16,
          }}
        >
          🗝️
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
          Confirm account deletion
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
          Hi {name}, we received a request to permanently delete your Kalya
          account. Confirm below to proceed.
        </Text>
      </Section>

      <Section style={{textAlign: "center", margin: "24px 0 8px"}}>
        <EmailButton
          href={deleteUrl}
          style={{
            display: "inline-block",
            backgroundColor: brand.color.danger,
            color: brand.color.onDanger,
            fontFamily: brand.font.body,
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
            padding: "12px 28px",
            borderRadius: 8,
          }}
        >
          Delete my account
        </EmailButton>
      </Section>

      <Text
        style={{
          margin: "0 0 28px",
          fontFamily: brand.font.body,
          fontSize: 12,
          lineHeight: "18px",
          color: brand.color.textMuted,
          textAlign: "center",
        }}
      >
        This link expires in 1 hour and can only be used once.
      </Text>

      {/* What gets erased — plainly stated, no soft-pedaling */}
      <Text
        style={{
          margin: "0 0 14px",
          fontFamily: brand.font.body,
          fontSize: 12,
          fontWeight: 600,
          color: brand.color.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        This will permanently erase
      </Text>

      <EraseRow text="Every linked account, card, and wallet" />
      <EraseRow text="Your full transaction and budget history" />
      <EraseRow text="Logged assets, liabilities, and net worth trend" last />

      <Section
        style={{
          backgroundColor: brand.color.dangerSubtle,
          borderRadius: 10,
          padding: "16px 20px",
          margin: "28px 0 8px",
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
          <strong>This can't be undone.</strong> Once confirmed, your data is
          erased immediately and can't be recovered — there's no grace period
          or restore option.
        </Text>
      </Section>

      <Text
        style={{
          margin: "24px 0 0",
          fontFamily: brand.font.body,
          fontSize: 12,
          lineHeight: "18px",
          color: brand.color.textMuted,
          textAlign: "center",
        }}
      >
        Didn't request this? Ignore this email and your account stays exactly
        as it is. If you're concerned someone else has access, visit the{" "}
        <a
          href={`${baseUrl}/help`}
          style={{color: brand.color.info, textDecoration: "none"}}
        >
          Help Center
        </a>{" "}
        right away.
      </Text>
    </Layout>
  );
}

const EraseRow = ({text, last = false}: {text: string; last?: boolean}) => (
  <Row style={{marginBottom: last ? 0 : 10}}>
    <Column width="20" style={{verticalAlign: "top"}}>
      <Text
        style={{
          margin: 0,
          fontFamily: brand.font.body,
          fontSize: 13,
          lineHeight: "19px",
          color: brand.color.danger,
        }}
      >
        ✕
      </Text>
    </Column>
    <Column style={{verticalAlign: "top"}}>
      <Text
        style={{
          margin: 0,
          fontFamily: brand.font.body,
          fontSize: 13,
          lineHeight: "19px",
          color: brand.color.textSecondary,
        }}
      >
        {text}
      </Text>
    </Column>
  </Row>
);