import * as React from 'react';
import { Section, Text, Row, Column, Img } from 'react-email';

import { EMAIL_ASSETS } from '../constants';

export const Header = () => {
  return (
    <>
      <Section className="bg-brand-accent h-1 leading-1">
        <Text className="m-0 text-[0px] leading-1">&nbsp;</Text>
      </Section>
      <Section className="bg-brand-surface pt-10 px-10 pb-7">
        <Row>
          <Column align="center">
            <Img
              src={EMAIL_ASSETS.logo}
              alt="Kalya — Ready for tomorrow."
              width="200"
              height="120"
              className="block mx-auto h-auto max-w-full"
            />
          </Column>
        </Row>
      </Section>
    </>
  );
};
