'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Coins,
  Shield,
  Lock,
  ArrowRight,
  HelpCircle,
  FileText,
  Mail,
  ChevronsUpDown,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui';

import { TERMS_SECTIONS } from './constants';

const ALL_SECTION_IDS = TERMS_SECTIONS.map((s) => s.id);

export function TermsAccordion() {
  const [expandedItems, setExpandedItems] = React.useState<string[]>(ALL_SECTION_IDS);

  const isAllExpanded = expandedItems.length === ALL_SECTION_IDS.length;

  const toggleAll = () => {
    setExpandedItems(isAllExpanded ? [] : ALL_SECTION_IDS);
  };

  const handleSectionClick = (id: string) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Sticky Sidebar Navigation (Desktop) - Highlights open accordion items */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-6">
            <Card className="border-border bg-surface shadow-card max-h-[calc(100vh-8rem)] overflow-y-auto">
              <CardHeader className="p-4 pb-2 border-b border-border/70 sticky top-0 bg-surface z-10 flex flex-row items-center justify-between">
                <span className="text-caption font-bold text-text-muted uppercase tracking-wider">
                  Terms Index
                </span>
                <span className="text-[11px] font-numeric text-text-muted">
                  {expandedItems.length}/{TERMS_SECTIONS.length} open
                </span>
              </CardHeader>
              <CardContent className="p-2.5">
                <nav className="space-y-1">
                  {TERMS_SECTIONS.map((sec) => {
                    const isExpanded = expandedItems.includes(sec.id);
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => handleSectionClick(sec.id)}
                        className={cn(
                          'flex w-full items-center justify-between px-3 py-2 rounded-lg text-caption transition-all text-left cursor-pointer group',
                          isExpanded
                            ? 'bg-primary-subtle text-primary font-semibold border border-primary/25 shadow-2xs'
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised/80 font-medium'
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={cn(
                              'font-numeric text-[11px] shrink-0 transition-colors',
                              isExpanded
                                ? 'text-primary font-bold'
                                : 'text-text-muted group-hover:text-text-secondary'
                            )}
                          >
                            {sec.number}
                          </span>
                          <span className="truncate">{sec.title}</span>
                        </div>
                        {isExpanded && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 ml-2 animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>

            {/* Quick Help Card (Remote team - email only, no office address) */}
            <Card className="border-border bg-surface-raised/50">
              <CardContent className="p-4.5 space-y-2">
                <div className="flex items-center gap-2 text-text-primary font-semibold text-caption">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  <span>Questions about terms?</span>
                </div>
                <p className="text-caption text-text-secondary leading-relaxed">
                  We are a remote team. Reach our team at{' '}
                  <a
                    href="mailto:support@kalya.app"
                    className="text-primary hover:underline font-semibold"
                  >
                    support@kalya.app
                  </a>{' '}
                  or through our Contact page.
                </p>
              </CardContent>
            </Card>
          </aside>

          {/* Main Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* The short version (box at the top) */}
            <Card className="border-primary/30 bg-primary-subtle/20 shadow-card">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary shadow-xs">
                    <Scale className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-xl font-bold text-text-primary">
                      The short version
                    </CardTitle>
                    <CardDescription className="text-caption text-text-secondary">
                      Plain-language summary of your agreement with Kalya
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                <ul className="space-y-2.5 text-body-sm text-text-primary">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                    <span>
                      Kalya is a free tool to track money, plan budgets, split bills and follow your
                      wealth.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                    <span>
                      Kalya does not hold or move your money, and it does not give financial advice.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                    <span>You own your data, and you can export or delete it.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                    <span>Be honest and respectful when you split bills with friends.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Accordion Controls Bar */}
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold text-text-primary">
                  Terms Sections
                </span>
                <Badge variant="subtle" size="sm" className="font-numeric">
                  18 Sections
                </Badge>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleAll}
                leadingIcon={<ChevronsUpDown className="h-3.5 w-3.5" />}
                className="text-caption"
              >
                {isAllExpanded ? 'Collapse all' : 'Expand all'}
              </Button>
            </div>

            {/* Main Accordion Component */}
            <Accordion
              type="multiple"
              value={expandedItems}
              onValueChange={(val) => setExpandedItems(Array.isArray(val) ? val : [val])}
              className="divide-y divide-border border-border rounded-2xl bg-surface shadow-card overflow-hidden"
            >
              {/* Section 1: Agreeing to these terms */}
              <AccordionItem
                value="section-1"
                id="section-1"
                className={cn(
                  'transition-colors scroll-mt-24',
                  expandedItems.includes('section-1') && 'bg-primary-subtle/5'
                )}
              >
                <AccordionTrigger className="hover:bg-surface-raised/60 px-5 py-4.5">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={expandedItems.includes('section-1') ? 'default' : 'subtle'}
                      size="sm"
                      className="font-numeric text-[11px]"
                    >
                      01
                    </Badge>
                    <span
                      className={cn(
                        'font-display text-body-md font-bold transition-colors',
                        expandedItems.includes('section-1') ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      Agreeing to these terms
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2">
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    These terms are an agreement between you and{' '}
                    <strong className="text-text-primary">Kalya Technologies</strong>{' '}
                    (&ldquo;Kalya&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). We operate as a
                    remote-first team. You must be{' '}
                    <strong className="text-text-primary font-numeric">18</strong> or older to use
                    Kalya. If you do not agree, please do not use it.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Section 2: What Kalya is, and what it is not */}
              <AccordionItem
                value="section-2"
                id="section-2"
                className={cn(
                  'transition-colors scroll-mt-24',
                  expandedItems.includes('section-2') && 'bg-primary-subtle/5'
                )}
              >
                <AccordionTrigger className="hover:bg-surface-raised/60 px-5 py-4.5">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={expandedItems.includes('section-2') ? 'default' : 'subtle'}
                      size="sm"
                      className="font-numeric text-[11px]"
                    >
                      02
                    </Badge>
                    <span
                      className={cn(
                        'font-display text-body-md font-bold transition-colors',
                        expandedItems.includes('section-2') ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      What Kalya is, and what it is not
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-2">
                  <ul className="space-y-1.5 text-body-sm text-text-secondary leading-relaxed list-disc pl-5">
                    <li>
                      Kalya is a tool for recording your money, budgeting, splitting bills with
                      friends, setting goals and tracking assets such as gold, silver, shares and
                      mutual funds.
                    </li>
                    <li>
                      <strong className="text-text-primary">
                        Kalya is not a bank, a payment service, a broker or an adviser.
                      </strong>{' '}
                      We do not hold, send or receive your money.
                    </li>
                    <li>
                      When you settle a split, the payment happens outside Kalya, for example in
                      your UPI app. Kalya only records it.
                    </li>
                    <li>
                      What you see depends on what you enter. Values, totals, GST amounts and
                      projections are for your guidance, and you should check them against your own
                      records.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Section 3: Your account */}
              <AccordionItem
                value="section-3"
                id="section-3"
                className={cn(
                  'transition-colors scroll-mt-24',
                  expandedItems.includes('section-3') && 'bg-primary-subtle/5'
                )}
              >
                <AccordionTrigger className="hover:bg-surface-raised/60 px-5 py-4.5">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={expandedItems.includes('section-3') ? 'default' : 'subtle'}
                      size="sm"
                      className="font-numeric text-[11px]"
                    >
                      03
                    </Badge>
                    <span
                      className={cn(
                        'font-display text-body-md font-bold transition-colors',
                        expandedItems.includes('section-3') ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      Your account
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-2">
                  <ul className="space-y-1.5 text-body-sm text-text-secondary leading-relaxed list-disc pl-5">
                    <li>Give us accurate details, and keep them up to date.</li>
                    <li>
                      Keep your password safe. You are responsible for what happens in your account.
                    </li>
                    <li>
                      Tell us at once at{' '}
                      <a
                        href="mailto:support@kalya.app"
                        className="font-semibold text-primary hover:underline"
                      >
                        support@kalya.app
                      </a>{' '}
                      if you think someone else has used your account.
                    </li>
                    <li>One account is for one person.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Section 4: Your data */}
              <AccordionItem
                value="section-4"
                id="section-4"
                className={cn(
                  'transition-colors scroll-mt-24',
                  expandedItems.includes('section-4') && 'bg-primary-subtle/5'
                )}
              >
                <AccordionTrigger className="hover:bg-surface-raised/60 px-5 py-4.5">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={expandedItems.includes('section-4') ? 'default' : 'subtle'}
                      size="sm"
                      className="font-numeric text-[11px]"
                    >
                      04
                    </Badge>
                    <span
                      className={cn(
                        'font-display text-body-md font-bold transition-colors',
                        expandedItems.includes('section-4') ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      Your data
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-2">
                  <ul className="space-y-1.5 text-body-sm text-text-secondary leading-relaxed list-disc pl-5">
                    <li>You own the money entries and other content you add to Kalya.</li>
                    <li>
                      You give us permission to store and process them only to run Kalya for you, as
                      set out in our{' '}
                      <Link href="/privacy" className="font-semibold text-primary hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </li>
                    <li>You can export your data or delete your account at any time.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Section 5: Splitting bills with friends */}
              <AccordionItem
                value="section-5"
                id="section-5"
                className={cn(
                  'transition-colors scroll-mt-24',
                  expandedItems.includes('section-5') && 'bg-primary-subtle/5'
                )}
              >
                <AccordionTrigger className="hover:bg-surface-raised/60 px-5 py-4.5">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={expandedItems.includes('section-5') ? 'default' : 'subtle'}
                      size="sm"
                      className="font-numeric text-[11px]"
                    >
                      05
                    </Badge>
                    <span
                      className={cn(
                        'font-display text-body-md font-bold transition-colors',
                        expandedItems.includes('section-5') ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      Splitting bills with friends
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-2">
                  <ul className="space-y-1.5 text-body-sm text-text-secondary leading-relaxed list-disc pl-5">
                    <li>Only add people you know, and who are fine with being added.</li>
                    <li>
                      When you split an expense, the friend you invite can see the details of that
                      split.
                    </li>
                    <li>You are responsible for the accuracy of the splits you create.</li>
                    <li>
                      Kalya is not responsible for disagreements between friends or for amounts that
                      are not paid. A settlement recorded in Kalya is a record, not proof of
                      payment.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Section 6: Using Kalya properly */}
              <AccordionItem
                value="section-6"
                id="section-6"
                className={cn(
                  'transition-colors scroll-mt-24',
                  expandedItems.includes('section-6') && 'bg-primary-subtle/5'
                )}
              >
                <AccordionTrigger className="hover:bg-surface-raised/60 px-5 py-4.5">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={expandedItems.includes('section-6') ? 'default' : 'subtle'}
                      size="sm"
                      className="font-numeric text-[11px]"
                    >
                      06
                    </Badge>
                    <span
                      className={cn(
                        'font-display text-body-md font-bold transition-colors',
                        expandedItems.includes('section-6') ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      Using Kalya properly
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-2">
                  <p className="text-body-sm text-text-secondary">You agree not to:</p>
                  <ul className="space-y-1 text-body-sm text-text-secondary leading-relaxed list-disc pl-5">
                    <li>break the law, or use Kalya to harm or cheat anyone</li>
                    <li>add other people&apos;s personal data without their permission</li>
                    <li>pretend to be someone else</li>
                    <li>harass or threaten other users</li>
                    <li>
                      try to break, overload, copy or reverse-engineer Kalya, or collect data from
                      it automatically
                    </li>
                    <li>upload viruses or harmful code</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Section 7: Cost */}
              <AccordionItem
                value="section-7"
                id="section-7"
                className={cn(
                  'transition-colors scroll-mt-24',
                  expandedItems.includes('section-7') && 'bg-primary-subtle/5'
                )}
              >
                <AccordionTrigger className="hover:bg-surface-raised/60 px-5 py-4.5">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={expandedItems.includes('section-7') ? 'default' : 'subtle'}
                      size="sm"
                      className="font-numeric text-[11px]"
                    >
                      07
                    </Badge>
                    <span
                      className={cn(
                        'font-display text-body-md font-bold transition-colors',
                        expandedItems.includes('section-7') ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      Cost
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2">
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    Kalya is free for now. We may add paid features in the future. If we do, we will
                    tell you in advance, and you will not be charged for anything unless you choose
                    it.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Section 8: Our content and brand */}
              <AccordionItem
                value="section-8"
                id="section-8"
                className={cn(
                  'transition-colors scroll-mt-24',
                  expandedItems.includes('section-8') && 'bg-primary-subtle/5'
                )}
              >
                <AccordionTrigger className="hover:bg-surface-raised/60 px-5 py-4.5">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={expandedItems.includes('section-8') ? 'default' : 'subtle'}
                      size="sm"
                      className="font-numeric text-[11px]"
                    >
                      08
                    </Badge>
                    <span
                      className={cn(
                        'font-display text-body-md font-bold transition-colors',
                        expandedItems.includes('section-8') ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      Our content and brand
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2">
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    The Kalya name, logo, design, text and software belong to us or our licensors.
                    We give you a personal, non-exclusive, non-transferable right to use Kalya for
                    your own use. You may not use our brand without written permission.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Section 9: Other services */}
              <AccordionItem
                value="section-9"
                id="section-9"
                className={cn(
                  'transition-colors scroll-mt-24',
                  expandedItems.includes('section-9') && 'bg-primary-subtle/5'
                )}
              >
                <AccordionTrigger className="hover:bg-surface-raised/60 px-5 py-4.5">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={expandedItems.includes('section-9') ? 'default' : 'subtle'}
                      size="sm"
                      className="font-numeric text-[11px]"
                    >
                      09
                    </Badge>
                    <span
                      className={cn(
                        'font-display text-body-md font-bold transition-colors',
                        expandedItems.includes('section-9') ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      Other services
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2">
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    Kalya may link to or work alongside other services, such as UPI apps. Their own
                    terms and privacy rules apply, and we are not responsible for them.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Section 10: Alerts and emails */}
              <AccordionItem
                value="section-10"
                id="section-10"
                className={cn(
                  'transition-colors scroll-mt-24',
                  expandedItems.includes('section-10') && 'bg-primary-subtle/5'
                )}
              >
                <AccordionTrigger className="hover:bg-surface-raised/60 px-5 py-4.5">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={expandedItems.includes('section-10') ? 'default' : 'subtle'}
                      size="sm"
                      className="font-numeric text-[11px]"
                    >
                      10
                    </Badge>
                    <span
                      className={cn(
                        'font-display text-body-md font-bold transition-colors',
                        expandedItems.includes('section-10') ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      Alerts and emails
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2">
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    We send alerts and emails that you turn on, and service messages such as
                    security notices or changes to these terms. You can turn off the optional ones
                    in Settings.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Section 11: No advice */}
              <AccordionItem
                value="section-11"
                id="section-11"
                className={cn(
                  'transition-colors scroll-mt-24',
                  expandedItems.includes('section-11') && 'bg-primary-subtle/5'
                )}
              >
                <AccordionTrigger className="hover:bg-surface-raised/60 px-5 py-4.5">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={expandedItems.includes('section-11') ? 'default' : 'subtle'}
                      size="sm"
                      className="font-numeric text-[11px]"
                    >
                      11
                    </Badge>
                    <span
                      className={cn(
                        'font-display text-body-md font-bold transition-colors',
                        expandedItems.includes('section-11') ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      No advice
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-2">
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-body-sm">
                      <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                      <span>Informational & Mathematical Tracking Only</span>
                    </div>
                    <p className="text-caption text-text-primary leading-relaxed">
                      Nothing in Kalya is investment, tax, legal or accounting advice. Talk to a
                      qualified professional before you make financial decisions. Kalya tracks what
                      you enter, and it does not recommend what to buy, sell or save.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Section 12: Availability and changes */}
              <AccordionItem
                value="section-12"
                id="section-12"
                className={cn(
                  'transition-colors scroll-mt-24',
                  expandedItems.includes('section-12') && 'bg-primary-subtle/5'
                )}
              >
                <AccordionTrigger className="hover:bg-surface-raised/60 px-5 py-4.5">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={expandedItems.includes('section-12') ? 'default' : 'subtle'}
                      size="sm"
                      className="font-numeric text-[11px]"
                    >
                      12
                    </Badge>
                    <span
                      className={cn(
                        'font-display text-body-md font-bold transition-colors',
                        expandedItems.includes('section-12') ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      Availability and changes
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2">
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    We work to keep Kalya running, but it may sometimes be unavailable or contain
                    errors. We may change, add or remove features. If a change affects you in a
                    major way, we will let you know.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Section 13: Ending your use */}
              <AccordionItem
                value="section-13"
                id="section-13"
                className={cn(
                  'transition-colors scroll-mt-24',
                  expandedItems.includes('section-13') && 'bg-primary-subtle/5'
                )}
              >
                <AccordionTrigger className="hover:bg-surface-raised/60 px-5 py-4.5">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={expandedItems.includes('section-13') ? 'default' : 'subtle'}
                      size="sm"
                      className="font-numeric text-[11px]"
                    >
                      13
                    </Badge>
                    <span
                      className={cn(
                        'font-display text-body-md font-bold transition-colors',
                        expandedItems.includes('section-13') ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      Ending your use
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-2">
                  <ul className="space-y-1.5 text-body-sm text-text-secondary leading-relaxed list-disc pl-5">
                    <li>You can stop using Kalya and delete your account at any time.</li>
                    <li>
                      We may suspend or close an account that breaks these terms or puts others at
                      risk. Where we can, we will warn you first.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Section 14: Disclaimer */}
              <AccordionItem
                value="section-14"
                id="section-14"
                className={cn(
                  'transition-colors scroll-mt-24',
                  expandedItems.includes('section-14') && 'bg-primary-subtle/5'
                )}
              >
                <AccordionTrigger className="hover:bg-surface-raised/60 px-5 py-4.5">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={expandedItems.includes('section-14') ? 'default' : 'subtle'}
                      size="sm"
                      className="font-numeric text-[11px]"
                    >
                      14
                    </Badge>
                    <span
                      className={cn(
                        'font-display text-body-md font-bold transition-colors',
                        expandedItems.includes('section-14') ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      Disclaimer
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2">
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    To the extent the law allows, Kalya is provided &ldquo;as is&rdquo; and
                    &ldquo;as available&rdquo;, without promises that it will be error-free or
                    always available.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Section 15: Limits on our responsibility */}
              <AccordionItem
                value="section-15"
                id="section-15"
                className={cn(
                  'transition-colors scroll-mt-24',
                  expandedItems.includes('section-15') && 'bg-primary-subtle/5'
                )}
              >
                <AccordionTrigger className="hover:bg-surface-raised/60 px-5 py-4.5">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={expandedItems.includes('section-15') ? 'default' : 'subtle'}
                      size="sm"
                      className="font-numeric text-[11px]"
                    >
                      15
                    </Badge>
                    <span
                      className={cn(
                        'font-display text-body-md font-bold transition-colors',
                        expandedItems.includes('section-15') ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      Limits on our responsibility
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2">
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    To the extent the law allows, we are not responsible for indirect or knock-on
                    losses, such as lost savings or missed opportunities. Our total responsibility
                    to you for any claim is limited to{' '}
                    <strong className="text-text-primary font-numeric">₹5,000</strong>. Nothing in
                    these terms limits responsibility that the law does not allow us to limit.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Section 16: Governing law and disputes */}
              <AccordionItem
                value="section-16"
                id="section-16"
                className={cn(
                  'transition-colors scroll-mt-24',
                  expandedItems.includes('section-16') && 'bg-primary-subtle/5'
                )}
              >
                <AccordionTrigger className="hover:bg-surface-raised/60 px-5 py-4.5">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={expandedItems.includes('section-16') ? 'default' : 'subtle'}
                      size="sm"
                      className="font-numeric text-[11px]"
                    >
                      16
                    </Badge>
                    <span
                      className={cn(
                        'font-display text-body-md font-bold transition-colors',
                        expandedItems.includes('section-16') ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      Governing law and disputes
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2">
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    These terms follow the laws of India. If we cannot settle a dispute by talking,
                    the competent courts in India will have jurisdiction. Please contact us first at{' '}
                    <a
                      href="mailto:support@kalya.app"
                      className="font-semibold text-primary hover:underline"
                    >
                      support@kalya.app
                    </a>
                    , because most problems can be solved that way.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Section 17: Changes to these terms */}
              <AccordionItem
                value="section-17"
                id="section-17"
                className={cn(
                  'transition-colors scroll-mt-24',
                  expandedItems.includes('section-17') && 'bg-primary-subtle/5'
                )}
              >
                <AccordionTrigger className="hover:bg-surface-raised/60 px-5 py-4.5">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={expandedItems.includes('section-17') ? 'default' : 'subtle'}
                      size="sm"
                      className="font-numeric text-[11px]"
                    >
                      17
                    </Badge>
                    <span
                      className={cn(
                        'font-display text-body-md font-bold transition-colors',
                        expandedItems.includes('section-17') ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      Changes to these terms
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2">
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    If we change these terms in a way that matters, we will tell you by email or in
                    the app at least{' '}
                    <span className="font-semibold text-text-primary font-numeric">14 days</span>{' '}
                    before the change takes effect. If you keep using Kalya after that, you accept
                    the new terms.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Section 18: Contact */}
              <AccordionItem
                value="section-18"
                id="section-18"
                className={cn(
                  'transition-colors scroll-mt-24',
                  expandedItems.includes('section-18') && 'bg-primary-subtle/5'
                )}
              >
                <AccordionTrigger className="hover:bg-surface-raised/60 px-5 py-4.5">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={expandedItems.includes('section-18') ? 'default' : 'subtle'}
                      size="sm"
                      className="font-numeric text-[11px]"
                    >
                      18
                    </Badge>
                    <span
                      className={cn(
                        'font-display text-body-md font-bold transition-colors',
                        expandedItems.includes('section-18') ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      Contact
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2">
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    Questions about these terms? Write to{' '}
                    <a
                      href="mailto:support@kalya.app"
                      className="font-semibold text-primary hover:underline"
                    >
                      support@kalya.app
                    </a>{' '}
                    or use our{' '}
                    <Link href="/contact" className="font-semibold text-primary hover:underline">
                      Contact page
                    </Link>
                    .
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Bottom Navigation Links */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/80">
              <Link
                href="/privacy"
                className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline text-body-sm"
              >
                <span>Read our Privacy Policy</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 font-semibold text-text-secondary hover:text-text-primary text-body-sm"
              >
                <span>Need help? Talk to us</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
