import type { Metadata } from "next";
import { SignupForm } from "@/components/forms/auth";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Kalya account and start consolidating your finances in one dashboard.",
};

export default function Signup() {
  return (
    <Card className="flex flex-col items-center justify-center p-8 shadow-md">
      <div className="mb-6 text-center">
        <h1 className="text-text-primary mb-1 text-2xl font-bold">New Here, Join Today!</h1>
        <p className="text-text-secondary text-sm">Create account to access to our platform.</p>
      </div>
      <SignupForm />
    </Card>
  );
}
