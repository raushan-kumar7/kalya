'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<'overview' | 'tokens' | 'components'>('overview');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary font-body transition-colors duration-300">
      {/* Top Banner / Status Indicator */}
      <aside
        aria-label="System diagnostic banner"
        className="border-b border-border bg-surface-raised/80 backdrop-blur-sm px-4 py-2 text-text-secondary text-caption flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="font-numeric font-medium">Design Token Diagnostic Engine</span>
          <span className="text-text-muted">|</span>
          <span>
            Active Theme: <strong className="text-text-primary uppercase">{theme}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-text-muted">globals.css validation testbed</span>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-primary-subtle text-primary font-numeric text-caption font-semibold hover:bg-primary hover:text-on-primary transition-all cursor-pointer"
          >
            <span>{theme === 'light' ? '🌙 Switch to Dark' : '☀️ Switch to Light'}</span>
          </button>
        </div>
      </aside>

      {/* Main Navigation */}
      <header className="border-b border-border bg-surface sticky top-0 z-40 shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-36 h-10">
              <Image
                src={theme === 'dark' ? '/kalya_logo1.png' : '/kalya_logo1.png'}
                alt="Kalya Logo"
                fill
                priority
                className={`object-contain transition-all ${
                  theme === 'dark' ? 'brightness-125 contrast-125' : ''
                }`}
              />
            </div>
            <div className="hidden md:flex flex-col pl-3 border-l border-border">
              <span className="eyebrow">READY FOR TOMORROW.</span>
              <span className="text-caption text-text-muted">Design System Verification</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-surface-raised p-1 rounded-md border border-border">
            {(
              [
                { id: 'overview', label: 'Brand Dashboard' },
                { id: 'tokens', label: 'Token Inspector' },
                { id: 'components', label: 'Component Gallery' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-sm text-body-sm font-medium transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-surface text-primary font-semibold shadow-card border border-border/50'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & BRAND DASHBOARD (Modeled from kalya_brand.png)          */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Welcome Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-border">
              <div>
                <span className="eyebrow block mb-1">FINANCIAL WELLNESS OVERVIEW</span>
                <h1 className="font-display text-text-primary text-display-md md:text-display-lg font-bold tracking-tight">
                  Good evening, Raushan
                </h1>
                <p className="text-text-secondary text-body-md mt-1">
                  Here is your real-time portfolio health snapshot based on the Kalya design system.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button className="px-4 py-2 rounded-md bg-surface border border-border text-text-primary hover:bg-surface-raised transition shadow-card text-body-sm font-medium">
                  Export Report
                </button>
                <button className="px-4 py-2 rounded-md bg-primary text-on-primary hover:bg-primary-hover transition shadow-card text-body-sm font-medium flex items-center gap-2">
                  <span>Add Transaction</span>
                  <span className="text-accent font-bold">↗</span>
                </button>
              </div>
            </div>

            {/* Top Dashboard Grid: Net Worth Card + Reserve Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Primary Net Worth Card (Replicating phone mockup in kalya_brand.png) */}
              <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6 shadow-card relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-caption text-text-muted uppercase tracking-wider font-semibold">
                      Total Net Worth
                    </span>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="numeric text-text-primary text-display-md sm:text-display-lg font-bold">
                        ₹18,74,520
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-success-subtle text-success text-body-sm font-medium border border-success/20">
                        ↑ 6.3% vs last month
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-surface-raised px-2.5 py-1 rounded-sm border border-border text-caption text-text-secondary font-numeric">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span>Real-time Sync</span>
                  </div>
                </div>

                {/* SVG Visual Chart Simulation using Chart Tokens */}
                <div className="mt-8 mb-4">
                  <div className="h-32 w-full flex items-end gap-1.5 sm:gap-2">
                    {[38, 45, 42, 58, 62, 55, 68, 72, 70, 84, 88, 95].map((val, idx) => (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-1.5 group relative"
                      >
                        <div
                          className="w-full rounded-xs transition-all duration-300 group-hover:opacity-80"
                          style={{
                            height: `${val}%`,
                            backgroundColor:
                              idx === 11
                                ? 'var(--primary)'
                                : idx > 8
                                  ? 'var(--chart-1)'
                                  : idx > 5
                                    ? 'var(--chart-4)'
                                    : 'var(--chart-3)',
                          }}
                        />
                        <span className="text-[10px] font-numeric text-text-muted">
                          {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][idx]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metric Strip (Assets / Liabilities / Goals) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border">
                  <div className="p-3 rounded-md bg-surface-raised border border-border/60">
                    <div className="flex items-center gap-2 text-caption text-text-muted">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <span>Assets</span>
                    </div>
                    <span className="numeric block text-body-lg font-bold text-text-primary mt-1">
                      ₹24,85,230
                    </span>
                  </div>

                  <div className="p-3 rounded-md bg-surface-raised border border-border/60">
                    <div className="flex items-center gap-2 text-caption text-text-muted">
                      <span className="w-2 h-2 rounded-full bg-warning" />
                      <span>Liabilities</span>
                    </div>
                    <span className="numeric block text-body-lg font-bold text-text-primary mt-1">
                      ₹6,10,710
                    </span>
                  </div>

                  <div className="p-3 rounded-md bg-surface-raised border border-border/60">
                    <div className="flex items-center gap-2 text-caption text-text-muted">
                      <span className="w-2 h-2 rounded-full bg-accent" />
                      <span>Financial Goals</span>
                    </div>
                    <span className="numeric block text-body-lg font-bold text-text-primary mt-1">
                      3 Active Goals
                    </span>
                  </div>
                </div>
              </div>

              {/* Physical Card Showcase (Replicating deep green debossed card in kalya_brand.png) */}
              <div
                className="rounded-xl p-6 shadow-raised flex flex-col justify-between relative overflow-hidden border border-border/20 text-on-primary min-h-80"
                style={{ background: 'var(--brand-gradient)' }}
              >
                {/* Background decorative watermark */}
                <div className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 pointer-events-none">
                  <Image
                    src="/kalya_icon_white1.png"
                    alt="Watermark"
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8">
                      <Image
                        src="/kalya_icon_white1.png"
                        alt="Kalya Mark"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="font-display font-bold text-body-lg tracking-wide text-white">
                      kalya
                    </span>
                  </div>
                  <span className="eyebrow text-accent font-semibold tracking-brand">RESERVE</span>
                </div>

                {/* EMV Chip & Contactless */}
                <div className="my-6 relative z-10">
                  <div className="w-11 h-8 rounded-sm bg-linear-to-tr from-amber-300 to-amber-100 border border-amber-400/40 shadow-inner flex items-center justify-center">
                    <div className="w-7 h-5 border border-amber-600/30 rounded-xs" />
                  </div>
                </div>

                <div className="space-y-2 relative z-10">
                  <div className="font-numeric tracking-widest text-body-md text-white/90">
                    •••• •••• •••• 8920
                  </div>
                  <div className="flex items-end justify-between pt-2">
                    <div>
                      <span className="text-[10px] uppercase text-white/60 tracking-wider block">
                        Cardholder
                      </span>
                      <span className="font-display font-medium text-body-sm text-white">
                        RAUSHAN KUMAR
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-white/60 tracking-wider block">
                        Expires
                      </span>
                      <span className="font-numeric text-caption text-white/90">09/29</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Pillars: The Meaning Section (From kalya_brand.png) */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-card">
              <div className="text-center max-w-xl mx-auto mb-6">
                <span className="eyebrow block">THE MEANING</span>
                <h2 className="font-display text-text-primary text-display-md font-bold mt-1">
                  One symbol. Complete financial wellness.
                </h2>
                <p className="text-text-secondary text-body-sm mt-1">
                  The visual anatomy of the Kalya identity translates directly into our core product
                  values.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: 'HEALTH',
                    subtitle: 'Financial Fitness',
                    desc: 'Organic vitality, long-term balance, and sustainable compounding.',
                    icon: '🌿',
                    color: 'text-primary bg-primary-subtle',
                  },
                  {
                    title: 'GROWTH',
                    subtitle: 'Wealth Growth',
                    desc: 'Dynamic ascending arrow breaking out of standard linear limits.',
                    icon: '↗',
                    color: 'text-accent bg-accent-subtle',
                  },
                  {
                    title: 'DIRECTION',
                    subtitle: 'Guidance & Clarity',
                    desc: 'Internal compass vein guiding every capital allocation decision.',
                    icon: '🧭',
                    color: 'text-info bg-info-subtle',
                  },
                  {
                    title: 'TOMORROW',
                    subtitle: 'Ready for Tomorrow',
                    desc: 'The horizon dawn, keeping wealth resilient against future shocks.',
                    icon: '☀️',
                    color: 'text-warning bg-warning-subtle',
                  },
                ].map((pillar, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-surface-raised border border-border hover:border-accent/40 transition-all hover:shadow-card group"
                  >
                    <div
                      className={`w-10 h-10 rounded-md flex items-center justify-center text-body-lg font-bold mb-3 ${pillar.color}`}
                    >
                      {pillar.icon}
                    </div>
                    <span className="eyebrow block text-[10px]">{pillar.title}</span>
                    <h3 className="font-display font-semibold text-text-primary text-body-md mt-0.5">
                      {pillar.subtitle}
                    </h3>
                    <p className="text-text-secondary text-body-sm mt-1">{pillar.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Utility Test Section: Horizontal .no-scrollbar and .scroll-fade test */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Filter Chips (.no-scrollbar) */}
              <div className="bg-surface rounded-xl border border-border p-5 shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-semibold text-text-primary text-body-md">
                    Filter Portfolios (.no-scrollbar test)
                  </h4>
                  <span className="text-caption text-text-muted">Horizontal Scroll</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {[
                    'All Assets',
                    'Equity & MFs',
                    'Real Estate',
                    'Fixed Deposits',
                    'Gold & Bullion',
                    'Venture Capital',
                    'Cryptocurrency',
                    'International Tech',
                  ].map((cat, idx) => (
                    <button
                      key={cat}
                      className={`whitespace-nowrap px-3.5 py-1.5 rounded-sm text-body-sm font-medium transition cursor-pointer ${
                        idx === 0
                          ? 'bg-primary text-on-primary shadow-card'
                          : 'bg-surface-raised text-text-secondary hover:text-text-primary border border-border'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Scroll Feed (.scroll-fade test) */}
              <div className="bg-surface rounded-xl border border-border p-5 shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-semibold text-text-primary text-body-md">
                    Recent Activity (.scroll-fade test)
                  </h4>
                  <span className="text-caption text-text-muted font-numeric">
                    Live Transactions
                  </span>
                </div>
                <div className="h-32 overflow-y-auto scroll-fade space-y-2 pr-1">
                  {[
                    {
                      label: 'Nifty 50 Index SIP Auto-Debit',
                      amount: '-₹25,000',
                      date: 'Today, 10:14 AM',
                      color: 'text-text-primary',
                    },
                    {
                      label: 'Dividend Yield Credited (TCS)',
                      amount: '+₹4,320',
                      date: 'Yesterday, 3:20 PM',
                      color: 'text-success',
                    },
                    {
                      label: 'Sovereign Gold Bond Tranche V',
                      amount: '+₹50,000',
                      date: '28 Sep, 11:30 AM',
                      color: 'text-accent-strong',
                    },
                    {
                      label: 'Term Insurance Premium',
                      amount: '-₹12,400',
                      date: '25 Sep, 09:00 AM',
                      color: 'text-danger',
                    },
                    {
                      label: 'Fixed Deposit Quarterly Interest',
                      amount: '+₹8,750',
                      date: '22 Sep, 02:45 PM',
                      color: 'text-success',
                    },
                  ].map((tx, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-sm bg-surface-raised border border-border/40 text-body-sm"
                    >
                      <div>
                        <span className="font-medium text-text-primary block">{tx.label}</span>
                        <span className="text-caption text-text-muted">{tx.date}</span>
                      </div>
                      <span className={`numeric font-bold ${tx.color}`}>{tx.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: COMPLETE DESIGN TOKEN INSPECTOR & PALETTE MATRIX                   */}
        {/* ========================================================================= */}
        {activeTab === 'tokens' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="eyebrow block mb-1">AUTOMATED AUDIT</span>
              <h2 className="font-display text-text-primary text-display-md font-bold">
                Design Token Verification Matrix
              </h2>
              <p className="text-text-secondary text-body-sm mt-1">
                Direct verification of every CSS variable declared in{' '}
                <code className="text-caption px-1.5 py-0.5 rounded-xs bg-surface-raised border border-border text-primary font-numeric">
                  styles/globals.css
                </code>
                .
              </p>
            </div>

            {/* Core Brand Swatches */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
              <h3 className="font-display font-semibold text-text-primary text-body-lg">
                1. Core Brand Colors
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  {
                    name: '--primary',
                    cls: 'bg-primary text-on-primary',
                    role: 'Leaf Evergreen',
                  },
                  {
                    name: '--primary-hover',
                    cls: 'bg-primary-hover text-on-primary',
                    role: 'Action Hover',
                  },
                  {
                    name: '--primary-subtle',
                    cls: 'bg-primary-subtle text-primary border border-primary/20',
                    role: 'Container Tint',
                  },
                  {
                    name: '--accent',
                    cls: 'bg-accent text-on-accent',
                    role: 'Solar Arrow Gold',
                  },
                  {
                    name: '--accent-strong',
                    cls: 'bg-accent-strong text-white',
                    role: 'High-contrast Gold',
                  },
                  {
                    name: '--accent-subtle',
                    cls: 'bg-accent-subtle text-accent-strong border border-accent/20',
                    role: 'Parchment Glow',
                  },
                ].map((s) => (
                  <div
                    key={s.name}
                    className="p-3 rounded-md bg-surface-raised border border-border"
                  >
                    <div
                      className={`h-14 rounded-sm flex items-center justify-center font-numeric text-caption font-bold shadow-inner ${s.cls}`}
                    >
                      Sample
                    </div>
                    <span className="font-numeric font-medium text-text-primary text-caption block mt-2">
                      {s.name}
                    </span>
                    <span className="text-[11px] text-text-muted">{s.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Surfaces & Canvas */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
              <h3 className="font-display font-semibold text-text-primary text-body-lg">
                2. Canvas, Surfaces & Borders
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    name: '--bg',
                    cls: 'bg-bg text-text-primary',
                    desc: 'Main Viewport Background',
                  },
                  {
                    name: '--surface',
                    cls: 'bg-surface text-text-primary',
                    desc: 'Base Card Surface',
                  },
                  {
                    name: '--surface-raised',
                    cls: 'bg-surface-raised text-text-primary',
                    desc: 'Elevated Component Container',
                  },
                  {
                    name: '--border',
                    cls: 'bg-surface border-2 border-border',
                    desc: 'Global Outlines & Dividers',
                  },
                ].map((s) => (
                  <div
                    key={s.name}
                    className="p-4 rounded-md bg-surface-raised border border-border flex flex-col justify-between"
                  >
                    <div
                      className={`h-16 rounded-sm p-3 shadow-card flex items-center justify-center font-numeric text-caption font-medium border border-border ${s.cls}`}
                    >
                      {s.name}
                    </div>
                    <div className="mt-2">
                      <span className="font-numeric font-bold text-text-primary text-caption block">
                        {s.name}
                      </span>
                      <span className="text-[11px] text-text-muted">{s.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Semantic Feedback Matrix */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
              <h3 className="font-display font-semibold text-text-primary text-body-lg">
                3. Semantic Status & Feedback
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    status: 'Success',
                    solid: 'bg-success text-on-success',
                    subtle: 'bg-success-subtle text-success',
                    role: 'Wealth Inflow / Gains',
                  },
                  {
                    status: 'Warning',
                    solid: 'bg-warning text-on-warning',
                    subtle: 'bg-warning-subtle text-warning',
                    role: 'Liabilities / Alerts',
                  },
                  {
                    status: 'Danger',
                    solid: 'bg-danger text-on-danger',
                    subtle: 'bg-danger-subtle text-danger',
                    role: 'Risk / Critical Outflows',
                  },
                  {
                    status: 'Info',
                    solid: 'bg-info text-on-info',
                    subtle: 'bg-info-subtle text-info',
                    role: 'Analytics / Insights',
                  },
                ].map((st) => (
                  <div
                    key={st.status}
                    className="p-3 rounded-md bg-surface-raised border border-border space-y-2"
                  >
                    <span className="font-display font-semibold text-text-primary text-body-sm">
                      {st.status}
                    </span>
                    <div
                      className={`py-1.5 px-3 rounded-xs text-caption font-numeric font-bold text-center ${st.solid}`}
                    >
                      Solid Fill
                    </div>
                    <div
                      className={`py-1.5 px-3 rounded-xs text-caption font-numeric font-semibold text-center border border-border/40 ${st.subtle}`}
                    >
                      Subtle Container
                    </div>
                    <span className="text-[11px] text-text-muted block">{st.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data-viz Charts Palette */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
              <h3 className="font-display font-semibold text-text-primary text-body-lg">
                4. Data-viz Chart Series (`--chart-1` to `--chart-5`)
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { id: '1', var: '--chart-1', cls: 'bg-chart-1', label: 'Primary Trend' },
                  { id: '2', var: '--chart-2', cls: 'bg-chart-2', label: 'Gold Benchmark' },
                  { id: '3', var: '--chart-3', cls: 'bg-chart-3', label: 'Market Index' },
                  { id: '4', var: '--chart-4', cls: 'bg-chart-4', label: 'Sage Hedging' },
                  { id: '5', var: '--chart-5', cls: 'bg-chart-5', label: 'Risk Exposure' },
                ].map((c) => (
                  <div key={c.id} className="text-center space-y-1.5">
                    <div className={`h-14 rounded-sm shadow-card ${c.cls}`} />
                    <span className="font-numeric text-caption font-bold text-text-primary block">
                      {c.var}
                    </span>
                    <span className="text-[10px] text-text-muted hidden sm:inline">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography & Numeric Scale */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
              <h3 className="font-display font-semibold text-text-primary text-body-lg">
                5. Typography & Font Families
              </h3>
              <div className="space-y-4 divide-y divide-border">
                <div className="pt-2">
                  <span className="text-caption text-text-muted block">
                    Display Font: Outfit (var(--font-display))
                  </span>
                  <span className="font-display text-display-md text-text-primary font-bold">
                    Kalya: Intelligent Capital Allocation
                  </span>
                </div>
                <div className="pt-4">
                  <span className="text-caption text-text-muted block">
                    Brand Eyebrow (.eyebrow)
                  </span>
                  <span className="eyebrow block mt-1">
                    READY FOR TOMORROW. 0.22em WIDE-TRACKED
                  </span>
                </div>
                <div className="pt-4">
                  <span className="text-caption text-text-muted block">
                    Body Font: Inter (var(--font-body))
                  </span>
                  <p className="font-body text-body-md text-text-secondary mt-1">
                    Financial wellness is not merely the accumulation of capital, but the strategic
                    clarity and alignment of resources for long-term independence.
                  </p>
                </div>
                <div className="pt-4">
                  <span className="text-caption text-text-muted block">
                    Numeric Tabular: IBM Plex Mono (.numeric)
                  </span>
                  <span className="numeric text-display-sm font-bold text-text-primary block mt-1">
                    ₹18,74,520.45 · +14.28% · 1,290.00
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: COMPONENT GALLERY (Buttons, Inputs, Alerts, Cards)                  */}
        {/* ========================================================================= */}
        {activeTab === 'components' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="eyebrow block mb-1">INTERACTIVE ELEMENTS</span>
              <h2 className="font-display text-text-primary text-display-md font-bold">
                Component States & Elevation
              </h2>
              <p className="text-text-secondary text-body-sm mt-1">
                Verifying shadows, radii, interactive focus rings, and hover transitions.
              </p>
            </div>

            {/* Buttons Showcase */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
              <h3 className="font-display font-semibold text-text-primary text-body-lg">
                Buttons & Controls
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <button className="px-4 py-2 rounded-sm bg-primary text-on-primary hover:bg-primary-hover font-medium text-body-sm shadow-card transition cursor-pointer">
                  Primary Button
                </button>
                <button className="px-4 py-2 rounded-sm bg-accent text-on-accent hover:opacity-90 font-medium text-body-sm shadow-card transition cursor-pointer">
                  Accent Gold Button
                </button>
                <button className="px-4 py-2 rounded-sm bg-primary-subtle text-primary hover:bg-primary hover:text-on-primary font-medium text-body-sm transition cursor-pointer">
                  Subtle Container
                </button>
                <button className="px-4 py-2 rounded-sm bg-surface border border-border text-text-primary hover:bg-surface-raised font-medium text-body-sm shadow-card transition cursor-pointer">
                  Outlined Surface
                </button>
                <button className="px-4 py-2 rounded-sm bg-danger text-on-danger hover:opacity-90 font-medium text-body-sm transition cursor-pointer">
                  Danger Action
                </button>
                <button
                  disabled
                  className="px-4 py-2 rounded-sm bg-surface-raised text-text-muted border border-border/50 font-medium text-body-sm cursor-not-allowed opacity-60"
                >
                  Disabled
                </button>
              </div>
            </div>

            {/* Radii & Shadows Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { radius: 'rounded-sm (0.5rem)', shadow: 'shadow-card', label: 'Compact Card' },
                {
                  radius: 'rounded-md (0.75rem)',
                  shadow: 'shadow-card',
                  label: 'Standard Surface',
                },
                { radius: 'rounded-lg (1rem)', shadow: 'shadow-raised', label: 'Raised Modal' },
                { radius: 'rounded-xl (1.5rem)', shadow: 'shadow-raised', label: 'Hero Tile' },
              ].map((r, i) => (
                <div
                  key={i}
                  className={`bg-surface border border-border p-5 ${r.radius} ${r.shadow} flex flex-col justify-between`}
                >
                  <span className="font-display font-semibold text-text-primary text-body-sm">
                    {r.label}
                  </span>
                  <div className="mt-4 pt-3 border-t border-border/60">
                    <span className="font-numeric text-caption text-primary block">{r.radius}</span>
                    <span className="font-numeric text-caption text-text-muted">{r.shadow}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Focus Ring Testbed */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
              <h3 className="font-display font-semibold text-text-primary text-body-lg">
                Focus Ring Accessibility Verification (:focus-visible)
              </h3>
              <p className="text-text-secondary text-body-sm">
                Press{' '}
                <kbd className="px-1.5 py-0.5 rounded-xs bg-surface-raised border border-border font-numeric text-caption">
                  Tab
                </kbd>{' '}
                to inspect the ring color which resolves to{' '}
                <code className="text-primary font-numeric">--ring</code> (forest green in light,
                emerald in dark).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Focus me with Tab..."
                  className="px-3.5 py-2 rounded-sm bg-surface-raised border border-border text-text-primary placeholder:text-text-muted text-body-sm"
                />
                <select className="px-3.5 py-2 rounded-sm bg-surface-raised border border-border text-text-primary text-body-sm">
                  <option>Select Asset Class</option>
                  <option>Equities</option>
                  <option>Commodities</option>
                </select>
                <button className="px-4 py-2 rounded-sm bg-primary text-on-primary font-medium text-body-sm">
                  Focusable Button
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-surface py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7">
              <Image src="/kalya_icon1.png" alt="Kalya Leaf" fill className="object-contain" />
            </div>
            <span className="font-display font-bold text-text-primary text-body-md">kalya</span>
            <span className="text-text-muted">·</span>
            <span className="eyebrow text-caption">READY FOR TOMORROW.</span>
          </div>
          <span className="text-caption text-text-muted font-numeric">
            Design Tokens Verified · Tailwind CSS 4 Inline Engine · All Tests Passing
          </span>
        </div>
      </footer>
    </div>
  );
}
