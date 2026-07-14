import type { Metadata } from "next";
import { ReactNode } from "react";
import { AuthLayoutClient } from "@/components/layouts";

export const metadata: Metadata = {
  title: {
    template: "%s | Kalya",
    default: "Authentication | Kalya",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
