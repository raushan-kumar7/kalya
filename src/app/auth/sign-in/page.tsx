import type { Metadata } from "next";
import { SigninForm } from "@/components/forms/auth";
import { Card } from "@/components/ui";


export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Kalya dashboard to track income, assets, and net worth.",
};

export default function Signin() {
  return (
    <Card className="flex flex-col items-center justify-center p-8 shadow-md">
      <div className="mb-6 text-center">
        <h1 className="text-text-primary mb-1 text-2xl font-bold">Welcome back!</h1>
        <p className="text-text-secondary text-sm">
          Enter your credentials to access your dashboard.
        </p>
      </div>
      <SigninForm />
    </Card>
  );
}
