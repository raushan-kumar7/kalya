import { Footer, Sidebar, Top } from "@/components/dashboard";
import { StoreHydration } from "@/hooks";
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

  return (
    <div className="bg-bg flex min-h-full overflow-x-hidden">
      <StoreHydration/>
      <Sidebar user={session.user} />
      {/** sidebar  */}
      <div className="flex min-h-full w-full flex-1 flex-col">
        {/** top */}
        <Top user={session.user} className="pl-18 md:pl-4" />
        <main className="flex-1 px-4 pb-6 sm:px-6 md:px-8">{children}</main>
        {/** footer */}
        <Footer/>
      </div>
    </div>
  );
}
