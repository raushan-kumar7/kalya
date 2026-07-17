"use client";

import * as React from "react";
import NextImage from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * Detects whether we're past hydration, without calling setState inside
 * an effect (avoids the "setState in effect body" lint warning). This is
 * the standard useSyncExternalStore-based replacement for the old
 * `useEffect(() => setMounted(true), [])` mount-detection hack:
 * - subscribe: no-op, nothing ever changes so no re-render is triggered
 * - getSnapshot: true on the client
 * - getServerSnapshot: false during SSR
 */
function useHasMounted() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/**
 * Matches your ThemeProvider config: attribute="data-theme", enableSystem.
 * We read `resolvedTheme` (not `theme`) so "system" resolves to the
 * actual applied light/dark value instead of the literal string "system".
 */
function useIsDarkTheme() {
  const { resolvedTheme } = useTheme();
  const hasMounted = useHasMounted();

  // Before mount, theme is unknown (SSR) — default to light so there's
  // never a mismatched flash. Pairs with suppressHydrationWarning on <html>.
  return hasMounted && resolvedTheme === "dark";
}

interface LogoBaseProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/** Full wordmark logo — swaps to the white variant in dark mode. */
export function Logo({
  className,
  width = 140,
  height = 32,
  priority = true,
}: LogoBaseProps) {
  const isDark = useIsDarkTheme();
  const src = isDark ? "/kalya_logo_white1.png" : "/kalya_logo1.png";

  return (
    <NextImage
      key={src}
      src={src}
      alt="Kalya"
      width={width}
      height={height}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );
}

/** Standalone mark/icon — swaps to the white variant in dark mode. */
export function Icon({
  className,
  width = 32,
  height = 32,
  priority = true,
}: LogoBaseProps) {
  const isDark = useIsDarkTheme();
  const src = isDark ? "/kalya_icon_white1.png" : "/kalya_icon1.png";

  return (
    <NextImage
      key={src}
      src={src}
      alt="Kalya"
      width={width}
      height={height}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );
}