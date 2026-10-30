import {
  Button,
  Checkbox,
  Divider,
  FormField,
  Input,
  PasswordField,
  Pressable,
  Typo,
} from '@/components/ui';
import { SignInInput } from '@kalya/validations';
import { ArrowRight, Lock, User } from 'lucide-react-native';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { View } from 'react-native';

interface SigninFormProps {
  control: Control<SignInInput>;
  errors: FieldErrors<SignInInput>;
  onSubmit: () => void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  loading?: boolean;
  error?: string;
}

export const SigninForm = ({
  control,
  errors,
  onSubmit,
  onForgotPassword,
  onSignUp,
  loading = false,
  error = '',
}: SigninFormProps) => {
  return (
    <View className="w-full">
      <View className="mb-7">
        <Typo size="title-lg" className="text-kalya-text-primary text-center">
          Welcome back!
        </Typo>

        <Typo size="body-md" tone="secondary" className="mt-2 leading-6 text-center">
          {/* Sign in to see your financial picture and stay on top of your goals. */}
          {/* Please enter credentials to access your account */}
          Sign in to pick up where you left off.
        </Typo>
      </View>

      <View className="mb-5">
        <Controller
          control={control}
          name="identifier"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField
              label="Email or Username"
              required
              error={errors.identifier?.message?.toString()}
            >
              <Input
                placeholder="Enter your email or username"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon={<User size={16} color="#5d8a72" />}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                accessibilityLabel="Email or username"
                returnKeyType="next"
                editable={!loading}

                glowColor="emerald"
              />
            </FormField>
          )}
        />
      </View>

      <View className="mb-3">
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField label="Password" required error={errors.password?.message?.toString()}>
              <PasswordField
                placeholder="Enter your password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon={<Lock size={16} color="#5d8a72" />}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                editable={!loading}

                glowColor="emerald"
              />
            </FormField>
          )}
        />
      </View>

      <View className="mb-7 flex-row flex-wrap items-center justify-between gap-y-3">
        <Controller
          control={control}
          name="rememberMe"
          render={({ field: { value, onChange } }) => (
            <Checkbox
              checked={!!value}
              onChange={onChange}
              label="Remember me"
              disabled={loading}
            />
          )}
        />

        <Pressable
          onPress={onForgotPassword}
          disabled={loading}
          accessibilityLabel="button"
          hitSlop={8}
          className="py-1"
        >
          <Typo size="body-sm" className="font-inter-bold text-kalya-primary-light">
            Forgot Password?
          </Typo>
        </Pressable>
      </View>

      {!!error && (
        <View className="mb-4 rounded-kalya-sm border border-kalya-outflow/30 bg-kalya-outflow/5 px-3 py-3">
          <Typo size="body-sm" tone="outflow">
            {error}
          </Typo>
        </View>
      )}

      <Button
        title="Sign In"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={loading}
        loadingText="Signing in..."
        rightIcon={!loading ? <ArrowRight size={18} color="#ffffff" /> : undefined}
        onPress={onSubmit}
        accessibilityLabel="Sign in to Kalya"
      />

      <View className="my-6 flex-row items-center gap-3">
        <Divider className="flex-1" />
        <Typo size="caption" tone="muted">
          New to Kalya?
        </Typo>
        <Divider className="flex-1" />
      </View>

      <Button
        title="Create Account"
        variant="outline"
        size="lg"
        fullWidth
        disabled={loading}
        onPress={onSignUp}
      />
    </View>
  );
};
