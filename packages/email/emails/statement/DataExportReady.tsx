import * as React from 'react';
import { Text, Section, Heading } from 'react-email';
import { Layout, Callout, DetailRow, FallbackLinkBox, Button } from '../components';
import { EMAILS_CONFIG } from '../constants';

export interface DataExportReadyProps {
  userName?: string;
  exportFormat?: string;
  dateRange?: string;
  fileSizeBytes?: string;
  downloadUrl?: string;
  expiresInHours?: number;
}

export const DataExportReady = ({
  userName = 'Arjun',
  exportFormat = 'Encrypted CSV Archive (ZIP)',
  dateRange = '01 Jan 2026 - 29 Sep 2026',
  fileSizeBytes = '3.4 MB',
  downloadUrl = 'https://kalya.app/download/export_sample_991823.zip',
  expiresInHours = 24,
}: DataExportReadyProps) => {
  return (
    <Layout preview="Your requested financial data export is ready to download">
      <Section className="text-center">
        <Heading className="m-0 font-display text-[22px] font-semibold text-brand-textPrimary mb-2">
          Your Data Export is Ready
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-6 text-brand-textSecondary mb-6">
          Hi {userName}, the data export you requested has finished compiling and is now available
          for secure download.
        </Text>
      </Section>

      <Section className="my-6">
        <DetailRow label="Export Format" value={exportFormat} />
        <DetailRow label="Date Range Covered" value={dateRange} />
        <DetailRow label="Archive File Size" value={fileSizeBytes} />
        <DetailRow label="Link Expiration" value={`${expiresInHours} hours`} last />
      </Section>

      <Callout tone="info">
        This download link contains sensitive financial statements and transaction records. For your
        security, this link is signed and will automatically expire in {expiresInHours} hours.
      </Callout>

      <Section className="text-center my-8">
        <Button href={downloadUrl}>Download Export File</Button>
      </Section>

      <FallbackLinkBox url={downloadUrl} label="Direct download link:" />
    </Layout>
  );
};

export default DataExportReady;
