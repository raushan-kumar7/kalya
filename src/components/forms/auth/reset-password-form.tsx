"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Lock, ShieldAlert } from "lucide-react";
import { Button, Input, Spinner } from "@/components/ui";
import { AuthSeal } from "@/components/shared/auth-seal";
import { PasswordStrengthMeter } from "@/components/shared/password-strength-meter";
import { useAuth } from "@/hooks/auth";
import { ResetPasswordInput, ResetPasswordSchema } from "@/validations/auth";

interface ResetPasswordFormProps {
  /** Reset token pulled from the URL by the page. Absent/invalid renders the expired-link state. */
  token?: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const { confirmPasswordReset, isResettingPassword } = useAuth();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = useWatch({ control, name: "password" });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) return;

    const result = await confirmPasswordReset(data, token);
    if (result) {
      setStatus("success");
    }
  };

  // Missing or already-invalidated token — never render the form
  if (!token) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <AuthSeal icon={ShieldAlert} className="text-danger" />
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-display-md text-text-primary">
            This link isn&apos;t valid
          </h1>
          <p className="text-body-sm text-text-secondary leading-relaxed">
            It may have expired or already been used. Request a new one to continue.
          </p>
        </div>
        <Link href="/auth/forgot-password" className="w-full">
          <Button variant="default" size="md" className="w-full">
            Request a new link
          </Button>
        </Link>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <AuthSeal icon={Lock} done />
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-display-md text-text-primary">Password updated</h1>
          <p className="text-body-sm text-text-secondary leading-relaxed">
            Taking you to sign in...
          </p>
        </div>
      </div>
    );
  }

  // Reset form
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <AuthSeal icon={Lock} />

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-display-md text-text-primary">Choose a new password</h1>
        <p className="text-body-sm text-text-secondary leading-relaxed">
          Make it something you haven&apos;t used before on Kalya.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-1 text-left">
        <Input
          label="New password"
          type="password"
          required
          placeholder="Enter new password"
          leadingIcon={<Lock size={16} />}
          autoComplete="new-password"
          disabled={isResettingPassword}
          errorMessage={errors.password?.message}
          {...register("password")}
        />
        <PasswordStrengthMeter password={password ?? ""} />

        <div className="pt-4">
          <Input
            label="Confirm new password"
            type="password"
            required
            placeholder="Re-enter new password"
            leadingIcon={<Lock size={16} />}
            autoComplete="new-password"
            disabled={isResettingPassword}
            errorMessage={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>

        <Button
          type="submit"
          variant="default"
          size="md"
          className="mt-5 w-full"
          disabled={isResettingPassword}
        >
          {isResettingPassword ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" /> Updating password...
            </span>
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </div>
  );
}