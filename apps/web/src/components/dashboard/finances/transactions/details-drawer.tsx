'use client';

import React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/overlays/drawer';
import { Button } from '@/components/ui/forms/button';
import { Badge } from '@/components/ui/data-display/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/data-display/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/data-display/avatar';
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Pencil,
  Split,
  Tag,
  Wallet,
} from 'lucide-react';
import type { UnifiedTransactionItem } from './types';
import { formatCalendarDate, formatDateTime, formatTimeAgo, fromISO } from '@kalya/utils';
import { getCategoryIcon } from '@/components/forms/finances/category';
import { PAYMENT_OPTIONS } from '@/components/forms/finances/transactions/helper';

export interface DetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: UnifiedTransactionItem | null;
  onEdit: (item: UnifiedTransactionItem) => void;
  onSettleSplit?: (item: UnifiedTransactionItem) => void;
}

export function DetailsDrawer({
  open,
  onOpenChange,
  item,
  onEdit,
  onSettleSplit,
}: DetailsDrawerProps) {
  if (!item) return null;

  const IconComponent = item.kind === 'income' ? Wallet : getCategoryIcon(item.category?.icon);
  const categoryColor =
    item.kind === 'income'
      ? '#16A34A'
      : item.category?.color || (item.kind === 'split_bill' ? '#D97706' : '#2563EB');

  const paymentOpt =
    item.kind !== 'income' ? PAYMENT_OPTIONS.find((p) => p.id === item.paymentMethod) : null;
  const paymentLabel = paymentOpt
    ? paymentOpt.label
    : item.kind === 'income'
      ? 'Direct Credit'
      : 'UPI';

  const plainDate = fromISO(item.date);
  const calendarDateFormatted = plainDate ? formatCalendarDate(plainDate) : item.date;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {/* The close (X) button is rendered by DrawerContent itself, so none is added here. */}
      <DrawerContent side="right" size="lg" className="flex flex-col">
        {/* Header (DrawerHeader already reserves right padding for the built-in close button) */}
        <DrawerHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{
                backgroundColor: `${categoryColor}15`,
                color: categoryColor,
              }}
            >
              <IconComponent className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <DrawerTitle>{item.description}</DrawerTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-body text-caption text-text-muted">
                  {item.kind === 'personal_expense'
                    ? 'Personal Expense'
                    : item.kind === 'split_bill'
                      ? 'Split Bill'
                      : 'Income Inflow'}
                </span>
                {item.kind === 'split_bill' && (
                  <Badge
                    variant={item.isSettled ? 'success' : 'warning'}
                    size="sm"
                    className="font-medium"
                  >
                    {item.isSettled ? 'Settled' : 'Pending Dues'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DrawerHeader>

        {/* Body Content */}
        <DrawerBody className="space-y-6 py-5">
          {/* Hero Amount Banner */}
          <div className="rounded-xl border border-border bg-surface-raised p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="font-body text-caption font-medium text-text-muted">
                {item.kind === 'split_bill' ? 'Your Obligation / Share' : 'Total Amount'}
              </span>
              <div className="font-numeric text-heading-md font-bold mt-0.5">
                {item.kind === 'income' ? (
                  <span className="text-success">+₹{item.amount.toLocaleString('en-IN')}</span>
                ) : (
                  <span className="text-text-primary">-₹{item.amount.toLocaleString('en-IN')}</span>
                )}
              </div>
            </div>

            {item.kind === 'split_bill' && (
              <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-border/60 pt-2 sm:pt-0 sm:pl-4">
                <span className="font-body text-caption font-medium text-text-muted block">
                  Gross Bill Total
                </span>
                <span className="font-numeric text-body-lg font-semibold text-text-secondary block">
                  ₹{item.totalBill.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          {/* Common Transaction Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-2.5">
              <Calendar className="h-4 w-4 text-text-muted mt-0.5 shrink-0" />
              <div>
                <span className="font-body text-[11px] font-medium text-text-muted uppercase block">
                  Transaction Date
                </span>
                <span className="font-body text-body-sm font-medium text-text-primary">
                  {calendarDateFormatted}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Tag className="h-4 w-4 text-text-muted mt-0.5 shrink-0" />
              <div>
                <span className="font-body text-[11px] font-medium text-text-muted uppercase block">
                  Category & Bucket
                </span>
                <span className="font-body text-body-sm font-medium text-text-primary">
                  {item.kind !== 'income' ? item.category?.label || 'General' : 'Income Streams'}
                  {item.kind !== 'income' && item.bucket && (
                    <span className="text-text-muted"> ({item.bucket.label})</span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CreditCard className="h-4 w-4 text-text-muted mt-0.5 shrink-0" />
              <div>
                <span className="font-body text-[11px] font-medium text-text-muted uppercase block">
                  Payment Method
                </span>
                <span className="font-body text-body-sm font-medium text-text-primary">
                  {paymentLabel}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-text-muted mt-0.5 shrink-0" />
              <div>
                <span className="font-body text-[11px] font-medium text-text-muted uppercase block">
                  Recorded At
                </span>
                <span className="font-body text-body-sm font-medium text-text-primary">
                  {item.createdAt ? formatDateTime(item.createdAt, 'Asia/Kolkata') : '—'}
                  {item.createdAt && (
                    <span className="text-text-muted text-caption block">
                      ({formatTimeAgo(item.createdAt)})
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Income Details Specific Breakdown */}
          {item.kind === 'income' && (
            <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
              <span className="font-display text-body-sm font-semibold text-text-primary block">
                Income Components
              </span>
              <div className="grid grid-cols-2 gap-3 text-caption">
                <div className="border border-border/60 rounded-lg p-2.5 bg-surface-raised/40">
                  <span className="text-text-muted block">Primary Salary</span>
                  <span className="font-numeric text-body-sm font-semibold text-text-primary">
                    ₹{item.salary.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="border border-border/60 rounded-lg p-2.5 bg-surface-raised/40">
                  <span className="text-text-muted block">Secondary / Other</span>
                  <span className="font-numeric text-body-sm font-semibold text-text-primary">
                    ₹{item.other.toLocaleString('en-IN')}
                  </span>
                </div>
                {item.previousMonthLeft !== 0 && (
                  <div className="border border-border/60 rounded-lg p-2.5 bg-surface-raised/40 col-span-2">
                    <span className="text-text-muted block">Previous Month Rollover</span>
                    <span className="font-numeric text-body-sm font-semibold text-text-primary">
                      ₹{item.previousMonthLeft.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Split Bill Specific Section */}
          {item.kind === 'split_bill' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-display text-body-sm font-semibold text-text-primary flex items-center gap-1.5">
                  <Split className="h-4 w-4 text-primary" />
                  <span>Split Participants Breakdown</span>
                </span>
                <span className="text-caption text-text-muted">
                  Paid by: <strong className="text-text-primary">{item.payerName}</strong>
                </span>
              </div>

              {/* Participants Breakdown Table */}
              <div className="rounded-xl border border-border overflow-hidden bg-surface">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead className="text-right">Share</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* You (Logged in User) row */}
                    <TableRow>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Avatar size="xs">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                            YOU
                          </AvatarFallback>
                        </Avatar>
                        <span>You {item.isUserPayer ? '(Payer)' : ''}</span>
                      </TableCell>
                      <TableCell className="text-right font-numeric font-medium">
                        ₹{item.yourShare.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            item.isUserPayer ? 'success' : item.isSettled ? 'success' : 'warning'
                          }
                          size="sm"
                        >
                          {item.isUserPayer ? 'Covered' : item.isSettled ? 'Settled' : 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>

                    {/* Peer Members */}
                    {item.members.map((member, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <Avatar size="xs">
                            {member.memberImage ? (
                              <AvatarImage src={member.memberImage} alt={member.memberName} />
                            ) : null}
                            <AvatarFallback className="bg-surface-raised text-text-primary text-[10px]">
                              {member.memberName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{member.memberName}</span>
                        </TableCell>
                        <TableCell className="text-right font-numeric font-medium">
                          ₹{member.amount.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={member.settled ? 'success' : 'warning'} size="sm">
                            {member.settled ? 'Settled' : 'Pending'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Settlement History Note */}
              <div className="rounded-lg bg-surface-raised/50 border border-border/60 p-3 text-caption text-text-muted flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <span>
                  {item.isSettled
                    ? 'All participant obligations for this expense have been completely settled.'
                    : item.isUserPayer
                      ? 'Pending amounts will update automatically as friends reimburse you.'
                      : `You owe ${item.payerName} ₹${item.yourShare}. Settle with them to balance accounts.`}
                </span>
              </div>
            </div>
          )}
        </DrawerBody>

        {/* Footer Actions
            `sm:justify-between` overrides DrawerFooter's default `sm:justify-end`,
            so Edit sits left and Settle sits right on desktop. */}
        <DrawerFooter className="border-t border-border sm:justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onEdit(item);
            }}
            className="gap-1.5 cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit Transaction</span>
          </Button>

          {item.kind === 'split_bill' && !item.isSettled && onSettleSplit && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onSettleSplit(item);
              }}
              className="gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Settle Balance</span>
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
