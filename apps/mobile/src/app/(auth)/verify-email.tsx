/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowRight, CircleCheck, MailCheck } from 'lucide-react-native';
import { AuthContainer } from '@/components/shared';
import { Button, OtpInput, Pressable, Typo } from '@/components/ui';
import { toast } from '@/components/ui/feedback/toast';
import { useAuth } from '@/hooks/auth';
import { useCooldown } from '@/hooks/use-cooldown';
import { AUTH_LIMITS } from '@kalya/types';

const IconBadge = ({ children }: { children: React.ReactNode }) => (
  <View className="mb-6 h-20 w-20 items-center justify-center rounded-kalya-pill border border-kalya-border-subtle bg-kalya-mint-subtle">
    {children}
  </View>
);

const getErrorMessage = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

const VerifyEmail = () => {
  const router = useRouter();
  const { email: paramEmail } = useLocalSearchParams<{ email?: string }>();
  const { verifyEmailOtp, sendVerificationOtp, isVerifyingEmailOtp, isSendingOtp, pendingEmail } =
    useAuth();

  // The code was already sent during sign-up, so the cooldown starts on mount.
  const { remaining, isActive, start } = useCooldown(AUTH_LIMITS.OTP_RESEND_SECONDS, {
    startOnMount: true,
  });

  const [otp, setOtp] = useState('');
  const [formError, setFormError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const email = (paramEmail || pendingEmail || '').trim().toLowerCase();

  const goToSignIn = () => router.replace('/(auth)/sign-in');
  const goToDashboard = () => router.replace('/(tabs)'); // adjust to your home route

  const handleChange = (code: string) => {
    setOtp(code);
    if (formError) setFormError('');
  };

  // `codeToVerify` comes from OtpInput's onComplete, because `otp` state
  // may not have updated yet on the render where the last digit is typed.
  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify ?? otp;

    if (isVerifyingEmailOtp) return;
    if (!email) {
      setFormError('Email not found. Please sign up again.');
      return;
    }
    if (code.length !== AUTH_LIMITS.OTP_LENGTH) {
      setFormError(`Enter the ${AUTH_LIMITS.OTP_LENGTH}-digit code`);
      return;
    }

    try {
      setFormError('');
      await verifyEmailOtp({ email, otp: code }); // match your VerifyEmailOtpDto
      setIsSuccess(true);
      toast.success('Email verified successfully!');
    } catch (e) {
      setOtp('');
      const errorMsg = getErrorMessage(e, 'Invalid or expired code. Please try again.');
      setFormError(errorMsg);
      toast.error(errorMsg, { title: 'Verification Failed' });
    }
  };

  const handleResend = async () => {
    if (!email || isActive || isSendingOtp) return;

    try {
      setFormError('');
      setOtp('');
      await sendVerificationOtp(email);
      toast.success('A new verification code has been sent to your email.');
      start();
    } catch (e) {
      const errorMsg = getErrorMessage(e, 'We could not send a new code. Please try again.');
      setFormError(errorMsg);
      toast.error(errorMsg, { title: 'Resend Failed' });
    }
  };

  /* ---------- Success ---------- */
  if (isSuccess) {
    return (
      <AuthContainer>
        <View className="w-full items-center">
          <IconBadge>
            <CircleCheck size={40} color="#0d3e26" />
          </IconBadge>
          <Typo size="title-lg" className="text-center text-kalya-text-primary">
            Email Verified!
          </Typo>
          <Typo size="body-md" tone="secondary" className="mt-2 text-center leading-6">
            Your account is verified and ready to manage your wealth.
          </Typo>
          <View className="mt-7 w-full">
            <Button
              title="Continue to Dashboard"
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight size={18} color="#ffffff" />}
              onPress={goToDashboard}
            />
          </View>
        </View>
      </AuthContainer>
    );
  }

  /* ---------- Enter code ---------- */
  return (
    <AuthContainer showBackButton onBackPress={goToSignIn}>
      <View className="w-full items-center">
        <IconBadge>
          <MailCheck size={36} color="#0d3e26" />
        </IconBadge>

        <Typo size="title-lg" className="text-center text-kalya-text-primary">
          Enter Verification Code
        </Typo>
        <Typo size="body-md" tone="secondary" className="mt-2 text-center leading-6">
          We sent a {AUTH_LIMITS.OTP_LENGTH}-digit code to
        </Typo>
        <Typo size="body-md" className="mb-6 mt-0.5 text-center font-inter-bold text-kalya-primary">
          {email || 'your email'}
        </Typo>

        <OtpInput
          value={otp}
          onChange={handleChange}
          onComplete={handleVerify}
          error={formError}
          disabled={isVerifyingEmailOtp}
        />

        <View className="mt-6 w-full">
          <Button
            title="Verify Email"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isVerifyingEmailOtp}
            loadingText="Verifying..."
            disabled={otp.length !== AUTH_LIMITS.OTP_LENGTH || isVerifyingEmailOtp}
            onPress={() => handleVerify()}
          />
        </View>

        <View className="mt-6 flex-row items-center justify-center gap-1">
          <Typo size="body-sm" tone="muted">
            Didn't receive the code?
          </Typo>
          <Pressable
            onPress={handleResend}
            disabled={isActive || isSendingOtp || !email}
            hitSlop={8}
          >
            <Typo
              size="body-sm"
              className={`font-inter-bold ${
                isActive || isSendingOtp ? 'text-kalya-text-muted' : 'text-kalya-primary'
              }`}
            >
              {isActive ? `Resend in ${remaining}s` : isSendingOtp ? 'Sending...' : 'Resend Code'}
            </Typo>
          </Pressable>
        </View>

        <Pressable onPress={goToSignIn} hitSlop={8} className="mt-5 py-1">
          <Typo size="body-sm" className="font-inter-bold text-kalya-primary-light">
            Back to Sign In
          </Typo>
        </Pressable>
      </View>
    </AuthContainer>
  );
};

export default VerifyEmail;
