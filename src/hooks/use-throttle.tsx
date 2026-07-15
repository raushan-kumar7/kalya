"use client";

import { useEffect, useRef } from "react";
import { throttle, type ThrottledFunction } from "@/utils";

export function useThrottledCallback<T extends (...args: never[]) => unknown>(
  fn: T,
  wait = 200,
): (...args: Parameters<T>) => void {
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  const throttledRef = useRef<ThrottledFunction<T> | null>(null);

  useEffect(() => {
    throttledRef.current = throttle(
      ((...args: Parameters<T>) => fnRef.current(...args)) as T,
      wait,
    );

    return () => {
      throttledRef.current?.cancel();
      throttledRef.current = null;
    };
  }, [wait]);

  return (...args: Parameters<T>) => {
    throttledRef.current?.(...args);
  };
}
