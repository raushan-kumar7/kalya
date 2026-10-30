// import * as React from 'react';
// import { Section, Row, Column, Text } from 'react-email';

// const LETTER_SPACING = 10;
// const BOX_WIDTH = 320;

// export interface OtpCodeProps {
//   code: string;
//   label?: string;
//   expiresInMinutes?: number;
//   footnote?: string;
// }

// export const OtpCode = ({
//   code,
//   label = 'Enter this verification code:',
//   expiresInMinutes,
//   footnote = 'Never share this code with anyone.',
// }: OtpCodeProps) => (
//   <Section className="my-6 text-center">
//     <Text className="m-0 mb-2 font-body text-[13px] font-medium text-brand-textSecondary">
//       {label}
//     </Text>

//     <Section
//       width={BOX_WIDTH}
//       style={{ width: `${BOX_WIDTH}px`, maxWidth: '100%', margin: '0 auto' }}
//       className="bg-brand-successSubtle border border-solid border-brand-border rounded-lg"
//     >
//       <Row>
//         <Column
//           align="center"
//           // extra left padding offsets the trailing letter-spacing so the digits look centered
//           style={{ padding: `14px 16px 14px ${16 + LETTER_SPACING}px` }}
//         >
//           <Text
//             className="m-0 font-numeric text-[32px] font-bold leading-none text-brand-primary"
//             style={{ letterSpacing: `${LETTER_SPACING}px` }}
//           >
//             {code}
//           </Text>
//         </Column>
//       </Row>
//     </Section>

//     <Text className="m-0 mt-2 font-body text-[12px] text-brand-textMuted">
//       {expiresInMinutes ? `This code expires in ${expiresInMinutes} minutes. ` : ''}
//       {footnote}
//     </Text>
//   </Section>
// );

import * as React from 'react';
import { Section, Row, Column, Text } from 'react-email';

const LETTER_SPACING = 10;
const BOX_WIDTH = 320;
const PADDING_X = 16;

type OtpTone = 'primary' | 'neutral' | 'warning';

const TONE_CLASSES: Record<OtpTone, { box: string; text: string }> = {
  primary: {
    box: 'bg-brand-successSubtle border-brand-border',
    text: 'text-brand-primary',
  },
  neutral: {
    box: 'bg-brand-surfaceRaised border-brand-border',
    text: 'text-brand-textPrimary',
  },
  warning: {
    box: 'bg-brand-warningSubtle border-brand-border',
    text: 'text-brand-textPrimary',
  },
};

export interface OtpCodeProps {
  /** The one-time code exactly as the user must type it. */
  code: string;
  /** Short instruction shown above the code. */
  label?: string;
  /** Validity window. Shown as "Expires in N minutes". */
  expiresInMinutes?: number;
  /** Security reminder shown under the code. */
  footnote?: string;
  /** Visual emphasis. Use `warning` for security-sensitive flows like password reset. */
  tone?: OtpTone;
  /** Show a small "select to copy" hint under the code. */
  showCopyHint?: boolean;
}

/** Scales the font down for longer codes so they never wrap on narrow phones. */
const getFontSize = (length: number) => (length <= 6 ? 36 : length <= 8 ? 30 : 24);

/** Spoken form for screen readers: "4 8 2 9 1 0" instead of "four hundred eighty-two thousand...". */
const toSpokenCode = (code: string) => code.split('').join(' ');

export const OtpCode = ({
  code,
  label = 'Enter this verification code:',
  expiresInMinutes,
  footnote = 'Never share this code with anyone. Kalya will never ask you for it.',
  tone = 'primary',
  showCopyHint = true,
}: OtpCodeProps) => {
  const value = code?.trim();
  if (!value) return null;

  const { box, text } = TONE_CLASSES[tone];
  const fontSize = getFontSize(value.length);

  return (
    <Section className="my-6 text-center">
      <Text className="m-0 mb-3 font-body text-[13px] font-medium leading-5 text-brand-textSecondary">
        {label}
      </Text>

      <Section
        width={BOX_WIDTH}
        style={{ width: `${BOX_WIDTH}px`, maxWidth: '100%', margin: '0 auto' }}
        className={`rounded-xl border border-solid ${box}`}
      >
        <Row>
          <Column
            align="center"
            // Left padding includes LETTER_SPACING to offset the trailing space after the
            // last digit, so the code looks optically centered.
            style={{
              padding: `18px ${PADDING_X}px 18px ${PADDING_X + LETTER_SPACING}px`,
            }}
          >
            <Text
              aria-label={`Verification code: ${toSpokenCode(value)}`}
              className={`m-0 font-numeric font-bold leading-none ${text}`}
              style={{
                fontSize: `${fontSize}px`,
                letterSpacing: `${LETTER_SPACING}px`,
                // One tap/click selects the whole code in clients that support it.
                WebkitUserSelect: 'all',
                userSelect: 'all',
              }}
            >
              {value}
            </Text>
          </Column>
        </Row>
      </Section>

      {showCopyHint && (
        <Text className="m-0 mt-2 font-body text-[11px] leading-4 text-brand-textMuted">
          Tap and hold, or double-click, the code to copy it.
        </Text>
      )}

      {expiresInMinutes ? (
        <Text className="m-0 mt-4 font-body text-[13px] font-semibold leading-5 text-brand-textPrimary">
          Expires in {expiresInMinutes} {expiresInMinutes === 1 ? 'minute' : 'minutes'}
        </Text>
      ) : null}

      <Text className="m-0 mt-1 mx-auto max-w-85 font-body text-[12px] leading-4.5 text-brand-textMuted">
        {footnote}
      </Text>
    </Section>
  );
};
