"use client";

import { PasswordStrengthMeter } from "@/components/shared";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui";
import { useAuth } from "@/hooks/auth";
import { ChangePasswordInput, ChangePasswordSchema } from "@/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Lock } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordModal({ open, onOpenChange }: ChangePasswordModalProps) {
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
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) reset();
    onOpenChange(isOpen);
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent size="md">
        <ModalHeader icon={<KeyRound size={18} />}>
          <ModalTitle>Change password</ModalTitle>
          <ModalDescription>
            Choose a strong password you don&apos;t use elsewhere.
          </ModalDescription>
        </ModalHeader>

        <form id="password-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <ModalBody className="flex flex-col gap-4">
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
          </ModalBody>
        </form>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="password-form" disabled={isChangingPassword}>
            {isChangingPassword ? "Updating…" : "Update password"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
