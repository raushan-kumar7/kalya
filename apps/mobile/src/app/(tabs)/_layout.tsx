import { Button, Typo } from '@/components/ui';
import { useAuth } from '@/hooks/auth';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

const _Layout = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View className="flex-1 bg-kalya-canvas items-center justify-center">
      <Typo variant="body-lg" tone="secondary">
        {user?.name}
      </Typo>

      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
};

export default _Layout;
