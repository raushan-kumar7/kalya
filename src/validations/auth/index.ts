import { z } from "zod";

export const SigninSchema = z.object({
  userId: z.string().min(1, { message: "Username or email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});
export type SigninInput = z.infer<typeof SigninSchema>;

export const PASSWORD_RULES = [
  {
    test: (p: string) => /[A-Z]/.test(p),
    message: "Uppercase letter",
  },
  {
    test: (p: string) => /[a-z]/.test(p),
    message: "Lowercase letter",
  },
  {
    test: (p: string) => /[0-9]/.test(p),
    message: "Number",
  },
  {
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
    message: "Special character (e.g. !?<>@#$%)",
  },
  {
    test: (p: string) => p.length >= 8,
    message: "8 characters or more",
  },
] as const;

const passwordSchema = z
  .string()
  .min(1, { message: "Password is required" })
  .superRefine((value, ctx) => {
    for (const rule of PASSWORD_RULES) {
      if (!rule.test(value)) {
        ctx.addIssue({ code: "custom", message: rule.message });
      }
    }
  });

export const SignupSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  middleName: z.string().optional(),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  username: z
    .string()
    .min(4, { message: "Username must be at least 4 characters" })
    .max(20, { message: "Username must be under 20 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Only letters, numbers, and underscores allowed",
    })
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Enter a valid email address" }),
  password: passwordSchema,
});

export type SignupInput = z.infer<typeof SignupSchema>;

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Enter a valid email address" }),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Confirm your new password" }),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords don't match",
      });
    }
  });

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Confirm your new password" }),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords don't match",
      });
    }
    if (values.currentPassword && values.password === values.currentPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "New password must be different from your current one",
      });
    }
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
