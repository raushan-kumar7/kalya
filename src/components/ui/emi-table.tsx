"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from "./table";
import { formatIndianNumber } from "./numeric-value";
import { Button } from "./button";

export interface EMIPayment {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  outstandingBalance: number;
  date?: string;
}

export interface EMITableProps extends React.HTMLAttributes<HTMLDivElement> {
  payments: EMIPayment[];
  currency?: string;
  showSummary?: boolean;
  initialVisibleRows?: number;
}

const EMITable = React.forwardRef<HTMLDivElement, EMITableProps>(
  (
    {
      className,
      payments,
      currency = "₹",
      showSummary = true,
      initialVisibleRows = 12,
      ...props
    },
    ref
  ) => {
    const [showAll, setShowAll] = React.useState(false);

    if (!payments || payments.length === 0) {
      return (
        <div className="text-center py-6 text-text-muted font-body text-body-sm">
          No amortization data available.
        </div>
      );
    }

    const visiblePayments = showAll
      ? payments
      : payments.slice(0, initialVisibleRows);

    const hasMore = payments.length > initialVisibleRows;

    // Calculate totals for summary/footer
    const totalPrincipal = payments.reduce((sum, p) => sum + p.principal, 0);
    const totalInterest = payments.reduce((sum, p) => sum + p.interest, 0);
    const totalPayment = payments.reduce((sum, p) => sum + p.payment, 0);

    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-left">Month</TableHead>
                {payments[0]?.date && <TableHead className="text-left">Date</TableHead>}
                <TableHead className="text-right">EMI Payment</TableHead>
                <TableHead className="text-right">Principal</TableHead>
                <TableHead className="text-right">Interest</TableHead>
                <TableHead className="text-right">Outstanding Bal.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visiblePayments.map((payment) => (
                <TableRow key={payment.month}>
                  <TableCell className="font-numeric font-medium text-text-primary text-left">
                    {payment.month}
                  </TableCell>
                  {payment.date && (
                    <TableCell className="font-body text-text-secondary text-left">
                      {payment.date}
                    </TableCell>
                  )}
                  <TableCell className="font-numeric text-text-primary text-right font-medium">
                    {formatIndianNumber(payment.payment, { currency })}
                  </TableCell>
                  <TableCell className="font-numeric text-success text-right font-medium">
                    {formatIndianNumber(payment.principal, { currency })}
                  </TableCell>
                  <TableCell className="font-numeric text-danger text-right font-medium">
                    {formatIndianNumber(payment.interest, { currency })}
                  </TableCell>
                  <TableCell className="font-numeric text-text-primary text-right font-semibold bg-surface-raised/30">
                    {formatIndianNumber(payment.outstandingBalance, { currency })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {showSummary && (
              <TableFooter>
                <TableRow className="font-semibold bg-surface-raised">
                  <TableCell className="text-left">Total</TableCell>
                  {payments[0]?.date && <TableCell></TableCell>}
                  <TableCell className="font-numeric text-right text-text-primary font-bold">
                    {formatIndianNumber(totalPayment, { currency })}
                  </TableCell>
                  <TableCell className="font-numeric text-right text-success font-bold">
                    {formatIndianNumber(totalPrincipal, { currency })}
                  </TableCell>
                  <TableCell className="font-numeric text-right text-danger font-bold">
                    {formatIndianNumber(totalInterest, { currency })}
                  </TableCell>
                  <TableCell className="text-right text-text-muted font-normal text-caption">
                    —
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>

        {hasMore && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="cursor-pointer font-body text-xs font-semibold text-primary hover:bg-primary-subtle"
            >
              {showAll ? "Show Less" : `Show All ${payments.length} Months`}
            </Button>
          </div>
        )}
      </div>
    );
  }
);

EMITable.displayName = "EMITable";

export { EMITable };
