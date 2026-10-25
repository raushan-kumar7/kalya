import React, { useState, useRef } from 'react';
import { View, ScrollView, Alert as NativeAlert } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  IconButton,
  Icon,
  HapticTouchable,
  Divider,
  Badge,
  StatusPill,
  Avatar,
  Chip,
} from './primitives';
import {
  Row,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  GlassView,
  Section,
  Header,
  ListItem,
  SwipeableRow,
  FAB,
} from './layout';
import {
  TextField,
  PasswordField,
  AmountInput,
  CurrencyInput,
  SearchInput,
  DatePicker,
  MonthPicker,
  Select,
  SegmentedControl,
  Switch,
  Checkbox,
  Slider,
  OTPInput,
} from './forms';
import {
  Skeleton,
  Spinner,
  UndoSnackBar,
  Banner,
  ErrorCard,
  ProgressBar,
  ProgressRing,
  Alert,
} from './feedback';
import { BottomSheet, Modal, ConfirmDialog, ActionSheet, Tabs } from './overlays';
import { MoneyText, DateText, StatCard, Legend, KeyValueRow, Timeline } from './data-display';
import { DonutChart, FinancialBarChart, FinancialLineChart } from './charts';

export type ComponentCategory =
  'all' | 'primitives' | 'layout' | 'forms' | 'feedback' | 'overlays' | 'data-display' | 'charts';

/**
 * ShowUIComponents is an interactive catalog showcasing all 55+ UI components
 * across the concern folders in @kalya/mobile.
 */
