import React from 'react';
import { View } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import {
  Bell,
  CreditCard,
  Mail,
  Shield,
  ShieldCheck,
  Smartphone,
  User as UserIcon,
} from 'lucide-react-native';
import { Avatar, Badge, Button, Card, Header, ListItem, Section, Typo } from '@/components/ui';
import { TabScreenWrapper } from '@/components/shared/tabs';
import { useAuth } from '@/hooks/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation<any>();
  const { user, biometric, signOut, signOutMutation } = useAuth();
  const isSigningOut = signOutMutation.isPending;

  const handleBack = () => {
    if (navigation?.navigate) {
      navigation.navigate('index');
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/(tabs)');
    }
  };

  const handleSignOut = () => {
    signOut().catch(() => {});
  };

  const displayName = user?.name || user?.username || 'Kalya Member';
  const displayHandle = user?.username ? `@${user.username}` : user?.email || '—';

  return (
    <TabScreenWrapper
      hideFab
      header={
        <Header
          showBack
          onBack={handleBack}
          title="Profile"
          subtitle="Account settings & preferences"
        />
      }
    >
      {/* Profile Overview Card */}
      <Card variant="surface" padding="lg" className="items-center text-center">
        <Avatar name={displayName} source={user?.image ? { uri: user.image } : null} size="xl" />
        <Typo variant="title-md" className="mt-3 font-outfit-bold text-kalya-text-primary">
          {displayName}
        </Typo>
        <Typo variant="body-sm" tone="secondary" className="mt-0.5">
          {displayHandle}
        </Typo>

        <View className="mt-3 flex-row items-center gap-2">
          {user?.emailVerified ? (
            <Badge variant="savings" label="Verified Account" showDot />
          ) : (
            <Badge variant="wants" label="Unverified Email" />
          )}
        </View>
      </Card>

      {/* Account Details */}
      <Section title="Account Details">
        <Card padding="none" className="overflow-hidden">
          <ListItem
            title="Full Name"
            subtitle={user?.name || '—'}
            leading={<UserIcon size={20} color="#0d3e26" />}
          />
          <ListItem
            title="Email Address"
            subtitle={user?.email || '—'}
            leading={<Mail size={20} color="#0d3e26" />}
          />
          <ListItem
            title="Membership Tier"
            subtitle="Sovereign Vault"
            leading={<Shield size={20} color="#0d3e26" />}
            bottomDivider={false}
          />
        </Card>
      </Section>

      {/* Security */}
      <Section title="Security & Authentication">
        <Card padding="none" className="overflow-hidden">
          <ListItem
            title="Biometric Protection"
            subtitle={
              biometric.isEnabled ? `Active (${biometric.biometricLabel})` : 'Biometrics disabled'
            }
            leading={<ShieldCheck size={20} color="#0d3e26" />}
          />
          <ListItem
            title="App Version"
            subtitle="v1.0.0 (Production Build)"
            leading={<Smartphone size={20} color="#0d3e26" />}
            bottomDivider={false}
          />
        </Card>
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        <Card padding="none" className="overflow-hidden">
          <ListItem
            title="Base Currency"
            subtitle="Indian Rupee (INR ₹)"
            leading={<CreditCard size={20} color="#0d3e26" />}
          />
          <ListItem
            title="Push Notifications"
            subtitle="Active for transaction and budget alerts"
            leading={<Bell size={20} color="#0d3e26" />}
            bottomDivider={false}
          />
        </Card>
      </Section>

      {/* Sign Out Button */}
      <View className="pt-2">
        <Button
          title="Sign Out of Kalya"
          variant="destructive"
          size="lg"
          isLoading={isSigningOut}
          onPress={handleSignOut}
        />
      </View>
    </TabScreenWrapper>
  );
}
