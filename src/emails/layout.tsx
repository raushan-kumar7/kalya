import {ReactNode} from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Link,
  Hr,
  Button as EmailButton,
} from "react-email";

const logo =
  "https://res.cloudinary.com/cloud-alpha/image/upload/v1784056067/kalya/kalya_logo_yxp1fz.png";
const icon =
  "https://res.cloudinary.com/cloud-alpha/image/upload/v1784056074/kalya/kalya_icon_n6webd.png";

export const baseUrl = "http://localhost:3000";

export const brand = {
  font: {
    display: "'Outfit', 'Inter', ui-sans-serif, system-ui, sans-serif",
    body: "'Inter', ui-sans-serif, system-ui, sans-serif",
    numeric: "'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace",
  },
  color: {
    primary: "#0D3E26", // Deep Emerald
    primaryHover: "#0A3019",
    primarySubtle: "#E4EEE8",

    accent: "#B8912E", // Satin Gold
    accentSubtle: "#F6EDD4",

    bg: "#F9F8F6", // Alabaster
    surface: "#FFFFFF",
    surfaceRaised: "#FCFBFA",
    border: "#E4E1DA",

    textPrimary: "#16241D",
    textSecondary: "#4E5D6C",
    textMuted: "#8A9098",

    success: "#1E7A4C",
    warning: "#C9862B",
    danger: "#B3432D",
    info: "#3E6B8A",

    successSubtle: "#E5F2EA",
    warningSubtle: "#FBEEDC",
    dangerSubtle: "#F7E5E0",
    infoSubtle: "#E6EEF2",

    onPrimary: "#FFFFFF",
    onAccent: "#16241D",
    onSuccess: "#FFFFFF",
    onDanger: "#FFFFFF",
  },
} as const;

export const Header = () => {
  return (
    <>
      {/* Top accent bar — Satin Gold, ~4px */}
      <Section style={{backgroundColor: brand.color.accent, height: 4, lineHeight: "4px"}}>
        <Text style={{margin: 0, fontSize: 0, lineHeight: "4px"}}>&nbsp;</Text>
      </Section>

      <Section
        style={{backgroundColor: brand.color.surface, padding: "40px 40px 28px"}}
      >
        <Row>
          {/* Column align="center" renders a centered table cell — this
              centers reliably in Outlook, unlike margin:auto on the <img>. */}
          <Column align="center">
            <Img
              src={logo}
              alt="Kalya — Ready for tomorrow."
              width="200"
              height="120"
              style={{display: "block", margin: "0 auto", height: "auto", maxWidth: "100%"}}
            />
          </Column>
        </Row>
      </Section>
    </>
  );
};

export const Footer = () => {
  return (
    <Section
      style={{
        backgroundColor: brand.color.bg,
        borderTop: `1px solid ${brand.color.border}`,
        padding: "32px 40px 40px",
      }}
    >
      <Row>
        <Column align="center">
          <Img
            src={icon}
            alt=""
            width="30"
            height="30"
            style={{display: "block", margin: "0 auto 12px"}}
          />

          <Text
            style={{
              margin: "0 0 2px",
              fontFamily: brand.font.body,
              fontSize: 13,
              color: brand.color.textSecondary,
            }}
          >
            कल्य — ready for tomorrow; in sound condition.
          </Text>
          <Text
            style={{
              margin: "0 0 20px",
              fontFamily: brand.font.body,
              fontSize: 13,
              color: brand.color.textSecondary,
            }}
          >
            Consolidate your wealth. Secure your tomorrow.
          </Text>

          <Row>
            <Column align="center">
              <Link
                href={`${baseUrl}/dashboard`}
                style={footerLink}
              >
                Dashboard
              </Link>
              <span style={{color: brand.color.border}}> &nbsp;|&nbsp; </span>
              <Link href={`${baseUrl}/help`} style={footerLink}>
                Help Center
              </Link>
              <span style={{color: brand.color.border}}> &nbsp;|&nbsp; </span>
              <Link href={`${baseUrl}/privacy`} style={footerLink}>
                Privacy Policy
              </Link>
              <span style={{color: brand.color.border}}> &nbsp;|&nbsp; </span>
              <Link href={`${baseUrl}/terms`} style={footerLink}>
                Terms of Service
              </Link>
            </Column>
          </Row>

          <Hr style={{borderColor: brand.color.border, margin: "20px 0"}} />

          <Text style={{...footerFine, marginTop: 12}}>
            Kalya Technologies Private Limited, [City, State, India]
          </Text>
        </Column>
      </Row>
    </Section>
  );
};

const footerLink = {
  fontFamily: brand.font.body,
  fontSize: 12,
  color: brand.color.textMuted,
  textDecoration: "none",
};

const footerFine = {
  margin: "0 0 6px",
  fontFamily: brand.font.body,
  fontSize: 11,
  lineHeight: "16px",
  color: brand.color.textMuted,
};

export const Button = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => {
  return (
    <EmailButton
      href={href}
      style={{
        display: "inline-block",
        backgroundColor: brand.color.primary,
        color: brand.color.onPrimary,
        fontFamily: brand.font.body,
        fontSize: 15,
        fontWeight: 600,
        textDecoration: "none",
        padding: "12px 28px",
        borderRadius: 8,
      }}
    >
      {children}
    </EmailButton>
  );
};

export const Layout = ({
  preview,
  children,
}: {
  preview: string;
  children: ReactNode;
}) => {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>{preview}</Preview>

      {/* Hidden preheader spacer — pads out client auto-preview text */}
      <div
        style={{
          display: "none",
          overflow: "hidden",
          lineHeight: 1,
          maxHeight: 0,
          maxWidth: 0,
          opacity: 0,
        }}
      >
        {preview}
        {"\u00A0\u200C".repeat(80)}
      </div>

      <Body
        style={{
          backgroundColor: brand.color.bg,
          margin: 0,
          padding: "24px 0",
          fontFamily: brand.font.body,
        }}
      >
        <Container
          style={{
            backgroundColor: brand.color.surface,
            maxWidth: 560,
            margin: "0 auto",
            borderRadius: 12,
            overflow: "hidden",
            border: `1px solid ${brand.color.border}`,
          }}
        >
          <Header />

          <Section style={{padding: "0 40px 32px"}}>{children}</Section>

          <Footer />
        </Container>
      </Body>
    </Html>
  );
};