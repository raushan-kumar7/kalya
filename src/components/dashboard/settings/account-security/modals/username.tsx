"use client";

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
import { useUsernameAvailability } from "@/hooks/auth";
import { useUser } from "@/hooks/users";
import { UsernameInput, UsernameSchema } from "@/validations/users";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtSign, CircleCheckBig, CircleX } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

interface UsernameUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUsername?: string | null;
}

const ICON_SIZE = 16;

export function UsernameUpdateModal({
  open,
  onOpenChange,
  currentUsername,
}: UsernameUpdateModalProps) {
  const { updateUsername, isUpdatingProfile, updateProfileError } = useUser();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UsernameInput>({
    resolver: zodResolver(UsernameSchema),
    defaultValues: { username: currentUsername ?? "" },
  });

  const username = useWatch({ control, name: "username" });
  const usernameAvailability = useUsernameAvailability(username ?? "");

  useEffect(() => {
    if (open) reset({ username: currentUsername ?? "" });
  }, [open, currentUsername, reset]);

  const onSubmit = async (data: UsernameInput) => {
    // Don't let a submit slip through while we're still resolving
    // availability, or while it's known taken/invalid — RHF's schema
    // validation alone doesn't know about the async check.
    if (
      usernameAvailability.status === "checking" ||
      usernameAvailability.status === "taken" ||
      usernameAvailability.status === "invalid"
    ) {
      setError("username", {
        message: usernameAvailability.message ?? "Please choose a different username.",
      });
      return;
    }

    // No-op if unchanged.
    if (data.username === currentUsername) {
      onOpenChange(false);
      return;
    }

    const result = await updateUsername(data);
    if (result?.success !== false) {
      onOpenChange(false);
    }
  };

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

  const saving = isSubmitting || isUpdatingProfile;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader icon={<AtSign size={ICON_SIZE} />}>
          <ModalTitle>Change username</ModalTitle>
          <ModalDescription>This is how others will find and mention you.</ModalDescription>
        </ModalHeader>

        <form id="username-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <ModalBody>
            <Input
              label="Username"
              type="text"
              required
              placeholder="yourname"
              leadingIcon={<AtSign size={16} />}
              trailingIcon={usernameTrailingIcon}
              loading={usernameAvailability.status === "checking"}
              autoComplete="username"
              errorMessage={usernameErrorMessage}
              helperText={usernameHelperText}
              {...register("username")}
            />
            <p className="text-caption text-text-muted mt-2">
              4-20 characters. Letters, numbers, and underscores only.
            </p>
            {updateProfileError && (
              <p className="text-caption text-danger mt-2">{updateProfileError}</p>
            )}
          </ModalBody>
        </form>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="username-form" disabled={saving}>
            {saving ? "Saving…" : "Save username"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
