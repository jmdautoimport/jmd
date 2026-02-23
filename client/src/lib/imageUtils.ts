type OptimizeOptions = {
  width?: number;
  quality?: number;
  fit?: "cover" | "contain" | "inside" | "outside";
};

function resolveAbsoluteUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (typeof window !== "undefined" && window.location) {
    return new URL(url, window.location.origin).toString();
  }

  return url;
}

export function getOptimizedImageUrl(
  url?: string | null,
  options: OptimizeOptions = {},
): string {
  if (!url) return "";
  if (url.startsWith("blob:")) return url;

  const { width = 1600, quality = 80, fit = "cover" } = options;

  try {
    const absolute = resolveAbsoluteUrl(url);

    // Bypass optimization for local URLs
    if (
      absolute.includes("localhost") ||
      absolute.includes("127.0.0.1") ||
      absolute.includes("[::1]")
    ) {
      return absolute;
    }

    const params = new URLSearchParams({
      url: absolute,
      w: String(width),
      q: String(quality),
      fit,
      output: "webp",
    });
    return `https://wsrv.nl/?${params.toString()}`;
  } catch {
    return url;
  }
}

export function getThumbnailUrl(url?: string | null, width: number = 400) {
  return getOptimizedImageUrl(url, { width, quality: 70, fit: "cover" });
}

