"use client";

import { useEffect, useRef, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 500): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}

export function useDebouncedCallback<T extends (...args: never[]) => unknown>(
  fn: T,
  delay = 500,
): (...args: Parameters<T>) => void {
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (...args: Parameters<T>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fnRef.current(...args), delay);
  };
}
