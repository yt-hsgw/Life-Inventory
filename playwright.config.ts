import { execFileSync } from "node:child_process";
import { defineConfig, devices } from "@playwright/test";

function readLocalSupabaseValue(output: string, key: string) {
  return output.match(new RegExp(`^${key}="([^"]+)"$`, "m"))?.[1];
}

function resolveSupabaseEnv() {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const configuredKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (configuredUrl && configuredKey) {
    return { url: configuredUrl, publishableKey: configuredKey };
  }

  try {
    const output = execFileSync("npx", ["supabase", "status", "-o", "env"], {
      encoding: "utf8",
    });
    const url = readLocalSupabaseValue(output, "API_URL");
    const publishableKey = readLocalSupabaseValue(output, "PUBLISHABLE_KEY");
    if (url && publishableKey) return { url, publishableKey };
  } catch {
    // The actionable error below is clearer than the CLI's container details.
  }

  throw new Error(
    "Playwright requires Supabase. Run `npm run supabase:start` or set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
  );
}

const supabaseEnv = resolveSupabaseEnv();
process.env.NEXT_PUBLIC_SUPABASE_URL = supabaseEnv.url;
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = supabaseEnv.publishableKey;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: { baseURL: "http://127.0.0.1:3000", trace: "on-first-retry" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: supabaseEnv.url,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: supabaseEnv.publishableKey,
    },
  },
});
