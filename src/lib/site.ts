export const SITE_NAME = "Aletheia";
export const SITE_ORIGIN = "https://aletheia.dev";
export const DEFAULT_SOCIAL_IMAGE = "/screen.png";
export const DEFAULT_SOCIAL_IMAGE_ALT =
  "Aletheia dashboard and marketing experience";

function normalizePath(pathname: string): string {
  if (!pathname || pathname === "/") {
    return "/";
  }

  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

export function absoluteUrl(pathname: string): string {
  return new URL(normalizePath(pathname), SITE_ORIGIN).toString();
}

export function absoluteAssetUrl(pathname: string): string {
  if (/^https?:\/\//.test(pathname)) {
    return pathname;
  }

  return absoluteUrl(pathname.startsWith("/") ? pathname : `/${pathname}`);
}
