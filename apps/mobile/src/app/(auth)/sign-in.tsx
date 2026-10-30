import { useState } from 'react';
import { View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { SigninForm } from '@/components/forms/auth';
import { AuthContainer } from '@/components/shared';
import { SignInInput, SignInSchema } from '@kalya/validations';
import { useAuth } from '@/hooks/auth';
import { Button } from '@/components/ui';
import { toast } from '@/components/ui/feedback/toast';
import { Fingerprint } from 'lucide-react-native';

const SIGN_IN_DEFAULTS: SignInInput = {
  identifier: '',
  password: '',
  rememberMe: false,
};

const SignIn = () => {
  const router = useRouter();
  const [formError, setFormError] = useState('');

  const { signIn, isSigningIn, biometric, unlockWithBiometrics } = useAuth();

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema as any),
    defaultValues: SIGN_IN_DEFAULTS,
  });

  const onPressSubmit = async (payload: SignInInput) => {
    setFormError('');

    try {
      await signIn(payload);
      reset(SIGN_IN_DEFAULTS);
      toast.success('Welcome back to Kalya!');
      router.replace('/(tabs)');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'We could not sign you in. Check your credentials and try again.';

      setError('root.server', {
        type: 'server',
        message: message,
      });

      setFormError(message);
      toast.error(message, { title: 'Sign In Failed' });
    }
  };

  const onBiometricUnlock = async () => {
    setFormError('');
    const ok = await unlockWithBiometrics(`Unlock Kalya with ${biometric.biometricLabel}`);
    if (ok) {
      toast.success('Biometric unlock successful!');
      router.replace('/(tabs)');
    } else {
      const msg = 'Biometric authentication failed. Please sign in with your password.';
      setFormError(msg);
      toast.error(msg);
    }
  };

  const showBiometrics = biometric.isSupported && biometric.isEnrolled && biometric.isEnabled;

  return (
    <AuthContainer>
      <View className="w-full">
        <SigninForm
          control={control}
          errors={errors}
          onSubmit={handleSubmit(onPressSubmit)}
          onForgotPassword={() => router.push('/(auth)/forgot-password')}
          onSignUp={() => router.push('/(auth)/sign-up')}
          loading={isSigningIn}
          error={formError}
        />

        {showBiometrics && (
          <View className="mt-4 w-full">
            <Button
              title={`Sign In with ${biometric.biometricLabel}`}
              variant="outline"
              size="lg"
              fullWidth
              disabled={isSigningIn}
              leftIcon={<Fingerprint size={20} color="#0d3e26" />}
              onPress={onBiometricUnlock}
            />
          </View>
        )}
      </View>
    </AuthContainer>
  );
};

export default SignIn;
