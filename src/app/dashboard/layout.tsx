import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });

  if (!session) {
    const pathname = hdrs.get("x-pathname") ?? "/dashboard";
    redirect(`/auth/sign-in?redirectTo=${encodeURIComponent(pathname)}`);
  }

  return <main>{children}</main>;
}
