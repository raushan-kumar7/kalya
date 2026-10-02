'use client';

import * as React from 'react';
import { toast } from '@/components/ui';
import { ApiError } from './api/types';

export interface RunActionOptions<T> {
  /** Optional loading message displayed in a toast during execution */
  loading?: string;
  /** Toast message displayed on success, or a dynamic message resolver */
  success?: string | ((data: T) => string);
  /** Error message fallback, or a dynamic error resolver */
  error?: string | ((err: Error | string) => string);
  /** Callback fired immediately upon successful completion */
  onSuccess?: (data: T) => void | Promise<void>;
  /** Callback fired upon failure */
  onError?: (err: Error) => void | Promise<void>;
  /** Callback fired when the action finishes (success or error) */
  onSettled?: () => void | Promise<void>;
  /** When true, disables toast notifications completely (default: false) */
  silent?: boolean;
  /** Custom toast id to prevent duplicate toasts */
  toastId?: string;
}

export interface ActionResult<T> {
  data: T | null;
  error: Error | null;
  errorMessage: string | null;
  success: boolean;
}

/**
 * Normalizes any error object, AxiosError, ApiError, or string into a user-friendly message.
 */
export function extractErrorMessage(err: unknown, fallback = 'Operation failed'): string {
  if (!err) return fallback;

  if (err instanceof ApiError) {
    if (err.errors && err.errors.length > 0) {
      return err.errors.map((e) => e.message).join(', ');
    }
    return err.message || fallback;
  }

  if (err instanceof Error) {
    return err.message || fallback;
  }

  if (typeof err === 'string') {
    return err;
  }

  if (typeof err === 'object' && err !== null) {
    const record = err as Record<string, unknown>;
    if (typeof record.message === 'string') return record.message;
    if (typeof record.error === 'string') return record.error;
  }

  return fallback;
}

export const getErrorMessage = extractErrorMessage;

/**
 * Universal Action Runner
 *
 * Wraps asynchronous operations with unified toast feedback, error normalization,
 * and lifecycle callbacks.
 *
 * @example
 * ```ts
 * const { data, success } = await runAction(
 *   () => userService.updateProfile({ first_name: 'Alex' }),
 *   {
 *     loading: 'Updating profile…',
 *     success: 'Profile updated successfully!',
 *   }
 * );
 * ```
 */
export async function runAction<T>(
  action: () => Promise<T>,
  options: RunActionOptions<T> = {}
): Promise<ActionResult<T>> {
  const {
    loading,
    success,
    error,
    onSuccess,
    onError,
    onSettled,
    silent = false,
    toastId,
  } = options;

  let activeToastId: string | undefined = toastId;

  if (loading && !silent) {
    activeToastId = toast.loading(loading, { id: toastId });
  }

  try {
    const result = await action();

    if (!silent) {
      let successMsg: string | undefined;
      if (typeof success === 'function') {
        successMsg = success(result);
      } else if (typeof success === 'string') {
        successMsg = success;
      }

      if (successMsg) {
        toast.success(successMsg, { id: activeToastId });
      } else if (loading && activeToastId) {
        toast.dismiss(activeToastId);
      }
    }

    if (onSuccess) {
      await onSuccess(result);
    }

    return {
      data: result,
      error: null,
      errorMessage: null,
      success: true,
    };
  } catch (err: unknown) {
    const normalizedError = err instanceof Error ? err : new Error(extractErrorMessage(err));
    const normalizedMessage = extractErrorMessage(err);

    if (!silent) {
      let errorMsg: string;
      if (typeof error === 'function') {
        errorMsg = error(normalizedError);
      } else if (typeof error === 'string') {
        errorMsg = error;
      } else {
        errorMsg = normalizedMessage;
      }

      toast.error(errorMsg, { id: activeToastId });
    }

    if (onError) {
      await onError(normalizedError);
    }

    return {
      data: null,
      error: normalizedError,
      errorMessage: normalizedMessage,
      success: false,
    };
  } finally {
    if (onSettled) {
      await onSettled();
    }
  }
}

/**
 * React hook wrapper around runAction for component mutations.
 *
 * @example
 * ```tsx
 * const { execute, isPending } = useAction(userService.updateProfile, {
 *   success: 'Profile saved!',
 * });
 * ```
 */
export function useAction<TInput = void, TOutput = unknown>(
  actionFn: (input: TInput) => Promise<TOutput>,
  options: RunActionOptions<TOutput> = {}
) {
  const [isPending, setIsPending] = React.useState(false);
  const [data, setData] = React.useState<TOutput | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  const execute = React.useCallback(
    async (input: TInput): Promise<ActionResult<TOutput>> => {
      setIsPending(true);
      setError(null);

      const result = await runAction(() => actionFn(input), {
        ...options,
        onSuccess: async (resData) => {
          setData(resData);
          if (options.onSuccess) await options.onSuccess(resData);
        },
        onError: async (err) => {
          setError(err);
          if (options.onError) await options.onError(err);
        },
        onSettled: async () => {
          setIsPending(false);
          if (options.onSettled) await options.onSettled();
        },
      });

      return result;
    },
    [actionFn, options]
  );

  const reset = React.useCallback(() => {
    setData(null);
    setError(null);
    setIsPending(false);
  }, []);

  return {
    execute,
    isPending,
    data,
    error,
    reset,
  };
}
