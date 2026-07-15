"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedValue } from "../use-debounce";
import { Status } from "@/types/auth";
import { authService } from "@/lib/services";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{4,20}$/;

interface UsernameAvailability {
  status: Status;
  message: string | null;
}

const IDLE: UsernameAvailability = { status: "idle", message: null };
const INVALID: UsernameAvailability = {
  status: "invalid",
  message: "4-20 letters, numbers, or underscores.",
};
const CHECKING: UsernameAvailability = { status: "checking", message: null };

export const useUsernameAvailability = (username: string, debounceMs = 700) => {
  const trimmed = username.trim();
  const debounced = useDebouncedValue(trimmed, debounceMs);

  const derived = useMemo<UsernameAvailability | null>(() => {
    if (!debounced) return IDLE;
    if (!USERNAME_PATTERN.test(debounced)) return INVALID;
    return null;
  }, [debounced]);

  const [asyncState, setAsyncState] = useState<{
    query: string;
    result: UsernameAvailability;
  } | null>(null);

  const requestIdRef = useRef(0);

  useEffect(() => {
    if (derived !== null) {
      requestIdRef.current++;
      return;
    }

    const currentId = ++requestIdRef.current;

    (async () => {
      try {
        const { data, error } = await authService.checkUsernameAvailability(debounced);
        if (currentId !== requestIdRef.current) return;

        if (error) {
          setAsyncState({
            query: debounced,
            result: {
              status: "error",
              message: error.message ?? "Could not check availability. Try again.",
            },
          });
          return;
        }

        setAsyncState({
          query: debounced,
          result: data?.available
            ? { status: "available", message: "Username is available." }
            : { status: "taken", message: "Username is already taken." },
        });
      } catch (err) {
        if (currentId !== requestIdRef.current) return;
        setAsyncState({
          query: debounced,
          result: {
            status: "error",
            message: err instanceof Error ? err.message : "Could not check availability.",
          },
        });
      }
    })();
  }, [derived, debounced]);

  if (derived !== null) return derived;
  if (asyncState?.query === debounced) return asyncState.result;
  return CHECKING;
};
