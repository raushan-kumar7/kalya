"use client";

import React from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowUpRight, Shield, PiggyBank, Scale } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg text-text-primary transition-colors duration-200 selection:bg-primary-subtle selection:text-primary">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Minimalist Logo Leaf/Graph Icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <span className="font-display text-lg font-bold text-bg dark:text-text-primary">K</span>
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-text-primary">kalya</span>
              <span className="ml-1 text-[10px] font-medium text-text-muted">कल्य</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button variant="accent" size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <section className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="font-display text-display-lg font-bold tracking-tight">
              Ready for tomorrow.
            </h1>
            <p className="text-text-secondary mt-1">
              Your financial fitness command center. Consolidate assets, liabilities, and retirement portfolios.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-3 py-1 text-xs font-medium text-success">
              <TrendingUp className="h-3.5 w-3.5" /> Market Open
            </span>
          </div>
        </section>

        {/* Hero Net Worth Widget */}
        <section className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="col-span-2 rounded-xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary font-body text-body-sm font-medium uppercase tracking-wider">
                Consolidated Net Worth
              </span>
              <span className="text-text-muted font-numeric text-caption">As of today, 10:30 AM</span>
            </div>
            <div className="mt-3">
              <div className="font-numeric text-display-xl font-bold tracking-tight text-primary">
                ₹ 48,25,900.00
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-0.5 rounded bg-success-subtle px-1.5 py-0.5 text-xs font-semibold text-success font-numeric">
                  +3.2%
                </span>
                <span className="text-text-secondary font-numeric text-caption">
                  +₹ 1,50,000.00 this month
                </span>
              </div>
            </div>

            {/* Quick Metrics Breakdowns */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6 md:grid-cols-4">
              <div>
                <span className="text-text-muted text-caption block">Assets</span>
                <span className="font-numeric text-body-md font-semibold text-text-primary block mt-0.5">
                  ₹ 58,10,000.00
                </span>
              </div>
              <div>
                <span className="text-text-muted text-caption block">Liabilities</span>
                <span className="font-numeric text-body-md font-semibold text-danger block mt-0.5">
                  ₹ 9,84,100.00
                </span>
              </div>
              <div>
                <span className="text-text-muted text-caption block">Retirement</span>
                <span className="font-numeric text-body-md font-semibold text-text-primary block mt-0.5">
                  ₹ 18,45,000.00
                </span>
              </div>
              <div>
                <span className="text-text-muted text-caption block">Protection (Sum Assured)</span>
                <span className="font-numeric text-body-md font-semibold text-success block mt-0.5">
                  ₹ 2,00,00,000
                </span>
              </div>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-display text-body-lg font-bold text-primary mb-3">
                Financial Fitness Score
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="font-numeric text-display-lg font-bold">84</span>
                <span className="text-text-secondary text-caption font-medium">/ 100</span>
              </div>
              <p className="text-text-secondary text-body-sm mt-3 leading-relaxed">
                Your liquid reserve covers <strong>7.2 months</strong> of average expenses. Debt-to-asset ratio is at a healthy 17%.
              </p>
            </div>
            <div className="mt-6 border-t border-border pt-4">
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span>View Full Insights</span>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Section Grid */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Active Assets */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                <PiggyBank className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-body-md font-bold text-text-primary">Assets</h3>
                <p className="text-text-muted text-caption">Liquid cash, Equities, Gold</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-text-secondary text-body-sm">Equity Portfolio</span>
                <span className="font-numeric text-body-sm font-semibold">₹ 35,40,000.00</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-text-secondary text-body-sm">Gold & Silver</span>
                <span className="font-numeric text-body-sm font-semibold">₹ 14,20,000.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-body-sm">Cash & Bank Savings</span>
                <span className="font-numeric text-body-sm font-semibold">₹ 8,50,000.00</span>
              </div>
            </div>
          </div>

          {/* Liabilities */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-subtle text-danger">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-body-md font-bold text-text-primary">Liabilities</h3>
                <p className="text-text-muted text-caption">Loans & Active EMIs</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-text-secondary text-body-sm">Home Loan (SBI)</span>
                <span className="font-numeric text-body-sm font-semibold text-danger">₹ 8,75,000.00</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-text-secondary text-body-sm">Credit Cards</span>
                <span className="font-numeric text-body-sm font-semibold text-danger">₹ 1,09,100.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-body-sm">Monthly EMI total</span>
                <span className="font-numeric text-body-sm font-semibold text-warning">₹ 42,500.00 / mo</span>
              </div>
            </div>
          </div>

          {/* Retirement & Protection */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle text-accent">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-body-md font-bold text-text-primary">Protection & Future</h3>
                <p className="text-text-muted text-caption">Retirement pots & Policies</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-text-secondary text-body-sm">EPF (Provident Fund)</span>
                <span className="font-numeric text-body-sm font-semibold">₹ 12,15,000.00</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-text-secondary text-body-sm">NPS (Tier 1)</span>
                <span className="font-numeric text-body-sm font-semibold">₹ 6,30,000.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-body-sm">HDFC Term Life</span>
                <span className="font-numeric text-body-sm font-semibold text-success">Active (1.5 Cr)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Button Variants to Showcase Styling Guidelines */}
        <section className="mt-12 rounded-xl border border-dashed border-border p-6 bg-surface-raised">
          <h4 className="font-display text-body-md font-bold text-text-secondary mb-4">
            UI Design System Preview (Button Variants Showcase)
          </h4>
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Default Emerald</Button>
            <Button variant="accent">Satin Gold Accent</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="success">Success State</Button>
            <Button variant="danger">Danger State</Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-border bg-surface py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-text-muted text-caption">
            &copy; 2026 Kalya. Sanskrit word for wellness, ready for tomorrow.
          </p>
        </div>
      </footer>
    </div>
  );
}
