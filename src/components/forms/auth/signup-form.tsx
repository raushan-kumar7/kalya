"use client";

import { Alert, AlertDescription, Button, Input, Spinner } from "@/components/ui";
import { SignupInput, SignupSchema } from "@/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheckBig, CircleUser, CircleX, Lock, Mail, UserRound } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import Link from "next/link";
import { PasswordStrengthMeter } from "@/components/shared";
import { useAuth, useUsernameAvailability } from "@/hooks/auth";

export function SignupForm() {
  const { signUp, isSigningUp, signUpError } = useAuth();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignupInput>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const password = useWatch({ control, name: "password" });
  const username = useWatch({ control, name: "username" });

  const usernameAvailability = useUsernameAvailability(username ?? "");

  const onSubmit = async (data: SignupInput) => {
    if (usernameAvailability.status === "taken" || usernameAvailability.status === "invalid") {
      return;
    }

    const success = await signUp(
      data,
      `/auth/verify-email?email=${encodeURIComponent(data.email)}`
    );
    if (success) {
      reset();
    }
  };

  const ICON_SIZE = 16;

  const usernameErrorMessage =
    errors.username?.message ??
    (usernameAvailability.status === "invalid" || usernameAvailability.status === "taken"
      ? (usernameAvailability.message ?? undefined)
      : undefined);

  const usernameHelperText =
    !usernameErrorMessage &&
    (usernameAvailability.status === "available" || usernameAvailability.status === "checking")
      ? (usernameAvailability.message ??
        (usernameAvailability.status === "checking" ? "Checking availability…" : undefined))
      : undefined;

  const usernameTrailingIcon =
    usernameAvailability.status === "available" ? (
      <CircleCheckBig size={ICON_SIZE} className="text-success" />
    ) : usernameAvailability.status === "taken" ||
      usernameAvailability.status === "invalid" ||
      usernameAvailability.status === "error" ? (
      <CircleX size={ICON_SIZE} className="text-danger" />
    ) : undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {signUpError && (
        <Alert variant="danger">
          <AlertDescription>{signUpError}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-3 gap-3 space-y-1.5">
        <Input
          label="First Name"
          type="text"
          required
          placeholder="Enter first name"
          leadingIcon={<UserRound size={ICON_SIZE} />}
          autoComplete="firstName"
          errorMessage={errors.firstName?.message}
          {...register("firstName")}
        />
        <Input
          label="Middle Name"
          type="text"
          placeholder="Enter middle name"
          leadingIcon={<UserRound size={ICON_SIZE} />}
          autoComplete="middleName"
          errorMessage={errors.middleName?.message}
          {...register("middleName")}
        />
        <Input
          label="Last Name"
          type="text"
          required
          placeholder="Enter last name"
          leadingIcon={<UserRound size={ICON_SIZE} />}
          autoComplete="lastName"
          errorMessage={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 space-y-1.5">
        <Input
          label="Username"
          type="text"
          placeholder="kalya_user"
          leadingIcon={<CircleUser size={ICON_SIZE} />}
          trailingIcon={usernameTrailingIcon}
          loading={usernameAvailability.status === "checking"}
          errorMessage={usernameErrorMessage}
          helperText={usernameHelperText}
          {...register("username")}
        />

        <Input
          label="Email"
          type="email"
          required
          placeholder="you@example.com"
          leadingIcon={<Mail size={ICON_SIZE} />}
          errorMessage={errors.email?.message}
          {...register("email")}
        />
      </div>

      <div className="space-y-1.5">
        <Input
          label="Password"
          type="password"
          required
          placeholder="Create a password"
          leadingIcon={<Lock size={ICON_SIZE} />}
          errorMessage={errors.password?.message}
          {...register("password")}
        />
        <PasswordStrengthMeter password={password} />
      </div>

      <Button
        type="submit"
        variant="default"
        size="md"
        className="mt-4 w-full"
        disabled={isSigningUp || usernameAvailability.status === "checking"}
      >
        {isSigningUp ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" /> Creating account...
          </span>
        ) : (
          "Create Account"
        )}
      </Button>

      <p className="text-text-secondary mt-6 text-center text-sm">
        Already Have an acconut?{" "}
        <Link href="/auth/sign-in" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
