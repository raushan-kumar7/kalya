"use client";

import { Lock } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Spinner,
  toast,
} from "@/components/ui";
import { PasswordStrengthMeter } from "@/components/shared/password-strength-meter";
import { ChangePasswordInput, ChangePasswordSchema } from "@/validations/auth";

export function ChangePasswordForm() {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
  });

  const newPassword = useWatch({control, name: "password"});

  const onSubmit = async (data: ChangePasswordInput) => {
    try {
      console.log("Data: ", data)
      // Replace with real change-password API call, sending
      // { currentPassword: data.currentPassword, password: data.password }
      await new Promise((resolve) => setTimeout(resolve, 900));
      toast.success("Password changed", {
        description: "Use your new password next time you sign in.",
      });
      reset();
    } catch {
      // If the API reports the current password didn't match, surface it on that
      // field specifically instead of a generic error:
      // setError("currentPassword", { message: "That password doesn't match your current one" });
      toast.error("Couldn't change your password", {
        description: "Double check your current password and try again.",
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>Update the password you use to sign in to Kalya.</CardDescription>
      </CardHeader>

      <CardContent>
        <form id="password-change-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Current password"
            type="password"
            required
            placeholder="Enter current password"
            leadingIcon={<Lock size={16} />}
            autoComplete="current-password"
            disabled={isSubmitting}
            errorMessage={errors.currentPassword?.message}
            {...register("currentPassword")}
          />

          <div>
            <Input
              label="New password"
              type="password"
              required
              placeholder="Enter new password"
              leadingIcon={<Lock size={16} />}
              autoComplete="new-password"
              disabled={isSubmitting}
              errorMessage={errors.password?.message}
              {...register("password")}
            />
            <PasswordStrengthMeter password={newPassword ?? ""} />
          </div>

          <Input
            label="Confirm new password"
            type="password"
            required
            placeholder="Re-enter new password"
            leadingIcon={<Lock size={16} />}
            autoComplete="new-password"
            disabled={isSubmitting}
            errorMessage={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </form>
      </CardContent>

      <CardFooter className="justify-end">
        <Button
          type="submit"
          form="password-change-form"
          variant="default"
          size="md"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" /> Saving...
            </span>
          ) : (
            "Save new password"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}