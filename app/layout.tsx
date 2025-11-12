import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ドッジボール愛護団体",
  description: "ドッジボール愛護団体のメンバー紹介ページ",
  icons: {
    icon: "https://wprs.my-hobby.space/wp-content/uploads/2025/11/dozzi_love.jpg",
    shortcut: "https://wprs.my-hobby.space/wp-content/uploads/2025/11/dozzi_love.jpg",
    apple: "https://wprs.my-hobby.space/wp-content/uploads/2025/11/dozzi_love.jpg",
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
