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
  title: "Reflecto",
  description: "Your personal micro-journal",
  openGraph: {
    title: "Reflecto",
    description: "Your personal micro-journal",
    url: "https://micro-journal-app-six.vercel.app",
    images: [
      {
        url: "https://micro-journal-app-six.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Reflecto — Your personal micro-journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reflecto",
    description: "Your personal micro-journal",
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
