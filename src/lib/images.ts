const RESPONSIVE_WIDTHS = [400, 640, 800, 1200, 1600] as const;

export type ImageResizeMode = "cover" | "contain" | "fill";

export type ImageTransformOptions = {
  width?: number;
  height?: number;
  quality?: number;
  resize?: ImageResizeMode;
};

function isSupabaseStorageUrl(value: string) {
  return value.includes("/storage/v1/");
}

/**
 * Builds a Supabase Storage rendering URL without changing the persisted URL.
 * Existing signed URLs are converted to the equivalent image-render endpoint so
 * their token remains valid while the image can be resized at the edge.
 */
export function getOptimizedImageUrl(
  source: string,
  { width, height, quality, resize = "cover" }: ImageTransformOptions = {},
) {
  if (!source || !isSupabaseStorageUrl(source) || (!width && !height && !quality)) {
    return source;
  }

  let url: URL;
  try {
    url = new URL(source);
  } catch {
    return source;
  }
  url.pathname = url.pathname
    .replace("/storage/v1/object/sign/", "/storage/v1/render/image/sign/")
    .replace("/storage/v1/object/public/", "/storage/v1/render/image/public/")
    .replace("/storage/v1/object/authenticated/", "/storage/v1/render/image/authenticated/");

  if (width && width > 0) url.searchParams.set("width", String(Math.round(width)));
  if (height && height > 0) url.searchParams.set("height", String(Math.round(height)));
  if (quality && quality > 0 && quality <= 100) {
    url.searchParams.set("quality", String(Math.round(quality)));
  }
  if (width || height) url.searchParams.set("resize", resize);

  return url.toString();
}

export function getResponsiveImageWidths(maxWidth = 1600) {
  const widths = RESPONSIVE_WIDTHS.filter((candidate) => candidate < maxWidth);
  return [...new Set([...widths, Math.max(1, Math.round(maxWidth))])].sort((a, b) => a - b);
}
