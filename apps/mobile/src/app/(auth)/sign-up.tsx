import { SignUpForm } from '@/components/forms/auth';
import { AuthContainer } from '@/components/shared';
import { toast } from '@/components/ui/feedback/toast';
import { useAuth, useUsernameAvailability } from '@/hooks/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignUpInput, SignUpSchema } from '@kalya/validations';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { View } from 'react-native';

const SIGN_UP_DEFAULTS: SignUpInput = {
  first_name: '',
  middle_name: '',
  last_name: '',
  username: '',
  email: '',
  password: '',
};

const SignUp = () => {
  const router = useRouter();
  const [formError, setFormError] = useState('');
  const { signUp, isSigningUp, setPendingEmail } = useAuth();

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema as any),
    defaultValues: SIGN_UP_DEFAULTS,
  });

  const usernameValue = useWatch({ control, name: 'username' }) ?? '';
  const username = useUsernameAvailability(usernameValue);

  const trimmedUsername = usernameValue.trim();
  const usernameBlocked =
    trimmedUsername.length > 0 && username.status !== 'available' && username.status !== 'error';

  const onPressSubmit = async (payload: SignUpInput) => {
    if (usernameBlocked) return;
    try {
      setFormError('');
      const signUpPayload: SignUpInput = {
        ...payload,
        first_name: payload.first_name.trim(),
        last_name: payload.last_name.trim(),
        middle_name: payload.middle_name?.trim() ? payload.middle_name.trim() : undefined,
        username: payload.username.trim().toLowerCase(),
        displayUsername: payload.username.trim(),
        email: payload.email.toLowerCase(),
      };

      const result = await signUp(signUpPayload);
      if (result.user) {
        setPendingEmail(signUpPayload.email);
        reset(SIGN_UP_DEFAULTS);
        toast.success('Account created! Please verify your email.');
        router.replace({
          pathname: '/(auth)/verify-email',
          params: { email: signUpPayload.email },
        });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to sign up';
      setError('root.server', {
        type: 'server',
        message: msg,
      });
      setFormError(msg);
      toast.error(msg, { title: 'Sign Up Failed' });
    }
  };
  return (
    <AuthContainer>
      <View className="w-full">
        <SignUpForm
          control={control}
          errors={errors}
          onSubmit={handleSubmit(onPressSubmit)}
          onSignIn={() => router.replace('/(auth)/sign-in')}
          loading={isSigningUp || usernameBlocked}
          error={formError}
          usernameCheck={username}
        />
      </View>
    </AuthContainer>
  );
};

export default SignUp;
