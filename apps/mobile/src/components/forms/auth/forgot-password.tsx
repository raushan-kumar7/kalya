/* eslint-disable react/no-unescaped-entities */
import { Button, Divider, FormField, Input, Typo } from '@/components/ui';
import { ForgotPasswordInput } from '@kalya/validations';
import { Mail, Send } from 'lucide-react-native';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { View } from 'react-native';

interface ForgotPasswordFormProps {
  control: Control<ForgotPasswordInput>;
  errors: FieldErrors<ForgotPasswordInput>;
  onSubmit: () => void;
  onSignIn?: () => void;
  loading?: boolean;
  error?: string;
}

export const ForgotPasswordFrom = ({
  control,
  errors,
  onSubmit,
  onSignIn,
  loading,
  error,
}: ForgotPasswordFormProps) => {
  return (
    <View className="w-full">
      <View className="mb-7 items-center">
        <View className="mb-5 h-16 w-16 items-center justify-center rounded-kalya-pill border border-kalya-border-subtle bg-kalya-mint-subtle">
          <Mail size={28} color="#0d3e26" />
        </View>
        <Typo size="title-lg" className="text-center text-kalya-text-primary">
          Forgot password?
        </Typo>
        <Typo size="body-md" tone="secondary" className="mt-2 text-center leading-6">
          Enter your account email and we'll send you a 6-digit code to reset your password.
        </Typo>
      </View>

      <View className="mb-5">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField label="Email" required error={errors.email?.message}>
              <Input
                placeholder="Enter your reg. email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon={<Mail size={18} color="#5d8a72" />}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="send"
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

      <Button
        title="Send Reset Code"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={loading}
        loadingText="Sending code..."
        rightIcon={!loading ? <Send size={18} color="#ffffff" /> : undefined}
        onPress={onSubmit}
      />

      <View className="my-6 flex-row items-center gap-3">
        <Divider className="flex-1" />
        <Typo size="caption" tone="muted">
          Remembered it?
        </Typo>
        <Divider className="flex-1" />
      </View>

      <Button
        title="Back to Sign In"
        variant="outline"
        size="lg"
        fullWidth
        disabled={loading}
        onPress={onSignIn}
      />
    </View>
  );
};
