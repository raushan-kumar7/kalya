"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { KeyRound, Mail } from "lucide-react";
import { Button, Input, Spinner } from "@/components/ui";
import { AuthSeal } from "@/components/shared";
import { useAuth } from "@/hooks/auth";
import { ForgotPasswordInput, ForgotPasswordSchema } from "@/validations/auth";

const RESEND_COOLDOWN_SECONDS = 45;

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { requestPasswordReset, isRequestingPasswordReset } = useAuth();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (cooldown <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldown]);

  const sendLink = async (data: ForgotPasswordInput) => {
    const result = await requestPasswordReset(data, '/auth/reset-password');
    if (result) {
      setSentTo(data.email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    }
  };

  const handleResend = () => {
    if (cooldown > 0 || isRequestingPasswordReset) return;
    const email = getValues("email");
    if (email) sendLink({ email });
  };

  // Sent state — mirrors the verify-email confirmation screen
  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <AuthSeal icon={KeyRound} done />

        <div className="flex flex-col gap-2">
          <h1 className="font-display text-display-md text-text-primary">Check your inbox</h1>
          <p className="text-body-sm text-text-secondary leading-relaxed">
            We sent a password reset link to{" "}
            <span className="font-numeric text-text-primary break-all">{sentTo}</span>. The
            link expires in 30 minutes.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-3">
          <Button
            variant="outline"
            size="md"
            className="w-full"
            onClick={handleResend}
            disabled={cooldown > 0 || isRequestingPasswordReset}
          >
            {isRequestingPasswordReset ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" /> Resending...
              </span>
            ) : cooldown > 0 ? (
              `Resend link (0:${cooldown.toString().padStart(2, "0")})`
            ) : (
              "Resend link"
            )}
          </Button>
          <Link
            href="/auth/sign-in"
            className="text-body-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  // Request state
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <AuthSeal icon={KeyRound} />

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-display-md text-text-primary">Forgot your password?</h1>
        <p className="text-body-sm text-text-secondary leading-relaxed">
          Enter the email on your account and we&apos;ll send you a link to reset it.
        </p>
      </div>

      <form onSubmit={handleSubmit(sendLink)} className="w-full space-y-5 text-left">
        <Input
          label="Email"
          type="email"
          required
          placeholder="Enter email"
          leadingIcon={<Mail size={16} />}
          autoComplete="email"
          disabled={isRequestingPasswordReset}
          errorMessage={errors.email?.message}
          {...register("email")}
        />

        <Button
          type="submit"
          variant="default"
          size="md"
          className="w-full"
          disabled={isRequestingPasswordReset}
        >
          {isRequestingPasswordReset ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" /> Sending link...
            </span>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <Link
        href="/auth/sign-in"
        className="text-body-sm text-text-muted hover:text-text-secondary transition-colors"
      >
        Back to sign in
      </Link>
    </div>
  );
}