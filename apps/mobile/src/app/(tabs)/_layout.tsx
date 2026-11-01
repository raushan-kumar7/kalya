import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { CustomTabBar, QuickActionsSheet, TABS, TabsFab } from '@/components/shared/tabs';

export default function TabsLayout() {
  return (
    <View className="flex-1">
      <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
        {TABS.map((tab) => (
          <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title }} />
        ))}

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
      </Tabs>

      {/* Persistent Floating Action Button positioned above tab bar */}
      <TabsFab />

      {/* Global Quick Financial Actions Bottom Sheet */}
      <QuickActionsSheet />
    </View>
  );
}
