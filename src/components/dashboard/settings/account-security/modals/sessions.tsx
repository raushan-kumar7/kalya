"use client";

import { Laptop2, LogOut, MonitorSmartphone, Smartphone } from "lucide-react";
import { useState } from "react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui";
import { useSessions } from "@/hooks/sessions";
import { cn } from "@/lib/utils";

interface SessionsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function deviceIcon(device: string) {
  const lower = device.toLowerCase();
  if (lower.includes("phone")) return <Smartphone size={18} />;
  if (lower.includes("laptop") || lower.includes("mac") || lower.includes("pc"))
    return <Laptop2 size={18} />;
  return <MonitorSmartphone size={18} />;
}

export function SessionsDrawer({ open, onOpenChange }: SessionsDrawerProps) {
  // The drawer owns its own data now — callers just control open/onOpenChange,
  // they no longer need to fetch and pass sessions in as a prop.
  const { sessions, isLoading, error, revoke, isRevoking, revokeOthers, isRevokingOthers } =
    useSessions();

  // Tracks which row's "Sign out" button is mid-request, since revoke() is a
  // single shared mutation and isRevoking alone can't tell rows apart.
  const [terminatingId, setTerminatingId] = useState<string | null>(null);
  const otherSessions = sessions.filter((s) => !s.current);

  const handleTerminate = async (id: string) => {
    setTerminatingId(id);
    try {
      await revoke(id);
    } finally {
      setTerminatingId(null);
    }
  };

  const handleSignOutAll = async () => {
    await revokeOthers();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" size="md">
        <DrawerHeader>
          <DrawerTitle>Active sessions</DrawerTitle>
          <DrawerDescription>Devices currently signed in to your account.</DrawerDescription>
        </DrawerHeader>

        <DrawerBody className="flex flex-col gap-3 py-4!">
          {isLoading && <p className="text-body-sm text-text-secondary">Loading sessions…</p>}

          {!isLoading && error && <p className="text-body-sm text-danger">{error}</p>}

          {!isLoading && !error && sessions.length === 0 && (
            <p className="text-body-sm text-text-secondary">No active sessions found.</p>
          )}

          {sessions.map((session) => (
            <div
              key={session.id}
              className="border-border flex items-start gap-3 rounded-lg border px-4 py-3"
            >
              <div className="bg-primary-subtle text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                {deviceIcon(session.device)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-body-sm text-text-primary font-medium">
                    {session.device} · {session.browser}
                  </p>
                  {session.current && (
                    <span className="bg-success-subtle text-success text-caption rounded-full px-2 py-0.5 font-medium">
                      This device
                    </span>
                  )}
                </div>
                <p className="text-caption text-text-secondary mt-0.5">
                  {session.location} · {session.ipAddress}
                </p>
                <p className="text-caption text-text-muted mt-0.5">
                  Last active {new Date(session.updatedAt).toLocaleString()}
                </p>
              </div>
              {!session.current && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isRevoking && terminatingId === session.id}
                  onClick={() => handleTerminate(session.id)}
                  className="shrink-0"
                >
                  {isRevoking && terminatingId === session.id ? "Signing out…" : "Sign out"}
                </Button>
              )}
            </div>
          ))}
        </DrawerBody>

        <DrawerFooter className={cn(otherSessions.length === 0 && "hidden")}>
          <Button
            type="button"
            variant="danger"
            className="w-full gap-2 sm:w-auto"
            disabled={isRevokingOthers}
            onClick={handleSignOutAll}
          >
            <LogOut size={16} />
            {isRevokingOthers ? "Signing out…" : "Sign out of all other sessions"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}