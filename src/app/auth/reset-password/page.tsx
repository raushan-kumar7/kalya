// "use client";

// import type { Metadata } from "next";
// import { useSearchParams } from "next/navigation";
// import { ResetPasswordForm } from "@/components/forms/auth";

// export const metadata: Metadata = {
//   title: "Reset Password",
//   description: "Set a new password for your Kalya account.",
// };

// export default function ResetPassword() {
//   const searchParams = useSearchParams();
//   const token = searchParams.get("token") ?? undefined;

//   return <ResetPasswordForm token={token} />;
// }


import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/forms/auth";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your Kalya account.",
};

export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return <ResetPasswordForm token={token} />;
}