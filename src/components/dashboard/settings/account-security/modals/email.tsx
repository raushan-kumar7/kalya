/* eslint-disable react-hooks/set-state-in-effect */
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
import { useUser } from "@/hooks/users";
import { EmailInput, EmailSchema } from "@/validations/users";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface EmailUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail?: string | null;
}

export function EmailUpdateModal({ open, onOpenChange, currentEmail }: EmailUpdateModalProps) {
  const [sent, setSent] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { changeEmail, isUpdatingProfile, updateProfileError } = useUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailInput>({
    resolver: zodResolver(EmailSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ email: "" });
      setSent(false);
      setHasSubmitted(false);
    }
  }, [open, reset]);

  useEffect(() => {
    if (hasSubmitted && !isUpdatingProfile) {
      if (!updateProfileError) {
        setSent(true);
      }
      setHasSubmitted(false);
    }
  }, [hasSubmitted, isUpdatingProfile, updateProfileError]);

  const onSubmit = (data: EmailInput) => {
    setHasSubmitted(true);
    void changeEmail(data, `${window.location.origin}/dashboard/settings`);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader icon={<Mail size={18} />}>
          <ModalTitle>Change email address</ModalTitle>
          <ModalDescription>
            {currentEmail ? `Currently ${currentEmail}` : "Add an email address to your account."}
          </ModalDescription>
        </ModalHeader>

        {sent ? (
          <ModalBody>
            <p className="text-body-sm text-text-secondary">
              We&apos;ve sent a confirmation link to your new address. Click it to finish updating
              your email.
            </p>
          </ModalBody>
        ) : (
          <form id="email-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <ModalBody>
              <Input
                label="New email address"
                type="email"
                required
                placeholder="you@example.com"
                leadingIcon={<Mail size={16} />}
                autoComplete="email"
                errorMessage={errors.email?.message}
                {...register("email")}
              />
              <p className="text-caption text-text-muted mt-2">
                We&apos;ll send a confirmation link before this takes effect.
              </p>
            </ModalBody>
          </form>
        )}

        <ModalFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {sent ? "Close" : "Cancel"}
          </Button>
          {!sent && (
            <Button type="submit" form="email-form" disabled={isUpdatingProfile}>
              {isUpdatingProfile ? "Sending…" : "Send confirmation"}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
