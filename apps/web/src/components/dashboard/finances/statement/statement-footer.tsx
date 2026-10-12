'use client';

import React from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { StatementData } from './types';

interface StatementFooterProps {
  statement: StatementData;
}

export function StatementFooter({ statement }: StatementFooterProps) {
  const formattedDate = new Date(statement.meta.generatedAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="border-t border-border pt-5 mt-8 page-break-inside-avoid font-body">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-caption text-text-muted">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
          <span>
            Verified record generated on <strong>{formattedDate}</strong>
          </span>
        </div>
        <div className="font-numeric text-[11px]">
          Statement ID:{' '}
          <span className="font-semibold text-text-secondary">{statement.meta.statementId}</span>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-border/80 bg-surface-raised p-3 text-[11px] text-text-secondary leading-relaxed flex items-start gap-2.5">
        <ShieldAlert className="h-4 w-4 text-accent-strong shrink-0 mt-0.5" />
        <div>
          <strong>Personal Financial Record:</strong> This statement is compiled directly from your
          verified Kalya records to help you monitor spending, budget effectively, and grow your
          savings. All figures are in Indian Rupees (₹). &copy; {new Date().getFullYear()} Kalya.
          All rights reserved.
        </div>
      </div>
    </div>
  );
}