export const ShowUIComponents: React.FC = () => {
  const [category, setCategory] = useState<ComponentCategory>('all');
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  const handleSelectCategory = (cat: ComponentCategory) => {
    setCategory(cat);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Form interactive states
  const [textFieldVal, setTextFieldVal] = useState('Sovereign Vault Account');
  const [passwordVal, setPasswordVal] = useState('KalyaSecretPass123');
  const [amountPaise, setAmountPaise] = useState(12500000); // ₹1,25,000.00
  const [searchVal, setSearchVal] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-10-25');
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [selectedOption, setSelectedOption] = useState('needs');
  const [segmentedTab, setSegmentedTab] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [switchState, setSwitchState] = useState(true);
  const [checkboxState, setCheckboxState] = useState(true);
  const [sliderVal, setSliderVal] = useState(50);
  const [otpVal, setOtpVal] = useState('582194');

  // Overlay visibility states
  const [showModal, setShowModal] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showUndoSnackbar, setShowUndoSnackbar] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState<'overview' | 'history' | 'analytics'>(
    'overview'
  );

  const categories = [
    { label: 'All', value: 'all' },
    { label: 'Primitives', value: 'primitives' },
    { label: 'Layout', value: 'layout' },
    { label: 'Forms', value: 'forms' },
    { label: 'Feedback', value: 'feedback' },
    { label: 'Overlays', value: 'overlays' },
    { label: 'Data', value: 'data-display' },
    { label: 'Charts', value: 'charts' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-kalya-canvas" edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <Header
        title="Kalya UI Catalog"
        subtitle="Mobile Design System Component Showcase"
        showBack={false}
        rightAction={<StatusPill isOnline={true} />}
      />

      {/* Category Filter */}
      <View className="py-2.5 px-4 bg-kalya-surface-subtle border-b border-kalya-border-subtle">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          <View className="flex-row gap-2">
            {categories.map((c) => (
              <Chip
                key={c.value}
                label={c.label}
                selected={category === c.value}
                onPress={() => handleSelectCategory(c.value as ComponentCategory)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ======================================================== */}
        {/* 1. PRIMITIVES */}
        {/* ======================================================== */}
        {(category === 'all' || category === 'primitives') && (
          <Animated.View
            key="sec-primitives"
            entering={FadeInDown.duration(240).springify().damping(18)}
            exiting={FadeOutUp.duration(160)}
            layout={LinearTransition.springify().damping(18)}
          >
            <Section
              title="1. Primitives"
              subtitle="Base typography, tactile buttons, badges, chips, and icons"
              className="mb-8"
            >
              {/* Typography */}
              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      Typography Hierarchy
                    </Text>
                    <Text variant="caption" tone="tertiary">
                      Outfit, Inter, IBM Plex Mono
                    </Text>
                  </View>
                </CardHeader>
                <CardBody className="gap-2.5">
                  <Text variant="display" tone="primary">
                    Display Header
                  </Text>
                  <Text variant="title-lg" tone="primary">
                    Heading Large
                  </Text>
                  <Text variant="title-md" tone="primary">
                    Heading Medium
                  </Text>
                  <Text variant="body-md" tone="secondary">
                    Body Medium interface text with calibrated leading and tone.
                  </Text>
                  <Text variant="caption" tone="tertiary">
                    Caption label text for metadata and timestamps.
                  </Text>
                  <Text variant="numeral-lg" tone="primary" className="font-ibm-plex-bold">
                    ₹2,485,390.42 (Numeral Large)
                  </Text>
                </CardBody>
              </Card>

              {/* Buttons & Haptics */}
              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      Tactile Buttons & Actions
                    </Text>
                    <Text variant="caption" tone="tertiary">
                      Physics-driven spring feedback
                    </Text>
                  </View>
                </CardHeader>
                <CardBody className="gap-3">
                  <Row gap="sm" className="flex-wrap">
                    <Button title="Primary" variant="primary" size="md" />
                    <Button title="Gold Action" variant="gold" size="md" />
                    <Button title="Outline" variant="outline" size="md" />
                    <Button title="Glass" variant="glass" size="md" />
                    <Button title="Destructive" variant="destructive" size="md" />
                  </Row>

                  <Row gap="md" align="center">
                    <IconButton
                      icon={<Icon name="Plus" size={20} color="#ffffff" />}
                      variant="primary"
                      accessibilityLabel="Add"
                    />
                    <IconButton
                      icon={<Icon name="Bell" size={20} color="#0d3e26" />}
                      variant="outline"
                      accessibilityLabel="Notifications"
                    />
                    <IconButton
                      icon={<Icon name="Download" size={20} color="#d4af37" />}
                      variant="gold"
                      accessibilityLabel="Download"
                    />
                    <HapticTouchable
                      hapticTier="success"
                      className="px-3 py-2 bg-kalya-mint-subtle rounded-kalya-md"
                    >
                      <Text variant="body-sm" tone="primary" className="font-inter-bold">
                        Haptic Touchable
                      </Text>
                    </HapticTouchable>
                  </Row>
                </CardBody>
              </Card>

              {/* Badges, Avatars, Chips */}
              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      Badges, Status & Identifiers
                    </Text>
                  </View>
                </CardHeader>
                <CardBody className="gap-4">
                  <Row gap="sm" className="flex-wrap">
                    <Badge variant="needs" label="Needs 50%" />
                    <Badge variant="wants" label="Wants 30%" />
                    <Badge variant="savings" label="Savings 20%" />
                    <Badge variant="inflow" label="Active" showDot />
                    <Badge variant="gold-pro" label="Pro Tier" />
                    <Badge variant="outflow" label="Over Budget" />
                    <Badge variant="sync-live" label="Live Sync" showDot pulseDot />
                  </Row>

                  <Divider />

                  <Row gap="md" align="center">
                    <Avatar name="Raushan Kumar" size="lg" />
                    <Avatar name="Kalya Vault" size="md" />
                    <Avatar name="Treasury" size="sm" />
                  </Row>
                </CardBody>
              </Card>
            </Section>
          </Animated.View>
        )}

        {/* ======================================================== */}
        {/* 2. LAYOUT */}
        {/* ======================================================== */}
        {(category === 'all' || category === 'layout') && (
          <Animated.View
            key="sec-layout"
            entering={FadeInDown.duration(240).springify().damping(18)}
            exiting={FadeOutUp.duration(160)}
            layout={LinearTransition.springify().damping(18)}
          >
            <Section
              title="2. Layout Surfaces"
              subtitle="Cards, liquid glass, stack helpers, and list items"
              className="mb-8"
            >
              {/* Glass View */}
              <GlassView variant="base" borderGlow className="p-4 rounded-kalya-xl mb-4">
                <Text variant="title-sm" tone="primary">
                  Specular Liquid Glass
                </Text>
                <Text variant="body-sm" tone="secondary" className="mt-1">
                  Refractive translucency layered over canvas backgrounds.
                </Text>
              </GlassView>

              {/* Structured Card */}
              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      Structured Surface Card
                    </Text>
                    <Text variant="caption" tone="tertiary">
                      Header, Body & Footer slots
                    </Text>
                  </View>
                </CardHeader>
                <CardBody>
                  <Text variant="body-sm" tone="secondary">
                    Cards provide elevated focal points for critical financial data.
                  </Text>
                </CardBody>
                <CardFooter className="flex-row justify-between items-center">
                  <Text variant="caption" tone="tertiary">
                    Verified Vault State
                  </Text>
                  <Button title="Details" variant="ghost" size="sm" />
                </CardFooter>
              </Card>

              {/* List Items */}
              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      List Items & Swipeable Rows
                    </Text>
                  </View>
                </CardHeader>
                <CardBody className="p-0">
                  <ListItem
                    title="Spotify Premium"
                    subtitle="Lifestyle · Monthly"
                    leading={<Icon name="Music" size={20} color="#0d3e26" />}
                    trailing={
                      <Text variant="body-sm" tone="primary" className="font-ibm-plex-bold">
                        ₹119.00
                      </Text>
                    }
                    bottomDivider
                  />
                  <ListItem
                    title="Direct Salary Deposit"
                    subtitle="Employer Inflow · Oct 25"
                    leading={<Icon name="ArrowDownLeft" size={20} color="#1b5e3a" />}
                    trailing={
                      <Text
                        variant="body-sm"
                        tone="primary"
                        className="font-ibm-plex-bold text-kalya-inflow"
                      >
                        +₹1,45,000.00
                      </Text>
                    }
                    bottomDivider
                  />
                  <SwipeableRow onDelete={() => NativeAlert.alert('Deleted')}>
                    <ListItem
                      title="Swipe Left Item"
                      subtitle="Try swiping to reveal actions"
                      leading={<Icon name="Sliders" size={20} color="#64748b" />}
                    />
                  </SwipeableRow>
                </CardBody>
              </Card>
            </Section>
          </Animated.View>
        )}

        {/* ======================================================== */}
        {/* 3. FORMS */}
        {/* ======================================================== */}
        {(category === 'all' || category === 'forms') && (
          <Animated.View
            key="sec-forms"
            entering={FadeInDown.duration(240).springify().damping(18)}
            exiting={FadeOutUp.duration(160)}
            layout={LinearTransition.springify().damping(18)}
          >
            <Section
              title="3. Form Inputs"
              subtitle="Minor-unit amounts, numpads, date pickers, selectors, and OTP"
              className="mb-8"
            >
              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      Text & Secure Inputs
                    </Text>
                  </View>
                </CardHeader>
                <CardBody className="gap-3">
                  <TextField
                    label="Account Name"
                    value={textFieldVal}
                    onChangeText={setTextFieldVal}
                    placeholder="Enter account label"
                    clearable
                  />

                  <PasswordField
                    label="Master Key / Passphrase"
                    value={passwordVal}
                    onChangeText={setPasswordVal}
                    placeholder="Enter secret"
                  />

                  <SearchInput
                    placeholder="Search transactions, tags, merchants..."
                    onSearch={setSearchVal}
                  />
                </CardBody>
              </Card>

              {/* Amount & Currency */}
              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      Financial Currency & Amount
                    </Text>
                    <Text variant="caption" tone="tertiary">
                      Integer paise handling
                    </Text>
                  </View>
                </CardHeader>
                <CardBody className="gap-4">
                  <AmountInput valuePaise={amountPaise} onChangePaise={setAmountPaise} />

                  <Row
                    align="center"
                    justify="between"
                    className="p-3 bg-kalya-surface-subtle rounded-kalya-md"
                  >
                    <Text variant="caption" tone="secondary">
                      Formatted Currency:
                    </Text>
                    <CurrencyInput valuePaise={amountPaise} size="md" />
                  </Row>
                </CardBody>
              </Card>

              {/* Controls & Pickers */}
              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      Controls, Dates & Selectors
                    </Text>
                  </View>
                </CardHeader>
                <CardBody className="gap-4">
                  <SegmentedControl
                    value={segmentedTab}
                    options={[
                      { label: 'Daily', value: 'daily' },
                      { label: 'Monthly', value: 'monthly' },
                      { label: 'Yearly', value: 'yearly' },
                    ]}
                    onChange={setSegmentedTab}
                  />

                  <Row align="center" justify="between">
                    <Text variant="body-sm" tone="primary">
                      Biometric Authentication
                    </Text>
                    <Switch value={switchState} onValueChange={setSwitchState} />
                  </Row>

                  <Checkbox
                    checked={checkboxState}
                    onChange={setCheckboxState}
                    label="Agree to automated vault synchronization terms"
                  />

                  <Slider
                    label="Budget Allocation Target"
                    value={sliderVal}
                    onChange={setSliderVal}
                    min={0}
                    max={100}
                  />

                  <DatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    label="Transaction Date"
                  />

                  <MonthPicker
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                    label="Budgeting Month"
                  />

                  <Select
                    label="Category Bucket"
                    value={selectedOption}
                    options={[
                      { label: '50% Needs & Essentials', value: 'needs' },
                      { label: '30% Wants & Lifestyle', value: 'wants' },
                      { label: '20% Savings & Debt', value: 'savings' },
                    ]}
                    onChange={setSelectedOption}
                  />

                  <View className="gap-1.5">
                    <Text variant="caption" tone="secondary">
                      6-Digit Verification Code (Better-Auth)
                    </Text>
                    <OTPInput value={otpVal} onChange={setOtpVal} />
                  </View>
                </CardBody>
              </Card>
            </Section>
          </Animated.View>
        )}

        {/* ======================================================== */}
        {/* 4. FEEDBACK & STATUS */}
        {/* ======================================================== */}
        {(category === 'all' || category === 'feedback') && (
          <Animated.View
            key="sec-feedback"
            entering={FadeInDown.duration(240).springify().damping(18)}
            exiting={FadeOutUp.duration(160)}
            layout={LinearTransition.springify().damping(18)}
          >
            <Section
              title="4. Feedback & Status"
              subtitle="Zero-shift skeletons, progress rings, undo pills, and alerts"
              className="mb-8"
            >
              {/* Alerts & Banners */}
              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      Alerts & Callouts
                    </Text>
                  </View>
                </CardHeader>
                <CardBody className="gap-3">
                  <Alert
                    variant="info"
                    title="Vault Synced"
                    description="Offline changes reconciled successfully with sovereign server."
                  />
                  <Alert
                    variant="warning"
                    title="80% Budget Threshold"
                    description="Lifestyle bucket has reached 82% of monthly allowance."
                  />
                  <Banner
                    variant="offline"
                    title="Offline Mode"
                    description="Working in offline mode. Local transactions queued."
                  />
                </CardBody>
              </Card>

              {/* Progress Gauges */}
              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      Progress Gauges & Loading
                    </Text>
                  </View>
                </CardHeader>
                <CardBody className="gap-4">
                  <ProgressBar progress={0.75} />
                  <ProgressBar progress={0.92} />

                  <Row align="center" justify="around" className="pt-2">
                    <ProgressRing progress={0.68} size={70} strokeWidth={8}>
                      <Text variant="caption" tone="primary" className="font-ibm-plex-bold">
                        68%
                      </Text>
                    </ProgressRing>
                    <Spinner size="md" color="#0d3e26" />
                  </Row>
                </CardBody>
              </Card>

              {/* Skeletons & Undo */}
              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      Skeletons & Destructive Undo
                    </Text>
                  </View>
                </CardHeader>
                <CardBody className="gap-3">
                  <Row align="center" gap="md">
                    <Skeleton width={44} height={44} rounded="md" />
                    <View className="flex-1 gap-1.5">
                      <Skeleton width="70%" height={16} rounded="sm" />
                      <Skeleton width="45%" height={12} rounded="sm" />
                    </View>
                  </Row>

                  <Button
                    title="Trigger 5-Second Undo Pill"
                    variant="outline"
                    size="sm"
                    onPress={() => setShowUndoSnackbar(true)}
                    className="mt-2"
                  />
                </CardBody>
              </Card>

              {/* Service Recovery */}
              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      Service Recovery States
                    </Text>
                  </View>
                </CardHeader>
                <CardBody>
                  <ErrorCard
                    title="Failed to Sync Vault"
                    description="Network connection dropped during payload handoff. Local data preserved."
                    onRetry={() => NativeAlert.alert('Retrying...')}
                  />
                </CardBody>
              </Card>
            </Section>
          </Animated.View>
        )}

        {/* ======================================================== */}
        {/* 5. OVERLAYS */}
        {/* ======================================================== */}
        {(category === 'all' || category === 'overlays') && (
          <Animated.View
            key="sec-overlays"
            entering={FadeInDown.duration(240).springify().damping(18)}
            exiting={FadeOutUp.duration(160)}
            layout={LinearTransition.springify().damping(18)}
          >
            <Section
              title="5. Overlays & Dialogs"
              subtitle="Modals, sheets, and confirmation flows"
              className="mb-8"
            >
              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      Interactive Overlay Triggers
                    </Text>
                  </View>
                </CardHeader>
                <CardBody className="gap-3">
                  <Button
                    title="Open Centered Modal"
                    variant="primary"
                    onPress={() => setShowModal(true)}
                  />
                  <Button
                    title="Open Bottom Sheet"
                    variant="outline"
                    onPress={() => setShowBottomSheet(true)}
                  />
                  <Button
                    title="Open Destructive Confirm"
                    variant="destructive"
                    onPress={() => setShowConfirm(true)}
                  />
                  <Button
                    title="Open Action Sheet Menu"
                    variant="gold"
                    onPress={() => setShowActionSheet(true)}
                  />
                </CardBody>
              </Card>

              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      Tabs Component
                    </Text>
                  </View>
                </CardHeader>
                <CardBody>
                  <Tabs
                    tabs={[
                      { id: 'overview', label: 'Overview' },
                      { id: 'history', label: 'History' },
                      { id: 'analytics', label: 'Analytics' },
                    ]}
                    activeTab={activeTabKey}
                    onChange={setActiveTabKey}
                  />
                </CardBody>
              </Card>
            </Section>
          </Animated.View>
        )}

        {/* ======================================================== */}
        {/* 6. DATA DISPLAY */}
        {/* ======================================================== */}
        {(category === 'all' || category === 'data-display') && (
          <Animated.View
            key="sec-data-display"
            entering={FadeInDown.duration(240).springify().damping(18)}
            exiting={FadeOutUp.duration(160)}
            layout={LinearTransition.springify().damping(18)}
          >
            <Section
              title="6. Data Display"
              subtitle="Money formatting, dates via @kalya/utils, stat cards, and timeline"
              className="mb-8"
            >
              {/* Stat Cards */}
              <Row gap="md" className="mb-4">
                <StatCard
                  label="Total Inflow"
                  value="₹1,84,500"
                  trend={{ value: '+14.2%', positive: true, comparisonLabel: 'vs last month' }}
                  className="flex-1"
                />
                <StatCard
                  label="Total Outflow"
                  value="₹62,400"
                  trend={{ value: '-4.8%', positive: false, comparisonLabel: 'vs budget' }}
                  className="flex-1"
                />
              </Row>

              {/* MoneyText & DateText */}
              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      Localized Formatting (@kalya/utils)
                    </Text>
                  </View>
                </CardHeader>
                <CardBody className="gap-3">
                  <Row justify="between" align="center">
                    <Text variant="body-sm" tone="secondary">
                      MoneyText (Inflow):
                    </Text>
                    <MoneyText paise={4500000} showSign colored variant="numeral-md" />
                  </Row>
                  <Row justify="between" align="center">
                    <Text variant="body-sm" tone="secondary">
                      MoneyText (Outflow):
                    </Text>
                    <MoneyText paise={-1850000} showSign colored variant="numeral-md" />
                  </Row>
                  <Row justify="between" align="center">
                    <Text variant="body-sm" tone="secondary">
                      Relative Date:
                    </Text>
                    <DateText date={new Date(Date.now() - 7200000)} format="relative" />
                  </Row>
                  <Row justify="between" align="center">
                    <Text variant="body-sm" tone="secondary">
                      Calendar Date:
                    </Text>
                    <DateText date="2026-10-25" format="short" />
                  </Row>
                </CardBody>
              </Card>

              {/* Key Value Rows */}
              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      Detail Key-Value Rows
                    </Text>
                  </View>
                </CardHeader>
                <CardBody className="p-1">
                  <KeyValueRow label="Vault Currency" value="INR (₹)" />
                  <KeyValueRow label="Partition Algorithm" value="50 / 30 / 20 Rule" />
                  <KeyValueRow
                    label="Sync Verification"
                    value="Pass (HMAC-SHA256)"
                    bottomDivider={false}
                  />
                </CardBody>
              </Card>

              {/* Timeline */}
              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      Chronological Audit Trail
                    </Text>
                    <Text variant="caption" tone="tertiary">
                      Powered by @kalya/utils timestamps
                    </Text>
                  </View>
                </CardHeader>
                <CardBody>
                  <Timeline
                    items={[
                      {
                        id: '1',
                        title: 'Salary Deposited',
                        description: 'Direct corporate transfer from Kalya Labs',
                        timestamp: new Date(Date.now() - 3600000),
                        completed: true,
                      },
                      {
                        id: '2',
                        title: 'Budget Allocation Partitioned',
                        description: '50% Needs, 30% Wants, 20% Savings applied',
                        timestamp: new Date(Date.now() - 7200000),
                        completed: true,
                      },
                      {
                        id: '3',
                        title: 'Pending Merchant Settlement',
                        description: 'Starbucks Coffee reserve lock',
                        timestamp: new Date(Date.now() - 14400000),
                        completed: false,
                      },
                    ]}
                  />
                </CardBody>
              </Card>
            </Section>
          </Animated.View>
        )}

        {/* ======================================================== */}
        {/* 7. CHARTS (react-native-gifted-charts) */}
        {/* ======================================================== */}
        {(category === 'all' || category === 'charts') && (
          <Animated.View
            key="sec-charts"
            entering={FadeInDown.duration(240).springify().damping(18)}
            exiting={FadeOutUp.duration(160)}
            layout={LinearTransition.springify().damping(18)}
          >
            <Section
              title="7. Financial Charts"
              subtitle="react-native-gifted-charts native allocation, bars, and curves"
              className="mb-8"
            >
              {/* Donut Chart */}
              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      50/30/20 Allocation Donut
                    </Text>
                    <Text variant="caption" tone="tertiary">
                      Animated with center balance
                    </Text>
                  </View>
                </CardHeader>
                <CardBody className="items-center py-4">
                  <DonutChart
                    data={[
                      { label: 'Needs', value: 50, color: '#0d3e26' },
                      { label: 'Wants', value: 30, color: '#d4af37' },
                      { label: 'Savings', value: 20, color: '#1b5e3a' },
                    ]}
                    centerLabel="₹1,25,000"
                    centerSubtitle="Total Budget"
                    size={150}
                    strokeWidth={20}
                  />
                  <Legend
                    className="mt-4"
                    items={[
                      { label: 'Needs (50%)', color: '#0d3e26', value: '₹62.5k' },
                      { label: 'Wants (30%)', color: '#d4af37', value: '₹37.5k' },
                      { label: 'Savings (20%)', color: '#1b5e3a', value: '₹25.0k' },
                    ]}
                  />
                </CardBody>
              </Card>

              {/* Financial Bar Chart */}
              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      Monthly Cash Inflow & Outflow
                    </Text>
                    <Text variant="caption" tone="tertiary">
                      Rounded bar tops with emerald gradient
                    </Text>
                  </View>
                </CardHeader>
                <CardBody className="py-2">
                  <FinancialBarChart
                    height={180}
                    barWidth={26}
                    spacing={20}
                    data={[
                      { value: 45000, label: 'May', frontColor: '#0d3e26' },
                      { value: 58000, label: 'Jun', frontColor: '#0d3e26' },
                      { value: 52000, label: 'Jul', frontColor: '#0d3e26' },
                      { value: 64000, label: 'Aug', frontColor: '#1b5e3a' },
                      { value: 71000, label: 'Sep', frontColor: '#d4af37' },
                      { value: 85000, label: 'Oct', frontColor: '#0d3e26' },
                    ]}
                  />
                </CardBody>
              </Card>

              {/* Financial Line Chart */}
              <Card variant="surface" className="mb-4">
                <CardHeader>
                  <View>
                    <Text variant="title-sm" tone="primary">
                      Wealth Accumulation Trajectory
                    </Text>
                    <Text variant="caption" tone="tertiary">
                      Bezier curve with area gradient fill
                    </Text>
                  </View>
                </CardHeader>
                <CardBody className="py-2">
                  <FinancialLineChart
                    height={180}
                    data={[
                      { value: 120000, label: 'Q1' },
                      { value: 145000, label: 'Q2' },
                      { value: 180000, label: 'Q3' },
                      { value: 240000, label: 'Q4' },
                    ]}
                    curved
                    areaChart
                  />
                </CardBody>
              </Card>
            </Section>
          </Animated.View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon={<Icon name="Plus" size={24} color="#072617" />}
        onPress={() => NativeAlert.alert('FAB Pressed', 'Log New Transaction')}
      />

      {/* Undo SnackBar */}
      <UndoSnackBar
        visible={showUndoSnackbar}
        message="Transaction #8841 deleted"
        durationMs={5000}
        onUndo={() => {
          setShowUndoSnackbar(false);
          NativeAlert.alert('Undone', 'Transaction restored');
        }}
        onExpire={() => setShowUndoSnackbar(false)}
      />

      {/* Overlays */}
      <Modal visible={showModal} onClose={() => setShowModal(false)} title="Sovereign Vault Notice">
        <Text variant="body-sm" tone="secondary" className="mb-4">
          This is an interactive centered modal dialog rendered using @kalya/mobile overlays.
        </Text>
        <Button title="Acknowledge" variant="primary" onPress={() => setShowModal(false)} />
      </Modal>

      <BottomSheet
        visible={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        title="Select Funding Source"
      >
        <View className="gap-2">
          <ListItem
            title="HDFC Wealth Account"
            subtitle="•••• 9012"
            leading={<Icon name="Landmark" size={20} color="#0d3e26" />}
            onPress={() => setShowBottomSheet(false)}
            bottomDivider
          />
          <ListItem
            title="ICICI Treasury Vault"
            subtitle="•••• 3481"
            leading={<Icon name="Shield" size={20} color="#0d3e26" />}
            onPress={() => setShowBottomSheet(false)}
          />
        </View>
      </BottomSheet>

      <ConfirmDialog
        visible={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => {
          setShowConfirm(false);
          NativeAlert.alert('Confirmed', 'Partition deleted');
        }}
        title="Delete Budget Partition?"
        message="This will irreversibly remove the allocated targets for the current cycle."
        confirmLabel="Delete Partition"
        destructive
      />

      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title="Transaction Options"
        actions={[
          {
            label: 'Export Statement as PDF',
            icon: <Icon name="FileText" size={18} color="#0d3e26" />,
            onPress: () => NativeAlert.alert('Exporting PDF...'),
          },
          {
            label: 'Split with Contact',
            icon: <Icon name="Users" size={18} color="#0d3e26" />,
            onPress: () => NativeAlert.alert('Splitting...'),
          },
          {
            label: 'Delete Transaction',
            icon: <Icon name="Trash2" size={18} color="#ef4444" />,
            destructive: true,
            onPress: () => NativeAlert.alert('Deleted'),
          },
        ]}
      />
    </SafeAreaView>
  );
};
