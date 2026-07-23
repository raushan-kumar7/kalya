import { UserSection } from "@/types/auth";

/**
 * Extends the app-wide event bus with settings-specific events, following
 * the module-augmentation pattern documented in `@/utils/events`. Side-effect
 * import this once from anywhere in the settings feature (settings-client
 * does it) so the types are in scope wherever `appEvents` is used.
 */
declare module "@/utils/events" {
  interface AppEventMap {
    "settings:saved": { section: UserSection };
  }
}

export {};
