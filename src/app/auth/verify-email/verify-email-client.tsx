"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Mail, Check, RotateCw } from "lucide-react";
import { Card, Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/hooks/auth";

const RESEND_COOLDOWN_SECONDS = 45;

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const { resendVerificationEmail, isResendingVerification } = useAuth();
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const reduceMotion = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const handleResend = async () => {
    if (isResendingVerification || cooldown > 0 || !email) return;

    // runAction (inside useAuth) already handles the loading state and
    // success/error toasts, so we only need to react to the boolean result.
    const success = await resendVerificationEmail(email);
    if (success) {
      setSent(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    }
  };

  return (
    <Card className="mx-auto flex flex-col items-center gap-6 p-10 text-center">
      {/* Seal */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="border-border absolute inset-0 rounded-full border-2 border-dashed" />
        <motion.div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full border-2 transition-colors duration-300",
            sent
              ? "bg-primary border-primary text-on-primary"
              : "bg-primary-subtle border-primary/30 text-primary"
          )}
          animate={
            sent && !reduceMotion ? { scale: [1, 0.85, 1.08, 1], rotate: [0, -6, 0] } : undefined
          }
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <motion.span
                key="check"
                initial={reduceMotion ? undefined : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Check className="h-6 w-6" strokeWidth={3} />
              </motion.span>
            ) : (
              <motion.span
                key="mail"
                initial={reduceMotion ? undefined : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Mail className="h-6 w-6" strokeWidth={2} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Copy */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-display-md text-text-primary">Confirm your email</h1>
        <p className="text-body-sm text-text-secondary leading-relaxed">
          We sent a verification link to
          {email ? (
            <>
              {" "}
              <span className="font-numeric text-text-primary break-all">{email}</span>.
            </>
          ) : (
            " your inbox."
          )}{" "}
          Open it to activate your account.
        </p>
      </div>

      {/* Actions */}
      <div className="flex w-full flex-col items-center gap-3">
        <Button
          variant="default"
          className="w-full"
          onClick={handleResend}
          disabled={isResendingVerification || cooldown > 0 || !email}
        >
          {isResendingVerification ? (
            <span className="flex items-center justify-center gap-2">
              <RotateCw className="h-4 w-4 animate-spin" />
              Sending...
            </span>
          ) : cooldown > 0 ? (
            `Resend email (0:${cooldown.toString().padStart(2, "0")})`
          ) : sent ? (
            "Email sent — resend"
          ) : (
            "Resend email"
          )}
        </Button>

        <p className="text-body-sm text-text-muted">
          Wrong email address?{" "}
          <Link
            href="/auth/sign-up"
            className="text-primary font-medium transition-colors hover:underline"
          >
            Go back
          </Link>
        </p>
      </div>

      <p className="text-caption text-text-muted">
        Check your spam folder if it doesn&apos;t arrive within a few minutes.
      </p>
    </Card>
  );
}
