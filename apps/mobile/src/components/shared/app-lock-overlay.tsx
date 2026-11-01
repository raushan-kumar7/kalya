import { useAuth } from '@/hooks/auth';
import { useRouter } from 'expo-router';
import { View, Image } from 'react-native';
import { Button, Modal, Typo } from '../ui';
import { logoColored } from '@/constants/images';
import { Fingerprint, Lock } from 'lucide-react-native';

interface AppLockOverlayProps {
  visible: boolean;
}

export const AppLockOverlay = ({ visible }: AppLockOverlayProps) => {
  const router = useRouter();
  const { unlockWithBiometrics, biometric, signOut } = useAuth();

  if (!visible) return null;

  const handleUnlock = async () => {
    await unlockWithBiometrics(`Unlock Kalya with ${biometric.biometricLabel}`);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <Modal visible={visible} dismissible={false} onClose={() => {}} className="max-w-[360px] p-6">
      <View className="items-center py-4">
        {/* Logo */}
        <Image
          source={logoColored}
          resizeMode="contain"
          style={{ width: 140, height: 48 }}
          className="mb-6"
        />

        {/* Lock Icon Badge */}
        <View className="h-16 w-16 rounded-full bg-kalya-mint-subtle border border-kalya-border-subtle items-center justify-center mb-4">
          <Lock size={32} color="#0d3e26" />
        </View>

        {/* Title & Description */}
        <Typo variant="title-md" className="text-kalya-text-primary text-center">
          Kalya is Locked
        </Typo>
        <Typo variant="body-sm" tone="secondary" className="text-center mt-2 max-w-[260px] mb-8">
          Please verify your identity using {biometric.biometricLabel} to view your finances.
        </Typo>

        {/* Actions */}
        <View className="w-full gap-3">
          <Button
            title={`Unlock with ${biometric.biometricLabel}`}
            onPress={handleUnlock}
            leftIcon={<Fingerprint size={20} color="#ffffff" />}
          />
          <Button title="Log Out & Switch Account" variant="ghost" onPress={handleSignOut} />
        </View>
      </View>
    </Modal>
  );
};
