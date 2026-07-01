import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

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
  title: "Swapnil Kharche — Software Development Manager & Engineering Leader",
  description:
    "Swapnil Kharche — Software Development Manager and Technical Lead with 12+ years modernizing mission-critical systems across Government, Healthcare, E-commerce and Financial domains. Based in Pune, India.",
  authors: [{ name: "Swapnil Kharche" }],
  openGraph: {
    type: "profile",
    title:
      "Swapnil Kharche — Software Development Manager & Engineering Leader",
    description:
      "12+ years modernizing mission-critical systems. Engineering leadership, architecture, and AI-driven engineering.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swapnil Kharche — Software Development Manager",
    description: "Engineering leader. Architect. AI-driven engineering.",
  },
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
