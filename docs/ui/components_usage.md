# Kalya UI Components Usage Guide

This guide documents how to import and use **every** component inside `src/components/ui/` component-by-component.

---

## Index

1. **Core Primitives:** [Button](#1-button) · [Input](#2-input) · [Textarea](#3-textarea) · [Card](#4-card) · [Label](#5-label) · [Checkbox](#6-checkbox) · [Radio Group](#7-radio-group) · [Switch](#8-switch) · [Select](#9-select) · [Combobox](#10-combobox) · [Date Picker](#11-date-picker) · [Field](#12-field) · [Input Group](#13-input-group) · [Calendar](#14-calendar)
2. **Feedback & Status:** [Toast](#15-toast) · [Skeleton](#16-skeleton) · [Tooltip](#17-tooltip) · [Badge](#18-badge) · [Alert](#19-alert) · [Alert Dialog](#20-alert-dialog) · [Spinner](#21-spinner) · [Empty State](#22-empty-state)
3. **Overlay & Navigation:** [Dialog](#23-dialog) · [Dropdown Menu](#24-dropdown-menu) · [Tabs](#25-tabs) · [Sidebar Nav](#26-sidebar-nav) · [Pagination](#27-pagination) · [Popover](#28-popover)
4. **Layout & Display:** [Page Header](#29-page-header) · [Data Table](#30-data-table) · [Chart](#31-chart) · [Table](#32-table)
5. **Financial Elements:** [Theme Toggle](#33-theme-toggle) · [Numeric Value](#34-numeric-value) · [Budget Progress](#35-budget-progress) · [Metric Card](#36-metric-card) · [EMI Table](#37-emi-table)

---

## 1. Core Primitives

### 1. Button
* **Import:** `import { Button } from "@/components/ui";`
* **Use Case:** Action handlers (submitting forms, navigating, primary/secondary action choices).
* **Usage:**
```tsx
<Button variant="default" size="md" onClick={() => console.log("clicked")}>
  Save Changes
</Button>
```

### 2. Input
* **Import:** `import { Input } from "@/components/ui";`
* **Use Case:** Single line text inputs (e.g. typing username, emails, search bars).
* **Usage:**
```tsx
<Input placeholder="Enter your email" type="email" required />
```

### 3. Textarea
* **Import:** `import { Textarea } from "@/components/ui";`
* **Use Case:** Multiline text responses (e.g. transaction descriptions, account notes).
* **Usage:**
```tsx
<Textarea placeholder="Add optional details about this transaction..." rows={3} />
```

### 4. Card
* **Import:** `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui";`
* **Use Case:** Grouping related information into isolated tiles on dashboards.
* **Usage:**
```tsx
<Card hoverable>
  <CardHeader>
    <CardTitle>Account Summary</CardTitle>
    <CardDescription>Primary savings holdings</CardDescription>
  </CardHeader>
  <CardContent>Card body content here...</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>
```

### 5. Label
* **Import:** `import { Label } from "@/components/ui";`
* **Use Case:** Standalone form control descriptions with appropriate ARIA access tags.
* **Usage:**
```tsx
<div className="space-y-1">
  <Label htmlFor="salary">Monthly Base Salary</Label>
  <Input id="salary" type="number" />
</div>
```

### 6. Checkbox
* **Import:** `import { Checkbox } from "@/components/ui";`
* **Use Case:** Multi-select options or toggling singular terms (e.g. agreeing to T&C).
* **Usage:**
```tsx
<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>
```

### 7. Radio Group
* **Import:** `import { RadioGroup, RadioGroupItem } from "@/components/ui/radio";`
* **Use Case:** Exclusively choosing one setting from a small group.
* **Usage:**
```tsx
<RadioGroup defaultValue="salary">
  <div className="flex items-center gap-2">
    <RadioGroupItem value="salary" id="r1" />
    <Label htmlFor="r1">Salary</Label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="investment" id="r2" />
    <Label htmlFor="r2">Investment</Label>
  </div>
</RadioGroup>
```

### 8. Switch
* **Import:** `import { Switch } from "@/components/ui";`
* **Use Case:** Settings-style instant toggles (e.g. enabling email alerts, biometrics).
* **Usage:**
```tsx
<div className="flex items-center justify-between">
  <Label htmlFor="notifications">Enable notifications</Label>
  <Switch id="notifications" />
</div>
```

### 9. Select
* **Import:** `import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";`
* **Use Case:** Selecting one option from a collapsible dropdown list.
* **Usage:**
```tsx
<Select defaultValue="active">
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="closed">Closed</SelectItem>
  </SelectContent>
</Select>
```

### 10. Combobox
* **Import:** `import { Combobox } from "@/components/ui";`
* **Use Case:** Selecting a value from a large list using dynamic text filter/autocomplete.
* **Usage:**
```tsx
const options = [
  { value: "mutual-fund", label: "Mutual Funds" },
  { value: "stock", label: "Direct Stocks" },
];
<Combobox options={options} placeholder="Select Asset Type" onValueChange={(val) => console.log(val)} />
```

### 11. Date Picker
* **Import:** `import { DatePicker } from "@/components/ui";`
* **Use Case:** Selecting a calendar date for transactions or schedules.
* **Usage:**
```tsx
<DatePicker date={new Date()} onDateChange={(d) => console.log(d)} />
```

### 12. Field
* **Import:** `import { Field } from "@/components/ui";`
* **Use Case:** Wrapper that groups label, control, optional helper description, and validation error.
* **Usage:**
```tsx
<Field label="PAN Card" error="Invalid PAN format" helper="Required for mutual fund investments">
  <Input placeholder="ABCDE1234F" />
</Field>
```

### 13. Input Group
* **Import:** `import { InputGroup } from "@/components/ui";`
* **Use Case:** Prepending or appending icons/suffixes directly surrounding inputs.
* **Usage:**
```tsx
<InputGroup prefix="₹" suffix="/ month">
  <Input type="number" placeholder="50,000" />
</InputGroup>
```

### 14. Calendar
* **Import:** `import { Calendar } from "@/components/ui";`
* **Use Case:** Standalone panel for date range selects or calendar day dashboards.
* **Usage:**
```tsx
<Calendar mode="single" selected={new Date()} onSelect={(d) => console.log(d)} />
```

---

## 2. Feedback & Status

### 15. Toast
* **Import:** `import { toast } from "react-hot-toast";` (uses the configuration in [toast.tsx](file:///D:/Projects/personal/kalya/src/components/ui/toast.tsx))
* **Use Case:** Micro-alerts confirming operations (e.g. "Transaction saved").
* **Usage:**
```tsx
toast.success("Net worth balance updated successfully.");
```

### 16. Skeleton
* **Import:** `import { Skeleton } from "@/components/ui";`
* **Use Case:** Rendering mockup structures while loading heavy card modules.
* **Usage:**
```tsx
<div className="space-y-2">
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
</div>
```

### 17. Tooltip
* **Import:** `import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui";`
* **Use Case:** Hover text explanations of terminology (e.g. explaining NPS Tier 1 differences).
* **Usage:**
```tsx
<Tooltip>
  <TooltipTrigger>NPS Tier 1</TooltipTrigger>
  <TooltipContent>Non-withdrawable pension account subject to tax exemptions.</TooltipContent>
</Tooltip>
```

### 18. Badge
* **Import:** `import { Badge } from "@/components/ui";`
* **Use Case:** Status tags (e.g. "Active", "Pending", "Success").
* **Usage:**
```tsx
<Badge variant="success">Completed</Badge>
```

### 19. Alert
* **Import:** `import { Alert, AlertTitle, AlertDescription } from "@/components/ui";`
* **Use Case:** Permanent static messages warning of limits (e.g. "EPF limits reached").
* **Usage:**
```tsx
<Alert variant="warning">
  <AlertTitle>Budget Nearing Limit</AlertTitle>
  <AlertDescription>You have spent 85% of your food allowance.</AlertDescription>
</Alert>
```

### 20. Alert Dialog
* **Import:** `import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui";`
* **Use Case:** Critical actions requiring explicit focus confirmation (e.g. purging data).
* **Usage:**
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="danger">Delete Account</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone. This will permanently delete your bank connection.</AlertDialogDescription>
    </AlertDialogHeader>
    <div className="flex justify-end gap-2">
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={() => console.log("deleted")}>Confirm</AlertDialogAction>
    </div>
  </AlertDialogContent>
</AlertDialog>
```

### 21. Spinner
* **Import:** `import { Spinner } from "@/components/ui";`
* **Use Case:** Loading spin icons centered inside sections or tables.
* **Usage:**
```tsx
<div className="flex justify-center p-8">
  <Spinner size="lg" variant="default" />
</div>
```

### 22. Empty State
* **Import:** `import { EmptyState } from "@/components/ui";`
* **Use Case:** Standalone placeholder cards when a search yields no records.
* **Usage:**
```tsx
<EmptyState 
  title="No investments found" 
  description="Add your first stock or mutual fund connection to begin tracking." 
  actionLabel="Add Connection"
  onActionClick={() => console.log("connect")}
/>
```

---

## 3. Overlay & Navigation

### 23. Dialog
* **Import:** `import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui";`
* **Use Case:** Rendering overlays for forms or setting additions.
* **Usage:**
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Add Asset</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Asset Holdings</DialogTitle>
      <DialogDescription>Input purchase value details below.</DialogDescription>
    </DialogHeader>
    {/* Form contents here */}
  </DialogContent>
</Dialog>
```

### 24. Dropdown Menu
* **Import:** `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui";`
* **Use Case:** Secondary actions grouped into collapsible option menus.
* **Usage:**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => console.log("edit")}>Edit</DropdownMenuItem>
    <DropdownMenuItem className="text-danger" onClick={() => console.log("delete")}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 25. Tabs
* **Import:** `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";`
* **Use Case:** Switching between sibling layout sections (e.g. Assets vs Liabilities).
* **Usage:**
```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="history">History</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview Dashboard Content...</TabsContent>
  <TabsContent value="history">Historical Charts Content...</TabsContent>
</Tabs>
```

### 26. Sidebar Nav
* **Import:** `import { SidebarNav } from "@/components/ui";`
* **Use Case:** Left side sticky panels for application route navigation.
* **Usage:**
```tsx
const navItems = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Assets", href: "/assets" },
];
<SidebarNav items={navItems} activeHref="/dashboard" />
```

### 27. Pagination
* **Import:** `import { Pagination } from "@/components/ui";`
* **Use Case:** Segmenting long transaction datasets across pages.
* **Usage:**
```tsx
<Pagination 
  currentPage={1} 
  totalPages={5} 
  onPageChange={(page) => console.log("Go to page", page)} 
/>
```

### 28. Popover
* **Import:** `import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui";`
* **Use Case:** Secondary content popups anchored to action cues (e.g. quick profiles).
* **Usage:**
```tsx
<Popover>
  <PopoverTrigger>Info</PopoverTrigger>
  <PopoverContent>This popover is anchored to the text.</PopoverContent>
</Popover>
```

---

## 4. Layout & Display

### 29. Page Header
* **Import:** `import { PageHeader } from "@/components/ui";`
* **Use Case:** Top title layouts with optional action triggers and breadcrumbs.
* **Usage:**
```tsx
<PageHeader 
  title="Mutual Funds Portfolio" 
  description="Detailed analytics of active SIP holdings."
  action={<Button>Import Portfolio</Button>}
/>
```

### 30. Data Table
* **Import:** `import { DataTable } from "@/components/ui";`
* **Use Case:** TanStack-driven grid lists for transactions or balances with pagination support.
* **Usage:**
```tsx
const columns = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "amount", header: "Amount" }
];
const data = [
  { date: "2026-07-12", amount: "₹5,000" }
];
<DataTable columns={columns} data={data} searchKey="date" />
```

### 31. Chart
* **Import:** `import { ChartContainer, ChartTooltip } from "@/components/ui";`
* **Use Case:** Formatting Recharts line/bar widgets responsive to the light/dark themes.
* **Usage:**
```tsx
const config = {
  assets: { label: "Assets", color: "var(--color-primary)" }
};
<ChartContainer config={config} className="h-[300px]">
  {/* Standard Recharts tags using CSS variable color mapping */}
</ChartContainer>
```

### 32. Table
* **Import:** `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";`
* **Use Case:** Flat layouts for structured records (transactions, historical ledgers).
* **Usage:**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Account</TableHead>
      <TableHead className="text-right">Balance</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>SBI Savings</TableCell>
      <TableCell className="text-right">₹1,50,000</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## 5. Financial Elements

### 33. Theme Toggle
* **Import:** `import { ThemeToggle } from "@/components/ui";`
* **Use Case:** Switching between light/dark/system themes.
* **Usage:**
```tsx
<ThemeToggle />
```

### 34. Numeric Value
* **Import:** `import { NumericValue } from "@/components/ui";`
* **Use Case:** Formatted numbers adhering to Indian standards and monospace font styles.
* **Usage:**
```tsx
<NumericValue value={4825900} currency="₹" colored={true} decimals={2} />
```

### 35. Budget Progress
* **Import:** `import { BudgetProgress } from "@/components/ui";`
* **Use Case:** Dynamic progress bars that turn yellow/red at specific budget thresholds.
* **Usage:**
```tsx
<BudgetProgress spent={8500} limit={10000} />
```

### 36. Metric Card
* **Import:** `import { MetricCard } from "@/components/ui";`
* **Use Case:** Stat dashboards with high contrast trend statistics.
* **Usage:**
```tsx
<MetricCard 
  title="Consolidated Net Worth" 
  value={4825900} 
  change={3.2} 
  changeLabel="this month" 
  currency="₹" 
/>
```

### 37. EMI Table
* **Import:** `import { EMITable } from "@/components/ui";`
* **Use Case:** Collapsible schedule tables tracking outstanding loan balances.
* **Usage:**
```tsx
const schedule = [
  { month: 1, payment: 42500, principal: 15000, interest: 27500, outstandingBalance: 860000 },
];
<EMITable payments={schedule} initialVisibleRows={12} />
```
