"use client";

import {
  Button,
  Calendar,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
// import { Calendar } from "@/components/ui/calendar";
import { useUser } from "@/hooks/users";
import { GENDER_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { User } from "@/types/auth";
import { UserInput, UserSchema } from "@/validations/users";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse, isValid } from "date-fns";
// import { zodResolver as _unused } from "@hookform/resolvers/zod"; // remove if duplicate import errors
import { Cake, CalendarIcon, Phone, UserRound } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

interface ProfileUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

const UNSPECIFIED_GENDER = "UNSPECIFIED";
const DATE_FORMAT = "yyyy-MM-dd";

const formatGenderLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

// UserSchema stores date_of_birth as a "yyyy-MM-dd" string; Calendar wants
// a Date. Convert at the boundary rather than changing the schema's wire format.
const parseISODate = (value?: string | null): Date | undefined => {
  if (!value) return undefined;
  const parsed = parse(value, DATE_FORMAT, new Date());
  return isValid(parsed) ? parsed : undefined;
};

export function ProfileUpdateModal({ open, onOpenChange, user }: ProfileUpdateModalProps) {
  const { updateProfile, isUpdatingProfile, updateProfileError } = useUser();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UserInput>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      first_name: user?.first_name ?? "",
      middle_name: user?.middle_name ?? "",
      last_name: user?.last_name ?? "",
      gender: user?.gender ?? null,
      date_of_birth: user?.date_of_birth ?? "",
      phone: user?.phone ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        first_name: user?.first_name ?? "",
        middle_name: user?.middle_name ?? "",
        last_name: user?.last_name ?? "",
        gender: user?.gender ?? null,
        date_of_birth: user?.date_of_birth ?? "",
        phone: user?.phone ?? "",
      });
    }
  }, [open, user, reset]);

  const onSubmit = async (data: UserInput) => {
    const result = await updateProfile(data);
    if (result?.success !== false) {
      onOpenChange(false);
    }
  };

  const saving = isSubmitting || isUpdatingProfile;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg">
        <ModalHeader icon={<UserRound size={18} />}>
          <ModalTitle>Edit profile</ModalTitle>
          <ModalDescription>Update the personal details on your account.</ModalDescription>
        </ModalHeader>

        <form id="profile-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <ModalBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              required
              placeholder="Enter first name"
              errorMessage={errors.first_name?.message}
              {...register("first_name")}
            />
            <Input
              label="Middle name"
              placeholder="Enter middle name"
              errorMessage={errors.middle_name?.message}
              {...register("middle_name")}
            />
            <Input
              label="Last name"
              required
              placeholder="Enter last name"
              errorMessage={errors.last_name?.message}
              {...register("last_name")}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-body-sm text-text-secondary font-medium" htmlFor="gender">
                Gender
              </label>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select
                    value={field.value ?? UNSPECIFIED_GENDER}
                    onValueChange={(val) =>
                      field.onChange(val === UNSPECIFIED_GENDER ? null : val)
                    }
                  >
                    <SelectTrigger id="gender" error={Boolean(errors.gender)}>
                      <SelectValue placeholder="Prefer not to say" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UNSPECIFIED_GENDER}>Prefer not to say</SelectItem>
                      {GENDER_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {formatGenderLabel(opt)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gender?.message && (
                <p className="text-danger text-caption">{errors.gender.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-body-sm text-text-secondary font-medium" htmlFor="date_of_birth">
                Date of birth
              </label>
              <Controller
                control={control}
                name="date_of_birth"
                render={({ field }) => {
                  const selectedDate = parseISODate(field.value);
                  return (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          id="date_of_birth"
                          type="button"
                          className={cn(
                            "flex h-10 w-full items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-text-primary hover:border-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer",
                            !selectedDate && "text-text-muted",
                            errors.date_of_birth && "border-danger focus:ring-danger"
                          )}
                        >
                          <Cake size={16} className="shrink-0 opacity-70" />
                          {selectedDate ? format(selectedDate, "PPP") : "Select date of birth"}
                          <CalendarIcon size={16} className="ml-auto shrink-0 opacity-50" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          defaultMonth={selectedDate}
                          captionLayout="dropdown"
                          disabled={{ after: new Date() }}
                          onSelect={(date) =>
                            field.onChange(date ? format(date, DATE_FORMAT) : null)
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  );
                }}
              />
              {errors.date_of_birth?.message && (
                <p className="text-danger text-caption">{errors.date_of_birth.message}</p>
              )}
            </div>

            <Input
              label="Phone"
              type="tel"
              leadingIcon={<Phone size={16} />}
              placeholder="Enter phone number"
              errorMessage={errors.phone?.message}
              {...register("phone")}
            />

            {updateProfileError && (
              <p className="text-caption text-danger sm:col-span-2">{updateProfileError}</p>
            )}
          </ModalBody>
        </form>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="profile-form" disabled={saving || !isDirty}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}