'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Skeleton,
  Spinner,
  EmptyState,
  ErrorState,
  Separator,
  Portal,
  AspectRatio,
  ThemeToggle,
  ThemeSegmented,
  ThemeDropdown,
  useTheme,
  // Data Display
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardMedia,
  ExpandableCard,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  DataTable,
  type DataTableColumn,
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  // Navigation
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  Pagination,
  ResponsivePagination,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarItem,
  SidebarSubMenu,
} from '@/components/ui';
import {
  Button,
  ButtonIcon,
  Checkbox,
  CheckboxField,
  CheckboxGroup,
  Combobox,
  MultiSelect,
  Input,
  InputGroup,
  InputAddon,
  RadioGroup,
  RadioGroupItem,
  RadioField,
  RadioCard,
  RadioGroupField,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  Switch,
  SwitchField,
  Textarea,
  ReadOnlyField,
  Label,
  Field,
  FieldSuccess,
  FieldError,
  FieldWarning,
  FieldDescription,
} from '@/components/ui/forms';
import {
  RefreshCw,
  FolderPlus,
  Sparkles,
  PlusCircle,
  X,
  Maximize2,
  Lock,
  Wallet,
  ShieldCheck,
  CreditCard,
  SlidersHorizontal,
  CircleCheck,
  CircleCheck as CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Info,
  Share2,
  Trash2,
  ExternalLink,
  History,
  Layers,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  TrendingUp,
  Check,
  Minus,
  Tag,
  User,
  Users,
  ChevronRight,
  ChevronLeft,
  Home as HomeIcon,
  LayoutDashboard,
  Settings,
  FileText,
  Globe,
  DollarSign,
  Database,
  RotateCw,
} from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverBody,
  PopoverFooter,
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  AnimatedTooltip,
} from '@/components/ui/overlays';
import {
  Alert,
  AlertTitle,
  AlertDescription,
  Banner,
  Progress,
  toast,
} from '@/components/ui/feedback';

interface HoldingRecord {
  id: number;
  ticker: string;
  name: string;
  assetClass: string;
  allocation: number;
  value: string;
  change24h: number;
  status: 'active' | 'rebalancing' | 'settled';
}

const SAMPLE_HOLDINGS: HoldingRecord[] = [
  {
    id: 1,
    ticker: 'NIFTY50',
    name: 'Nifty 50 Index Fund',
    assetClass: 'Equities',
    allocation: 35.0,
    value: '₹24,80,000',
    change24h: 1.42,
    status: 'active',
  },
  {
    id: 2,
    ticker: 'SGB-2029',
    name: 'Sovereign Gold Bonds',
    assetClass: 'Commodities',
    allocation: 25.0,
    value: '₹17,71,500',
    change24h: 0.85,
    status: 'settled',
  },
  {
    id: 3,
    ticker: 'TREPS-91D',
    name: 'Treasury Repos 91D',
    assetClass: 'Fixed Income',
    allocation: 20.0,
    value: '₹14,17,200',
    change24h: 0.12,
    status: 'active',
  },
  {
    id: 4,
    ticker: 'US-TECH100',
    name: 'Nasdaq 100 ETF Feeder',
    assetClass: 'International',
    allocation: 12.5,
    value: '₹8,85,750',
    change24h: -0.64,
    status: 'rebalancing',
  },
  {
    id: 5,
    ticker: 'REIT-EMB',
    name: 'Embassy Office REIT',
    assetClass: 'Real Estate',
    allocation: 7.5,
    value: '₹5,31,450',
    change24h: -0.18,
    status: 'active',
  },
  {
    id: 6,
    ticker: 'CORP-AAA',
    name: 'HDFC Corp Bond AAA',
    assetClass: 'Fixed Income',
    allocation: 5.0,
    value: '₹3,54,300',
    change24h: 0.08,
    status: 'settled',
  },
];

