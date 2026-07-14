import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailClient } from "./verify-email-client";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Confirm your email address to activate your Kalya account.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailClient />
    </Suspense>
  );
}
