import { ForgotPasswordFrom } from '@/components/forms/auth';
import { AuthContainer } from '@/components/shared';
import { toast } from '@/components/ui/feedback/toast';
import { useAuth } from '@/hooks/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { ForgotPasswordInput, ForgotPasswordSchema } from '@kalya/validations';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const ForgotPassword = () => {
  const router = useRouter();
  const [formError, setFormError] = useState('');
  const { sendPasswordResetOtp, isSendingOtp, setPendingEmail } = useAuth();

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema as any),
    defaultValues: { email: '' },
  });

  const onPressSubmit = async (payload: ForgotPasswordInput) => {
    setFormError('');
    try {
      const email = payload.email.trim().toLowerCase();
      await sendPasswordResetOtp(email);
      setPendingEmail(email);
      reset();
      toast.success('Password reset code sent to your email');
      router.replace({
        pathname: '/(auth)/reset-password',
        params: { email },
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Could not send reset code. Please check your email and try again.';
      setError('root.server', { type: 'server', message: msg });
      setFormError(msg);
      toast.error(msg, { title: 'Reset Request Failed' });
    }
  };

  return (
    <AuthContainer showBackButton>
      <ForgotPasswordFrom
        control={control}
        errors={errors}
        onSubmit={handleSubmit(onPressSubmit)}
        onSignIn={() => router.replace('/(auth)/sign-in')}
        loading={isSendingOtp}
        error={formError}
      />
    </AuthContainer>
  );
};

export default ForgotPassword;