export default function Home() {
  const { theme, setTheme, resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [activeTab, setActiveTab] = useState<'overview' | 'tokens' | 'components'>('overview');

  // Overview live async state simulation
  const [dashboardState, setDashboardState] = useState<'live' | 'loading' | 'empty' | 'error'>(
    'live'
  );
  const [isRetryingDashboard, setIsRetryingDashboard] = useState(false);

  // Component Gallery state
  const [galleryFilter, setGalleryFilter] = useState<
    | 'all'
    | 'forms'
    | 'overlays'
    | 'data-display'
    | 'navigation'
    | 'feedback'
    | 'states'
    | 'utilities'
    | 'foundations'
  >('all');
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const [dynamicProgress, setDynamicProgress] = useState(68);
  const [isSkeletonDemoLoading, setIsSkeletonDemoLoading] = useState(true);
  const [isSpinnerBtnLoading, setIsSpinnerBtnLoading] = useState(false);
  const [spinnerBtnSuccess, setSpinnerBtnSuccess] = useState(false);
  const [isErrorRetrying, setIsErrorRetrying] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [activeAspectRatio, setActiveAspectRatio] = useState<number>(16 / 9);

  // Form interactive demo states
  const [formInputVal, setFormInputVal] = useState('1,50,000');
  const [formClearableVal, setFormClearableVal] = useState('EQUITY-ALPHA-Q3');
  const [formSwitchChecked, setFormSwitchChecked] = useState(true);
  const [formCheckboxChecked, setFormCheckboxChecked] = useState(true);
  const [formRadioVal, setFormRadioVal] = useState('growth');
  const [formSelectVal, setFormSelectVal] = useState('equities');
  const [formComboboxVal, setFormComboboxVal] = useState('hdfc');
  const [formTextareaVal, setFormTextareaVal] = useState(
    'Automated SIP rebalancing target: 60% Nifty 50, 40% Sovereign Gold.'
  );

  // Data Display & Navigation interactive states
  const [tableSelectedKeys, setTableSelectedKeys] = useState<(string | number)[]>([1, 3]);
  const [tableLoadingDemo, setTableLoadingDemo] = useState(false);
  const [multiSelectVals, setMultiSelectVals] = useState<string[]>(['inr', 'usd']);
  const [navActiveTab, setNavActiveTab] = useState('holdings');
  const [navPaginationPage, setNavPaginationPage] = useState(1);
  const [navPageSize, setNavPageSize] = useState(5);
  const [indeterminateChecked, setIndeterminateChecked] = useState<'indeterminate' | boolean>(
    'indeterminate'
  );
  const [radioCardVal, setRadioCardVal] = useState('pro');
  const [bannerVisible, setBannerVisible] = useState(true);

  const handleDashboardRetry = () => {
    setIsRetryingDashboard(true);
    setTimeout(() => {
      setIsRetryingDashboard(false);
      setDashboardState('live');
    }, 900);
  };

  const handleSpinnerButtonClick = () => {
    if (isSpinnerBtnLoading) return;
    setIsSpinnerBtnLoading(true);
    setSpinnerBtnSuccess(false);
    setTimeout(() => {
      setIsSpinnerBtnLoading(false);
      setSpinnerBtnSuccess(true);
      setTimeout(() => setSpinnerBtnSuccess(false), 2500);
    }, 1200);
  };

  const handleErrorStateRetry = () => {
    setIsErrorRetrying(true);
    setTimeout(() => {
      setIsErrorRetrying(false);
      setErrorDismissed(true);
      setTimeout(() => setErrorDismissed(false), 4000);
    }, 1000);
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
            Active Theme:{' '}
            <strong className="text-text-primary uppercase" suppressHydrationWarning>
              {mounted ? (theme ?? 'system') : 'system'}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-text-muted">globals.css validation testbed</span>
          <ThemeToggle
            size="sm"
            showLabel
            variant="outline"
            className="h-7 px-2.5 rounded-full text-caption"
          />
        </div>
      </aside>

      {/* Main Navigation */}
      <header className="border-b border-border bg-surface sticky top-0 z-40 shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-36 h-10">
              <Image
                src={resolvedTheme === 'dark' ? '/kalya_logo1.png' : '/kalya_logo1.png'}
                alt="Kalya Logo"
                fill
                priority
                sizes="144px"
                className={`object-contain transition-all ${
                  mounted && resolvedTheme === 'dark' ? 'brightness-125 contrast-125' : ''
                }`}
              />
            </div>
            <div className="hidden md:flex flex-col pl-3 border-l border-border">
              <span className="eyebrow">READY FOR TOMORROW.</span>
              <span className="text-caption text-text-muted">Design System Verification</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & BRAND DASHBOARD (Modeled from kalya_brand.png)          */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Welcome Bar with Telemetry State Simulator */}
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

              {/* Live State Simulator Switcher & Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 p-1 rounded-md bg-surface-raised border border-border">
                  <span className="text-[11px] font-numeric text-text-muted px-2 uppercase tracking-wider font-semibold hidden sm:inline">
                    Simulate:
                  </span>
                  {(
                    [
                      { id: 'live', label: 'Live' },
                      { id: 'loading', label: 'Skeleton' },
                      { id: 'empty', label: 'Empty' },
                      { id: 'error', label: 'Error' },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        setDashboardState(st.id);
                        setIsRetryingDashboard(false);
                      }}
                      className={`px-2.5 py-1 rounded-xs text-caption font-numeric font-medium transition cursor-pointer ${
                        dashboardState === st.id
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPortalOpen(true)}
                  className="px-4 py-2 rounded-md bg-primary text-on-primary hover:bg-primary-hover transition shadow-card text-body-sm font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Quick Action</span>
                  <span className="text-accent font-bold">↗</span>
                </button>
              </div>
            </div>

            {/* Top Dashboard Grid: Net Worth Card + Reserve Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Primary Net Worth Card */}
              <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6 shadow-card relative overflow-hidden flex flex-col justify-between">
                {dashboardState === 'loading' ? (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-56" animation="shimmer" />
                      </div>
                      <div className="flex items-center gap-2 bg-surface-raised px-3 py-1.5 rounded-sm border border-border text-caption text-text-muted font-numeric">
                        <Spinner size="xs" variant="accent" />
                        <span>Synchronizing Telemetry...</span>
                      </div>
                    </div>

                    <div className="mt-8 mb-4">
                      <div className="h-32 w-full flex items-end gap-1.5 sm:gap-2">
                        {[38, 45, 42, 58, 62, 55, 68, 72, 70, 84, 88, 95].map((val, idx) => (
                          <Skeleton
                            key={idx}
                            className="flex-1 rounded-xs"
                            style={{ height: `${val}%` }}
                            animation="shimmer"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border">
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className="p-3 rounded-md bg-surface-raised border border-border/60 space-y-2"
                        >
                          <Skeleton className="h-3.5 w-20" />
                          <Skeleton className="h-6 w-28" animation="shimmer" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : dashboardState === 'error' ? (
                  <ErrorState
                    errorCode="ERR_TELEMETRY_WS_TIMEOUT"
                    title="Real-time Stream Interrupted"
                    message="Failed to establish secure WebSocket telemetry with market exchange. Fallback to cached state or trigger reconnect."
                    onRetry={handleDashboardRetry}
                    retryLabel={isRetryingDashboard ? 'Reconnecting...' : 'Retry Connection'}
                    icon={isRetryingDashboard ? <Spinner size="lg" variant="primary" /> : undefined}
                    action={
                      <button
                        onClick={() => setDashboardState('live')}
                        className="px-4 py-2 rounded-sm bg-surface border border-border text-text-primary hover:bg-surface-raised font-medium text-body-sm transition cursor-pointer"
                      >
                        Reset Demo
                      </button>
                    }
                  />
                ) : (
                  <>
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
                  </>
                )}
              </div>

              {/* Physical Card Showcase using AspectRatio (1.586 standard banking card ratio) */}
              <div className="flex flex-col justify-center">
                <AspectRatio
                  ratio={1.586}
                  className="rounded-xl p-6 shadow-raised flex flex-col justify-between relative overflow-hidden border border-border/20 text-on-primary w-full"
                  style={{ background: 'var(--brand-gradient)' }}
                >
                  {/* Background decorative watermark */}
                  <div className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 pointer-events-none">
                    <Image
                      src="/kalya_icon_white1.png"
                      alt="Watermark"
                      fill
                      sizes="192px"
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
                          sizes="32px"
                          className="object-contain"
                        />
                      </div>
                      <span className="font-display font-bold text-body-lg tracking-wide text-white">
                        kalya
                      </span>
                    </div>
                    <span className="eyebrow text-accent font-semibold tracking-brand">
                      RESERVE
                    </span>
                  </div>

                  {/* EMV Chip & Contactless */}
                  <div className="my-2 sm:my-3 relative z-10">
                    <div className="w-11 h-8 rounded-sm bg-linear-to-tr from-amber-300 to-amber-100 border border-amber-400/40 shadow-inner flex items-center justify-center">
                      <div className="w-7 h-5 border border-amber-600/30 rounded-xs" />
                    </div>
                  </div>

                  <div className="space-y-1 relative z-10">
                    <div className="font-numeric tracking-widest text-body-sm sm:text-body-md text-white/90">
                      •••• •••• •••• 8920
                    </div>
                    <div className="flex items-end justify-between pt-1">
                      <div>
                        <span className="text-[9px] uppercase text-white/60 tracking-wider block">
                          Cardholder
                        </span>
                        <span className="font-display font-medium text-caption sm:text-body-sm text-white">
                          RAUSHAN KUMAR
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase text-white/60 tracking-wider block">
                          Expires
                        </span>
                        <span className="font-numeric text-[11px] sm:text-caption text-white/90">
                          09/29
                        </span>
                      </div>
                    </div>
                  </div>
                </AspectRatio>
              </div>
            </div>

            <Separator label="THE ANATOMY OF KALYA" variant="subtle" className="my-6" />

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

            <Separator
              label="DATA TELEMETRY & VIEWPORT UTILITIES"
              variant="subtle"
              className="my-6"
            />

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

              {/* Live Scroll Feed (.scroll-fade test with Simulated States) */}
              <div className="bg-surface rounded-xl border border-border p-5 shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-semibold text-text-primary text-body-md">
                    Recent Activity (.scroll-fade test)
                  </h4>
                  <span className="text-caption text-text-muted font-numeric">
                    Live Transactions
                  </span>
                </div>

                {dashboardState === 'loading' ? (
                  <div className="h-32 space-y-2 pr-1">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between p-2 rounded-sm bg-surface-raised border border-border/40"
                      >
                        <div className="space-y-1">
                          <Skeleton className="h-3.5 w-36" animation="pulse" />
                          <Skeleton className="h-2.5 w-20" />
                        </div>
                        <Skeleton className="h-4 w-16" animation="shimmer" />
                      </div>
                    ))}
                  </div>
                ) : dashboardState === 'empty' ? (
                  <EmptyState
                    className="py-4 px-3"
                    title="No Recent Transactions"
                    description="No account movements recorded in the selected period."
                    action={
                      <button
                        onClick={() => setDashboardState('live')}
                        className="px-3 py-1 rounded-sm bg-primary text-on-primary text-caption font-medium hover:bg-primary-hover transition cursor-pointer"
                      >
                        Restore Sample Feed
                      </button>
                    }
                  />
                ) : (
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
                )}
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
        {/* TAB 3: COMPONENT GALLERY (UI States, Utilities & Foundations)             */}
        {/* ========================================================================= */}
        {activeTab === 'components' && (
          <div className="space-y-10 animate-fadeIn">
            {/* Gallery Header & Module Filter */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-border">
              <div>
                <span className="eyebrow block mb-1">DESIGN SYSTEM SHOWCASE</span>
                <h2 className="font-display text-text-primary text-display-md font-bold">
                  Component States & Layout Utilities
                </h2>
                <p className="text-text-secondary text-body-sm mt-1">
                  Interactive verification matrix for{' '}
                  <code className="text-primary font-numeric font-medium">
                    @/components/ui/states
                  </code>{' '}
                  and{' '}
                  <code className="text-primary font-numeric font-medium">
                    @/components/ui/utilities
                  </code>
                  .
                </p>
              </div>

              {/* Sub-gallery Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-md bg-surface-raised border border-border">
                {(
                  [
                    { id: 'all', label: 'All Modules' },
                    { id: 'forms', label: 'Forms (12)' },
                    { id: 'data-display', label: 'Data Display (5)' },
                    { id: 'navigation', label: 'Navigation (4)' },
                    { id: 'overlays', label: 'Overlays (6)' },
                    { id: 'feedback', label: 'Feedback (4)' },
                    { id: 'states', label: 'States (4)' },
                    { id: 'utilities', label: 'Utilities (3)' },
                    { id: 'foundations', label: 'Foundations' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setGalleryFilter(tab.id)}
                    className={`px-3 py-1 rounded-xs text-body-sm font-medium transition cursor-pointer ${
                      galleryFilter === tab.id
                        ? 'bg-surface text-primary font-semibold shadow-card border border-border/50'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ===================================================================== */}
            {/* GROUP 0: FORMS & INPUT CONTROLS (@/components/ui/forms/*)             */}
            {/* ===================================================================== */}
            {(galleryFilter === 'all' || galleryFilter === 'forms') && (
              <div className="space-y-8">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <h3 className="font-display font-bold text-text-primary text-display-sm">
                    1. Form Controls & Input Systems
                  </h3>
                  <span className="text-caption font-numeric text-text-muted bg-surface-raised px-2 py-0.5 rounded-xs border border-border">
                    @/components/ui/forms
                  </span>
                </div>

                {/* 1. BUTTON VARIANTS & SIZES */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-5">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Button Component (
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Button /&gt;
                      </code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Semantic action buttons with hover lift, active scale, theme tokens, and async
                      loading spinners.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                      Variants (ui.txt Guidelines)
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button variant="primary">Primary (Leaf Green)</Button>
                      <Button variant="secondary">Secondary Surface</Button>
                      <Button variant="tertiary">Tertiary / Ghost</Button>
                      <Button variant="destructive">Destructive Action</Button>
                      <Button variant="link">Link-Style Action</Button>
                      <Button variant="accent">Accent Gold</Button>
                      <Button variant="outline">Outlined Surface</Button>
                      <Button variant="subtle">Subtle Container</Button>
                      <Button variant="success">Success Action</Button>
                      <Button disabled>Disabled State</Button>
                      <Button isLoading>Processing...</Button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                      Size Scale (Extra Small → Extra Large + Icon Sizes)
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button size="xs">Extra Small (xs: h-7)</Button>
                      <Button size="sm">Small (sm: h-8.5)</Button>
                      <Button size="default">Medium (md: h-10)</Button>
                      <Button size="lg">Large (lg: h-12)</Button>
                      <Button size="xl">Extra Large (xl: h-14)</Button>

                      <div className="flex items-center gap-2 pl-2 border-l border-border">
                        <Button size="icon-xs" aria-label="Quick Action XS">
                          <Sparkles className="w-3 h-3 text-accent" />
                        </Button>
                        <Button size="icon-sm" aria-label="Quick Action SM">
                          <Sparkles className="w-3.5 h-3.5 text-accent" />
                        </Button>
                        <Button size="icon" aria-label="Quick Action MD">
                          <Sparkles className="w-4 h-4 text-accent" />
                        </Button>
                        <Button size="icon-lg" aria-label="Quick Action LG">
                          <Sparkles className="w-5 h-5 text-accent" />
                        </Button>
                        <Button size="icon-xl" aria-label="Quick Action XL">
                          <Sparkles className="w-6 h-6 text-accent" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                      Icon Positions (Leading / Trailing Slots)
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button variant="default" leadingIcon={<PlusCircle className="h-4 w-4" />}>
                        Leading Icon (Deposit)
                      </Button>
                      <Button variant="secondary" trailingIcon={<ArrowRight className="h-4 w-4" />}>
                        Trailing Icon (Transfer)
                      </Button>
                      <Button
                        variant="outline"
                        leadingIcon={<Lock className="h-4 w-4 text-primary" />}
                        trailingIcon={<ArrowUpRight className="h-3.5 w-3.5 text-text-muted" />}
                      >
                        Dual Icon Slot (Security)
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                      Framer Motion Fluid Interactions (
                      <code className="text-primary font-numeric">animated</code>)
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button animated variant="default">
                        Spring Hover &amp; Tap
                      </Button>
                      <Button animated variant="accent">
                        Gold Fluid Motion
                      </Button>
                      <Button animated variant="outline">
                        Tactile Press Feedback
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 2. TEXT INPUTS & INPUT GROUPS */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Text Inputs & Addons (
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Input /&gt;
                      </code>
                      ,{' '}
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;InputGroup /&gt;
                      </code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Inputs featuring leading/trailing icons, clearable triggers, password reveal
                      toggles, and composite prefixes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Clearable Input */}
                    <Input
                      label="Portfolio Vault Tag"
                      leadingIcon={<Wallet />}
                      clearable
                      value={formClearableVal}
                      onChange={(e) => setFormClearableVal(e.target.value)}
                      onClear={() => setFormClearableVal('')}
                      helperText="Click the × icon to reset this field."
                    />

                    {/* Password with Reveal Toggle */}
                    <Input
                      type="password"
                      label="Vault Encryption Passcode"
                      leadingIcon={<Lock />}
                      defaultValue="KalyaReserve@2026"
                      required
                      helperText="Toggle the eye icon to reveal plaintext."
                    />

                    {/* Currency Input Group */}
                    <Field
                      label="SIP Investment Capital Allocation"
                      required
                      description="Composite InputGroup with prefix currency symbol and ISO currency code suffix."
                    >
                      <InputGroup>
                        <InputAddon position="prefix">₹</InputAddon>
                        <Input
                          placeholder="Amount in Rupees"
                          value={formInputVal}
                          onChange={(e) => setFormInputVal(e.target.value)}
                        />
                        <InputAddon position="suffix">INR</InputAddon>
                      </InputGroup>
                    </Field>

                    {/* Error State Input */}
                    <Input
                      label="Financial Assessment Year"
                      defaultValue="2024"
                      error
                      errorMessage="Assessment year must be greater than current financial year (FY 2026-27)."
                    />

                    {/* Success Validation State Input */}
                    <Input
                      label="Depository Consent Artifact"
                      defaultValue="AA-CONSENT-9921-ACTIVE"
                      success
                      successMessage="Consent artifact cryptographically signed and verified via RBI Account Aggregator."
                    />

                    {/* Warning Validation State Input */}
                    <Input
                      label="High-Yield Concentration Limit"
                      defaultValue="42.5%"
                      warning
                      warningMessage="Allocation exceeds recommended single-instrument ceiling of 35%."
                    />

                    {/* Character Counter Input */}
                    <Input
                      label="Portfolio Vault Strategy Label"
                      defaultValue="Long-term Sovereign Compounding"
                      maxLength={40}
                      showCount
                      helperText="Character counter updates dynamically with user input."
                    />

                    {/* Prefix and Suffix Affixes */}
                    <Input
                      label="Annualized Yield Hurdle"
                      defaultValue="14,500"
                      prefixText="₹"
                      suffixText="INR/mo"
                      helperText="Direct prefix and suffix text affixes integrated inside input frame."
                    />
                  </div>
                </div>

                {/* 3. MULTI-LINE TEXTAREA & READ-ONLY FIELD */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Textarea */}
                  <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
                    <div>
                      <h4 className="font-display font-semibold text-text-primary text-body-lg">
                        Textarea (
                        <code className="text-primary font-numeric text-body-sm">
                          &lt;Textarea /&gt;
                        </code>
                        )
                      </h4>
                      <p className="text-caption text-text-muted">
                        Multi-line field with built-in validation messages.
                      </p>
                    </div>

                    <Textarea
                      label="Investment Objective Mandate"
                      placeholder="Specify your investment horizon and liquidity needs..."
                      value={formTextareaVal}
                      onChange={(e) => setFormTextareaVal(e.target.value)}
                      helperText="Max 500 characters. Used for automated portfolio rebalancing."
                    />
                  </div>

                  {/* Read-Only Field with Masking & Copy */}
                  <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
                    <div>
                      <h4 className="font-display font-semibold text-text-primary text-body-lg">
                        ReadOnlyField (
                        <code className="text-primary font-numeric text-body-sm">
                          &lt;ReadOnlyField /&gt;
                        </code>
                        )
                      </h4>
                      <p className="text-caption text-text-muted">
                        Secure display for PAN, account numbers, and secrets with reveal and copy
                        animations.
                      </p>
                    </div>

                    <div className="space-y-3.5 pt-1">
                      <ReadOnlyField
                        label="Bank Account Number"
                        value="00021050098421"
                        icon={ShieldCheck}
                        mask={true}
                        copyable={true}
                        hint="Verified via RBI Account Aggregator protocol."
                      />

                      <ReadOnlyField
                        label="Income Tax PAN"
                        value="ABCDE1234F"
                        icon={CreditCard}
                        mask={true}
                        copyable={true}
                        hint="Linked with Central Board of Direct Taxes (CBDT)."
                      />
                    </div>
                  </div>
                </div>

                {/* 3.5 FORM FIELD & LABEL WRAPPER */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Accessible Form Field &amp; Label (
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Field /&gt;
                      </code>
                      ,{' '}
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Label /&gt;
                      </code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Composable field wrapper that automatically orchestrates{' '}
                      <code className="text-primary font-numeric">htmlFor</code>,{' '}
                      <code className="text-primary font-numeric">aria-describedby</code>,
                      cautionary warnings, validation alerts, and required badges for any input
                      control.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Field with cautionary warning */}
                    <Field
                      label="Target Portfolio Yield"
                      required
                      description="Calculated based on trailing 12-month net yields."
                      warning="Yield targets above 12% trigger high-volatility hedging protocols."
                    >
                      <Input placeholder="e.g. 14.2%" defaultValue="14.5%" />
                    </Field>

                    {/* Field with blocking validation error */}
                    <Field
                      label="Emergency Liquidity Reserve"
                      required
                      error="Minimum required liquidity for your tier is ₹2,50,000."
                    >
                      <Input placeholder="Enter allocation amount" defaultValue="₹1,20,000" />
                    </Field>

                    {/* Field with label action slot */}
                    <Field
                      label="Rebalancing Frequency"
                      labelAction={
                        <button
                          type="button"
                          onClick={() => alert('Automated dynamic drift rebalancing enabled.')}
                          className="text-accent hover:underline cursor-pointer font-medium"
                        >
                          Auto-Calculate
                        </button>
                      }
                      description="Determines periodic drift audit cycles."
                    >
                      <Select defaultValue="monthly">
                        <SelectTrigger>
                          <SelectValue placeholder="Select Frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly Cycle</SelectItem>
                          <SelectItem value="biweekly">Bi-Weekly Cycle</SelectItem>
                          <SelectItem value="monthly">Monthly Cycle</SelectItem>
                          <SelectItem value="quarterly">Quarterly Review</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </div>

                {/* 4. TOGGLES: SWITCH, CHECKBOX & RADIO GROUP */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Selection Controls (
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Switch /&gt;
                      </code>
                      ,{' '}
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Checkbox /&gt;
                      </code>
                      ,{' '}
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;RadioGroup /&gt;
                      </code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Accessible Radix UI toggles styled with Kalya emerald and gold themes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
                    {/* Switch Toggles with SwitchField */}
                    <div className="p-4 rounded-md bg-surface-raised border border-border space-y-3">
                      <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                        Switch &amp; SwitchField
                      </span>

                      <SwitchField
                        label="Auto Rebalance Mandate"
                        description="Executes periodic asset realignment"
                        stateLabel={true}
                        checked={formSwitchChecked}
                        onCheckedChange={setFormSwitchChecked}
                      />

                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <span className="text-caption text-text-secondary">
                          Compact Switch (size="sm")
                        </span>
                        <Switch size="sm" defaultChecked />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <span className="text-caption text-text-secondary">
                          Large Switch (size="lg")
                        </span>
                        <Switch size="lg" defaultChecked />
                      </div>
                    </div>

                    {/* Checkbox Controls & CheckboxField */}
                    <div className="p-4 rounded-md bg-surface-raised border border-border space-y-3">
                      <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                        Checkbox &amp; Indeterminate State
                      </span>

                      <CheckboxField
                        label="Biometric Authorization"
                        description="Require FaceID or YubiKey for withdrawals"
                        checked={formCheckboxChecked}
                        onCheckedChange={(c) => setFormCheckboxChecked(Boolean(c))}
                      />

                      <div className="pt-2 border-t border-border/50 space-y-1.5">
                        <CheckboxField
                          label="Parent Folio Consolidation"
                          description="Indeterminate dash indicates partial child selection"
                          checked={indeterminateChecked}
                          onCheckedChange={(c) => setIndeterminateChecked(c)}
                        />
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() =>
                            setIndeterminateChecked((prev) =>
                              prev === 'indeterminate'
                                ? true
                                : prev === true
                                  ? false
                                  : 'indeterminate'
                            )
                          }
                        >
                          Cycle State ({String(indeterminateChecked)})
                        </Button>
                      </div>
                    </div>

                    {/* Radio Group & RadioField */}
                    <div className="p-4 rounded-md bg-surface-raised border border-border space-y-3">
                      <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                        RadioGroup &amp; RadioField
                      </span>

                      <RadioGroup value={formRadioVal} onValueChange={setFormRadioVal}>
                        <RadioField
                          value="conservative"
                          label="Conservative Mandate"
                          description="100% Sovereign Debt & SGBs"
                        />
                        <RadioField
                          value="balanced"
                          label="Balanced Growth"
                          description="60/40 Equity & Debt Hybrid"
                        />
                        <RadioField
                          value="growth"
                          label="Aggressive Alpha"
                          description="100% Equity Momentum Index"
                        />
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Rich Radio Cards */}
                  <div className="space-y-3 pt-3 border-t border-border/60">
                    <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                      RadioCard Organisms (Rich Interactive Plan Selectors)
                    </span>
                    <RadioGroup
                      value={radioCardVal}
                      onValueChange={setRadioCardVal}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <RadioCard
                        value="standard"
                        label="Standard Wealth"
                        description="Self-directed trades with basic portfolio analytics"
                        icon={<Wallet className="h-5 w-5" />}
                        badge={
                          <Badge size="sm" variant="secondary">
                            Free
                          </Badge>
                        }
                      />
                      <RadioCard
                        value="pro"
                        label="Private Vault Pro"
                        description="Automated drift rebalancing, tax-loss harvesting, and priority AA feed"
                        icon={<Sparkles className="h-5 w-5 text-accent" />}
                        badge={
                          <Badge size="sm" variant="accent">
                            Popular
                          </Badge>
                        }
                      />
                      <RadioCard
                        value="institutional"
                        label="Family Office Tier"
                        description="Multi-signatory vault custody, bespoke mandate execution, and API access"
                        icon={<ShieldCheck className="h-5 w-5 text-primary" />}
                        badge={
                          <Badge size="sm" variant="subtle">
                            Enterprise
                          </Badge>
                        }
                      />
                    </RadioGroup>
                  </div>
                </div>

                {/* 5. DROPDOWNS: SELECT, COMBOBOX & MULTI-SELECT */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Dropdowns, Autocomplete &amp; Multi-Select (
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Select /&gt;
                      </code>
                      ,{' '}
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Combobox /&gt;
                      </code>
                      ,{' '}
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;MultiSelect /&gt;
                      </code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Single-select with category groups, searchable fuzzy filtering, and
                      multi-select with tag chips and clear-all action.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Radix Select with Category Groups */}
                    <div className="space-y-1.5">
                      <label className="block text-body-sm font-medium text-text-primary">
                        Single Select (
                        <code className="font-numeric text-primary">&lt;Select /&gt;</code>)
                      </label>
                      <Select value={formSelectVal} onValueChange={setFormSelectVal}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select asset class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Public Markets</SelectLabel>
                            <SelectItem value="equities">Equities & Index SIPs</SelectItem>
                            <SelectItem value="bonds">Sovereign Gold & Govt Bonds</SelectItem>
                            <SelectItem value="etf">Exchange Traded Funds (ETF)</SelectItem>
                          </SelectGroup>
                          <SelectSeparator />
                          <SelectGroup>
                            <SelectLabel>Alternative Assets</SelectLabel>
                            <SelectItem value="reit">Commercial Real Estate REITs</SelectItem>
                            <SelectItem value="commodities">
                              Bullion & Physical Commodities
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <p className="text-caption text-text-muted">
                        Grouped categories with separator dividers.
                      </p>
                    </div>

                    {/* Searchable Combobox */}
                    <div className="space-y-1.5">
                      <label className="block text-body-sm font-medium text-text-primary">
                        Searchable Combobox (
                        <code className="font-numeric text-primary">&lt;Combobox /&gt;</code>)
                      </label>
                      <Combobox
                        value={formComboboxVal}
                        onChange={setFormComboboxVal}
                        placeholder="Search institution..."
                        searchPlaceholder="Type institution name..."
                        options={[
                          {
                            value: 'hdfc',
                            label: 'HDFC Securities Ltd.',
                            description: 'Account #00021-IN',
                            group: 'Private Banks',
                          },
                          {
                            value: 'zerodha',
                            label: 'Zerodha Broking (Kite)',
                            description: 'Client ID #ZK9921',
                            group: 'Discount Brokers',
                          },
                          {
                            value: 'icici',
                            label: 'ICICI Direct Prime',
                            description: 'Wealth Trading Acc',
                            group: 'Private Banks',
                          },
                          {
                            value: 'groww',
                            label: 'Groww Invest Tech',
                            description: 'Mutual Fund Mandate',
                            group: 'Discount Brokers',
                          },
                          {
                            value: 'sbi',
                            label: 'SBI Mutual Fund AMC',
                            description: 'Direct Folio Master',
                            group: 'Public Banks',
                          },
                        ]}
                      />
                      <p className="text-caption text-text-muted">
                        Categorized groups with instant keyword filter.
                      </p>
                    </div>

                    {/* MultiSelect Component */}
                    <div className="space-y-1.5">
                      <label className="block text-body-sm font-medium text-text-primary">
                        Multi-Select with Tags (
                        <code className="font-numeric text-primary">&lt;MultiSelect /&gt;</code>)
                      </label>
                      <MultiSelect
                        values={multiSelectVals}
                        onChange={setMultiSelectVals}
                        placeholder="Select currencies..."
                        options={[
                          { value: 'inr', label: 'INR (₹)', description: 'Indian Rupee' },
                          { value: 'usd', label: 'USD ($)', description: 'US Dollar' },
                          { value: 'eur', label: 'EUR (€)', description: 'Euro' },
                          { value: 'gbp', label: 'GBP (£)', description: 'British Pound' },
                          { value: 'sgd', label: 'SGD ($)', description: 'Singapore Dollar' },
                        ]}
                      />
                      <p className="text-caption text-text-muted">
                        Interactive tag badges with individual and bulk clear.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* GROUP: OVERLAYS & FLOATING SURFACES (@/components/ui/overlays/*)      */}
            {/* ===================================================================== */}
            {(galleryFilter === 'all' || galleryFilter === 'overlays') && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                  <h3 className="font-display font-bold text-text-primary text-display-sm">
                    Overlays & Floating Surfaces
                  </h3>
                  <span className="text-caption font-numeric text-text-muted bg-surface-raised px-2 py-0.5 rounded-xs border border-border">
                    @/components/ui/overlays
                  </span>
                </div>

                {/* 1. OPINIONATED MODAL SYSTEM (<Modal />) */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Composed Modal (
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Modal /&gt;
                      </code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Opinionated composed modal with size steps (
                      <code className="font-numeric text-primary">sm</code>,{' '}
                      <code className="font-numeric text-primary">md</code>,{' '}
                      <code className="font-numeric text-primary">lg</code>,{' '}
                      <code className="font-numeric text-primary">xl</code>), tone-aware icon
                      badges, and a scrollable body with a sticky action footer.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Demo 1: Strategic Allocation Modal */}
                    <Modal>
                      <ModalTrigger asChild>
                        <Button variant="default" className="gap-2 cursor-pointer">
                          <Sparkles className="w-4 h-4 text-accent" />
                          <span>Wealth Strategy (size: md)</span>
                        </Button>
                      </ModalTrigger>
                      <ModalContent size="md">
                        <ModalHeader
                          tone="accent"
                          icon={<Sparkles className="w-5 h-5 text-accent" />}
                        >
                          <ModalTitle>Strategic Allocation Blueprint</ModalTitle>
                          <ModalDescription>
                            Review quarterly wealth rebalancing shifts before executing depository
                            order.
                          </ModalDescription>
                        </ModalHeader>
                        <ModalBody className="space-y-4">
                          <div className="space-y-2">
                            <span className="text-caption font-numeric uppercase tracking-wider text-text-muted font-semibold">
                              Target Rebalance Breakdown
                            </span>
                            <div className="space-y-2">
                              {[
                                {
                                  name: 'Nifty 50 Bluechip Index Fund',
                                  percent: '45%',
                                  amount: '₹14,20,000',
                                  tag: 'Equity',
                                },
                                {
                                  name: '24K Sovereign Gold Bullion Tranche',
                                  percent: '25%',
                                  amount: '₹7,88,000',
                                  tag: 'Hedge',
                                },
                                {
                                  name: 'AAA Corporate Sovereign Debt Yield',
                                  percent: '20%',
                                  amount: '₹6,30,000',
                                  tag: 'Fixed Income',
                                },
                                {
                                  name: 'Overnight Treasury Liquidity Reserve',
                                  percent: '10%',
                                  amount: '₹3,15,000',
                                  tag: 'Liquid Cash',
                                },
                              ].map((item) => (
                                <div
                                  key={item.name}
                                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-raised text-body-sm"
                                >
                                  <div>
                                    <p className="font-medium text-text-primary">{item.name}</p>
                                    <span className="text-caption text-text-muted">{item.tag}</span>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-numeric font-bold text-text-primary">
                                      {item.amount}
                                    </p>
                                    <span className="text-caption font-numeric text-primary font-semibold">
                                      {item.percent}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-primary-subtle border border-primary/20 text-caption text-primary leading-normal flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>
                              Custody verified with SEBI-registered depository participant.
                              Settlement executes on T+1 cycle.
                            </span>
                          </div>
                        </ModalBody>
                        <ModalFooter>
                          <Button variant="outline" size="sm">
                            Cancel
                          </Button>
                          <Button variant="default" size="sm">
                            Authorize Rebalance
                          </Button>
                        </ModalFooter>
                      </ModalContent>
                    </Modal>

                    {/* Demo 2: Volatility Risk Assessment Modal */}
                    <Modal>
                      <ModalTrigger asChild>
                        <Button variant="outline" className="gap-2 cursor-pointer">
                          <AlertTriangle className="w-4 h-4 text-warning" />
                          <span>Risk Assessment (size: lg)</span>
                        </Button>
                      </ModalTrigger>
                      <ModalContent size="lg">
                        <ModalHeader
                          tone="warning"
                          icon={<AlertTriangle className="w-5 h-5 text-warning" />}
                        >
                          <ModalTitle>Portfolio Risk & Sensitivity Exposure</ModalTitle>
                          <ModalDescription>
                            Comprehensive stress-test against simulated 15% benchmark market
                            drawdowns.
                          </ModalDescription>
                        </ModalHeader>
                        <ModalBody className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-3 rounded-lg bg-surface-raised border border-border">
                              <span className="text-caption text-text-muted font-numeric">
                                SHARPE RATIO
                              </span>
                              <p className="text-body-lg font-numeric font-bold text-text-primary mt-1">
                                2.41
                              </p>
                              <span className="text-caption text-success font-medium">
                                Optimal Risk-Reward
                              </span>
                            </div>
                            <div className="p-3 rounded-lg bg-surface-raised border border-border">
                              <span className="text-caption text-text-muted font-numeric">
                                BETA FACTOR
                              </span>
                              <p className="text-body-lg font-numeric font-bold text-text-primary mt-1">
                                0.78
                              </p>
                              <span className="text-caption text-primary font-medium">
                                Low Volatility
                              </span>
                            </div>
                            <div className="p-3 rounded-lg bg-surface-raised border border-border">
                              <span className="text-caption text-text-muted font-numeric">
                                VALUE AT RISK (95%)
                              </span>
                              <p className="text-body-lg font-numeric font-bold text-warning mt-1">
                                -3.12%
                              </p>
                              <span className="text-caption text-text-muted">
                                Max Expected Drawdown
                              </span>
                            </div>
                          </div>
                          <div className="p-4 rounded-lg bg-surface-raised border border-border space-y-2">
                            <h5 className="font-display font-semibold text-body-sm text-text-primary">
                              Advisory Recommendation
                            </h5>
                            <p className="text-body-sm text-text-secondary leading-relaxed">
                              Portfolio resilience is high. Rebalancing 5% from Mid-Cap Equities to
                              Sovereign Gold Bonds will optimize downside delta protection while
                              maintaining compounding trajectory.
                            </p>
                          </div>
                        </ModalBody>
                        <ModalFooter>
                          <Button variant="ghost" size="sm">
                            Dismiss
                          </Button>
                          <Button variant="accent" size="sm">
                            Download Risk Dossier
                          </Button>
                        </ModalFooter>
                      </ModalContent>
                    </Modal>

                    {/* Demo 3: Danger Revoke Access Modal */}
                    <Modal>
                      <ModalTrigger asChild>
                        <Button variant="danger" size="sm" className="gap-2 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revoke Mandate (size: sm)</span>
                        </Button>
                      </ModalTrigger>
                      <ModalContent size="sm">
                        <ModalHeader
                          tone="danger"
                          icon={<Trash2 className="w-5 h-5 text-danger" />}
                        >
                          <ModalTitle>Revoke Trading Mandate</ModalTitle>
                          <ModalDescription>
                            Are you sure you want to decouple the auto-SIP mandate?
                          </ModalDescription>
                        </ModalHeader>
                        <ModalBody>
                          <p className="text-body-sm text-text-secondary leading-relaxed">
                            Scheduled recurring investments for 3 active mutual funds will pause
                            immediately. No capital will be deducted next month.
                          </p>
                        </ModalBody>
                        <ModalFooter>
                          <Button variant="outline" size="sm">
                            Keep Active
                          </Button>
                          <Button variant="danger" size="sm">
                            Confirm Revocation
                          </Button>
                        </ModalFooter>
                      </ModalContent>
                    </Modal>
                  </div>
                </div>

                {/* 2. MULTI-DIRECTIONAL DRAWER (<Drawer />) */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Slide-in Viewport Drawer (
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Drawer /&gt;
                      </code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Edge-anchored sliding panels for side sheets, mobile drawers, and contextual
                      audit rails supporting{' '}
                      <code className="font-numeric text-primary">right</code>,{' '}
                      <code className="font-numeric text-primary">left</code>, and{' '}
                      <code className="font-numeric text-primary">bottom</code> placements.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Demo 1: Right Drawer (Transaction Audit Log) */}
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button variant="outline" className="gap-2 cursor-pointer">
                          <History className="w-4 h-4 text-primary" />
                          <span>Audit Trail (Right Drawer)</span>
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent side="right" size="md">
                        <DrawerHeader>
                          <DrawerTitle>Cryptographic Audit Ledger</DrawerTitle>
                          <DrawerDescription>
                            Verified transaction records for Kalya Reserve Vault #88219.
                          </DrawerDescription>
                        </DrawerHeader>
                        <DrawerBody className="space-y-4">
                          <div className="space-y-3">
                            {[
                              {
                                id: 'TXN-9941',
                                type: 'Sovereign Gold Purchase',
                                date: 'Today, 09:30 AM',
                                amt: '+₹2,50,000',
                                status: 'Settled',
                              },
                              {
                                id: 'TXN-9820',
                                type: 'Nifty 50 Index Rebalance',
                                date: 'Yesterday, 03:15 PM',
                                amt: '+₹1,00,000',
                                status: 'Settled',
                              },
                              {
                                id: 'TXN-9701',
                                type: 'Treasury Yield Credited',
                                date: '28 Sep 2026',
                                amt: '+₹14,280',
                                status: 'Credited',
                              },
                              {
                                id: 'TXN-9599',
                                type: 'Quarterly Custody Fee',
                                date: '25 Sep 2026',
                                amt: '-₹1,200',
                                status: 'Paid',
                              },
                            ].map((tx) => (
                              <div
                                key={tx.id}
                                className="p-3 rounded-lg border border-border bg-surface-raised space-y-1"
                              >
                                <div className="flex items-center justify-between text-body-sm">
                                  <span className="font-medium text-text-primary">{tx.type}</span>
                                  <span
                                    className={`font-numeric font-bold ${tx.amt.startsWith('+') ? 'text-success' : 'text-danger'}`}
                                  >
                                    {tx.amt}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-caption text-text-muted font-numeric">
                                  <span>
                                    {tx.id} · {tx.date}
                                  </span>
                                  <span className="text-primary font-medium">{tx.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </DrawerBody>
                        <DrawerFooter>
                          <Button variant="outline" size="sm">
                            Close
                          </Button>
                          <Button variant="default" size="sm">
                            Export CSV
                          </Button>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>

                    {/* Demo 2: Bottom Drawer (Quick Filter Sheet) */}
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button variant="subtle" className="gap-2 cursor-pointer">
                          <SlidersHorizontal className="w-4 h-4 text-primary" />
                          <span>Filter Sheet (Bottom Drawer)</span>
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent side="bottom" size="md">
                        <DrawerHeader>
                          <DrawerTitle>Filter Allocation Classes</DrawerTitle>
                          <DrawerDescription>
                            Filter holdings by risk tier, liquidity speed, and depository custody
                            status.
                          </DrawerDescription>
                        </DrawerHeader>
                        <DrawerBody className="space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              'High Yield Equities',
                              'Sovereign Debt',
                              'Physical Gold Bullion',
                              'Liquid Cash Equivalents',
                            ].map((cat, i) => (
                              <div
                                key={cat}
                                className={`p-3 rounded-lg border cursor-pointer select-none transition ${
                                  i < 2
                                    ? 'border-primary/40 bg-primary-subtle text-primary font-medium'
                                    : 'border-border bg-surface-raised text-text-secondary hover:text-text-primary'
                                }`}
                              >
                                <span className="text-body-sm block">{cat}</span>
                              </div>
                            ))}
                          </div>
                        </DrawerBody>
                        <DrawerFooter>
                          <Button variant="ghost" size="sm">
                            Reset All
                          </Button>
                          <Button variant="default" size="sm">
                            Apply Filters
                          </Button>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>

                    {/* Demo 3: Left Drawer (Navigation Rail) */}
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
                          <Layers className="w-3.5 h-3.5 text-accent" />
                          <span>Left Navigation Drawer</span>
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent side="left" size="sm">
                        <DrawerHeader>
                          <DrawerTitle>Wealth Navigation</DrawerTitle>
                          <DrawerDescription>Direct shortcuts to portfolio hubs.</DrawerDescription>
                        </DrawerHeader>
                        <DrawerBody className="space-y-2">
                          {[
                            'Portfolio Overview',
                            'Tax Harvest Enclave',
                            'Asset Rebalancing',
                            'Security Vault',
                            'Advisory Settings',
                          ].map((nav, i) => (
                            <div
                              key={nav}
                              className={`p-2.5 rounded-md text-body-sm font-medium cursor-pointer transition ${
                                i === 0
                                  ? 'bg-primary text-on-primary'
                                  : 'hover:bg-surface-raised text-text-primary'
                              }`}
                            >
                              {nav}
                            </div>
                          ))}
                        </DrawerBody>
                        <DrawerFooter>
                          <Button variant="outline" size="sm" className="w-full">
                            Close Menu
                          </Button>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                  </div>
                </div>

                {/* 3. ALERT DIALOG & BARE DIALOG GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Destructive AlertDialog */}
                  <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
                    <div>
                      <h4 className="font-display font-semibold text-text-primary text-body-lg">
                        Alert Confirmation (
                        <code className="text-primary font-numeric text-body-sm">
                          &lt;AlertDialog /&gt;
                        </code>
                        )
                      </h4>
                      <p className="text-caption text-text-muted">
                        Interruptive dialog for high-consequence irreversible operations.
                      </p>
                    </div>

                    <div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="danger" className="gap-2 cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                            <span>Liquidate Sovereign Vault</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Liquidate Sovereign Gold Allocation?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will initiate an immediate spot sale of 250 grams of 24K Physical
                              Sovereign Gold at current bullion rates (₹18,74,520). Proceeds will
                              transfer to your verified depository account on a T+1 cycle. This
                              action cannot be revoked.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Allocation</AlertDialogCancel>
                            <AlertDialogAction variant="danger">
                              Confirm Liquidation
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Standard Dialog */}
                  <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
                    <div>
                      <h4 className="font-display font-semibold text-text-primary text-body-lg">
                        Standard Dialog Primitive (
                        <code className="text-primary font-numeric text-body-sm">
                          &lt;Dialog /&gt;
                        </code>
                        )
                      </h4>
                      <p className="text-caption text-text-muted">
                        Unopinionated Radix modal container for custom workflows.
                      </p>
                    </div>

                    <div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="gap-2 cursor-pointer">
                            <Share2 className="w-4 h-4 text-primary" />
                            <span>Share Investment Snapshot</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Share Portfolio Snapshot</DialogTitle>
                            <DialogDescription>
                              Generate an end-to-end encrypted link for wealth advisors.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3 py-2">
                            <div className="p-3 rounded-lg bg-surface-raised border border-border flex items-center justify-between text-body-sm font-numeric">
                              <span className="text-text-muted truncate mr-2">
                                https://kalya.finance/p/v882-secure
                              </span>
                              <Button variant="subtle" size="sm">
                                Copy Link
                              </Button>
                            </div>
                            <p className="text-caption text-text-muted">
                              Link expires automatically in 24 hours. Sensitive account identifiers
                              remain masked.
                            </p>
                          </div>
                          <DialogFooter>
                            <Button variant="default" size="sm">
                              Done
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>

                {/* 4. TOOLTIPS & ANIMATED SPRING TOOLTIPS */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Tooltips (
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Tooltip /&gt;
                      </code>
                      ,{' '}
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;AnimatedTooltip /&gt;
                      </code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Snappy hover hints with Radix UI arrow collision avoidance and Framer Motion
                      spring physics with cursor-tilt.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Radix Standard Tooltips */}
                    <div className="space-y-3">
                      <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                        Radix Tooltip with Arrows (150ms delay)
                      </span>
                      <TooltipProvider>
                        <div className="flex flex-wrap items-center gap-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
                                <HelpCircle className="w-3.5 h-3.5 text-primary" />
                                <span>Compound Yield</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              Auto-reinvested daily into AAA-rated liquid debt funds
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
                                <Lock className="w-3.5 h-3.5 text-accent" />
                                <span>HSM Security</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              Keys held in FIPS 140-2 Level 3 hardware security module
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="subtle" size="sm" className="gap-2 cursor-pointer">
                                <Info className="w-3.5 h-3.5 text-primary" />
                                <span>Tax Harvest</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              Tax-loss harvesting calculates ₹85,000 in offset allowances
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </div>

                    {/* Framer Motion Animated Tooltip */}
                    <div className="space-y-3">
                      <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                        Framer Motion Spring Tooltips (Cursor/Position Aware)
                      </span>
                      <div className="flex items-center gap-4 pt-2">
                        {[
                          {
                            id: 'gold',
                            name: 'Gold Vault',
                            val: '24K Bullion · +14.2%',
                            icon: '🥇',
                          },
                          {
                            id: 'equity',
                            name: 'Alpha Index',
                            val: 'Nifty 50 · +22.8%',
                            icon: '📈',
                          },
                          {
                            id: 'debt',
                            name: 'Treasury Bonds',
                            val: 'Sovereign Yield · 7.4%',
                            icon: '🏛️',
                          },
                        ].map((item) => (
                          <div
                            key={item.id}
                            className="relative"
                            onMouseEnter={() => setHoveredTooltip(item.id)}
                            onMouseLeave={() => setHoveredTooltip(null)}
                          >
                            <div className="w-11 h-11 rounded-full bg-surface-raised border border-border flex items-center justify-center text-body-lg cursor-pointer hover:border-accent hover:scale-105 transition-all shadow-card">
                              {item.icon}
                            </div>
                            <AnimatedTooltip
                              show={hoveredTooltip === item.id}
                              text={item.val}
                              placement="top"
                              isLink={false}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* GROUP: USER FEEDBACK & NOTIFICATIONS (@/components/ui/feedback/*)     */}
            {/* ===================================================================== */}
            {(galleryFilter === 'all' || galleryFilter === 'feedback') && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-success" />
                  <h3 className="font-display font-bold text-text-primary text-display-sm">
                    User Feedback & Notifications
                  </h3>
                  <span className="text-caption font-numeric text-text-muted bg-surface-raised px-2 py-0.5 rounded-xs border border-border">
                    @/components/ui/feedback
                  </span>
                </div>

                {/* 1. TOAST NOTIFICATIONS (react-hot-toast + Framer Motion) */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Toast Notifications (
                      <code className="text-primary font-numeric text-body-sm">toast.*</code>)
                    </h4>
                    <p className="text-caption text-text-muted">
                      Floating notifications with color-coded side indicators, backdrop blur,
                      auto-dismiss countdown progress bars, action triggers, and Framer Motion
                      spring physics.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        toast.success('SIP Mandate Executed', {
                          description: '₹25,000 successfully allocated to Nifty 50 Index Fund.',
                          action: {
                            label: 'View Vault',
                            onClick: () => setActiveTab('overview'),
                          },
                        })
                      }
                      className="cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                      <span>Trigger Success Toast</span>
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        toast.error('Depository Sync Failed', {
                          description:
                            'CDSL gateway timed out during authentication handshake. Retrying in 10s.',
                          action: {
                            label: 'Retry Now',
                            onClick: () => toast.info('Retrying CDSL Handshake...'),
                          },
                        })
                      }
                      className="cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Trigger Error Toast</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast.warning('Portfolio Drift Exceeded', {
                          description:
                            'Equity allocation has reached 68.4% (exceeds recommended 60% threshold).',
                        })
                      }
                      className="cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      <span>Trigger Warning Toast</span>
                    </Button>

                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() =>
                        toast.info('Q3 Tax Dossier Ready', {
                          description:
                            'Annual capital gains breakdown report is compiled and available for export.',
                        })
                      }
                      className="cursor-pointer"
                    >
                      <Info className="w-4 h-4 text-primary" />
                      <span>Trigger Info Toast</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const toastId = toast.loading('Encrypting Vault Keys with HSM Enclave...');
                        setTimeout(() => {
                          toast.dismiss(toastId);
                          toast.success('Encryption Key Pair Stored Securely');
                        }, 2500);
                      }}
                      className="cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Trigger Loading Toast</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.dismiss()}
                      className="cursor-pointer text-text-muted hover:text-text-primary"
                    >
                      <span>Dismiss All</span>
                    </Button>
                  </div>
                </div>

                {/* 2. INLINE ALERT BANNERS (<Alert />) */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Inline Alert Banners (
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Alert /&gt;
                      </code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Semantic contextual alerts (
                      <code className="font-numeric text-primary">accent</code>,{' '}
                      <code className="font-numeric text-primary">info</code>,{' '}
                      <code className="font-numeric text-primary">success</code>,{' '}
                      <code className="font-numeric text-primary">warning</code>,{' '}
                      <code className="font-numeric text-primary">danger</code>) with auto-matching
                      icons, dismiss buttons, and action slots.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {/* Accent Alert */}
                    <Alert
                      variant="accent"
                      action={
                        <Button variant="default" size="sm" className="h-7 text-caption px-2.5">
                          View Auction Tranche
                        </Button>
                      }
                    >
                      <AlertTitle>Sovereign Gold Bullion Tranche Active</AlertTitle>
                      <AlertDescription>
                        Direct RBI Sovereign Gold Bond subscription window is open until 4:00 PM IST
                        today at zero issuance premium.
                      </AlertDescription>
                    </Alert>

                    {/* Info Alert */}
                    <Alert variant="info">
                      <AlertTitle>Advance Tax Assessment Window</AlertTitle>
                      <AlertDescription>
                        Q3 advance tax installment is due on 15 Dec 2026. Review harvestable capital
                        losses in the tax enclave to minimize net liability.
                      </AlertDescription>
                    </Alert>

                    {/* Success Alert */}
                    <Alert variant="success">
                      <AlertTitle>Depository Participant Handshake Verified</AlertTitle>
                      <AlertDescription>
                        Automated clearing mandate is confirmed with HDFC Wealth Services. Daily
                        sweep-in yield routing is running normally.
                      </AlertDescription>
                    </Alert>

                    {/* Warning Alert */}
                    <Alert variant="warning" dismissible>
                      <AlertTitle>Unhedged Currency Exposure Detected</AlertTitle>
                      <AlertDescription>
                        Foreign equity ETFs account for 22% of total assets without currency hedge.
                        USD/INR fluctuations may impact net portfolio yields.
                      </AlertDescription>
                    </Alert>

                    {/* Danger Alert */}
                    <Alert
                      variant="danger"
                      dismissible
                      action={
                        <Button variant="danger" size="sm" className="h-7 text-caption px-2.5">
                          Complete DigiLocker KYC
                        </Button>
                      }
                    >
                      <AlertTitle>Regulatory Mandate: Periodic KYC Re-verification</AlertTitle>
                      <AlertDescription>
                        SEBI guidelines require depository re-verification within 48 hours. Vault
                        trading will pause if compliance window lapses.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>

                {/* 3. ACCESSIBLE PROGRESS METERS (<Progress />) */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div>
                      <h4 className="font-display font-semibold text-text-primary text-body-lg">
                        Progress Meters (
                        <code className="text-primary font-numeric text-body-sm">
                          &lt;Progress /&gt;
                        </code>
                        )
                      </h4>
                      <p className="text-caption text-text-muted">
                        Fluid progress bars with color variants, size scales (
                        <code className="font-numeric text-primary">sm</code>,{' '}
                        <code className="font-numeric text-primary">md</code>,{' '}
                        <code className="font-numeric text-primary">lg</code>), numerical labels,
                        and infinite shimmer animation.
                      </p>
                    </div>

                    {/* Dynamic progress stepper */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-caption px-2.5"
                        onClick={() => setDynamicProgress((p) => Math.max(0, p - 10))}
                      >
                        -10%
                      </Button>
                      <span className="font-numeric font-semibold text-body-sm text-text-primary px-2">
                        {dynamicProgress}%
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-caption px-2.5"
                        onClick={() => setDynamicProgress((p) => Math.min(100, p + 10))}
                      >
                        +10%
                      </Button>
                      <Button
                        variant="subtle"
                        size="sm"
                        className="h-8 text-caption px-2.5 ml-1"
                        onClick={() => setDynamicProgress(100)}
                      >
                        100%
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {/* Dynamic interactive progress */}
                      <Progress
                        label="Emergency Cash Reserve Target (₹10,00,000 Goal)"
                        value={dynamicProgress}
                        showValue
                        size="md"
                        variant="default"
                      />

                      {/* Gold Accent Progress */}
                      <Progress
                        label="Sovereign Gold Vault Allocation Cap (25% Target)"
                        value={45}
                        showValue
                        size="md"
                        variant="accent"
                      />

                      {/* Success 100% Progress */}
                      <Progress
                        label="KYC & Legal Documentation Review"
                        value={100}
                        showValue
                        size="sm"
                        variant="success"
                      />
                    </div>

                    <div className="space-y-4">
                      {/* Danger Volatility Limit Progress */}
                      <Progress
                        label="Portfolio Downside Risk Buffer (Threshold: 90%)"
                        value={82}
                        showValue
                        size="sm"
                        variant="danger"
                      />

                      {/* Warning Drift Progress */}
                      <Progress
                        label="Equity Mid-Cap Concentration Limit"
                        value={68}
                        showValue
                        size="md"
                        variant="warning"
                      />

                      {/* Indeterminate Shimmer Progress */}
                      <Progress
                        label="Real-time Depository Settlement Consensus"
                        indeterminate
                        size="lg"
                        variant="gradient"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. PAGE-LEVEL ANNOUNCEMENT BANNERS */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Page-Level Announcement Banners (
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Banner /&gt;
                      </code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Full-width system broadcast banners for regulatory updates, maintenance
                      windows, and portfolio alerts.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Banner
                      variant="default"
                      action={
                        <Button size="xs" variant="secondary">
                          View Schedule
                        </Button>
                      }
                    >
                      Quarterly automated rebalancing scheduled for Saturday, 11:59 PM IST.
                    </Banner>

                    <Banner
                      variant="warning"
                      action={
                        <Button size="xs" variant="outline">
                          Update KYC
                        </Button>
                      }
                    >
                      SEBI Enhanced Due Diligence requires identity re-verification within 14 days.
                    </Banner>

                    <Banner variant="success">
                      All 14 depository holdings successfully verified and locked via Account
                      Aggregator.
                    </Banner>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* GROUP: DATA DISPLAY & CONTENT CONTAINERS (@/components/ui/data-display) */}
            {/* ===================================================================== */}
            {(galleryFilter === 'all' || galleryFilter === 'data-display') && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                  <h3 className="font-display font-bold text-text-primary text-display-sm">
                    Data Display &amp; Surface Containers
                  </h3>
                  <span className="text-caption font-numeric text-text-muted bg-surface-raised px-2 py-0.5 rounded-xs border border-border">
                    @/components/ui/data-display
                  </span>
                </div>

                {/* 1. CARDS & SURFACE CONTAINERS */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Cards &amp; Container Anatomy (
                      <code className="text-primary font-numeric text-body-sm">&lt;Card /&gt;</code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Modular surfaces featuring headers, actions, numeric metric bodies, media
                      slots, and tactile hover physics.
                    </p>
                  </div>

                  {/* Surface Variants Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Default Card */}
                    <Card variant="default">
                      <CardHeader
                        action={
                          <Badge variant="subtle" size="sm">
                            Active
                          </Badge>
                        }
                      >
                        <CardTitle>Liquid Reserve</CardTitle>
                        <CardDescription>Primary treasury yield pool</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <span className="font-numeric text-display-md font-bold text-text-primary">
                          ₹24,80,000
                        </span>
                        <div className="flex items-center gap-1.5 mt-2 text-caption text-success font-numeric font-medium">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>+8.42% net trailing yield</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <span>Reconciled 2 mins ago</span>
                        <ArrowUpRight className="h-4 w-4 text-text-muted" />
                      </CardFooter>
                    </Card>

                    {/* Raised Card */}
                    <Card variant="raised">
                      <CardHeader
                        action={
                          <Badge variant="accent" size="sm">
                            Gold Tier
                          </Badge>
                        }
                      >
                        <CardTitle>Sovereign Vault</CardTitle>
                        <CardDescription>24K physical gold allocation</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <span className="font-numeric text-display-md font-bold text-text-primary">
                          ₹17,71,500
                        </span>
                        <div className="flex items-center gap-1.5 mt-2 text-caption text-accent-strong font-numeric font-medium">
                          <Sparkles className="h-3.5 w-3.5 text-accent" />
                          <span>Inflation hedged reserve</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <span>Locked in RBI depository</span>
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </CardFooter>
                    </Card>

                    {/* Outlined Card */}
                    <Card variant="outlined">
                      <CardHeader
                        action={
                          <Badge variant="outline" size="sm">
                            Index
                          </Badge>
                        }
                      >
                        <CardTitle>Alpha Growth SIP</CardTitle>
                        <CardDescription>Top 100 high-growth equities</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <span className="font-numeric text-display-md font-bold text-text-primary">
                          ₹38,40,250
                        </span>
                        <div className="flex items-center gap-1.5 mt-2 text-caption text-success font-numeric font-medium">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>+14.65% annualized alpha</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <span>Monthly auto-rebalance</span>
                        <RefreshCw className="h-4 w-4 text-text-muted" />
                      </CardFooter>
                    </Card>

                    {/* Interactive Tactile Card */}
                    <Card
                      variant="interactive"
                      animated
                      onClick={() =>
                        toast.success('Interactive Card Clicked', {
                          description: 'Framer motion spring physics engaged.',
                        })
                      }
                    >
                      <CardHeader
                        action={
                          <Badge variant="success" size="sm" dot>
                            Live
                          </Badge>
                        }
                      >
                        <CardTitle>Tactile Press Card</CardTitle>
                        <CardDescription>Click to trigger micro-interaction</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <span className="font-numeric text-display-md font-bold text-primary">
                          scale(0.98)
                        </span>
                        <p className="text-caption text-text-secondary mt-2">
                          Elevation shift on hover with accessible focus outline.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <span className="text-primary font-medium">Click to inspect →</span>
                      </CardFooter>
                    </Card>
                  </div>

                  {/* Expandable Disclosure Card */}
                  <ExpandableCard
                    title="Automated Drift Rebalancing Ruleset"
                    subtitle="Click to expand dynamic portfolio threshold guidelines and trigger bands"
                    defaultExpanded={true}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-caption">
                      <div className="p-3 rounded-md bg-surface-raised border border-border">
                        <span className="font-semibold text-text-primary block">Equities Band</span>
                        <span className="text-text-muted">Target: 60% ± 4.5% drift threshold</span>
                      </div>
                      <div className="p-3 rounded-md bg-surface-raised border border-border">
                        <span className="font-semibold text-text-primary block">
                          Fixed Income Band
                        </span>
                        <span className="text-text-muted">Target: 25% ± 3.0% drift threshold</span>
                      </div>
                      <div className="p-3 rounded-md bg-surface-raised border border-border">
                        <span className="font-semibold text-text-primary block">
                          Gold / Commodities
                        </span>
                        <span className="text-text-muted">Target: 15% ± 2.0% drift threshold</span>
                      </div>
                    </div>
                  </ExpandableCard>
                </div>

                {/* 2. BADGES & NUMERICAL TAGS */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Badges &amp; Status Tags (
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Badge /&gt;
                      </code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Semantic status tags with pulsing status dots, icon slots, size variants, and
                      removable dismiss triggers.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="default">Primary Badge</Badge>
                      <Badge variant="secondary">Secondary Surface</Badge>
                      <Badge variant="accent">Gold Accent</Badge>
                      <Badge variant="subtle">Subtle Emerald</Badge>
                      <Badge variant="outline">Outlined Tag</Badge>
                      <Badge variant="success" dot dotColor="success">
                        +14.2% Verified
                      </Badge>
                      <Badge variant="warning" dot dotColor="warning">
                        Pending Rebalance
                      </Badge>
                      <Badge variant="danger" dot dotColor="danger">
                        Breached Threshold
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60">
                      <span className="text-caption text-text-muted font-numeric mr-2 font-semibold">
                        SIZES:
                      </span>
                      <Badge size="sm" variant="subtle">
                        Small (h-5)
                      </Badge>
                      <Badge size="md" variant="subtle">
                        Medium (h-6)
                      </Badge>
                      <Badge size="lg" variant="subtle">
                        Large (h-7)
                      </Badge>

                      <span className="text-caption text-text-muted font-numeric mx-2 font-semibold">
                        REMOVABLE:
                      </span>
                      <Badge
                        variant="outline"
                        removable
                        onRemove={() => {
                          toast.info('Asset Filter Removed');
                        }}
                      >
                        Equity Feeder
                      </Badge>
                      <Badge
                        variant="subtle"
                        removable
                        onRemove={() => {
                          toast.info('Tag Cleared');
                        }}
                      >
                        Tax-Harvested
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* 3. DATA TABLE (Enterprise Wealth Ledger) */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-display font-semibold text-text-primary text-body-lg">
                        Enterprise Data Table (
                        <code className="text-primary font-numeric text-body-sm">
                          &lt;DataTable /&gt;
                        </code>
                        )
                      </h4>
                      <p className="text-caption text-text-muted">
                        High-precision tabular data with column sorting, fuzzy search filtering,
                        bulk row selection, indeterminate checkbox state, and responsive pagination.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          setTableLoadingDemo(true);
                          setTimeout(() => setTableLoadingDemo(false), 800);
                        }}
                      >
                        Simulate Loading
                      </Button>
                    </div>
                  </div>

                  <DataTable<HoldingRecord>
                    title="Depository Asset Ledger"
                    data={SAMPLE_HOLDINGS}
                    columns={[
                      {
                        key: 'name',
                        header: 'Asset & Identifier',
                        sortable: true,
                        cell: (item) => (
                          <div className="flex flex-col">
                            <span className="font-semibold text-text-primary">{item.name}</span>
                            <span className="text-caption font-numeric text-text-muted">
                              {item.ticker}
                            </span>
                          </div>
                        ),
                      },
                      {
                        key: 'assetClass',
                        header: 'Asset Class',
                        sortable: true,
                        cell: (item) => (
                          <Badge variant="outline" size="sm">
                            {item.assetClass}
                          </Badge>
                        ),
                      },
                      {
                        key: 'value',
                        header: 'Holding Value',
                        sortable: true,
                        className: 'text-right font-numeric',
                        sortValue: (item) => item.allocation,
                        cell: (item) => (
                          <span className="font-numeric font-medium">{item.value}</span>
                        ),
                      },
                      {
                        key: 'allocation',
                        header: 'Weight',
                        sortable: true,
                        className: 'text-right font-numeric',
                        sortValue: (item) => item.allocation,
                        cell: (item) => (
                          <span className="font-numeric">{item.allocation.toFixed(1)}%</span>
                        ),
                      },
                      {
                        key: 'change24h',
                        header: '24h Yield',
                        sortable: true,
                        className: 'text-right font-numeric',
                        sortValue: (item) => item.change24h,
                        cell: (item) => (
                          <Badge variant={item.change24h >= 0 ? 'success' : 'danger'} size="sm" dot>
                            {item.change24h >= 0 ? `+${item.change24h}%` : `${item.change24h}%`}
                          </Badge>
                        ),
                      },
                      {
                        key: 'status',
                        header: 'Status',
                        cell: (item) => (
                          <Badge
                            variant={
                              item.status === 'active'
                                ? 'subtle'
                                : item.status === 'rebalancing'
                                  ? 'warning'
                                  : 'secondary'
                            }
                            size="sm"
                          >
                            {item.status}
                          </Badge>
                        ),
                      },
                    ]}
                    keyExtractor={(item) => item.id}
                    selectable={true}
                    selectedKeys={tableSelectedKeys}
                    onSelectionChange={setTableSelectedKeys}
                    isLoading={tableLoadingDemo}
                    pageSize={4}
                  />
                </div>

                {/* 4. AVATARS & IDENTITIES */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Avatars &amp; User Identities (
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Avatar /&gt;
                      </code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      User identity indicators with initials fallback, status dots (online, away,
                      busy, offline), and overlapping stack groups.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Size scale with status dots */}
                    <div className="p-4 rounded-md bg-surface-raised border border-border space-y-3">
                      <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                        Scale &amp; Status Indicators
                      </span>
                      <div className="flex items-center gap-4">
                        <Avatar size="xs" status="online">
                          <AvatarFallback>AK</AvatarFallback>
                        </Avatar>
                        <Avatar size="sm" status="away">
                          <AvatarFallback>VP</AvatarFallback>
                        </Avatar>
                        <Avatar size="md" status="busy">
                          <AvatarFallback>RD</AvatarFallback>
                        </Avatar>
                        <Avatar size="lg" status="online">
                          <AvatarFallback>KY</AvatarFallback>
                        </Avatar>
                        <Avatar size="xl" status="online">
                          <AvatarFallback>IN</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>

                    {/* Avatar Group */}
                    <div className="p-4 rounded-md bg-surface-raised border border-border space-y-3">
                      <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                        Stacked AvatarGroup
                      </span>
                      <div className="flex items-center gap-4 pt-1">
                        <AvatarGroup max={4} total={12}>
                          <Avatar size="md">
                            <AvatarFallback>AK</AvatarFallback>
                          </Avatar>
                          <Avatar size="md">
                            <AvatarFallback>VP</AvatarFallback>
                          </Avatar>
                          <Avatar size="md">
                            <AvatarFallback>RD</AvatarFallback>
                          </Avatar>
                          <Avatar size="md">
                            <AvatarFallback>KY</AvatarFallback>
                          </Avatar>
                        </AvatarGroup>
                        <span className="text-caption text-text-secondary font-medium">
                          12 Investment Committee Signers
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. ACCORDION DISCLOSURES */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Accordion Disclosures (
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Accordion /&gt;
                      </code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Expandable disclosure items with animated chevron rotation and keyboard
                      navigation.
                    </p>
                  </div>

                  <Accordion type="single" defaultValue="tax">
                    <AccordionItem value="tax">
                      <AccordionTrigger icon={<ShieldCheck className="h-4 w-4 text-primary" />}>
                        Tax Loss Harvesting Mechanism
                      </AccordionTrigger>
                      <AccordionContent>
                        Kalya automatically scans your equity holdings for realized and unrealized
                        capital losses, opportunistically harvesting offsets to reduce your annual
                        tax liability under Section 112A of the Income Tax Act.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="custody">
                      <AccordionTrigger icon={<Lock className="h-4 w-4 text-primary" />}>
                        Institutional Depository Security &amp; Custody
                      </AccordionTrigger>
                      <AccordionContent>
                        All underlying securities are deposited directly in your name with
                        SEBI-registered depositories (CDSL &amp; NSDL). Kalya never holds client
                        capital or commingles treasury assets.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="rebalancing">
                      <AccordionTrigger icon={<RefreshCw className="h-4 w-4 text-primary" />}>
                        Dynamic Multi-Asset Volatility Rebalancing
                      </AccordionTrigger>
                      <AccordionContent>
                        When asset class distributions drift beyond target volatility boundaries
                        (e.g. ±4.5% on Equities), automated smart orders reallocate surpluses into
                        fixed income and sovereign gold reserves.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* GROUP: NAVIGATION SYSTEMS (@/components/ui/navigation/*)               */}
            {/* ===================================================================== */}
            {(galleryFilter === 'all' || galleryFilter === 'navigation') && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <h3 className="font-display font-bold text-text-primary text-display-sm">
                    Navigation &amp; Orientation Systems
                  </h3>
                  <span className="text-caption font-numeric text-text-muted bg-surface-raised px-2 py-0.5 rounded-xs border border-border">
                    @/components/ui/navigation
                  </span>
                </div>

                {/* 1. TABS SYSTEM */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Tabs Navigation (
                      <code className="text-primary font-numeric text-body-sm">&lt;Tabs /&gt;</code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Segmented pill, underline, and enclosed tabs supporting horizontal/vertical
                      layouts, icons, and numerical badges.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Pill Variant */}
                    <div className="space-y-3">
                      <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                        Segmented Pill Style (variant="pill")
                      </span>
                      <Tabs defaultValue="holdings">
                        <TabsList variant="pill">
                          <TabsTrigger
                            value="holdings"
                            icon={<Wallet className="h-3.5 w-3.5" />}
                            badge={
                              <Badge size="sm" variant="subtle">
                                6
                              </Badge>
                            }
                          >
                            Holdings
                          </TabsTrigger>
                          <TabsTrigger
                            value="allocations"
                            icon={<BarChart3 className="h-3.5 w-3.5" />}
                          >
                            Allocations
                          </TabsTrigger>
                          <TabsTrigger
                            value="analytics"
                            icon={<TrendingUp className="h-3.5 w-3.5" />}
                          >
                            Analytics
                          </TabsTrigger>
                          <TabsTrigger value="settings" icon={<Settings className="h-3.5 w-3.5" />}>
                            Mandates
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent
                          value="holdings"
                          className="p-4 rounded-lg bg-surface-raised border border-border text-body-sm text-text-secondary"
                        >
                          Holdings panel view: Comprehensive breakdown of Indian Equities, Sovereign
                          Gold, and Treasury Repos.
                        </TabsContent>
                        <TabsContent
                          value="allocations"
                          className="p-4 rounded-lg bg-surface-raised border border-border text-body-sm text-text-secondary"
                        >
                          Allocations panel view: Dynamic asset weighting distribution matrix.
                        </TabsContent>
                        <TabsContent
                          value="analytics"
                          className="p-4 rounded-lg bg-surface-raised border border-border text-body-sm text-text-secondary"
                        >
                          Analytics panel view: Sharpe ratio, Max drawdown, and Alpha generation
                          metrics.
                        </TabsContent>
                        <TabsContent
                          value="settings"
                          className="p-4 rounded-lg bg-surface-raised border border-border text-body-sm text-text-secondary"
                        >
                          Mandates panel view: Execution parameters and periodic auto-rebalancing
                          rules.
                        </TabsContent>
                      </Tabs>
                    </div>

                    {/* Underline Variant */}
                    <div className="space-y-3 pt-2 border-t border-border/60">
                      <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                        Underline Style (variant="underline")
                      </span>
                      <Tabs defaultValue="overview">
                        <TabsList variant="underline">
                          <TabsTrigger value="overview">Executive Overview</TabsTrigger>
                          <TabsTrigger value="transactions">Transaction Ledger</TabsTrigger>
                          <TabsTrigger value="tax">Tax Optimization</TabsTrigger>
                        </TabsList>
                        <TabsContent
                          value="overview"
                          className="p-4 text-body-sm text-text-secondary"
                        >
                          High-level overview showing total net asset value and consolidated
                          portfolio performance.
                        </TabsContent>
                        <TabsContent
                          value="transactions"
                          className="p-4 text-body-sm text-text-secondary"
                        >
                          Real-time depository transaction audit ledger.
                        </TabsContent>
                        <TabsContent value="tax" className="p-4 text-body-sm text-text-secondary">
                          Harvested tax losses and long-term capital gain optimization reports.
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </div>

                {/* 2. BREADCRUMBS */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Breadcrumbs Hierarchy (
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Breadcrumb /&gt;
                      </code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Semantic route tracking adhering to WCAG 2.2 navigation standards with
                      clickable path links and separators.
                    </p>
                  </div>

                  <div className="p-4 rounded-md bg-surface-raised border border-border space-y-3">
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbLink href="#home">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink href="#portfolios">Portfolios</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbEllipsis />
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink href="#equities">Indian Equities</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>Nifty 50 Index Fund</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                </div>

                {/* 3. PAGINATION SYSTEMS */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Pagination Systems (
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Pagination /&gt;
                      </code>
                      ,{' '}
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;ResponsivePagination /&gt;
                      </code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Accessible page controls with smart ellipsis truncation and rows per page
                      selector.
                    </p>
                  </div>

                  <div className="p-5 rounded-md bg-surface-raised border border-border">
                    <ResponsivePagination
                      currentPage={navPaginationPage}
                      totalPages={12}
                      onPageChange={setNavPaginationPage}
                      pageSize={navPageSize}
                      onPageSizeChange={setNavPageSize}
                    />
                  </div>
                </div>

                {/* 4. SIDEBAR NAVIGATION */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Collapsible Sidebar Navigation (
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Sidebar /&gt;
                      </code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Multi-level navigation shell with active state indicator lines, nested
                      accordions, and badge counters.
                    </p>
                  </div>

                  <div className="flex border border-border rounded-xl overflow-hidden max-w-md bg-surface">
                    <Sidebar className="w-full border-r-0">
                      <SidebarHeader>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-primary text-on-primary flex items-center justify-center font-bold text-caption">
                            K
                          </div>
                          <span className="font-display font-bold text-text-primary text-body-md">
                            Kalya Ledger
                          </span>
                        </div>
                      </SidebarHeader>

                      <SidebarContent>
                        <SidebarGroup label="Core Platform">
                          <SidebarItem icon={<LayoutDashboard className="h-4 w-4" />} active>
                            Dashboard Overview
                          </SidebarItem>
                          <SidebarItem
                            icon={<Wallet className="h-4 w-4" />}
                            badge={
                              <Badge size="sm" variant="subtle">
                                Live
                              </Badge>
                            }
                          >
                            Asset Portfolios
                          </SidebarItem>
                          <SidebarItem icon={<BarChart3 className="h-4 w-4" />}>
                            Performance Analytics
                          </SidebarItem>
                        </SidebarGroup>

                        <SidebarGroup label="Configuration">
                          <SidebarSubMenu
                            title="Wealth Mandates"
                            icon={<FileText className="h-4 w-4" />}
                            defaultOpen
                          >
                            <SidebarItem icon={<ArrowRight className="h-3 w-3" />}>
                              SIP Automated Rebalance
                            </SidebarItem>
                            <SidebarItem icon={<ArrowRight className="h-3 w-3" />}>
                              Tax Loss Harvester
                            </SidebarItem>
                          </SidebarSubMenu>
                          <SidebarItem icon={<Settings className="h-4 w-4" />}>
                            Account Settings
                          </SidebarItem>
                        </SidebarGroup>
                      </SidebarContent>
                    </Sidebar>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* GROUP 1: STATES COMPONENTS (@/components/ui/states/*)                 */}
            {/* ===================================================================== */}
            {(galleryFilter === 'all' || galleryFilter === 'states') && (
              <div className="space-y-8">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <h3 className="font-display font-bold text-text-primary text-display-sm">
                    1. States & Feedback Components
                  </h3>
                  <span className="text-caption font-numeric text-text-muted bg-surface-raised px-2 py-0.5 rounded-xs border border-border">
                    @/components/ui/states
                  </span>
                </div>

                {/* 1.1 SPINNER MATRIX & INTERACTIVE BUTTON */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div>
                      <h4 className="font-display font-semibold text-text-primary text-body-lg">
                        Spinner Component (
                        <code className="text-primary font-numeric text-body-sm">
                          &lt;Spinner /&gt;
                        </code>
                        )
                      </h4>
                      <p className="text-caption text-text-muted">
                        Scalable SVG spinner with theme-aware tokens and screen reader accessibility
                        (<code className="font-numeric">role="status"</code>).
                      </p>
                    </div>

                    {/* Interactive Button Testbed */}
                    <button
                      onClick={handleSpinnerButtonClick}
                      disabled={isSpinnerBtnLoading}
                      className="px-4 py-2 rounded-sm bg-primary text-on-primary hover:bg-primary-hover disabled:opacity-80 transition shadow-card text-body-sm font-medium flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                    >
                      {isSpinnerBtnLoading ? (
                        <>
                          <Spinner size="sm" variant="white" />
                          <span>Processing Transaction...</span>
                        </>
                      ) : spinnerBtnSuccess ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-accent" />
                          <span>Transaction Verified!</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          <span>Test Spinner in Button</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Size Matrix */}
                  <div className="space-y-3">
                    <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                      Size Scale (`size="xs" | "sm" | "md" | "lg" | "xl"`)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                        <div
                          key={sz}
                          className="p-4 rounded-md bg-surface-raised border border-border flex flex-col items-center justify-center gap-2"
                        >
                          <Spinner size={sz} variant="primary" />
                          <span className="font-numeric text-caption font-bold text-text-primary">
                            size="{sz}"
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Color Variant Matrix */}
                  <div className="space-y-3 pt-2">
                    <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                      Color Variants (`variant="primary" | "accent" | "muted" | "white" |
                      "current"`)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {[
                        {
                          variant: 'primary' as const,
                          bg: 'bg-surface-raised',
                          text: 'text-text-primary',
                        },
                        {
                          variant: 'accent' as const,
                          bg: 'bg-surface-raised',
                          text: 'text-text-primary',
                        },
                        {
                          variant: 'muted' as const,
                          bg: 'bg-surface-raised',
                          text: 'text-text-primary',
                        },
                        { variant: 'white' as const, bg: 'bg-primary', text: 'text-white' },
                        {
                          variant: 'current' as const,
                          bg: 'bg-accent text-white',
                          text: 'text-white',
                        },
                      ].map((item) => (
                        <div
                          key={item.variant}
                          className={`p-4 rounded-md border border-border flex flex-col items-center justify-center gap-2 ${item.bg}`}
                        >
                          <Spinner size="md" variant={item.variant} />
                          <span className={`font-numeric text-caption font-bold ${item.text}`}>
                            variant="{item.variant}"
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 1.2 SKELETON COMPONENT SHOWCASE */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div>
                      <h4 className="font-display font-semibold text-text-primary text-body-lg">
                        Skeleton Component (
                        <code className="text-primary font-numeric text-body-sm">
                          &lt;Skeleton /&gt;
                        </code>
                        )
                      </h4>
                      <p className="text-caption text-text-muted">
                        Surface-raised placeholder placeholders supporting pulse and shimmer
                        animations.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsSkeletonDemoLoading((prev) => !prev)}
                      className="px-3.5 py-1.5 rounded-sm bg-surface-raised border border-border text-text-primary hover:bg-surface text-caption font-numeric font-semibold transition cursor-pointer flex items-center gap-2 self-start sm:self-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>
                        {isSkeletonDemoLoading
                          ? 'Switch to Loaded View'
                          : 'Switch to Skeleton Mode'}
                      </span>
                    </button>
                  </div>

                  {/* Interactive Card Skeleton Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-4">
                      <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                        Live Preview:{' '}
                        {isSkeletonDemoLoading ? 'Skeleton State (Shimmer)' : 'Loaded Data State'}
                      </span>

                      <div className="p-5 rounded-lg bg-surface-raised border border-border shadow-card space-y-4">
                        {isSkeletonDemoLoading ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Skeleton
                                variant="circular"
                                className="w-12 h-12 shrink-0"
                                animation="shimmer"
                              />
                              <div className="space-y-1.5 flex-1">
                                <Skeleton
                                  variant="text"
                                  className="w-3/4 h-4"
                                  animation="shimmer"
                                />
                                <Skeleton variant="text" className="w-1/2 h-3" />
                              </div>
                            </div>
                            <div className="space-y-2 pt-2">
                              <Skeleton variant="text" className="w-full h-3" />
                              <Skeleton variant="text" className="w-5/6 h-3" />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <Skeleton className="h-6 w-24 rounded-full" animation="pulse" />
                              <Skeleton className="h-8 w-28 rounded-sm" animation="shimmer" />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 animate-fadeIn">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-display font-bold text-body-lg shrink-0">
                                RK
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-display font-bold text-text-primary text-body-md truncate">
                                  Raushan Kumar
                                </h5>
                                <span className="text-caption text-text-muted block">
                                  Prime Portfolio · Tier 1 Wealth Enclave
                                </span>
                              </div>
                            </div>
                            <p className="text-text-secondary text-body-sm leading-relaxed">
                              Asset allocation is actively managed across index equity SIPs,
                              Sovereign Gold Bonds, and debt securities.
                            </p>
                            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-success-subtle text-success text-caption font-medium border border-success/20">
                                ● 99.4% Health Score
                              </span>
                              <button className="px-3.5 py-1.5 rounded-sm bg-primary text-on-primary text-caption font-medium shadow-card hover:bg-primary-hover transition cursor-pointer">
                                View Analytics
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shape Variants Showcase */}
                    <div className="space-y-4">
                      <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                        Variants & Animation Modes
                      </span>
                      <div className="space-y-3">
                        <div className="p-3 rounded-md bg-surface-raised border border-border space-y-2">
                          <span className="text-caption font-numeric text-text-secondary">
                            variant="circular" (Avatar)
                          </span>
                          <div className="flex items-center gap-3">
                            <Skeleton
                              variant="circular"
                              className="w-10 h-10"
                              animation="shimmer"
                            />
                            <Skeleton variant="circular" className="w-8 h-8" animation="pulse" />
                            <Skeleton variant="circular" className="w-6 h-6" animation="none" />
                          </div>
                        </div>

                        <div className="p-3 rounded-md bg-surface-raised border border-border space-y-2">
                          <span className="text-caption font-numeric text-text-secondary">
                            variant="text" (Multi-line Shimmer)
                          </span>
                          <div className="space-y-1.5">
                            <Skeleton variant="text" className="w-full" animation="shimmer" />
                            <Skeleton variant="text" className="w-4/5" animation="shimmer" />
                            <Skeleton variant="text" className="w-2/3" animation="shimmer" />
                          </div>
                        </div>

                        <div className="p-3 rounded-md bg-surface-raised border border-border space-y-2">
                          <span className="text-caption font-numeric text-text-secondary">
                            animation="pulse" vs "shimmer"
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            <Skeleton className="h-8 rounded-sm" animation="pulse" />
                            <Skeleton className="h-8 rounded-sm" animation="shimmer" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1.3 EMPTY STATE SHOWCASE */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
                  <div className="pb-2 border-b border-border">
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      EmptyState Component (
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;EmptyState /&gt;
                      </code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Full zero-state layout featuring icons, responsive action slots, and animated
                      Framer Motion transitions.
                    </p>
                  </div>

                  <div className="max-w-2xl mx-auto py-2">
                    <EmptyState
                      icon={<FolderPlus className="w-7 h-7 text-primary" />}
                      title="No Custom Portfolios Found"
                      description="Create your first targeted investment basket or connect a registered brokerage to track NAV performance automatically."
                      action={
                        <button
                          onClick={() => setPortalOpen(true)}
                          className="px-4 py-2 rounded-sm bg-primary text-on-primary hover:bg-primary-hover font-medium text-body-sm shadow-card transition cursor-pointer flex items-center gap-2"
                        >
                          <PlusCircle className="w-4 h-4 text-accent" />
                          <span>Create Portfolio Vault</span>
                        </button>
                      }
                      secondaryAction={
                        <button className="px-4 py-2 rounded-sm bg-surface border border-border text-text-primary hover:bg-surface-raised font-medium text-body-sm transition cursor-pointer">
                          Import CAS Statement
                        </button>
                      }
                    />
                  </div>
                </div>

                {/* 1.4 ERROR STATE SHOWCASE */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
                  <div className="pb-2 border-b border-border">
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      ErrorState Component (
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;ErrorState /&gt;
                      </code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Semantic danger container with technical errorCode badge, retry callback
                      hooks, and light/dark theme tokens.
                    </p>
                  </div>

                  <div className="max-w-2xl mx-auto py-2">
                    {errorDismissed ? (
                      <div className="p-6 rounded-xl bg-success-subtle border border-success/30 text-center space-y-2 animate-fadeIn">
                        <CheckCircle2 className="w-8 h-8 text-success mx-auto" />
                        <h4 className="font-display font-bold text-text-primary text-body-lg">
                          Connection Successfully Re-established
                        </h4>
                        <p className="text-caption text-text-secondary">
                          Consent telemetry verified with RBI Account Aggregator protocol.
                        </p>
                        <button
                          onClick={() => setErrorDismissed(false)}
                          className="mt-2 px-3 py-1 rounded-sm bg-surface border border-border text-caption font-numeric text-text-secondary hover:text-text-primary"
                        >
                          Reset Demo
                        </button>
                      </div>
                    ) : (
                      <ErrorState
                        errorCode="ERR_ACCOUNT_AGGREGATOR_504"
                        title="Consent Mandate Expired"
                        message="Your financial information provider (FIP) authorization window has passed. Refresh consent token to maintain live balances."
                        onRetry={handleErrorStateRetry}
                        retryLabel={isErrorRetrying ? 'Authorizing Handshake...' : 'Renew Mandate'}
                        icon={isErrorRetrying ? <Spinner size="lg" variant="primary" /> : undefined}
                        action={
                          <button className="px-4 py-2 rounded-sm bg-surface border border-border text-text-primary hover:bg-surface-raised font-medium text-body-sm transition cursor-pointer">
                            View Documentation
                          </button>
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* GROUP 2: UTILITIES COMPONENTS (@/components/ui/utilities/*)           */}
            {/* ===================================================================== */}
            {(galleryFilter === 'all' || galleryFilter === 'utilities') && (
              <div className="space-y-8">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                  <h3 className="font-display font-bold text-text-primary text-display-sm">
                    2. Layout & Viewport Utilities
                  </h3>
                  <span className="text-caption font-numeric text-text-muted bg-surface-raised px-2 py-0.5 rounded-xs border border-border">
                    @/components/ui/utilities
                  </span>
                </div>

                {/* 2.1 SEPARATOR SHOWCASE */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-text-primary text-body-lg">
                      Separator Component (
                      <code className="text-primary font-numeric text-body-sm">
                        &lt;Separator /&gt;
                      </code>
                      )
                    </h4>
                    <p className="text-caption text-text-muted">
                      Semantic horizontal & vertical dividers supporting centered label badges and
                      brand color tints.
                    </p>
                  </div>

                  {/* Horizontal Variants */}
                  <div className="space-y-4">
                    <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                      Horizontal Variants (`variant="default" | "subtle" | "strong" | "primary" |
                      "accent"`)
                    </span>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[11px] font-numeric text-text-muted">
                          variant="default"
                        </span>
                        <Separator variant="default" className="my-1.5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-numeric text-text-muted">
                          variant="subtle"
                        </span>
                        <Separator variant="subtle" className="my-1.5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-numeric text-text-muted">
                          variant="strong"
                        </span>
                        <Separator variant="strong" className="my-1.5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-numeric text-text-muted">
                          variant="primary"
                        </span>
                        <Separator variant="primary" className="my-1.5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-numeric text-text-muted">
                          variant="accent"
                        </span>
                        <Separator variant="accent" className="my-1.5" />
                      </div>
                    </div>
                  </div>

                  {/* Labeled Dividers */}
                  <div className="space-y-4 pt-2">
                    <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                      Labeled Dividers (`label="..."`)
                    </span>
                    <div className="space-y-2">
                      <Separator label="TRANSACTION AUDIT LEDGER" variant="default" />
                      <Separator label="SECURITY & BIOMETRIC ENCLAVE" variant="primary" />
                      <Separator label="OR CONTINUE WITH OAUTH2" variant="accent" />
                    </div>
                  </div>

                  {/* Vertical Separator Showcase */}
                  <div className="space-y-3 pt-2">
                    <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                      Vertical Orientation in Toolbars (`orientation="vertical"`)
                    </span>
                    <div className="flex items-center gap-3 p-3 rounded-md bg-surface-raised border border-border w-fit">
                      <button className="text-body-sm font-medium text-text-primary hover:text-primary transition">
                        Overview
                      </button>
                      <Separator orientation="vertical" className="h-5" />
                      <button className="text-body-sm font-medium text-text-secondary hover:text-text-primary transition">
                        Holdings
                      </button>
                      <Separator orientation="vertical" className="h-5" />
                      <button className="text-body-sm font-medium text-text-secondary hover:text-text-primary transition">
                        Orders
                      </button>
                      <Separator orientation="vertical" variant="accent" className="h-5" />
                      <span className="text-caption font-numeric text-accent-strong font-semibold">
                        Live (NSE)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2.2 ASPECT RATIO SHOWCASE */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div>
                      <h4 className="font-display font-semibold text-text-primary text-body-lg">
                        AspectRatio Component (
                        <code className="text-primary font-numeric text-body-sm">
                          &lt;AspectRatio /&gt;
                        </code>
                        )
                      </h4>
                      <p className="text-caption text-text-muted">
                        Fluid container maintaining exact aspect ratios (16:9, 4:3, 1:1, 21:9)
                        across dynamic viewports.
                      </p>
                    </div>

                    {/* Interactive Ratio Switcher */}
                    <div className="flex items-center gap-1 p-1 rounded-md bg-surface-raised border border-border self-start sm:self-auto">
                      {(
                        [
                          { ratio: 16 / 9, label: '16:9 Display' },
                          { ratio: 4 / 3, label: '4:3 Document' },
                          { ratio: 1 / 1, label: '1:1 Vault' },
                          { ratio: 21 / 9, label: '21:9 Ticker' },
                        ] as const
                      ).map((item) => (
                        <button
                          key={item.label}
                          onClick={() => setActiveAspectRatio(item.ratio)}
                          className={`px-2.5 py-1 rounded-xs text-caption font-numeric font-medium transition cursor-pointer ${
                            activeAspectRatio === item.ratio
                              ? 'bg-primary text-on-primary shadow-xs'
                              : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Responsive Aspect Ratio Container */}
                  <div className="max-w-2xl mx-auto">
                    <AspectRatio
                      ratio={activeAspectRatio}
                      animated={true}
                      className="rounded-xl border border-border/80 bg-surface-raised overflow-hidden shadow-card flex flex-col justify-between p-6 relative group"
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                          <span className="font-display font-bold text-text-primary text-body-md">
                            Kalya Telemetry Viewport
                          </span>
                        </div>
                        <span className="font-numeric text-caption px-2 py-0.5 rounded-xs bg-surface border border-border text-primary font-bold">
                          ratio={activeAspectRatio.toFixed(3)}
                        </span>
                      </div>

                      <div className="text-center relative z-10 space-y-1">
                        <span className="numeric text-display-md sm:text-display-lg font-bold text-text-primary block">
                          ₹18,74,520
                        </span>
                        <span className="text-caption text-text-muted font-numeric">
                          Constrained automatically by CSS aspectRatio token
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-caption text-text-secondary relative z-10 pt-2 border-t border-border/40 font-numeric">
                        <span>Responsive Height Scaling</span>
                        <span className="text-accent font-semibold">100% Geometry Protected</span>
                      </div>
                    </AspectRatio>
                  </div>
                </div>

                {/* 2.3 PORTAL SHOWCASE */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div>
                      <h4 className="font-display font-semibold text-text-primary text-body-lg">
                        Portal Component (
                        <code className="text-primary font-numeric text-body-sm">
                          &lt;Portal /&gt;
                        </code>
                        )
                      </h4>
                      <p className="text-caption text-text-muted">
                        SSR-safe DOM portal mounting overlays directly into{' '}
                        <code className="font-numeric">document.body</code> to prevent overflow
                        clipping.
                      </p>
                    </div>

                    <button
                      onClick={() => setPortalOpen(true)}
                      className="px-4 py-2 rounded-sm bg-primary text-on-primary hover:bg-primary-hover font-medium text-body-sm shadow-card transition cursor-pointer flex items-center gap-2 self-start sm:self-auto"
                    >
                      <Maximize2 className="w-4 h-4 text-accent" />
                      <span>Launch Portal Modal</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-md bg-surface-raised border border-border text-body-sm text-text-secondary leading-relaxed">
                    The{' '}
                    <code className="text-primary font-numeric font-medium">&lt;Portal&gt;</code>{' '}
                    component uses React 19's <code className="font-numeric">createPortal</code>{' '}
                    with SSR hydration safety checks. When triggered, it renders the modal dialog
                    directly at the DOM root, escaping all parent CSS transforms, z-index isolation,
                    and container clipping boundaries.
                  </div>
                </div>

                {/* 2.4 POPOVER SHOWCASE */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
                  <div className="flex flex-col gap-3 pb-3 border-b border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-display font-semibold text-text-primary text-body-lg">
                          Popover Component (
                          <code className="text-primary font-numeric text-body-sm">
                            &lt;Popover /&gt;
                          </code>
                          )
                        </h4>
                        <p className="text-caption text-text-muted">
                          Floating overlay with structured Header, Title, Description, Body, Footer,
                          collision padding, arrows, and visual variants.
                        </p>
                      </div>

                      {/* Interactive Triggers Showcase */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* 1. Default Surface with Header, Body, Footer, Close */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
                              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                              <span>Rebalancing Rules</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="end" showCloseButton className="w-80">
                            <PopoverHeader>
                              <PopoverTitle>Asset Allocation Thresholds</PopoverTitle>
                              <PopoverDescription>
                                Configure automated drift rebalancing alerts for equity indices.
                              </PopoverDescription>
                            </PopoverHeader>

                            <PopoverBody className="space-y-3 py-2">
                              <div className="flex items-center justify-between text-body-sm">
                                <span className="text-text-secondary">Drift Tolerance</span>
                                <span className="font-numeric font-bold text-text-primary">
                                  ± 5.0%
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-body-sm">
                                <span className="text-text-secondary">Auto-Execution</span>
                                <span className="text-success font-medium font-numeric">
                                  Active
                                </span>
                              </div>
                            </PopoverBody>

                            <PopoverFooter>
                              <Button variant="ghost" size="sm">
                                Cancel
                              </Button>
                              <Button variant="default" size="sm">
                                Save Rules
                              </Button>
                            </PopoverFooter>
                          </PopoverContent>
                        </Popover>

                        {/* 2. Frosted Glass Variant with Arrow */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="subtle" size="sm" className="gap-2 cursor-pointer">
                              <Sparkles className="w-3.5 h-3.5 text-accent" />
                              <span>Glassmorphic Insights</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            variant="glass"
                            hasArrow
                            align="center"
                            size="sm"
                            className="space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                              <h5 className="font-display font-semibold text-body-sm text-text-primary">
                                AI Yield Optimizer
                              </h5>
                            </div>
                            <p className="text-caption text-text-secondary leading-snug">
                              Yield routing is active with 99.8% allocation in AAA-rated sovereign
                              bonds.
                            </p>
                          </PopoverContent>
                        </Popover>

                        {/* 3. Dark Contextual Variant with Arrow */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="accent" size="sm" className="gap-2 cursor-pointer">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Security Vault</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            variant="dark"
                            hasArrow
                            align="start"
                            size="sm"
                            className="space-y-2"
                          >
                            <div className="flex items-center justify-between text-caption font-numeric">
                              <span className="text-white/70">ENCRYPTION</span>
                              <span className="text-accent font-semibold">AES-256 GCM</span>
                            </div>
                            <p className="text-caption text-white/80 leading-snug">
                              Keys are held in hardware HSM enclave with zero single points of
                              failure.
                            </p>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>

                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    Built on Radix UI Popover with automatic collision avoidance (
                    <code className="font-numeric text-primary">collisionPadding=8</code>),
                    directional origin spring animations, multi-style variants (
                    <code className="font-numeric text-primary">default</code>,{' '}
                    <code className="font-numeric text-primary">glass</code>,{' '}
                    <code className="font-numeric text-primary">dark</code>), size presets, and
                    integrated SVG indicator arrows.
                  </p>
                </div>

                {/* 2.5 THEME CONTROLS & UTILITIES */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div>
                      <h4 className="font-display font-semibold text-text-primary text-body-lg">
                        Theme Controls (
                        <code className="text-primary font-numeric text-body-sm">
                          &lt;ThemeToggle /&gt;
                        </code>
                        ,{' '}
                        <code className="text-primary font-numeric text-body-sm">
                          &lt;ThemeSegmented /&gt;
                        </code>
                        ,{' '}
                        <code className="text-primary font-numeric text-body-sm">
                          &lt;ThemeDropdown /&gt;
                        </code>
                        )
                      </h4>
                      <p className="text-caption text-text-muted">
                        Zero-dependency theme management engine with Framer Motion spring icon
                        transitions, system preference syncing, and instant DOM token swapping.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-numeric text-caption px-2.5 py-1 rounded-sm bg-surface-raised border border-border text-text-secondary">
                        Active:{' '}
                        <strong
                          className="text-primary uppercase font-bold"
                          suppressHydrationWarning
                        >
                          {mounted ? (theme ?? 'system') : 'system'}
                        </strong>{' '}
                        <span suppressHydrationWarning>
                          ({mounted ? (resolvedTheme ?? 'system') : 'system'})
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1. ThemeToggle Variants */}
                    <div className="p-4 rounded-lg bg-surface-raised border border-border space-y-3">
                      <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                        Cycle Toggle Button
                      </span>
                      <p className="text-caption text-text-secondary">
                        Spring-animated icon cycle between Light, Dark, and System modes.
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <div className="flex flex-col items-center gap-1.5">
                          <ThemeToggle />
                          <span className="text-[10px] font-numeric text-text-muted">
                            Icon Only
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                          <ThemeToggle showLabel variant="outline" className="px-3" />
                          <span className="text-[10px] font-numeric text-text-muted">
                            With Label
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                          <ThemeToggle size="sm" variant="subtle" className="h-8 w-8" />
                          <span className="text-[10px] font-numeric text-text-muted">Compact</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Segmented Pill Control */}
                    <div className="p-4 rounded-lg bg-surface-raised border border-border space-y-3">
                      <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                        Segmented Switch
                      </span>
                      <p className="text-caption text-text-secondary">
                        Multi-pill layout with Framer Motion layoutId spring slider highlight.
                      </p>
                      <div className="pt-2">
                        <ThemeSegmented />
                      </div>
                    </div>

                    {/* 3. Radix Dropdown Selector */}
                    <div className="p-4 rounded-lg bg-surface-raised border border-border space-y-3">
                      <span className="text-caption text-text-muted font-numeric uppercase tracking-wider block font-semibold">
                        Dropdown Menu
                      </span>
                      <p className="text-caption text-text-secondary">
                        Radix UI popover dropdown with active checkmark indicators.
                      </p>
                      <div className="pt-2 flex items-center gap-3">
                        <ThemeDropdown />
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic Information */}
                  <div className="p-3.5 rounded-md bg-surface-raised/60 border border-border text-caption text-text-secondary flex flex-wrap items-center justify-between gap-4 font-numeric">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-success" />
                      <span>
                        Engine: <code className="text-primary font-semibold">next-themes</code>
                      </span>
                    </div>
                    <div>
                      Storage Key: <code className="text-text-primary">localStorage('theme')</code>
                    </div>
                    <div>
                      CSS Target:{' '}
                      <code className="text-accent font-semibold">[data-theme="dark"]</code>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* GROUP 3: CORE FOUNDATIONS (Buttons, Radii, Focus Rings)               */}
            {/* ===================================================================== */}
            {(galleryFilter === 'all' || galleryFilter === 'foundations') && (
              <div className="space-y-8">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-text-muted" />
                  <h3 className="font-display font-bold text-text-primary text-display-sm">
                    3. Core Foundations & Controls
                  </h3>
                  <span className="text-caption font-numeric text-text-muted bg-surface-raised px-2 py-0.5 rounded-xs border border-border">
                    Tokens & Accessibility
                  </span>
                </div>

                {/* Buttons Showcase */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
                  <h4 className="font-display font-semibold text-text-primary text-body-lg">
                    Buttons & Controls
                  </h4>
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
                        <span className="font-numeric text-caption text-primary block">
                          {r.radius}
                        </span>
                        <span className="font-numeric text-caption text-text-muted">
                          {r.shadow}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Focus Ring Testbed */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
                  <h4 className="font-display font-semibold text-text-primary text-body-lg">
                    Focus Ring Accessibility Verification (:focus-visible)
                  </h4>
                  <p className="text-text-secondary text-body-sm">
                    Press{' '}
                    <kbd className="px-1.5 py-0.5 rounded-xs bg-surface-raised border border-border font-numeric text-caption">
                      Tab
                    </kbd>{' '}
                    to inspect the ring color which resolves to{' '}
                    <code className="text-primary font-numeric">--ring</code> (forest green in
                    light, emerald in dark).
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
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-surface py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7">
              <Image
                src="/kalya_icon1.png"
                alt="Kalya Leaf"
                fill
                sizes="28px"
                className="object-contain"
              />
            </div>
            <span className="font-display font-bold text-text-primary text-body-md">kalya</span>
            <span className="text-text-muted">·</span>
            <span className="eyebrow text-caption">READY FOR TOMORROW.</span>
          </div>
          <span className="text-caption text-text-muted font-numeric">
            UI Components & Utilities Active · Tailwind CSS 4 Inline Engine · All Tests Passing
          </span>
        </div>
      </footer>

      {/* SSR-Safe Modal Rendered via Portal */}
      {portalOpen && (
        <Portal animated>
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
            onClick={() => setPortalOpen(false)}
          >
            <div
              className="bg-surface border border-border rounded-xl p-6 shadow-raised max-w-lg w-full relative space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-primary-subtle text-primary flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-text-primary text-body-md">
                      SSR-Safe Portal Overlay
                    </h3>
                    <p className="text-caption text-text-muted">
                      Mounted directly into{' '}
                      <code className="font-numeric text-primary">document.body</code>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPortalOpen(false)}
                  className="p-1 rounded-sm text-text-muted hover:text-text-primary hover:bg-surface-raised transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-text-secondary text-body-sm leading-relaxed">
                This modal is dynamically mounted outside the main React DOM container using{' '}
                <code className="text-primary font-numeric px-1.5 py-0.5 rounded-xs bg-surface-raised border border-border">
                  &lt;Portal&gt;
                </code>
                . It completely bypasses parent clipping masks, relative positioning constraints,
                and transform contexts.
              </p>

              <div className="p-4 rounded-md bg-surface-raised border border-border space-y-2">
                <span className="font-numeric text-caption text-text-muted block uppercase tracking-wider font-semibold">
                  Portal Diagnostic Telemetry
                </span>
                <div className="grid grid-cols-2 gap-2 text-caption">
                  <div>
                    <span className="text-text-muted">Target DOM:</span>{' '}
                    <strong className="text-text-primary font-numeric">document.body</strong>
                  </div>
                  <div>
                    <span className="text-text-muted">Hydration Safe:</span>{' '}
                    <strong className="text-success font-numeric">✓ Active</strong>
                  </div>
                  <div>
                    <span className="text-text-muted">Exit Transition:</span>{' '}
                    <strong className="text-accent-strong font-numeric">Framer Motion</strong>
                  </div>
                  <div>
                    <span className="text-text-muted">Z-Index Layer:</span>{' '}
                    <strong className="text-text-primary font-numeric">z-50 (modal)</strong>
                  </div>
                </div>
              </div>

              <Separator variant="subtle" />

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  onClick={() => setPortalOpen(false)}
                  className="px-4 py-2 rounded-sm bg-surface border border-border text-text-primary hover:bg-surface-raised transition text-body-sm font-medium cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => setPortalOpen(false)}
                  className="px-4 py-2 rounded-sm bg-primary text-on-primary hover:bg-primary-hover transition shadow-card text-body-sm font-medium cursor-pointer"
                >
                  Confirm & Dismiss
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
