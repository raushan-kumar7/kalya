import { db } from "@/db";
import * as schema from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { GENDER_OPTIONS, SYNC_STATUS_OPTIONS } from "./constants/user";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite", schema }),

  user: {
    modelName: "users",
    additionalFields: {
      username: {
        type: "string",
        required: true,
        unique: true,
      },
      first_name: {
        type: "string",
        required: true,
      },
      middle_name: {
        type: "string",
        required: false,
      },
      last_name: {
        type: "string",
        required: true,
      },
      gender: {
        type: [...GENDER_OPTIONS],
        required: false,
      },
      date_of_birth: {
        type: "string",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      locale: {
        type: "string",
        required: false,
      },
      timezone: {
        type: "string",
        required: false,
      },
      currency: {
        type: "string",
        required: false,
      },
      sync_status: {
        type: [...SYNC_STATUS_OPTIONS],
        required: false,
        defaultValue: "SYNCED",
        input: false,
      },
    },
  },
});

export type Auth = typeof auth;
