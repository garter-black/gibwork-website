const STORAGE_KEY = "gibwork_referral_params_v1";
const TRACKED_KEYS = [
  "ref",
  "referral",
  "referrer",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export function captureReferralParamsFromUrl(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const captured: Record<string, string> = {};
  for (const key of TRACKED_KEYS) {
    const val = params.get(key);
    if (val && val.trim()) {
      captured[key] = val.trim();
    }
  }
  if (typeof window !== "undefined" && Object.keys(captured).length > 0) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
    } catch {
      // Ignore storage quota errors in restricted frames
    }
  }
  return captured;
}

export function appendReferralToCtaUrl(
  targetHref: string,
  explicitParams?: Record<string, string>
): string {
  let stored: Record<string, string> = explicitParams ?? {};
  if (!explicitParams && typeof window !== "undefined") {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw) as Record<string, string>;
    } catch {
      stored = {};
    }
  }
  const entries = Object.entries(stored).filter(([, v]) => Boolean(v));
  if (entries.length === 0) return targetHref;

  try {
    const url = new URL(targetHref, "https://app.gib.work");
    for (const [k, v] of entries) {
      if (!url.searchParams.has(k)) {
        url.searchParams.set(k, v);
      }
    }
    return url.toString();
  } catch {
    return targetHref;
  }
}
