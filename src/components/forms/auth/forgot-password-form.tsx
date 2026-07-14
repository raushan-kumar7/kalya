"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { KeyRound, Mail } from "lucide-react";
import { Button, Input, Spinner, toast } from "@/components/ui";
import { AuthSeal } from "@/components/shared";
import { ForgotPasswordInput, ForgotPasswordSchema } from "@/validations/auth";

const RESEND_COOLDOWN_SECONDS = 45;

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
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
    try {
      // Replace with real forgot-password API call
      await new Promise((resolve) => setTimeout(resolve, 900));
      setSentTo(data.email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success("Reset link sent", {
        description: `Check ${data.email} for the link.`,
      });
    } catch {
      toast.error("Couldn't send the reset link", {
        description: "Something went wrong on our end. Try again in a moment.",
      });
    }
  };

  const handleResend = () => {
    if (cooldown > 0) return;
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
            disabled={cooldown > 0}
          >
            {cooldown > 0 ? `Resend link (0:${cooldown.toString().padStart(2, "0")})` : "Resend link"}
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
          disabled={isSubmitting}
          errorMessage={errors.email?.message}
          {...register("email")}
        />

        <Button type="submit" variant="default" size="md" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
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