import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { StatementPdfDocument } from './statement-pdf-document';
import type { StatementData } from '@/components/dashboard/finances/statement/types';

/**
 * Generates and downloads a vector-grade branded PDF file using @react-pdf/renderer.
 */
export async function exportStatementToPdf(
  statement: StatementData,
  filename?: string
): Promise<void> {
  const docElement = <StatementPdfDocument statement={statement} />;
  const blob = await pdf(docElement).toBlob();

  const defaultFilename = `kalya-statement-${statement.period.startDate}-to-${statement.period.endDate}.pdf`;
  const exportFilename = filename || defaultFilename;

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = exportFilename.endsWith('.pdf') ? exportFilename : `${exportFilename}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

/**
 * Fallback / alternative: Spawns an isolated print frame applying strict A4 print styles.
 */
export function printStatementReport(elementId = 'kalya-statement-document'): void {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    window.print();
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  const headStyles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
    .map((node) => node.outerHTML)
    .join('\n');

  const printDocumentHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Kalya Financial Statement</title>
        ${headStyles}
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 14mm 14mm 14mm;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              background-color: #ffffff !important;
              color: #16241d !important;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .no-print {
              display: none !important;
            }
            .page-break-inside-avoid {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
            }
            th, td {
              border-color: #e4e1da !important;
            }
          }
        </style>
      </head>
      <body>
        <div style="width: 100%; max-width: 800px; margin: 0 auto; background: #ffffff;">
          ${targetElement.outerHTML}
        </div>
      </body>
    </html>
  `;

  doc.open();
  doc.write(printDocumentHtml);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 400);
}
