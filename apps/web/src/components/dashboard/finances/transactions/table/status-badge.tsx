'use client';

import * as React from 'react';
import { Check, Clock, Users, ArrowDownLeft } from 'lucide-react';
import { Badge } from '@/components/ui/data-display/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/data-display/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/overlays/tooltip';
import type { UnifiedTransactionItem } from '../types';
import { PAYMENT_OPTIONS } from '@/components/forms/finances/transactions/helper';
import { formatCardDate } from '@kalya/utils';
import { cn } from '@/libs/utils';

export interface TransactionStatusBadgeProps {
  item: UnifiedTransactionItem;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  showTooltip?: boolean;
}

export function TransactionStatusBadge({
  item,
  className,
  onClick,
  showTooltip = true,
}: TransactionStatusBadgeProps) {
  // ── Split Bill Status Logic ──
  if (item.kind === 'split_bill') {
    if (item.isSettled) {
      const badgeNode = (
        <Badge
          variant="success"
          size="sm"
          leadingIcon={<Check className="h-3 w-3 stroke-[2.5]" />}
          onClick={onClick}
          className={cn(
            'gap-1 font-medium text-[11px] shadow-2xs transition-all cursor-pointer hover:bg-success-subtle/80 hover:border-success/50',
            className
          )}
        >
          Settled
        </Badge>
      );

      if (!showTooltip) return badgeNode;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{badgeNode}</TooltipTrigger>
            <TooltipContent side="top" align="start" className="text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-on-primary flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-success" />
                  Fully Settled
                </span>
                <span className="text-[11px] text-on-primary/80">
                  Total ₹{item.totalBill.toLocaleString('en-IN')} across {item.participantsCount}{' '}
                  participants
                </span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Unsettled Split Bill
    if (item.isUserPayer) {
      // User is the payer; friends owe the user
      const unsettledMembers = item.members.filter((m) => !m.settled);
      const isSingleFriend = unsettledMembers.length === 1;
      const singleFriend = isSingleFriend ? unsettledMembers[0] : null;

      const badgeNode = (
        <Badge
          variant="outline"
          size="sm"
          onClick={onClick}
          className={cn(
            'gap-1.5 font-medium text-[11px] transition-all cursor-pointer shadow-2xs py-0.5 px-2 select-none',
            'bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/30 hover:bg-amber-500/15 hover:border-amber-500/50',
            className
          )}
        >
          {singleFriend ? (
            <>
              {singleFriend.memberImage ? (
                <Avatar size="xs" className="h-3.5 w-3.5 ring-1 ring-amber-500/30 shrink-0">
                  <AvatarImage src={singleFriend.memberImage} alt={singleFriend.memberName} />
                  <AvatarFallback className="bg-amber-500/25 text-amber-900 dark:text-amber-100 text-[8px] font-bold">
                    {singleFriend.memberName.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
              )}
              <span className="truncate max-w-44">
                {singleFriend.memberName} owes ₹{singleFriend.amount.toLocaleString('en-IN')}
              </span>
            </>
          ) : (
            <>
              {unsettledMembers.some((m) => m.memberImage) ? (
                <span className="flex -space-x-1 items-center shrink-0">
                  {unsettledMembers.slice(0, 2).map((m, idx) => (
                    <Avatar
                      key={idx}
                      size="xs"
                      className="h-3.5 w-3.5 ring-1 ring-surface shrink-0"
                    >
                      {m.memberImage ? (
                        <AvatarImage src={m.memberImage} alt={m.memberName} />
                      ) : null}
                      <AvatarFallback className="bg-amber-500/25 text-amber-900 dark:text-amber-100 text-[7px] font-bold">
                        {m.memberName.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </span>
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
              )}
              <span className="truncate max-w-44">
                {item.pendingDuesNarration || `${unsettledMembers.length} friends owe dues`}
              </span>
            </>
          )}
        </Badge>
      );

      if (!showTooltip) return badgeNode;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{badgeNode}</TooltipTrigger>
            <TooltipContent side="top" align="start" className="text-xs">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-on-primary flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-accent" />
                  Pending Receivables (₹{item.friendsOweUserAmount.toLocaleString('en-IN')})
                </span>
                <div className="space-y-0.5 text-[11px] text-on-primary/85 border-t border-white/10 pt-1">
                  {unsettledMembers.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3">
                      <span>{m.memberName}</span>
                      <span className="font-numeric font-medium">
                        ₹{m.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-on-primary/60 italic pt-0.5">
                  Click to view details & record settlement
                </span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Friend paid; user owes the payer
    const badgeNode = (
      <Badge
        variant="warning"
        size="sm"
        dot
        dotColor="warning"
        onClick={onClick}
        className={cn(
          'gap-1.5 font-medium text-[11px] transition-all cursor-pointer shadow-2xs py-0.5 px-2 select-none hover:bg-warning-subtle/80 hover:border-warning/50',
          className
        )}
      >
        <span className="truncate max-w-44">
          {item.pendingDuesNarration || `You owe ₹${item.yourShare.toLocaleString('en-IN')}`}
        </span>
      </Badge>
    );

    if (!showTooltip) return badgeNode;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badgeNode}</TooltipTrigger>
          <TooltipContent side="top" align="start" className="text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-on-primary flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-warning" />
                Pending Debt
              </span>
              <span className="text-[11px] text-on-primary/80">
                Paid by {item.payerName}. You owe ₹{item.yourShare.toLocaleString('en-IN')}.
              </span>
              <span className="text-[10px] text-on-primary/60 italic pt-0.5">
                Click to settle with {item.payerName}
              </span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // ── Personal Expense Status ──
  if (item.kind === 'personal_expense') {
    const paymentOpt = PAYMENT_OPTIONS.find((p) => p.id === item.paymentMethod);
    const paymentLabel = paymentOpt ? paymentOpt.label : 'Direct';

    const badgeNode = (
      <Badge
        variant="secondary"
        size="sm"
        onClick={onClick}
        className={cn(
          'font-normal text-[11px] text-text-muted border-border/60 bg-surface-raised/50 gap-1.5 select-none py-0.5 px-2 cursor-pointer hover:bg-surface-raised transition-colors',
          className
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-text-muted/40 shrink-0" />
        <span>Direct Paid</span>
      </Badge>
    );

    if (!showTooltip) return badgeNode;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badgeNode}</TooltipTrigger>
          <TooltipContent side="top" align="start" className="text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-on-primary">Personal Expense</span>
              <span className="text-[11px] text-on-primary/80">
                Paid in full via {paymentLabel}
              </span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // ── Income Status ──
  if (item.kind === 'income') {
    const badgeNode = (
      <Badge
        variant="success"
        size="sm"
        dot
        dotColor="success"
        onClick={onClick}
        className={cn(
          'font-medium text-[11px] select-none shadow-2xs py-0.5 px-2 gap-1.5 cursor-pointer hover:bg-success-subtle/80 transition-colors',
          className
        )}
      >
        <span>Received</span>
      </Badge>
    );

    if (!showTooltip) return badgeNode;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badgeNode}</TooltipTrigger>
          <TooltipContent side="top" align="start" className="text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-on-primary flex items-center gap-1.5">
                <ArrowDownLeft className="h-3.5 w-3.5 text-success" />
                Income Credited
              </span>
              <span className="text-[11px] text-on-primary/80">
                +₹{item.totalIncome.toLocaleString('en-IN')} received on{' '}
                {formatCardDate(item.creditDate || item.date)}
              </span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <span className="text-text-muted px-2 select-none">—</span>;
}
