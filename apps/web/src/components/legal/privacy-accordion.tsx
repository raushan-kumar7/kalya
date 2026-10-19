'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Lock,
  CheckCircle2,
  Database,
  Scale,
  Clock,
  ArrowRight,
  ChevronsUpDown,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui';

import { PRIVACY_SECTIONS } from './constants';

const ALL_SECTION_IDS = PRIVACY_SECTIONS.map((s) => s.id);

export function PrivacyAccordion() {
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
            <Card className="border-border bg-surface shadow-card">
              <CardHeader className="p-4 pb-2 border-b border-border/70 flex flex-row items-center justify-between">
                <span className="text-caption font-bold text-text-muted uppercase tracking-wider">
                  Contents
                </span>
                <span className="text-[11px] font-numeric text-text-muted">
                  {expandedItems.length}/{PRIVACY_SECTIONS.length} open
                </span>
              </CardHeader>
              <CardContent className="p-2.5">
                <nav className="space-y-1">
                  {PRIVACY_SECTIONS.map((sec) => {
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

            {/* Grievance Quick Box (Remote team - Email only) */}
            <Card className="border-primary/20 bg-primary-subtle/25">
              <CardContent className="p-4.5 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-caption">
                  <Scale className="h-4 w-4" />
                  <span>Privacy & Grievances</span>
                </div>
                <p className="text-caption text-text-secondary">
                  <a
                    href="mailto:kaalbyte@gmail.com"
                    className="text-primary hover:underline font-semibold"
                  >
                    kaalbyte@gmail.com
                  </a>
                </p>
                <p className="text-[11px] text-text-muted">
                  Remote team · Acknowledged within <span className="font-numeric">48h</span>,
                  resolution in <span className="font-numeric">15</span> days.
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
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-xl font-bold text-text-primary">
                      The short version
                    </CardTitle>
                    <CardDescription className="text-caption text-text-secondary">
                      Plain-language summary of our core commitments
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                <ul className="space-y-2.5 text-body-sm text-text-primary">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                    <span>We collect only what we need to run Kalya Personal Finance App.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                    <span>We never sell your data, and Kalya Personal Finance App has no ads.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                    <span>We never ask for your bank password, card number, UPI PIN or OTP.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                    <span>Friends you split bills with see only the split details you share.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                    <span>You can export or delete your data, and you can reach us any time.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Accordion Controls Bar */}
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold text-text-primary">
                  Policy Sections
                </span>
                <Badge variant="subtle" size="sm" className="font-numeric">
                  13 Sections
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
              {/* Section 1: Who we are */}
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
                      Who we are
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-2">
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    <strong className="text-text-primary">Kalya Personal Finance App</strong>{' '}
                    (&ldquo;Kalya&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) operates as a
                    remote-first team. We decide why and how your personal data is used. You can
                    reach us any time at{' '}
                    <a
                      href="mailto:kaalbyte@gmail.com"
                      className="font-medium text-primary hover:underline"
                    >
                      kaalbyte@gmail.com
                    </a>
                    .
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Section 2: What we collect */}
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
                      What we collect
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-4">
                  <div className="overflow-hidden rounded-xl border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/4 font-semibold text-text-primary">
                            What
                          </TableHead>
                          <TableHead className="w-1/2 font-semibold text-text-primary">
                            Examples
                          </TableHead>
                          <TableHead className="w-1/4 font-semibold text-text-primary">
                            Why we need it
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium text-text-primary align-top">
                            Account details
                          </TableCell>
                          <TableCell className="text-text-secondary text-caption leading-relaxed align-top">
                            Name, email, phone number (if you give it), password (stored in
                            protected form)
                          </TableCell>
                          <TableCell className="text-text-secondary text-caption leading-relaxed align-top">
                            To create and secure your account
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-text-primary align-top">
                            Money entries you add
                          </TableCell>
                          <TableCell className="text-text-secondary text-caption leading-relaxed align-top">
                            Transactions, categories, tags, budgets, goals, gold, silver, shares and
                            mutual funds
                          </TableCell>
                          <TableCell className="text-text-secondary text-caption leading-relaxed align-top">
                            To run the features you use
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-text-primary align-top">
                            Split and friend details
                          </TableCell>
                          <TableCell className="text-text-secondary text-caption leading-relaxed align-top">
                            Names and phone numbers or emails of friends you add, split amounts,
                            invitation status, settlement records, UPI IDs you choose to record
                          </TableCell>
                          <TableCell className="text-text-secondary text-caption leading-relaxed align-top">
                            To run bill splitting and send invitations
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-text-primary align-top">
                            Messages to us
                          </TableCell>
                          <TableCell className="text-text-secondary text-caption leading-relaxed align-top">
                            Your name, email and message
                          </TableCell>
                          <TableCell className="text-text-secondary text-caption leading-relaxed align-top">
                            To reply to you
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-text-primary align-top">
                            Alert settings
                          </TableCell>
                          <TableCell className="text-text-secondary text-caption leading-relaxed align-top">
                            Which alerts you turned on, and a notification token for your device
                          </TableCell>
                          <TableCell className="text-text-secondary text-caption leading-relaxed align-top">
                            To send only the alerts you asked for
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-text-primary align-top">
                            Technical data
                          </TableCell>
                          <TableCell className="text-text-secondary text-caption leading-relaxed align-top">
                            Device type, browser, IP address, pages used, error logs and anonymous
                            usage statistics
                          </TableCell>
                          <TableCell className="text-text-secondary text-caption leading-relaxed align-top">
                            To keep Kalya secure, fix problems and see how the site is used
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-raised border border-border/80 flex items-center gap-2.5">
                    <Database className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-caption font-semibold text-text-primary">
                      Kalya Personal Finance App does not connect to your bank. You add your own
                      entries.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Section 3: How we use your data */}
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
                      How we use your data
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-3">
                  <ul className="space-y-1.5 text-body-sm text-text-secondary leading-relaxed list-disc pl-5">
                    <li>
                      To provide Kalya Personal Finance App: your budget, splits, goals, net worth
                      and statements.
                    </li>
                    <li>
                      To send alerts and emails you turned on, such as a budget warning or a split
                      invitation.
                    </li>
                    <li>To keep Kalya Personal Finance App safe and to prevent misuse.</li>
                    <li>To reply to your messages.</li>
                    <li>
                      To improve Kalya Personal Finance App, using combined data that does not
                      identify you.
                    </li>
                    <li>To meet legal duties.</li>
                  </ul>
                  <div className="p-3 rounded-xl bg-danger-subtle/30 border border-danger/20 text-caption text-text-primary font-medium">
                    We do not use your data for advertising, and we do not build profiles of you for
                    lenders, banks or card companies.
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Section 4: Your consent and your choices */}
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
                      Your consent and your choices
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-2">
                  <ul className="space-y-1.5 text-body-sm text-text-secondary leading-relaxed list-disc pl-5">
                    <li>
                      Before we collect your data, we show you a short notice that says what we
                      collect and why, and we ask for your consent.
                    </li>
                    <li>
                      You can take back your consent at any time, in Settings or by writing to us.
                      If you do, we can no longer run your account, and we will delete your data
                      unless the law says we must keep some of it.
                    </li>
                    <li>You can turn off any alert or email in Settings.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Section 5: Who we share data with */}
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
                      Who we share data with
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-2.5">
                  <ul className="space-y-2 text-body-sm text-text-secondary leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-text-primary min-w-44 shrink-0">
                        • Friends you split with:
                      </span>
                      <span>They see only the details of the splits you share with them.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-text-primary min-w-44 shrink-0">
                        • Service providers:
                      </span>
                      <span>
                        Companies that help us run Kalya, such as cloud hosting, email and
                        notification providers. They may use your data only to provide their service
                        to us, under a written agreement.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-text-primary min-w-44 shrink-0">
                        • Authorities:
                      </span>
                      <span>Only when the law requires it, or to protect people from harm.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-text-primary min-w-44 shrink-0">
                        • If Kalya is sold or merged:
                      </span>
                      <span>
                        We will tell you first, and these protections will continue to apply.
                      </span>
                    </li>
                  </ul>
                  <p className="font-bold text-text-primary text-body-sm pt-1">
                    We do not sell your personal data.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Section 6: Where your data is stored */}
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
                      Where your data is stored
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-2">
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    Your data is stored with our secure cloud hosting provider with modern
                    encryption and data residency standards. We take rigorous steps to keep it
                    protected and private.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Section 7: How long we keep your data */}
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
                      How long we keep your data
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-2">
                  <ul className="space-y-1.5 text-body-sm text-text-secondary leading-relaxed list-disc pl-5">
                    <li>We keep your data while your account is open.</li>
                    <li>
                      When you delete your account, we delete or anonymise your data within{' '}
                      <strong className="text-text-primary font-numeric">30 days</strong>. Backups
                      are cleared within{' '}
                      <strong className="text-text-primary font-numeric">90 days</strong>.
                    </li>
                    <li>
                      We may keep limited records for longer if the law requires it, and only for
                      that purpose.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Section 8: How we keep your data safe */}
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
                      How we keep your data safe
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-2">
                  <ul className="space-y-1.5 text-body-sm text-text-secondary leading-relaxed list-disc pl-5">
                    <li>
                      Data is encrypted while it travels between your device and Kalya (TLS 1.3) and
                      while it is stored.
                    </li>
                    <li>
                      Each account&apos;s data is kept strictly separate from every other
                      user&apos;s.
                    </li>
                    <li>Access to data inside our team is limited and logged.</li>
                    <li>We keep backups and watch for unusual access.</li>
                    <li>
                      If a data breach affects you, we will tell you and the authorities as the law
                      requires.
                    </li>
                  </ul>
                  <p className="text-caption text-text-muted italic pt-1">
                    No service is perfectly secure. Please use a strong, unique password.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Section 9: Your rights */}
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
                      Your rights
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-2">
                  <p className="text-body-sm text-text-secondary">You can ask us to:</p>
                  <ul className="space-y-1 text-body-sm text-text-secondary leading-relaxed list-disc pl-5">
                    <li>show you a summary of the data we hold about you</li>
                    <li>correct or update it</li>
                    <li>delete it</li>
                    <li>take back your consent</li>
                    <li>
                      name another person to use these rights for you if you die or cannot act
                      (Nomination right under DPDP Act)
                    </li>
                    <li>look into a complaint</li>
                  </ul>
                  <p className="text-body-sm text-text-secondary leading-relaxed pt-1">
                    To use these rights, go to{' '}
                    <strong className="text-text-primary">Settings &gt; Privacy</strong> or write to{' '}
                    <a
                      href="mailto:kaalbyte@gmail.com"
                      className="font-semibold text-primary hover:underline"
                    >
                      kaalbyte@gmail.com
                    </a>
                    . We will reply within{' '}
                    <span className="font-semibold text-text-primary font-numeric">15 days</span>,
                    and in any case within{' '}
                    <span className="font-semibold text-text-primary font-numeric">90 days</span>.
                    If you are not happy with our answer, you can complain to the{' '}
                    <strong className="text-text-primary">Data Protection Board of India</strong>.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Section 10: Children */}
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
                      Children
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-2">
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    Kalya is for people aged{' '}
                    <span className="font-semibold text-text-primary font-numeric">18</span> and
                    over. We do not knowingly collect data from anyone younger. If we learn that we
                    have, we will delete it.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Section 11: Cookies and similar tools */}
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
                      Cookies and similar tools
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-2">
                  <ul className="space-y-1.5 text-body-sm text-text-secondary leading-relaxed list-disc pl-5">
                    <li>
                      <strong className="text-text-primary">Essential:</strong> keep you signed in
                      and remember your light or dark choice.
                    </li>
                    <li>
                      <strong className="text-text-primary">Analytics:</strong> we do not use
                      third-party tracking pixels or commercial ad scripts.
                    </li>
                    <li>
                      <strong className="text-text-primary">Advertising:</strong> none.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Section 12: Changes to this policy */}
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
                      Changes to this policy
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-2">
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    If we change this policy in a way that matters, we will tell you by email or in
                    the app at least{' '}
                    <span className="font-semibold text-text-primary font-numeric">14 days</span>{' '}
                    before it takes effect. The date at the top always shows the latest version.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Section 13: Contact and grievances */}
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
                      Contact and grievances
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 space-y-3">
                  <div className="p-4 rounded-xl bg-surface-raised/60 border border-border space-y-2 text-body-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-caption text-text-muted">
                        Grievance & Privacy Contact:
                      </span>
                      <a
                        href="mailto:kaalbyte@gmail.com"
                        className="font-semibold text-primary hover:underline"
                      >
                        kaalbyte@gmail.com
                      </a>
                    </div>
                    <p className="text-caption text-text-secondary leading-relaxed">
                      Kalya Personal Finance App operates as a remote team. All privacy and
                      grievance communications are handled digitally via email.
                    </p>
                    <div className="pt-2 border-t border-border/70 flex items-center gap-2 text-caption text-text-secondary">
                      <Clock className="h-4 w-4 text-primary shrink-0" />
                      <span>
                        We acknowledge every complaint within{' '}
                        <strong className="text-text-primary font-numeric">48 hours</strong> and aim
                        to resolve it within{' '}
                        <strong className="text-text-primary font-numeric">15 days</strong>.
                      </span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Bottom Callout & Contact Link */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/80">
              <p className="text-caption text-text-muted">
                Have questions about this Privacy Policy?
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline text-body-sm"
              >
                <span>Talk to our team</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
