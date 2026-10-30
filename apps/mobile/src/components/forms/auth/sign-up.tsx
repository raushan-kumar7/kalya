import {
  AvailabilityHint,
  AvailabilityStatusIcon,
  PasswordStrengthMeter,
} from '@/components/shared';
import { Button, Divider, FormField, Input, PasswordField, Typo } from '@/components/ui';
import { UseUsernameAvailabilityReturn } from '@/hooks/auth';
import { SignUpInput } from '@kalya/validations';
import { ArrowRight, Lock, Mail, User } from 'lucide-react-native';
import { Control, Controller, FieldErrors, useWatch } from 'react-hook-form';
import { View } from 'react-native';

interface SignupFormProps {
  control: Control<SignUpInput>;
  errors: FieldErrors<SignUpInput>;
  onSubmit: () => void;
  onSignIn?: () => void;
  loading?: boolean;
  error?: string;
  usernameCheck: UseUsernameAvailabilityReturn;
}

export const SignUpForm = ({
  control,
  errors,
  onSubmit,
  onSignIn,
  loading,
  error,
  usernameCheck,
}: SignupFormProps) => {
  const passwordValue = useWatch({ control, name: 'password' }) ?? '';

  return (
    <View className="w-full">
      <View className="mb-7">
        <Typo size="title-lg" className="text-kalya-text-primary text-center">
          Create Account
        </Typo>
        <Typo size="body-md" tone="secondary" className="mt-2 leading-6 text-center">
          Take control of your finances, starting today.
        </Typo>
      </View>

      <View className="mb-2 flex-row gap-2">
        <View className="min-w-0 flex-1">
          <Controller
            control={control}
            name="first_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField label="First Name" required error={errors.first_name?.message}>
                <Input
                  placeholder="First"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  autoComplete="given-name"
                />
              </FormField>
            )}
          />
        </View>
        <View className="min-w-0 flex-1">
          <Controller
            control={control}
            name="middle_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField label="Middle Name" error={errors.middle_name?.message}>
                <Input
                  placeholder="Middle"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                />
              </FormField>
            )}
          />
        </View>
        <View className="min-w-0 flex-1">
          <Controller
            control={control}
            name="last_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField label="Last Name" required error={errors.last_name?.message}>
                <Input
                  placeholder="Last"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  autoComplete="family-name"
                />
              </FormField>
            )}
          />
        </View>
      </View>

      <View className="mb-2">
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <FormField label="Username" error={errors.username?.message}>
                <Input
                  placeholder="Enter your username"
                  leftIcon={<User size={18} color="#5d8a72" />}
                  rightIcon={<AvailabilityStatusIcon status={usernameCheck.status} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={() => {
                    onBlur();
                    usernameCheck.checkNow();
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username-new"
                />
              </FormField>

              {!errors.username && (
                <AvailabilityHint
                  status={usernameCheck.status}
                  message={usernameCheck.message}
                  showIcon
                />
              )}
            </>
          )}
        />
      </View>

      <View className="mb-2">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField label="Email" required error={errors.email?.message}>
              <Input
                placeholder="Enter your email"
                leftIcon={<Mail size={18} color="#5d8a72" />}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </FormField>
          )}
        />
      </View>

      <View className="mb-2">
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField label="Password" required error={errors.password?.message}>
              <PasswordField
                placeholder="**********"
                leftIcon={<Lock size={18} color="#5d8a72" />}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoComplete="new-password"
              />
            </FormField>
          )}
        />
        <PasswordStrengthMeter password={passwordValue} />
      </View>

      {!!error && (
        <View className="mb-4 rounded-kalya-sm border border-kalya-outflow/30 bg-kalya-outflow/5 px-3 py-3">
          <Typo size="body-sm" tone="outflow">
            {error}
          </Typo>
        </View>
      )}

      <Button
        title="Sign Up"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={loading}
        loadingText="Creating account..."
        rightIcon={!loading ? <ArrowRight size={18} color="#ffffff" /> : undefined}
        onPress={onSubmit}
        accessibilityLabel="Sign up to Kalya"
      />

      <View className="my-6 flex-row items-center gap-3">
        <Divider className="flex-1" />
        <Typo size="caption" tone="muted">
          Already a Kalya user?
        </Typo>
        <Divider className="flex-1" />
      </View>

      <Button
        title="Sign In"
        variant="outline"
        size="lg"
        fullWidth
        disabled={loading}
        onPress={onSignIn}
      />
    </View>
  );
};
