'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from '@kalya/types';
import { useAuth } from '@/hooks/auth';
import { useProfileQuery } from '@/hooks/users';
import { Card, CardContent, Skeleton } from '@/components/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/navigation/tabs';
import {
  NotificationsTab,
  PreferencesTab,
  ProfileTab,
  SecurityTab,
  TABS,
  type UserSettingsTab,
} from '@/components/dashboard/account';

/* ------------------------------------------------------------------ */
/* Loading Skeleton                                                   */
/* ------------------------------------------------------------------ */

function AccountLoadingSkeleton() {
  return (
    <div className="space-y-6 pt-2 pb-12 max-w-6xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-48 rounded" />
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded" />
      </div>

      {/* User Hero Banner Skeleton */}
      <Card className="border-border/80 bg-surface/90">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-44 rounded" />
                <Skeleton className="h-4 w-60 rounded" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Bar Skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Content Skeleton */}
      <Card className="border-border/80 bg-surface/90">
        <CardContent className="p-8 space-y-6">
          <Skeleton className="h-6 w-48 rounded" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Account Settings View                                              */
/* ------------------------------------------------------------------ */

function AccountSettingsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { user: authUser } = useAuth();
  const { data: profileUser, isLoading: isProfileLoading } = useProfileQuery();

  const user: User | null = (profileUser ?? authUser) as User | null;

  // Sync active tab with URL query parameter
  const tabQuery = searchParams.get('tab');
  const validTabKeys = React.useMemo(() => TABS.map((t) => t.key), []);
  const initialTab = (
    tabQuery && validTabKeys.includes(tabQuery as UserSettingsTab['key']) ? tabQuery : 'profile'
  ) as UserSettingsTab['key'];

  const [activeTab, setActiveTab] = React.useState<UserSettingsTab['key']>(initialTab);

  // Keep state synchronized if URL search param changes externally
  React.useEffect(() => {
    if (tabQuery && validTabKeys.includes(tabQuery as UserSettingsTab['key'])) {
      setActiveTab(tabQuery as UserSettingsTab['key']);
    }
  }, [tabQuery, validTabKeys]);

  const handleTabChange = (nextTab: string) => {
    const tabKey = nextTab as UserSettingsTab['key'];
    setActiveTab(tabKey);

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabKey);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const currentTabConfig = TABS.find((t) => t.key === activeTab) || TABS[0];

  return (
    <div className="space-y-6 pt-5 pb-5 w-full max-w-8xl">
      {/* ------------------------------------------------------------ */}
      {/* 3. Navigation Tabs & Content Panels                          */}
      {/* ------------------------------------------------------------ */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        {/* Navigation Tabs List */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3">
          <TabsList
            variant="pill"
            className="w-full sm:w-auto p-1 bg-surface-raised border border-border/80 overflow-x-auto no-scrollbar justify-start"
          >
            {TABS.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  icon={TabIcon ? <TabIcon size={15} /> : undefined}
                  className="px-4 py-2 text-caption sm:text-body-sm font-medium transition-all"
                >
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Current Tab Context Summary */}
          {currentTabConfig?.description && (
            <p className="text-caption text-text-muted hidden md:block">
              {currentTabConfig.description}
            </p>
          )}
        </div>

        {/* Tab 1: Profile */}
        <TabsContent value="profile" className="mt-0 focus-visible:ring-0">
          <motion.div
            key="tab-profile"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ProfileTab user={user} />
          </motion.div>
        </TabsContent>

        {/* Tab 2: Account & Security */}
        <TabsContent value="account-security" className="mt-0 focus-visible:ring-0">
          <motion.div
            key="tab-security"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SecurityTab user={user} />
          </motion.div>
        </TabsContent>

        {/* Tab 3: Notifications */}
        <TabsContent value="notification" className="mt-0 focus-visible:ring-0">
          <motion.div
            key="tab-notification"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <NotificationsTab user={user} />
          </motion.div>
        </TabsContent>

        {/* Tab 4: Preferences */}
        <TabsContent value="preferences" className="mt-0 focus-visible:ring-0">
          <motion.div
            key="tab-preferences"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <PreferencesTab user={user} />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page Export with Suspense Boundary                                 */
/* ------------------------------------------------------------------ */

export default function AccountSettingsPage() {
  return (
    <React.Suspense fallback={<AccountLoadingSkeleton />}>
      <AccountSettingsContent />
    </React.Suspense>
  );
}
