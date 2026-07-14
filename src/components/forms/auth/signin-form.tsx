"use client";

import { Alert, AlertDescription, Button, Checkbox, Input, Label, Spinner, toast } from "@/components/ui";
import { SigninInput, SigninSchema } from "@/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function SigninForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setFormError(null);
    setIsSubmitting(true);

    try {
      // Replace with your real auth call
      console.log("Signin Data: ", data);
      toast.success("Successfully signed in!");
      router.push("/dashboard");
      reset();
    } catch {
      setFormError("We couldn't sign you in. Check your details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5" noValidate>
      {formError && (
        <Alert variant="danger">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Input
        label="User ID"
        placeholder="Enter your userId or email"
        leadingIcon={<User />}
        autoComplete="username"
        disabled={isSubmitting}
        errorMessage={errors.userId?.message}
        {...register("userId")}
      />

      <Input
        type="password"
        label="Password"
        placeholder="Enter your password"
        leadingIcon={<KeyRound />}
        autoComplete="current-password"
        disabled={isSubmitting}
        errorMessage={errors.password?.message}
        {...register("password")}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox id="remember" disabled={isSubmitting} />
          <Label htmlFor="remember" className="font-normal text-text-secondary">
            Remember me
          </Label>
        </div>

        <Link
          href="/auth/forgot-password"
          className="text-sm font-medium text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" variant="default" size="md" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" /> Signing in...
          </span>
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}