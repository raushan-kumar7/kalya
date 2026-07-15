import slugify from "slugify";
import { authClient } from "@/lib/auth-client";

export const generateUsername = async (
  firstName: string,
  lastName: string,
  middleName?: string,
): Promise<string> => {
  const base = slugify(`${firstName} ${middleName ?? ""} ${lastName}`, {
    lower: true,
    strict: true,
    trim: true,
  });

  const safeBase = base.slice(0, 24) || "user";

  let candidate = safeBase;
  let attempt = 0;
  const MAX_ATTEMPTS = 5;

  while (attempt < MAX_ATTEMPTS) {
    const { data, error } = await authClient.isUsernameAvailable({
      username: candidate,
    });

    if (!error && data?.available) {
      return candidate;
    }

    attempt++;
    const suffix = Math.floor(1000 + Math.random() * 9000);
    candidate = `${safeBase}${suffix}`;
  }

  return `${safeBase}${Date.now().toString().slice(-6)}`;
};