/** Prefix in-page anchors so nav works from routes other than home (e.g. /rag). */
export function navHref(href: string, anchorPrefix: string): string {
  return href.startsWith("#") ? `${anchorPrefix}${href}` : href;
}
