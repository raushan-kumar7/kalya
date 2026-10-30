import { ResetPasswordForm } from '@/components/forms/auth';
import { AuthContainer } from '@/components/shared';
import { toast } from '@/components/ui/feedback/toast';
import { useAuth } from '@/hooks/auth';
import { useCooldown } from '@/hooks/use-cooldown';
import { zodResolver } from '@hookform/resolvers/zod';
import { AUTH_LIMITS } from '@kalya/types';
import { ResetPasswordOtpFormInput, ResetPasswordOtpFormSchema } from '@kalya/validations';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const ResetPassword = () => {
  const router = useRouter();
  const { email: paramEmail = '' } = useLocalSearchParams<{ email?: string }>();
  const {
    resetPasswordOtp,
    isResettingPasswordOtp,
    sendPasswordResetOtp,
    isSendingOtp,
    pendingEmail,
  } = useAuth();
  const [formError, setFormError] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const { remaining, isActive, start } = useCooldown(AUTH_LIMITS.OTP_RESEND_SECONDS, {
    startOnMount: true,
  });

  const email = (paramEmail || pendingEmail || '').trim().toLowerCase();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordOtpFormInput>({
    resolver: zodResolver(ResetPasswordOtpFormSchema as any),
    defaultValues: { email, otp: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!email) {
      router.replace('/(auth)/forgot-password');
    }
  }, [email, router]);

  const onPressSubmit = async (values: ResetPasswordOtpFormInput) => {
    setFormError('');
    try {
      await resetPasswordOtp({
        email,
        otp: values.otp,
        password: values.password,
      });
      toast.success('Password reset successfully! Please sign in with your new password.');
      router.replace('/(auth)/sign-in');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Invalid or expired code. Please try again.';
      setFormError(msg);
      toast.error(msg, { title: 'Reset Failed' });
    }
  };

  const onResend = async () => {
    if (isActive || isSendingOtp) return;
    setFormError('');
    setResendSuccess(false);

    if (!email) {
      const msg = 'Account email is missing. Please restart password recovery.';
      setFormError(msg);
      toast.error(msg);
      return;
    }

    try {
      setValue('otp', '');
      await sendPasswordResetOtp(email);
      setResendSuccess(true);
      toast.success('A new code has been sent to your email.');
      start();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'We could not send a new code. Please try again.';
      setFormError(msg);
      toast.error(msg, { title: 'Resend Failed' });
    }
  };

  if (!email) return null;

  return (
    <AuthContainer showBackButton>
      <ResetPasswordForm
        control={control}
        errors={errors}
        email={email}
        onSubmit={handleSubmit(onPressSubmit)}
        onResend={onResend}
        resendLabel={
          isActive
            ? `Resend code in ${remaining}s`
            : isSendingOtp
              ? 'Sending code...'
              : 'Resend code'
        }
        resendDisabled={isActive || isSendingOtp}
        resendSuccess={resendSuccess}
        loading={isResettingPasswordOtp}
        error={formError}
      />
    </AuthContainer>
  );
};

export default ResetPassword;
