export function getSafeRedirectPath(
  candidate: string | null,
  requestUrl: string,
  fallback = "/dashboard",
) {
  if (
    !candidate ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\")
  ) {
    return fallback;
  }

  try {
    const requestOrigin = new URL(requestUrl).origin;
    const destination = new URL(candidate, requestOrigin);
    if (destination.origin !== requestOrigin) return fallback;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return fallback;
  }
}
