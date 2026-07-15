"use client";


import { Button, Spinner } from "@/components/ui";
import { useAuth } from "@/hooks/auth";

export default function Dashboard() {
  const { user, signOut, isSigningOut } = useAuth();
  return (
    <div>
      user
      <div className="p-2 px-8 py-6">
        <h1 className="font-medium">{user?.name}</h1>

        <div className="w-32">
          <Button
            onClick={() => signOut()}
            type="submit"
            variant="default"
            size="md"
            className="w-full"
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" /> Signing out...
              </span>
            ) : (
              "Sign out"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
