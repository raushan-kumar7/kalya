"use client";

import { Alert, AlertDescription, Button, Checkbox, Input, Label, Spinner } from "@/components/ui";
import { useAuth } from "@/hooks/auth";
import { SigninInput, SigninSchema } from "@/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, User } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

interface SigninFormProps {
  redirectTo?: string;
}

export function SigninForm({ redirectTo }: SigninFormProps) {
  const { signIn, isSigningIn, signInError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SigninInput>({
    resolver: zodResolver(SigninSchema),
    defaultValues: { userId: "", password: "" },
  });

  const onSubmit = async (data: SigninInput) => {
    // const success = await signIn(data);
    const success = await signIn(data, redirectTo || "/dashboard");
    if (success) {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5" noValidate>
      {signInError && (
        <Alert variant="danger">
          <AlertDescription>{signInError}</AlertDescription>
        </Alert>
      )}

      <Input
        label="User ID"
        placeholder="Enter your userId or email"
        leadingIcon={<User />}
        autoComplete="username"
        disabled={isSigningIn}
        errorMessage={errors.userId?.message}
        {...register("userId")}
      />

      <Input
        type="password"
        label="Password"
        placeholder="Enter your password"
        leadingIcon={<KeyRound />}
        autoComplete="current-password"
        disabled={isSigningIn}
        errorMessage={errors.password?.message}
        {...register("password")}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox id="remember" disabled={isSigningIn} />
          <Label htmlFor="remember" className="text-text-secondary font-normal">
            Remember me
          </Label>
        </div>

        <Link
          href="/auth/forgot-password"
          className="text-primary text-sm font-medium hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" variant="default" size="md" className="w-full" disabled={isSigningIn}>
        {isSigningIn ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" /> Signing in...
          </span>
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-text-secondary text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/auth/sign-up" className="text-primary font-medium hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
