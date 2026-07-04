import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { seed } from "@/db/seed";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Fraunces (serif) — name + section display headings only.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

// Inter — body copy.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// JetBrains Mono — eyebrows, metrics, tags, nav, labels (the signature element).
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Swapnil Kharche — Software Development Manager & Engineering Leader",
    template: "%s · Swapnil Kharche",
  },
  description:
    "Swapnil Kharche — Software Development Manager and Technical Lead with 12+ years modernizing mission-critical systems across Government, Healthcare, E-commerce and Financial domains. Based in Pune, India.",
  applicationName: "Swapnil Kharche — Portfolio",
  authors: [{ name: "Swapnil Kharche" }],
  creator: "Swapnil Kharche",
  keywords: [
    "Swapnil Kharche",
    "Software Development Manager",
    "Engineering Manager",
    "Technical Lead",
    "Staff Engineer",
    "Software Architecture",
    "RAG",
    "Next.js",
    "AWS",
    "Java",
    "Spring Boot",
    "Pune",
  ],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "profile",
    url: SITE_URL,
    siteName: "Swapnil Kharche",
    title:
      "Swapnil Kharche — Software Development Manager & Engineering Leader",
    description:
      "12+ years modernizing mission-critical systems. Engineering leadership, architecture, and AI-driven engineering — with a live RAG demo you can try.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swapnil Kharche — Software Development Manager",
    description: "Engineering leader. Architect. AI-driven engineering.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B0F1A" },
    { media: "(prefers-color-scheme: light)", color: "#FAFAF7" },
  ],
};

// Schema.org Person for rich results (kept in sync with the seed identity).
const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: seed.identity.name,
  jobTitle: "Software Development Manager",
  description:
    "Software Development Manager and Technical Lead with 12+ years modernizing mission-critical platforms.",
  url: SITE_URL,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Pune",
    addressRegion: "Maharashtra",
    addressCountry: "IN",
  },
  worksFor: { "@type": "Organization", name: "Deloitte Consulting LLP" },
  sameAs: [seed.identity.linkedinUrl].filter(Boolean),
};

// Runs before paint to set the saved theme and avoid a flash of the wrong one.
const NO_FLASH_THEME = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // Escape "<" so no field can break out of the <script> tag.
            __html: JSON.stringify(personLd).replace(/</g, "\\u003c"),
          }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
