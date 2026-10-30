import {
  Button,
  FormField,
  Input,
  OtpInput,
  PasswordField,
  Pressable,
  Typo,
} from '@/components/ui';
import { ResetPasswordOtpFormInput } from '@kalya/validations';
import { KeyRound, Lock } from 'lucide-react-native';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { View } from 'react-native';

interface ResetPasswordFormProps {
  control: Control<ResetPasswordOtpFormInput>;
  errors: FieldErrors<ResetPasswordOtpFormInput>;
  email: string;
  onSubmit: () => void;
  onResend: () => void;
  resendLabel: string;
  resendDisabled: boolean;
  resendSuccess?: boolean;
  loading?: boolean;
  error?: string;
}

export const ResetPasswordForm = ({
  control,
  errors,
  email,
  onSubmit,
  onResend,
  resendLabel,
  resendDisabled,
  resendSuccess,
  loading,
  error,
}: ResetPasswordFormProps) => {
  return (
    <View className="w-full">
      <View className="mb-7 items-center">
        <View className="mb-5 h-16 w-16 items-center justify-center rounded-kalya-pill border border-kalya-border-subtle bg-kalya-mint-subtle">
          <KeyRound size={28} color="#0d3e26" />
        </View>
        <Typo size="title-lg" className="text-center text-kalya-text-primary">
          Reset password
        </Typo>
        <Typo size="body-md" tone="secondary" className="mt-2 text-center leading-6">
          If an account exists for
        </Typo>
        <Typo size="body-md" className="mt-1 text-center font-inter-bold text-kalya-primary">
          {email}
        </Typo>
        <Typo size="body-md" tone="secondary" className="text-center leading-6">
          we sent a code. Enter it below with your new password.
        </Typo>
      </View>

      <Controller
        control={control}
        name="otp"
        render={({ field: { onChange, onBlur, value } }) => (
          <OtpInput
            value={value}
            onChange={onChange}
            error={errors.otp?.message}
            disabled={loading}
          />
        )}
      />

      <View className="mb-4 mt-4">
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField label="New Password" required error={errors.password?.message}>
              <PasswordField
                placeholder="Enter new password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon={<Lock size={18} color="#5d8a72" />}
                // secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="next"
                editable={!loading}
              />
            </FormField>
          )}
        />
      </View>

      <View className="mb-5">
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField label="Confirm Password" required error={errors.confirmPassword?.message}>
              <PasswordField
                placeholder="Re-enter new password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon={<Lock size={18} color="#5d8a72" />}
                // secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={onSubmit}
                editable={!loading}
              />
            </FormField>
          )}
        />
      </View>

      {!!error && (
        <View className="mb-4 rounded-kalya-sm border border-kalya-outflow/30 bg-kalya-outflow/5 px-3 py-3">
          <Typo size="body-sm" tone="outflow">
            {error}
          </Typo>
        </View>
      )}

      {resendSuccess && !error && (
        <View className="mb-4 rounded-kalya-sm border border-kalya-primary/30 bg-kalya-primary/10 px-3 py-3">
          <Typo size="body-sm" className="text-center font-inter-medium text-kalya-primary">
            A fresh code has been sent to your email.
          </Typo>
        </View>
      )}

      <Button
        title="Reset Password"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={loading}
        loadingText="Updating..."
        onPress={onSubmit}
      />

      <View className="mt-5 flex-row items-center justify-center gap-1">
        <Typo size="body-sm" tone="muted">
          Didn't receive the code?
        </Typo>
        <Pressable onPress={onResend} disabled={resendDisabled} hitSlop={8} className="py-1">
          <Typo
            size="body-sm"
            className={`font-inter-bold ${
              resendDisabled ? 'text-kalya-text-muted' : 'text-kalya-primary'
            }`}
          >
            {resendLabel}
          </Typo>
        </Pressable>
      </View>
    </View>
  );
};
