"use client";

import { Button, Input, Spinner, toast } from "@/components/ui";
import { SignupInput, SignupSchema } from "@/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleUser, Lock, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import Link from "next/link";
import { PasswordStrengthMeter } from "@/components/shared";

export function SignupForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = (data: SignupInput) => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      console.log("Signin Data: ", data);
      toast.success("Account created successfully, Please check your email box to verify account");
      router.push("/auth/sign-in");
      reset();
    } catch {
      setFormError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ICON_SIZE = 16;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
          errorMessage={errors.username?.message}
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
        disabled={isSubmitting}
      >
        {isSubmitting ? (
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
