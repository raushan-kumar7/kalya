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
} from "@/components/ui";
import { PasswordStrengthMeter } from "@/components/shared/password-strength-meter";
import { useAuth } from "@/hooks/auth";
import { ChangePasswordInput, ChangePasswordSchema } from "@/validations/auth";

export function ChangePasswordForm() {
  const { changePassword, isChangingPassword } = useAuth();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
  });

  const newPassword = useWatch({ control, name: "password" });

  const onSubmit = async (data: ChangePasswordInput) => {
    const result = await changePassword(data);

    if (result?.success === false) {
      if (result?.error?.code === "INVALID_PASSWORD") {
        setError("currentPassword", {
          message: "That password doesn't match your current one",
        });
      }
      return;
    }

    reset();
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
            disabled={isChangingPassword}
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
              disabled={isChangingPassword}
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
            disabled={isChangingPassword}
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
          disabled={isChangingPassword}
        >
          {isChangingPassword ? (
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