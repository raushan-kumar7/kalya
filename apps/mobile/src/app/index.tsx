import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logoIconWhite } from '@/constants/images';

export default function Index() {
  const [activeTab, setActiveTab] = useState<'all' | 'dashboard' | 'palette'>('all');

  return (
    <SafeAreaView className="flex-1 bg-kalya-canvas">
      <StatusBar style="dark" />

      {/* Top Navigation Bar */}
      <View className="px-5 pt-3 pb-4 border-b border-kalya-border-subtle bg-kalya-surface/80 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-kalya-md bg-kalya-primary items-center justify-center border border-kalya-border-strong">
            <Image source={logoIconWhite} className="w-6 h-6" resizeMode="contain" />
          </View>
          <View>
            <Text className="font-outfit-bold text-xl text-kalya-text-primary tracking-tight">
              KALYA
            </Text>
            <Text className="font-inter text-xs text-kalya-text-tertiary">
              Sovereign Wealth Management
            </Text>
          </View>
        </View>

        <View className="bg-kalya-gold-soft px-3 py-1 rounded-kalya-pill border border-kalya-gold/30">
          <Text className="font-inter-bold text-[11px] text-kalya-gold-dark">PRO SUITE</Text>
        </View>
      </View>

      {/* Segment Switcher */}
      <View className="px-5 py-3 bg-kalya-surface-subtle border-b border-kalya-border-subtle">
        <View className="flex-row bg-kalya-surface-muted p-1 rounded-kalya-pill border border-kalya-border-subtle">
          <TouchableOpacity
            onPress={() => setActiveTab('all')}
            className={`flex-1 py-2 rounded-kalya-pill items-center justify-center ${
              activeTab === 'all' ? 'bg-kalya-primary shadow-sm' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs ${
                activeTab === 'all'
                  ? 'font-outfit-bold text-kalya-text-inverse'
                  : 'font-outfit text-kalya-text-secondary'
              }`}
            >
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('dashboard')}
            className={`flex-1 py-2 rounded-kalya-pill items-center justify-center ${
              activeTab === 'dashboard' ? 'bg-kalya-primary shadow-sm' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs ${
                activeTab === 'dashboard'
                  ? 'font-outfit-bold text-kalya-text-inverse'
                  : 'font-outfit text-kalya-text-secondary'
              }`}
            >
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('palette')}
            className={`flex-1 py-2 rounded-kalya-pill items-center justify-center ${
              activeTab === 'palette' ? 'bg-kalya-primary shadow-sm' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs ${
                activeTab === 'palette'
                  ? 'font-outfit-bold text-kalya-text-inverse'
                  : 'font-outfit text-kalya-text-secondary'
              }`}
            >
              Design System
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ======================================================== */}
        {/* PART 1: WEALTH DASHBOARD (LIVE PRODUCTION EXPERIENCE)   */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'dashboard') && (
          <View className="px-5 pt-5 gap-5">
            {/* Section Header */}
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-outfit-bold text-lg text-kalya-text-primary">
                  Sovereign Portfolio
                </Text>
                <Text className="font-inter text-xs text-kalya-text-secondary">
                  Real-time asset allocation & cash reserves
                </Text>
              </View>
              <View className="flex-row items-center gap-1 bg-kalya-mint-subtle px-2.5 py-1 rounded-kalya-pill border border-kalya-border-subtle">
                <View className="w-2 h-2 rounded-kalya-pill bg-kalya-inflow" />
                <Text className="font-ibm-plex text-[11px] text-kalya-primary">LIVE VAULT</Text>
              </View>
            </View>

            {/* Hero Emerald Card (Glass + Primary Dark) */}
            <View className="bg-kalya-primary-dark rounded-kalya-xl p-5 border border-kalya-glass-border-emerald overflow-hidden relative">
              {/* Refractive Glass glow overlay */}
              <View className="absolute top-0 right-0 w-44 h-44 rounded-kalya-pill bg-kalya-primary-light/30 -mr-16 -mt-16" />
              <View className="absolute bottom-0 left-0 w-36 h-36 rounded-kalya-pill bg-kalya-gold/10 -ml-12 -mb-12" />

              <View className="flex-row items-center justify-between mb-3">
                <Text className="font-outfit text-xs text-kalya-mint uppercase tracking-widest">
                  Total Net Assets
                </Text>
                <View className="bg-kalya-primary px-2.5 py-0.5 rounded-kalya-sm border border-kalya-border-strong">
                  <Text className="font-ibm-plex text-xs text-kalya-gold">Tier 1 Capital</Text>
                </View>
              </View>

              <Text className="font-ibm-plex-bold text-3xl text-kalya-text-inverse tracking-tight">
                $2,485,390.42
              </Text>

              <View className="flex-row items-center gap-2 mt-2">
                <View className="bg-kalya-primary-light/50 px-2 py-0.5 rounded-kalya-pill">
                  <Text className="font-ibm-plex text-xs text-kalya-mint">
                    +$18,450.00 (+0.75%)
                  </Text>
                </View>
                <Text className="font-inter text-xs text-kalya-text-tertiary">
                  vs previous close
                </Text>
              </View>

              {/* Action Buttons inside Card */}
              <View className="flex-row gap-3 mt-5 pt-4 border-t border-kalya-glass-border-emerald">
                <TouchableOpacity className="flex-1 bg-kalya-gold py-2.5 rounded-kalya-md items-center justify-center shadow-sm">
                  <Text className="font-inter-bold text-xs text-kalya-primary-dark">
                    Deposit Capital
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-kalya-glass-base py-2.5 rounded-kalya-md items-center justify-center border border-kalya-glass-border">
                  <Text className="font-inter-bold text-xs text-kalya-primary-dark">
                    Transfer Funds
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 50 / 30 / 20 Financial Framework Card */}
            <View className="bg-kalya-surface-card rounded-kalya-lg p-5 border border-kalya-border">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-outfit-bold text-base text-kalya-text-primary">
                  50 / 30 / 20 Allocation Framework
                </Text>
                <Text className="font-inter text-xs text-kalya-text-accent">Target Balance</Text>
              </View>
              <Text className="font-inter text-xs text-kalya-text-secondary mb-4 leading-relaxed">
                Strategic wealth partition following balanced liquidity, lifestyle, and wealth
                building mandates.
              </Text>

              {/* Split Bar */}
              <View className="flex-row h-2.5 rounded-kalya-pill overflow-hidden mb-4 border border-kalya-border-subtle">
                <View className="bg-kalya-needs flex-[50]" />
                <View className="bg-kalya-wants flex-[30]" />
                <View className="bg-kalya-savings flex-[20]" />
              </View>

              {/* Allocation Items */}
              <View className="gap-3">
                {/* Needs Item */}
                <View className="flex-row items-center justify-between p-3 rounded-kalya-md bg-kalya-surface-subtle border border-kalya-border-subtle">
                  <View className="flex-row items-center gap-2.5">
                    <View className="w-3.5 h-3.5 rounded-kalya-xs bg-kalya-needs" />
                    <View>
                      <Text className="font-inter-bold text-xs text-kalya-text-primary">
                        50% Needs & Living
                      </Text>
                      <Text className="font-inter text-[11px] text-kalya-text-tertiary">
                        Mortgage, utilities & essentials
                      </Text>
                    </View>
                  </View>
                  <Text className="font-ibm-plex-bold text-xs text-kalya-text-primary">
                    $6,250.00
                  </Text>
                </View>

                {/* Wants Item */}
                <View className="flex-row items-center justify-between p-3 rounded-kalya-md bg-kalya-surface-subtle border border-kalya-border-subtle">
                  <View className="flex-row items-center gap-2.5">
                    <View className="w-3.5 h-3.5 rounded-kalya-xs bg-kalya-wants" />
                    <View>
                      <Text className="font-inter-bold text-xs text-kalya-text-primary">
                        30% Wants & Lifestyle
                      </Text>
                      <Text className="font-inter text-[11px] text-kalya-text-tertiary">
                        Fine dining, travel & leisure
                      </Text>
                    </View>
                  </View>
                  <Text className="font-ibm-plex-bold text-xs text-kalya-text-primary">
                    $3,750.00
                  </Text>
                </View>

                {/* Savings Item */}
                <View className="flex-row items-center justify-between p-3 rounded-kalya-md bg-kalya-surface-subtle border border-kalya-border-subtle">
                  <View className="flex-row items-center gap-2.5">
                    <View className="w-3.5 h-3.5 rounded-kalya-xs bg-kalya-savings" />
                    <View>
                      <Text className="font-inter-bold text-xs text-kalya-text-primary">
                        20% Savings & Reserves
                      </Text>
                      <Text className="font-inter text-[11px] text-kalya-text-tertiary">
                        Treasuries, gold & equities
                      </Text>
                    </View>
                  </View>
                  <Text className="font-ibm-plex-bold text-xs text-kalya-text-primary">
                    $2,500.00
                  </Text>
                </View>
              </View>
            </View>

            {/* Cash Flow Metrics (Inflow & Outflow) */}
            <View className="flex-row gap-4">
              {/* Inflow Card */}
              <View className="flex-1 bg-kalya-surface rounded-kalya-lg p-4 border border-kalya-border">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-inter text-xs text-kalya-text-secondary">Total Inflow</Text>
                  <View className="w-2.5 h-2.5 rounded-kalya-pill bg-kalya-inflow" />
                </View>
                <Text className="font-ibm-plex-bold text-lg text-kalya-inflow">+$32,840.00</Text>
                <Text className="font-inter text-[11px] text-kalya-text-tertiary mt-1">
                  14 transactions this cycle
                </Text>
              </View>

              {/* Outflow Card */}
              <View className="flex-1 bg-kalya-surface rounded-kalya-lg p-4 border border-kalya-border">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-inter text-xs text-kalya-text-secondary">
                    Total Outflow
                  </Text>
                  <View className="w-2.5 h-2.5 rounded-kalya-pill bg-kalya-outflow" />
                </View>
                <Text className="font-ibm-plex-bold text-lg text-kalya-outflow">-$12,490.00</Text>
                <Text className="font-inter text-[11px] text-kalya-text-tertiary mt-1">
                  Under monthly budget by 12%
                </Text>
              </View>
            </View>

            {/* Liquid Glass Highlight Showcase */}
            <View className="bg-kalya-primary-muted rounded-kalya-xl p-5 border border-kalya-border-strong">
              <Text className="font-outfit-bold text-base text-kalya-text-inverse mb-1">
                Liquid Glass Engine
              </Text>
              <Text className="font-inter text-xs text-kalya-mint-light mb-4">
                Translucent light refraction layered across native elements.
              </Text>

              <View className="gap-2.5">
                <View className="bg-kalya-glass-ultra-thin p-3 rounded-kalya-md border border-kalya-glass-border flex-row items-center justify-between">
                  <Text className="font-inter-bold text-xs text-kalya-text-inverse">
                    Ultra-Thin Glass (40% White)
                  </Text>
                  <Text className="font-ibm-plex text-xs text-kalya-gold-soft">
                    bg-kalya-glass-ultra-thin
                  </Text>
                </View>

                <View className="bg-kalya-glass-base p-3 rounded-kalya-md border border-kalya-glass-border flex-row items-center justify-between">
                  <Text className="font-inter-bold text-xs text-kalya-primary-dark">
                    Base Glass (65% White)
                  </Text>
                  <Text className="font-ibm-plex text-xs text-kalya-primary-light">
                    bg-kalya-glass-base
                  </Text>
                </View>

                <View className="bg-kalya-glass-gold p-3 rounded-kalya-md border border-kalya-glass-border-gold flex-row items-center justify-between">
                  <Text className="font-inter-bold text-xs text-kalya-text-inverse">
                    Radiant Gold Shimmer Glass
                  </Text>
                  <Text className="font-ibm-plex text-xs text-kalya-gold">bg-kalya-glass-gold</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Divider if showing all */}
        {activeTab === 'all' && (
          <View className="my-8 px-5">
            <View className="h-px bg-kalya-border-subtle" />
          </View>
        )}

        {/* ======================================================== */}
        {/* PART 2: DESIGN SYSTEM PALETTE & TYPOGRAPHY SPECIMEN      */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'palette') && (
          <View className="px-5 gap-6">
            {/* Header */}
            <View>
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="font-outfit-bold text-xl text-kalya-text-primary">
                  Kalya Design System
                </Text>
                <View className="bg-kalya-primary px-2 py-0.5 rounded-kalya-xs">
                  <Text className="font-ibm-plex text-[10px] text-kalya-gold">v1.0.0</Text>
                </View>
              </View>
              <Text className="font-inter text-xs text-kalya-text-secondary">
                Complete token catalog defined in tailwind.config.js
              </Text>
            </View>

            {/* 1. TYPOGRAPHY SPECIMEN (6 FONTS) */}
            <View className="bg-kalya-surface-card rounded-kalya-lg p-5 border border-kalya-border">
              <Text className="font-outfit-bold text-base text-kalya-text-primary mb-1">
                1. Typography Hierarchy
              </Text>
              <Text className="font-inter text-xs text-kalya-text-tertiary mb-4">
                Outfit (Display/Headings), Inter (UI/Body), IBM Plex Mono (Financial Numerals)
              </Text>

              <View className="gap-3.5">
                {/* Outfit Bold */}
                <View className="p-3 bg-kalya-surface-subtle rounded-kalya-md border border-kalya-border-subtle">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="font-ibm-plex text-[11px] text-kalya-primary">
                      font-outfit-bold
                    </Text>
                    <Text className="font-inter text-[11px] text-kalya-text-tertiary">
                      Outfit-Bold.ttf
                    </Text>
                  </View>
                  <Text className="font-outfit-bold text-xl text-kalya-text-primary">
                    The Sovereign Treasury of Kalya
                  </Text>
                </View>

                {/* Outfit Regular */}
                <View className="p-3 bg-kalya-surface-subtle rounded-kalya-md border border-kalya-border-subtle">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="font-ibm-plex text-[11px] text-kalya-primary">
                      font-outfit
                    </Text>
                    <Text className="font-inter text-[11px] text-kalya-text-tertiary">
                      Outfit-Regular.ttf
                    </Text>
                  </View>
                  <Text className="font-outfit text-base text-kalya-text-secondary">
                    Refined luxury meets mathematical financial precision.
                  </Text>
                </View>

                {/* Inter Bold */}
                <View className="p-3 bg-kalya-surface-subtle rounded-kalya-md border border-kalya-border-subtle">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="font-ibm-plex text-[11px] text-kalya-primary">
                      font-inter-bold
                    </Text>
                    <Text className="font-inter text-[11px] text-kalya-text-tertiary">
                      Inter-Bold.ttf
                    </Text>
                  </View>
                  <Text className="font-inter-bold text-sm text-kalya-text-primary">
                    Confirm Vault Transaction & Allocation Protocol
                  </Text>
                </View>

                {/* Inter Regular */}
                <View className="p-3 bg-kalya-surface-subtle rounded-kalya-md border border-kalya-border-subtle">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="font-ibm-plex text-[11px] text-kalya-primary">font-inter</Text>
                    <Text className="font-inter text-[11px] text-kalya-text-tertiary">
                      Inter-Regular.ttf
                    </Text>
                  </View>
                  <Text className="font-inter text-xs text-kalya-text-secondary leading-relaxed">
                    Default system interface typography optimized for effortless legibility across
                    all screen densities.
                  </Text>
                </View>

                {/* IBM Plex Mono Bold */}
                <View className="p-3 bg-kalya-surface-subtle rounded-kalya-md border border-kalya-border-subtle">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="font-ibm-plex text-[11px] text-kalya-primary">
                      font-ibm-plex-bold
                    </Text>
                    <Text className="font-inter text-[11px] text-kalya-text-tertiary">
                      IBMPlexMono-Bold.ttf
                    </Text>
                  </View>
                  <Text className="font-ibm-plex-bold text-lg text-kalya-text-primary">
                    $1,489,204.85 USD · +24.8% APY
                  </Text>
                </View>

                {/* IBM Plex Mono Regular */}
                <View className="p-3 bg-kalya-surface-subtle rounded-kalya-md border border-kalya-border-subtle">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="font-ibm-plex text-[11px] text-kalya-primary">
                      font-ibm-plex
                    </Text>
                    <Text className="font-inter text-[11px] text-kalya-text-tertiary">
                      IBMPlexMono-Regular.ttf
                    </Text>
                  </View>
                  <Text className="font-ibm-plex text-xs text-kalya-text-secondary">
                    TXN#8841-KL-9924 · NONCE: 0x82fA49c
                  </Text>
                </View>
              </View>
            </View>

            {/* 2. BRAND PRIMITIVES (PRIMARY EMERALD) */}
            <View className="bg-kalya-surface-card rounded-kalya-lg p-5 border border-kalya-border">
              <Text className="font-outfit-bold text-base text-kalya-text-primary mb-1">
                2. Brand Primitives (Emerald Vault)
              </Text>
              <Text className="font-inter text-xs text-kalya-text-tertiary mb-3">
                kalya.primary palette tokens
              </Text>

              <View className="gap-2.5">
                <View className="flex-row items-center p-3 rounded-kalya-md bg-kalya-primary border border-kalya-border-strong">
                  <View className="flex-1">
                    <Text className="font-inter-bold text-xs text-kalya-text-inverse">
                      DEFAULT (Sovereign Emerald)
                    </Text>
                    <Text className="font-ibm-plex text-[11px] text-kalya-mint">
                      #0d3e26 · bg-kalya-primary
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center p-3 rounded-kalya-md bg-kalya-primary-dark border border-kalya-border-strong">
                  <View className="flex-1">
                    <Text className="font-inter-bold text-xs text-kalya-text-inverse">
                      dark (Vault Night)
                    </Text>
                    <Text className="font-ibm-plex text-[11px] text-kalya-mint">
                      #072617 · bg-kalya-primary-dark
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center p-3 rounded-kalya-md bg-kalya-primary-light border border-kalya-border-strong">
                  <View className="flex-1">
                    <Text className="font-inter-bold text-xs text-kalya-text-inverse">
                      light (Forest Green)
                    </Text>
                    <Text className="font-ibm-plex text-[11px] text-kalya-mint-subtle">
                      #1b5e3a · bg-kalya-primary-light
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center p-3 rounded-kalya-md bg-kalya-primary-muted border border-kalya-border-strong">
                  <View className="flex-1">
                    <Text className="font-inter-bold text-xs text-kalya-text-inverse">
                      muted (Deep Sage)
                    </Text>
                    <Text className="font-ibm-plex text-[11px] text-kalya-mint-subtle">
                      #257c4c · bg-kalya-primary-muted
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 3. GOLD SPECTRUM */}
            <View className="bg-kalya-surface-card rounded-kalya-lg p-5 border border-kalya-border">
              <Text className="font-outfit-bold text-base text-kalya-text-primary mb-1">
                3. Gold Radiance Spectrum
              </Text>
              <Text className="font-inter text-xs text-kalya-text-tertiary mb-3">
                kalya.gold palette tokens
              </Text>

              <View className="gap-2.5">
                <View className="flex-row items-center p-3 rounded-kalya-md bg-kalya-gold border border-kalya-gold-warm">
                  <View className="flex-1">
                    <Text className="font-inter-bold text-xs text-kalya-primary-dark">
                      DEFAULT (Radiant Metallic Gold)
                    </Text>
                    <Text className="font-ibm-plex text-[11px] text-kalya-primary">
                      #d4af37 · bg-kalya-gold
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center p-3 rounded-kalya-md bg-kalya-gold-warm border border-kalya-gold-dark">
                  <View className="flex-1">
                    <Text className="font-inter-bold text-xs text-kalya-surface">
                      warm (Burnished Deep Gold)
                    </Text>
                    <Text className="font-ibm-plex text-[11px] text-kalya-gold-soft">
                      #b8912e · bg-kalya-gold-warm
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center p-3 rounded-kalya-md bg-kalya-gold-soft border border-kalya-gold">
                  <View className="flex-1">
                    <Text className="font-inter-bold text-xs text-kalya-gold-dark">
                      soft (Champagne Shimmer)
                    </Text>
                    <Text className="font-ibm-plex text-[11px] text-kalya-text-primary">
                      #fdf3cd · bg-kalya-gold-soft
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center p-3 rounded-kalya-md bg-kalya-gold-dark border border-kalya-border-strong">
                  <View className="flex-1">
                    <Text className="font-inter-bold text-xs text-kalya-surface">
                      dark (Antique Bronze Gold)
                    </Text>
                    <Text className="font-ibm-plex text-[11px] text-kalya-gold-soft">
                      #9a741c · bg-kalya-gold-dark
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 4. MINT & CANVAS SPECTRUM */}
            <View className="bg-kalya-surface-card rounded-kalya-lg p-5 border border-kalya-border">
              <Text className="font-outfit-bold text-base text-kalya-text-primary mb-1">
                4. Lucid Mint & Canvas
              </Text>
              <Text className="font-inter text-xs text-kalya-text-tertiary mb-3">
                kalya.mint and kalya.canvas tokens
              </Text>

              <View className="gap-2.5">
                <View className="flex-row items-center p-3 rounded-kalya-md bg-kalya-mint border border-kalya-border">
                  <View className="flex-1">
                    <Text className="font-inter-bold text-xs text-kalya-text-primary">
                      mint.DEFAULT (Lucid Mint Sage)
                    </Text>
                    <Text className="font-ibm-plex text-[11px] text-kalya-text-secondary">
                      #a3e6be · bg-kalya-mint
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center p-3 rounded-kalya-md bg-kalya-mint-subtle border border-kalya-border-subtle">
                  <View className="flex-1">
                    <Text className="font-inter-bold text-xs text-kalya-text-primary">
                      mint.subtle (Breeze Tint)
                    </Text>
                    <Text className="font-ibm-plex text-[11px] text-kalya-text-secondary">
                      #e1f7ea · bg-kalya-mint-subtle
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center p-3 rounded-kalya-md bg-kalya-mint-light border border-kalya-border-subtle">
                  <View className="flex-1">
                    <Text className="font-inter-bold text-xs text-kalya-text-primary">
                      mint.light (Mint Canvas Wash)
                    </Text>
                    <Text className="font-ibm-plex text-[11px] text-kalya-text-secondary">
                      #edfdf2 · bg-kalya-mint-light
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center p-3 rounded-kalya-md bg-kalya-canvas border border-kalya-border">
                  <View className="flex-1">
                    <Text className="font-inter-bold text-xs text-kalya-text-primary">
                      canvas (Base App Background)
                    </Text>
                    <Text className="font-ibm-plex text-[11px] text-kalya-text-secondary">
                      #edfdf2 · bg-kalya-canvas
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 5. SURFACES */}
            <View className="bg-kalya-surface-card rounded-kalya-lg p-5 border border-kalya-border">
              <Text className="font-outfit-bold text-base text-kalya-text-primary mb-1">
                5. Surface System
              </Text>
              <Text className="font-inter text-xs text-kalya-text-tertiary mb-3">
                kalya.surface tokens
              </Text>

              <View className="gap-2.5">
                <View className="p-3 rounded-kalya-md bg-kalya-surface border border-kalya-border-subtle">
                  <Text className="font-inter-bold text-xs text-kalya-text-primary">
                    surface.DEFAULT & surface.card & surface.raised (#ffffff)
                  </Text>
                  <Text className="font-ibm-plex text-[11px] text-kalya-text-tertiary">
                    bg-kalya-surface · bg-kalya-surface-card · bg-kalya-surface-raised
                  </Text>
                </View>

                <View className="p-3 rounded-kalya-md bg-kalya-surface-subtle border border-kalya-border-subtle">
                  <Text className="font-inter-bold text-xs text-kalya-text-primary">
                    surface.subtle (#f4fcf7)
                  </Text>
                  <Text className="font-ibm-plex text-[11px] text-kalya-text-secondary">
                    bg-kalya-surface-subtle
                  </Text>
                </View>

                <View className="p-3 rounded-kalya-md bg-kalya-surface-muted border border-kalya-border-subtle">
                  <Text className="font-inter-bold text-xs text-kalya-text-primary">
                    surface.muted (#e7f8ec)
                  </Text>
                  <Text className="font-ibm-plex text-[11px] text-kalya-text-secondary">
                    bg-kalya-surface-muted
                  </Text>
                </View>

                <View className="p-3 rounded-kalya-md bg-kalya-surface-dark border border-kalya-border-strong">
                  <Text className="font-inter-bold text-xs text-kalya-text-inverse">
                    surface.dark (#072617)
                  </Text>
                  <Text className="font-ibm-plex text-[11px] text-kalya-mint">
                    bg-kalya-surface-dark
                  </Text>
                </View>
              </View>
            </View>

            {/* 6. TEXT COLORS */}
            <View className="bg-kalya-surface-card rounded-kalya-lg p-5 border border-kalya-border">
              <Text className="font-outfit-bold text-base text-kalya-text-primary mb-1">
                6. Typography Color Hierarchy
              </Text>
              <Text className="font-inter text-xs text-kalya-text-tertiary mb-3">
                kalya.text semantic tokens
              </Text>

              <View className="gap-2.5">
                <View className="p-3 rounded-kalya-md bg-kalya-surface-subtle border border-kalya-border-subtle flex-row justify-between items-center">
                  <Text className="font-inter-bold text-sm text-kalya-text-primary">
                    text.primary (#082919)
                  </Text>
                  <Text className="font-ibm-plex text-xs text-kalya-text-primary">
                    text-kalya-text-primary
                  </Text>
                </View>

                <View className="p-3 rounded-kalya-md bg-kalya-surface-subtle border border-kalya-border-subtle flex-row justify-between items-center">
                  <Text className="font-inter text-sm text-kalya-text-secondary">
                    text.secondary (#2d5e46)
                  </Text>
                  <Text className="font-ibm-plex text-xs text-kalya-text-secondary">
                    text-kalya-text-secondary
                  </Text>
                </View>

                <View className="p-3 rounded-kalya-md bg-kalya-surface-subtle border border-kalya-border-subtle flex-row justify-between items-center">
                  <Text className="font-inter text-sm text-kalya-text-tertiary">
                    text.tertiary (#5d8a72)
                  </Text>
                  <Text className="font-ibm-plex text-xs text-kalya-text-tertiary">
                    text-kalya-text-tertiary
                  </Text>
                </View>

                <View className="p-3 rounded-kalya-md bg-kalya-surface-subtle border border-kalya-border-subtle flex-row justify-between items-center">
                  <Text className="font-inter-bold text-sm text-kalya-text-accent">
                    text.accent (#9a741c)
                  </Text>
                  <Text className="font-ibm-plex text-xs text-kalya-text-accent">
                    text-kalya-text-accent
                  </Text>
                </View>

                <View className="p-3 rounded-kalya-md bg-kalya-primary-dark border border-kalya-border-strong flex-row justify-between items-center">
                  <Text className="font-inter-bold text-sm text-kalya-text-inverse">
                    text.inverse (#ffffff)
                  </Text>
                  <Text className="font-ibm-plex text-xs text-kalya-mint">
                    text-kalya-text-inverse
                  </Text>
                </View>
              </View>
            </View>

            {/* 7. BORDERS & STROKES */}
            <View className="bg-kalya-surface-card rounded-kalya-lg p-5 border border-kalya-border">
              <Text className="font-outfit-bold text-base text-kalya-text-primary mb-1">
                7. Border Token Matrix
              </Text>
              <Text className="font-inter text-xs text-kalya-text-tertiary mb-3">
                kalya.border strokes
              </Text>

              <View className="gap-2.5">
                <View className="p-3 rounded-kalya-md bg-kalya-surface border-2 border-kalya-border-subtle">
                  <Text className="font-inter-bold text-xs text-kalya-text-primary">
                    border.subtle (#cde8d7)
                  </Text>
                  <Text className="font-ibm-plex text-[11px] text-kalya-text-tertiary">
                    border-kalya-border-subtle
                  </Text>
                </View>

                <View className="p-3 rounded-kalya-md bg-kalya-surface border-2 border-kalya-border">
                  <Text className="font-inter-bold text-xs text-kalya-text-primary">
                    border.DEFAULT (#b2dbc0)
                  </Text>
                  <Text className="font-ibm-plex text-[11px] text-kalya-text-secondary">
                    border-kalya-border
                  </Text>
                </View>

                <View className="p-3 rounded-kalya-md bg-kalya-surface border-2 border-kalya-border-strong">
                  <Text className="font-inter-bold text-xs text-kalya-text-primary">
                    border.strong (#0d3e26)
                  </Text>
                  <Text className="font-ibm-plex text-[11px] text-kalya-primary">
                    border-kalya-border-strong
                  </Text>
                </View>

                <View className="p-3 rounded-kalya-md bg-kalya-surface border-2 border-kalya-border-accent">
                  <Text className="font-inter-bold text-xs text-kalya-text-accent">
                    border.accent (#d4af37)
                  </Text>
                  <Text className="font-ibm-plex text-[11px] text-kalya-gold-dark">
                    border-kalya-border-accent
                  </Text>
                </View>
              </View>
            </View>

            {/* 8. FINANCIAL & FLOW SPECIFICS */}
            <View className="bg-kalya-surface-card rounded-kalya-lg p-5 border border-kalya-border">
              <Text className="font-outfit-bold text-base text-kalya-text-primary mb-1">
                8. Financial Allocation & Flow Tokens
              </Text>
              <Text className="font-inter text-xs text-kalya-text-tertiary mb-3">
                Needs, wants, savings, inflow & outflow
              </Text>

              <View className="gap-2.5">
                <View className="flex-row items-center p-3 rounded-kalya-md bg-kalya-needs">
                  <View className="flex-1">
                    <Text className="font-inter-bold text-xs text-kalya-text-inverse">
                      needs (#0d3e26)
                    </Text>
                    <Text className="font-ibm-plex text-[11px] text-kalya-mint">
                      bg-kalya-needs · text-kalya-needs
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center p-3 rounded-kalya-md bg-kalya-wants">
                  <View className="flex-1">
                    <Text className="font-inter-bold text-xs text-kalya-primary-dark">
                      wants (#d4af37)
                    </Text>
                    <Text className="font-ibm-plex text-[11px] text-kalya-primary">
                      bg-kalya-wants · text-kalya-wants
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center p-3 rounded-kalya-md bg-kalya-savings">
                  <View className="flex-1">
                    <Text className="font-inter-bold text-xs text-kalya-text-inverse">
                      savings (#2d7a50)
                    </Text>
                    <Text className="font-ibm-plex text-[11px] text-kalya-mint-light">
                      bg-kalya-savings · text-kalya-savings
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center p-3 rounded-kalya-md bg-kalya-inflow">
                  <View className="flex-1">
                    <Text className="font-inter-bold text-xs text-kalya-text-inverse">
                      inflow (#1b8a51)
                    </Text>
                    <Text className="font-ibm-plex text-[11px] text-kalya-mint-light">
                      bg-kalya-inflow · text-kalya-inflow
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center p-3 rounded-kalya-md bg-kalya-outflow">
                  <View className="flex-1">
                    <Text className="font-inter-bold text-xs text-kalya-text-inverse">
                      outflow (#c83535)
                    </Text>
                    <Text className="font-ibm-plex text-[11px] text-kalya-surface">
                      bg-kalya-outflow · text-kalya-outflow
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 9. LIQUID GLASS TOKENS */}
            <View className="bg-kalya-primary-dark rounded-kalya-lg p-5 border border-kalya-border-strong">
              <Text className="font-outfit-bold text-base text-kalya-text-inverse mb-1">
                9. Liquid Glass Tokens
              </Text>
              <Text className="font-inter text-xs text-kalya-mint mb-3">
                kalya.glass translucency & borders
              </Text>

              <View className="gap-2.5">
                <View className="p-3 rounded-kalya-md bg-kalya-glass-ultra-thin border border-kalya-glass-border">
                  <Text className="font-inter-bold text-xs text-kalya-text-inverse">
                    glass.ultra-thin (40% White)
                  </Text>
                  <Text className="font-ibm-plex text-[11px] text-kalya-gold-soft">
                    bg-kalya-glass-ultra-thin
                  </Text>
                </View>

                <View className="p-3 rounded-kalya-md bg-kalya-glass-base border border-kalya-glass-border">
                  <Text className="font-inter-bold text-xs text-kalya-primary-dark">
                    glass.base (65% White)
                  </Text>
                  <Text className="font-ibm-plex text-[11px] text-kalya-primary">
                    bg-kalya-glass-base
                  </Text>
                </View>

                <View className="p-3 rounded-kalya-md bg-kalya-glass-thick border border-kalya-glass-border">
                  <Text className="font-inter-bold text-xs text-kalya-primary-dark">
                    glass.thick (82% White)
                  </Text>
                  <Text className="font-ibm-plex text-[11px] text-kalya-primary">
                    bg-kalya-glass-thick
                  </Text>
                </View>

                <View className="p-3 rounded-kalya-md bg-kalya-glass-emerald border border-kalya-glass-border-emerald">
                  <Text className="font-inter-bold text-xs text-kalya-text-inverse">
                    glass.emerald (88% Emerald)
                  </Text>
                  <Text className="font-ibm-plex text-[11px] text-kalya-mint">
                    bg-kalya-glass-emerald · border-kalya-glass-border-emerald
                  </Text>
                </View>

                <View className="p-3 rounded-kalya-md bg-kalya-glass-emerald-dark border border-kalya-glass-border-emerald">
                  <Text className="font-inter-bold text-xs text-kalya-text-inverse">
                    glass.emerald-dark (95% Vault Night)
                  </Text>
                  <Text className="font-ibm-plex text-[11px] text-kalya-mint">
                    bg-kalya-glass-emerald-dark
                  </Text>
                </View>

                <View className="p-3 rounded-kalya-md bg-kalya-glass-gold border border-kalya-glass-border-gold">
                  <Text className="font-inter-bold text-xs text-kalya-text-inverse">
                    glass.gold (12% Gold)
                  </Text>
                  <Text className="font-ibm-plex text-[11px] text-kalya-gold">
                    bg-kalya-glass-gold · border-kalya-glass-border-gold
                  </Text>
                </View>

                <View className="p-3 rounded-kalya-md bg-kalya-glass-gold-strong border border-kalya-glass-border-gold">
                  <Text className="font-inter-bold text-xs text-kalya-text-inverse">
                    glass.gold-strong (25% Gold)
                  </Text>
                  <Text className="font-ibm-plex text-[11px] text-kalya-gold">
                    bg-kalya-glass-gold-strong
                  </Text>
                </View>
              </View>
            </View>

            {/* 10. BORDER RADIUS SCALE */}
            <View className="bg-kalya-surface-card rounded-kalya-lg p-5 border border-kalya-border">
              <Text className="font-outfit-bold text-base text-kalya-text-primary mb-1">
                10. Border Radius Hierarchy
              </Text>
              <Text className="font-inter text-xs text-kalya-text-tertiary mb-3">
                kalya borderRadius scale
              </Text>

              <View className="gap-2.5">
                <View className="p-2.5 bg-kalya-surface-subtle border border-kalya-border rounded-kalya-xs">
                  <Text className="font-inter-bold text-xs text-kalya-text-primary">
                    rounded-kalya-xs (6px)
                  </Text>
                </View>
                <View className="p-2.5 bg-kalya-surface-subtle border border-kalya-border rounded-kalya-sm">
                  <Text className="font-inter-bold text-xs text-kalya-text-primary">
                    rounded-kalya-sm (10px)
                  </Text>
                </View>
                <View className="p-2.5 bg-kalya-surface-subtle border border-kalya-border rounded-kalya-md">
                  <Text className="font-inter-bold text-xs text-kalya-text-primary">
                    rounded-kalya-md (16px)
                  </Text>
                </View>
                <View className="p-2.5 bg-kalya-surface-subtle border border-kalya-border rounded-kalya-lg">
                  <Text className="font-inter-bold text-xs text-kalya-text-primary">
                    rounded-kalya-lg (24px)
                  </Text>
                </View>
                <View className="p-2.5 bg-kalya-surface-subtle border border-kalya-border rounded-kalya-xl">
                  <Text className="font-inter-bold text-xs text-kalya-text-primary">
                    rounded-kalya-xl (32px)
                  </Text>
                </View>
                <View className="p-2.5 bg-kalya-surface-subtle border border-kalya-border rounded-kalya-pill items-center">
                  <Text className="font-inter-bold text-xs text-kalya-text-primary">
                    rounded-kalya-pill (9999px)
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
