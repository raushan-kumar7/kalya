'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Calendar, User as UserIcon } from 'lucide-react';
import type { StatementData } from './types';

interface StatementHeaderProps {
  statement: StatementData;
}

export function StatementHeader({ statement }: StatementHeaderProps) {
  return (
    <div className="border-b border-border pb-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left: Kalya Brand Lockup */}
        <div className="flex items-start gap-3.5">
          <div className="relative h-12 w-12 shrink-0 rounded-xl bg-primary-subtle border border-primary/20 p-2 flex items-center justify-center overflow-hidden shadow-xs">
            <Image
              src="https://res.cloudinary.com/cloud-alpha/image/upload/v1784056074/kalya/kalya_icon_n6webd.png"
              alt="Kalya"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-text-display-md font-bold tracking-tight text-text-primary">
                KALYA
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-primary-subtle px-2 py-0.5 text-[11px] font-semibold text-primary border border-primary/20">
                <ShieldCheck className="h-3 w-3" />
                VERIFIED
              </span>
            </div>
            <p className="eyebrow text-accent-strong text-[11px] font-medium mt-0.5">
              READY FOR TOMORROW.
            </p>
            <p className="text-caption text-text-muted mt-1 font-body">
              Personal Financial Statement &amp; Expense Summary
            </p>
          </div>
        </div>

        {/* Right: User Profile & Reference Info */}
        <div className="flex flex-col sm:items-end text-left sm:text-right font-body">
          <div className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-text-primary">
            <UserIcon className="h-3.5 w-3.5 text-text-muted" />
            <span>{statement.user.name}</span>
          </div>
          <div className="text-caption text-text-secondary mt-0.5">{statement.user.email}</div>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-2.5 py-1 text-caption font-medium text-text-primary">
            <Calendar className="h-3 w-3 text-primary" />
            <span>
              Period: <strong className="font-semibold">{statement.period.label}</strong>
            </span>
          </div>
          <div className="text-[11px] font-numeric text-text-muted mt-1">
            Statement ID: {statement.meta.statementId}
          </div>
        </div>
      </div>
    </div>
  );
}
