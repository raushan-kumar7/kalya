import * as React from 'react';
import { Html, Head, Preview, Body, Container, Tailwind, Section } from 'react-email';
import { EMAILS_CONFIG } from '../constants';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  preview: string;
  children: React.ReactNode;
}

export const Layout = ({ preview, children }: LayoutProps) => {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>{preview}</Preview>

      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: EMAILS_CONFIG.color,
              },
              fontFamily: {
                body: EMAILS_CONFIG.font.body,
                display: EMAILS_CONFIG.font.display,
                numeric: EMAILS_CONFIG.font.numeric,
              },
            },
          },
        }}
      >
        <Body className="bg-brand-bg m-0 py-6 font-body text-brand-textPrimary">
          <Container className="bg-brand-surface max-w-140 mx-auto rounded-xl overflow-hidden border border-solid border-brand-border">
            <Header />

            <Section className="px-10 pb-8">{children}</Section>

            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
