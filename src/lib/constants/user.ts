export const GENDER_OPTIONS = [
  "MALE",
  "FEMALE",
  "NON_BINARY",
  "PREFER_NOT_TO_SAY",
  "OTHER",
] as const;
export type Gender = (typeof GENDER_OPTIONS)[number];

export const SYNC_STATUS_OPTIONS = ["PENDING", "SYNCED", "CONFLICT", "FAILED"] as const;
export type SyncStatus = (typeof SYNC_STATUS_OPTIONS)[number];
