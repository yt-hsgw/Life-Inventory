import type { NextConfig } from "next";

function getSupabaseImagePattern():
  | NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number]
  | null {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return {
      protocol: url.protocol === "https:" ? "https" : "http",
      hostname: url.hostname,
      port: url.port,
      pathname: "/storage/v1/object/sign/item-photos/**",
    };
  } catch {
    return null;
  }
}

const supabaseImagePattern = getSupabaseImagePattern();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "192.168.1.142"],
  devIndicators: false,
  poweredByHeader: false,
  typedRoutes: true,
  images: {
    remotePatterns: supabaseImagePattern ? [supabaseImagePattern] : [],
    maximumRedirects: 0,
  },
};

export default nextConfig;
