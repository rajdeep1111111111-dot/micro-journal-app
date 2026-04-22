import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Reflecto — Your Personal Micro-Journal",
  description:
    "Reflecto helps you journal daily, get AI-powered reflections on your thoughts, track your streaks, and share your journey with close friends.",
  openGraph: {
    title: "Reflecto — Your Personal Micro-Journal",
    description:
      "Reflecto helps you journal daily, get AI-powered reflections on your thoughts, track your streaks, and share your journey with close friends.",
    url: "https://micro-journal-app-six.vercel.app",
    siteName: "Reflecto",
    images: [
      {
        url: "https://micro-journal-app-six.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Reflecto — Your Personal Micro-Journal",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reflecto — Your Personal Micro-Journal",
    description:
      "Reflecto helps you journal daily, get AI-powered reflections on your thoughts, track your streaks, and share your journey with close friends.",
    images: ["https://micro-journal-app-six.vercel.app/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfair.variable}`}>
        {children}
      </body>
    </html>
  );
}
