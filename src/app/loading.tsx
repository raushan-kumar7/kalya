import { Icon } from "@/components/shared/logo";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-subtle" />
        <Icon width={40} height={40} className="relative animate-pulse" />
      </div>
      <p className="text-body-sm text-text-muted">Loading…</p>
    </div>
  );
}