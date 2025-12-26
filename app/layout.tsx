import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { IMAGE_URLS } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dozzi.pages.dev"),
  title: "ドッジボール愛護団体",
  description: "ドッジボール愛護団体のメンバー紹介ページ",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  icons: {
    icon: "/dozzi.png",
    shortcut: "/dozzi.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "ドッジボール愛護団体",
    description: "ドッジボール愛護団体のメンバー紹介ページ",
    images: [
      {
        url: IMAGE_URLS.LOGO,
        width: 1200,
        height: 630,
        alt: "ドッジボール愛護団体",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ドッジボール愛護団体",
    description: "ドッジボール愛護団体のメンバー紹介ページ",
    images: [IMAGE_URLS.LOGO],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
