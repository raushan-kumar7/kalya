"use client";

import * as React from "react";
import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { cn } from "@/lib/utils";

export interface ImageProps extends Omit<NextImageProps, "onLoad" | "onError"> {
  /** Class applied to the wrapping <span> — background, rounding, opacity transitions */
  wrapperClassName?: string;
}

export function Image({ wrapperClassName, className, alt, ...props }: ImageProps) {
  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">("loading");

  return (
    <span
      className={cn(
        "relative inline-flex overflow-hidden",
        status === "loading" && "bg-surface-raised animate-pulse",
        wrapperClassName
      )}
    >
      {status !== "error" ? (
        <NextImage
          {...props}
          alt={alt}
          className={cn(
            "transition-opacity duration-200",
            status === "loading" ? "opacity-0" : "opacity-100",
            className
          )}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      ) : (
        <span className="text-caption text-text-muted flex h-full w-full items-center justify-center">
          {alt?.[0]?.toUpperCase() ?? "?"}
        </span>
      )}
    </span>
  );
}
