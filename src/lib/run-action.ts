// import { toast } from "@/components/ui";
// import { UserSection } from "@/types/auth";

// type ActionResult<T> = {
//   data?: T | null;
//   error?: { message?: string; code?: string } | null;
// };

// interface RunActionOptions<T, S> {
//   action: () => Promise<ActionResult<T>>;
//   section: S;
//   successTitle: string;
//   successDescription?: string;
//   fallbackErrorMessage: string;
//   errorTitle?: string;
//   setUpdating: (section: S, value: boolean) => void;
//   setError: (section: S, error: string | null) => void;
//   onSuccess?: (data: T | null | undefined) => void;
// }

// type RunActionResult<T> = {
//   success: boolean;
//   data?: T | null;
//   error?: { message?: string; code?: string } | null;
// };

// /**
//  * Runs a single async mutation with consistent loading/error/toast handling.
//  * Returns true on success so callers can chain follow-up logic
//  * (e.g. form.reset()) without duplicating the try/catch shape everywhere.
//  *
//  * Generic over both the result type `T` and the "section" key type `S`,
//  * so it can back any updating/error state map — UserSection, FinanceSection,
//  * or any other section enum/string union you introduce later.
//  */
// export async function runAction<T, S>({
//   action,
//   section,
//   successTitle,
//   successDescription,
//   fallbackErrorMessage,
//   errorTitle = "Update Failed",
//   setUpdating,
//   setError,
//   onSuccess,
// }: RunActionOptions<T, S>): Promise<RunActionResult<T>> {
//   setUpdating(section, true);
//   setError(section, null);

//   try {
//     const { data, error } = await action();

//     if (error) {
//       const message = error.message ?? fallbackErrorMessage;
//       setError(section, message);
//       toast.error({ title: errorTitle, description: message });
//       return { success: false, error, data: null };
//     }

//     onSuccess?.(data);
//     toast.success({ title: successTitle, description: successDescription });
//     return { success: true, data };
//   } catch (err) {
//     const message = err instanceof Error ? err.message : fallbackErrorMessage;
//     setError(section, message);
//     toast.error({ title: errorTitle, description: message });
//     return { success: false, error: { message }, data: null };
//   } finally {
//     setUpdating(section, false);
//   }
// }

// /**
//  * Thin wrapper preserving the original call signature for user-settings
//  * (UserSection) mutations, so existing call sites don't need to change.
//  */
// export function runAuthAction<T>(
//   options: Omit<RunActionOptions<T, UserSection>, "errorTitle"> & {
//     errorTitle?: string;
//   }
// ) {
//   return runAction<T, UserSection>(options);
// }

import { UserSection } from "@/types/auth";
import { appEvents } from "@/utils/events";

type ActionResult<T> = {
  data?: T | null;
  error?: { message?: string; code?: string } | null;
};

interface RunActionOptions<T, S> {
  action: () => Promise<ActionResult<T>>;
  section: S;
  successTitle: string;
  successDescription?: string;
  fallbackErrorMessage: string;
  errorTitle?: string;
  setUpdating: (section: S, value: boolean) => void;
  setError: (section: S, error: string | null) => void;
  onSuccess?: (data: T | null | undefined) => void;
}

type RunActionResult<T> = {
  success: boolean;
  data?: T | null;
  error?: { message?: string; code?: string } | null;
};

/**
 * Runs a single async mutation with consistent loading/error/toast handling.
 * Returns true on success so callers can chain follow-up logic
 * (e.g. form.reset()) without duplicating the try/catch shape everywhere.
 */
export async function runAction<T, S>({
  action,
  section,
  successTitle,
  successDescription,
  fallbackErrorMessage,
  errorTitle = "Update Failed",
  setUpdating,
  setError,
  onSuccess,
}: RunActionOptions<T, S>): Promise<RunActionResult<T>> {
  setUpdating(section, true);
  setError(section, null);

  try {
    const { data, error } = await action();

    if (error) {
      const message = error.message ?? fallbackErrorMessage;
      setError(section, message);

      // Dispatch via event bus
      appEvents.emit("toast:show", {
        variant: "error",
        title: errorTitle,
        description: message,
      });

      return { success: false, error, data: null };
    }

    onSuccess?.(data);

    // Dispatch via event bus
    appEvents.emit("toast:show", {
      variant: "success",
      title: successTitle,
      description: successDescription,
    });

    return { success: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : fallbackErrorMessage;
    setError(section, message);

    // Dispatch via event bus
    appEvents.emit("toast:show", {
      variant: "error",
      title: errorTitle,
      description: message,
    });

    return { success: false, error: { message }, data: null };
  } finally {
    setUpdating(section, false);
  }
}

/**
 * Thin wrapper preserving the original call signature for user-settings
 * (UserSection) mutations, so existing call sites don't need to change.
 */
export function runAuthAction<T>(
  options: Omit<RunActionOptions<T, UserSection>, "errorTitle"> & {
    errorTitle?: string;
  }
) {
  return runAction<T, UserSection>(options);
}
