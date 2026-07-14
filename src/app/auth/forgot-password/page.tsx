import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forms/auth";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your Kalya account password.",
};

export default function ForgotPassword() {
  return <ForgotPasswordForm />;
}