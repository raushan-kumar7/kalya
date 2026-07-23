import { ALLOWED_AVATAR_TYPES, GENDER_OPTIONS, MAX_AVATAR_BYTES } from "@/lib/constants";
import { z } from "zod";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const UserSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50),
  middle_name: z.string().max(50).optional().nullable(),
  last_name: z.string().min(1, "Last name is required").max(50),
  gender: z
    .enum(GENDER_OPTIONS, { error: "Please select a valid gender option" })
    .optional()
    .nullable(),
  date_of_birth: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) =>
        !val ||
        (ISO_DATE_PATTERN.test(val) && !isNaN(Date.parse(val)) && new Date(val) <= new Date()),
      { message: "Enter a valid date of birth (not in the future)" }
    ),
  phone: z.string().max(20).optional().nullable(),
});

export type UserInput = z.infer<typeof UserSchema>;

export const UsernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z0-9_.]+$/, "Only letters, numbers, _ and . allowed"),
});
export type UsernameInput = z.infer<typeof UsernameSchema>;

export const EmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});
export type EmailInput = z.infer<typeof EmailSchema>;

export const AvatarSchema = z.object({
  image: z
    .string()
    .refine((val) => val.startsWith("http") || val.startsWith("/"), {
      message: "Invalid image URL or path",
    })
    .optional()
    .nullable(),
});
export type AvatarInput = z.infer<typeof AvatarSchema>;

export const AvatarFileSchema = z
  .instanceof(File, { message: "Please select a file" })
  .refine((file) => file.size <= MAX_AVATAR_BYTES, "Image must be under 5MB")
  .refine(
    (file) => ALLOWED_AVATAR_TYPES.includes(file.type),
    "Only JPEG, JPG, PNG, or WebP images are allowed"
  );

export const PreferencesSchema = z.object({
  locale: z.string().max(10).optional().nullable(),
  timezone: z.string().max(50).optional().nullable(),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter ISO code")
    .toUpperCase()
    .optional()
    .nullable(),
});
export type PreferencesInput = z.infer<typeof PreferencesSchema>;
