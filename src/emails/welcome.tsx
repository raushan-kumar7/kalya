/* eslint-disable react/no-unescaped-entities */
import {Text, Section, Row, Column} from "react-email";
import {Layout, Button, brand, baseUrl} from "./layout";

export default function Welcome({
  name = "there",
}: {
  name?: string;
}) {
  return (
    <Layout preview="You're in. Here's how to get set up on Kalya.">
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
          🌱
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
          You're in, {name}
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
          Your account is verified and your command center is ready. Here's
          how to get the fullest picture, fastest.
        </Text>
      </Section>

      <Section style={{textAlign: "center", margin: "24px 0 32px"}}>
        <Button href={`${baseUrl}/dashboard`}>Go to your dashboard</Button>
      </Section>

      {/* Get started — numbered steps */}
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
        Get set up in three steps
      </Text>

      <StepRow
        number="1"
        title="Add your accounts"
        description="Bank, cash, wallets, and cards — so every transaction lands in one place."
      />
      <StepRow
        number="2"
        title="Log your assets and liabilities"
        description="Gold, equity, EPF, PPF, NPS, loans, and EMIs — see your real net worth."
      />
      <StepRow
        number="3"
        title="Set your first budget"
        description="Pick a category, set a monthly limit, and we'll flag it before you overspend."
        last
      />

      <Section
        style={{
          backgroundColor: brand.color.primarySubtle,
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
          <strong>Tip:</strong> the more you consolidate up front, the
          sooner your net worth trend and insights actually mean something.
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
        Questions along the way? Visit the{" "}
        <a
          href={`${baseUrl}/help`}
          style={{color: brand.color.info, textDecoration: "none"}}
        >
          Help Center
        </a>{" "}
        anytime.
      </Text>
    </Layout>
  );
}

const StepRow = ({
  number,
  title,
  description,
  last = false,
}: {
  number: string;
  title: string;
  description: string;
  last?: boolean;
}) => (
  <Row style={{marginBottom: last ? 0 : 16}}>
    <Column width="36" style={{verticalAlign: "top"}}>
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor: brand.color.primary,
          color: brand.color.onPrimary,
          fontFamily: brand.font.body,
          fontSize: 12,
          fontWeight: 700,
          textAlign: "center",
          lineHeight: "24px",
        }}
      >
        {number}
      </div>
    </Column>
    <Column style={{verticalAlign: "top", paddingLeft: 4}}>
      <Text
        style={{
          margin: "0 0 2px",
          fontFamily: brand.font.body,
          fontSize: 14,
          fontWeight: 600,
          color: brand.color.textPrimary,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          margin: 0,
          fontFamily: brand.font.body,
          fontSize: 13,
          lineHeight: "18px",
          color: brand.color.textSecondary,
        }}
      >
        {description}
      </Text>
    </Column>
  </Row>
);