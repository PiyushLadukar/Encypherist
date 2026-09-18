import NextImage, { type ImageProps } from "next/image";
import { getImageDimensions } from "@/lib/image-dimensions";

/**
 * next/image for a path that came out of the database.
 *
 * Member and event photo URLs are admin-editable, and next/image throws a hard
 * render error — not a warning — when given a host that is missing from
 * `images.remotePatterns`. A single bad paste would take down the whole page,
 * so anything that is not a local `/…` path falls back to a plain <img>, which
 * simply loads unoptimised instead of failing.
 *
 * Every current value is local, so in practice this renders an optimised image;
 * the fallback exists so that stays true no matter what gets entered later.
 */
type LocalImageProps = Omit<ImageProps, "src" | "width" | "height"> & {
  src: string;
  /** Fills the nearest positioned ancestor, as next/image's own `fill` does. */
  fill?: boolean;
};

export function LocalImage({ src, fill, alt, className, style, sizes, ...rest }: LocalImageProps) {
  const isLocal = src.startsWith("/") && !src.startsWith("//");

  if (!isLocal) {
    // eslint-disable-next-line @next/next/no-img-element -- deliberate fallback, see above
    return <img src={src} alt={alt} className={className} style={style} />;
  }

  if (fill) {
    return <NextImage src={src} alt={alt} fill sizes={sizes} className={className} style={style} {...rest} />;
  }

  const { width, height } = getImageDimensions(src);
  return (
    <NextImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      style={style}
      {...rest}
    />
  );
}
