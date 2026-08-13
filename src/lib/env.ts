import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const cleanupEnvSchema = z.object({
  ITEM_PHOTO_CLEANUP_SECRET: z.string().min(32),
});

export function getPublicEnv() {
  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });

  if (!result.success) {
    throw new Error(
      "Supabase configuration is missing. Copy .env.example to .env.local and set the public values.",
    );
  }

  return result.data;
}

export function getServerEnv() {
  const publicEnv = getPublicEnv();
  const result = serverEnvSchema.safeParse({
    ...publicEnv,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!result.success) {
    throw new Error(
      "Server-only Supabase configuration is missing. Set SUPABASE_SERVICE_ROLE_KEY in the deployment environment.",
    );
  }

  return result.data;
}

export function getItemPhotoCleanupSecret() {
  const result = cleanupEnvSchema.safeParse({
    ITEM_PHOTO_CLEANUP_SECRET: process.env.ITEM_PHOTO_CLEANUP_SECRET,
  });
  return result.success ? result.data.ITEM_PHOTO_CLEANUP_SECRET : null;
}
