// Supabase origin the browser talks to (anon reads / storage). Added to
// connect-src + img-src so the CSP doesn't block them. Falls back to same-origin.
let supabaseOrigin = "";
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    supabaseOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
  }
} catch {
  supabaseOrigin = "";
}

// Content-Security-Policy.
// - script-src / style-src keep 'unsafe-inline': Next.js App Router injects its
//   own inline bootstrap/hydration scripts and Framer Motion injects inline
//   styles, and this app has no nonce middleware. 'self' still blocks loading
//   scripts from any external host — the main injection vector.
// - The hardening value is in the strict directives: no framing (clickjacking),
//   no <base> hijack, no plugins/objects, forms only to self, HTTPS upgrade.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `img-src 'self' data: blob:${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
  `connect-src 'self'${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
  "frame-src 'none'",
  "upgrade-insecure-requests",
]
  .join("; ")
  .concat(";");

// Sent on every response. Defense-in-depth on top of the app-layer controls.
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false, // don't advertise the framework/version
  // Heavy / native RAG-demo packages run in Node route handlers — don't bundle them.
  experimental: {
    serverComponentsExternalPackages: [
      "@huggingface/transformers",
      "onnxruntime-node",
      "sharp",
      "tesseract.js",
      "unpdf",
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
