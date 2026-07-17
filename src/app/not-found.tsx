import Link from "next/link";
import { Icon } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-6 text-center">
      <Icon width={48} height={48} />

      <div className="flex flex-col items-center gap-2">
        <span className="rounded-full bg-info-subtle px-3 py-1 text-caption font-medium text-info">
          404
        </span>
        <h1 className="font-display text-display-md text-text-primary">
          Page not found
        </h1>
        <p className="max-w-md text-body-md text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>
      </div>

      <Link
        href="/"
        className="rounded-lg bg-primary px-5 py-2.5 text-body-sm font-medium text-on-primary transition-colors hover:bg-primary-hover"
      >
        Go home
      </Link>
    </div>
  );
}