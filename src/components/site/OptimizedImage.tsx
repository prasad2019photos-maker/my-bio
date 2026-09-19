import { useState, type ImgHTMLAttributes } from "react";
import { getOptimizedImageUrl, getResponsiveImageWidths, type ImageResizeMode } from "@/lib/images";

type OptimizedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "width"> & {
  src: string;
  width?: number;
  height?: number;
  quality?: number;
  resize?: ImageResizeMode;
  sizes?: string;
  responsive?: boolean;
  priority?: boolean;
};

export function OptimizedImage({
  src,
  width = 1600,
  height,
  quality = 80,
  resize = "cover",
  sizes = "100vw",
  responsive = true,
  priority = false,
  loading,
  decoding = "async",
  fetchPriority,
  onError,
  ...props
}: OptimizedImageProps) {
  const [failed, setFailed] = useState(false);
  const optimizedSrc = failed ? src : getOptimizedImageUrl(src, { width, height, quality, resize });
  const canTransform = optimizedSrc !== src;
  const widths = responsive && !failed && canTransform ? getResponsiveImageWidths(width) : [];
  const srcSet =
    widths.length > 1
      ? widths
          .map(
            (candidate) =>
              `${getOptimizedImageUrl(src, { width: candidate, quality, resize })} ${candidate}w`,
          )
          .join(", ")
      : undefined;

  return (
    <img
      {...props}
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      width={width}
      height={height}
      loading={loading ?? (priority ? "eager" : "lazy")}
      decoding={decoding}
      fetchPriority={fetchPriority ?? (priority ? "high" : "auto")}
      onError={(event) => {
        if (!failed && optimizedSrc !== src) {
          setFailed(true);
        }
        onError?.(event);
      }}
    />
  );
}
