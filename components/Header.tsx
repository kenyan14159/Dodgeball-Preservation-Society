"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SCROLL_THRESHOLDS, IMAGE_URLS } from "@/lib/constants";

interface HeaderProps {
  currentPath?: string;
}

export default function Header({ currentPath = "/" }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLDS.HEADER_TRANSPARENT);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted]);

  const handleMembersClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (currentPath === "/") {
      e.preventDefault();
      document.getElementById("members")?.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
        isScrolled
          ? "bg-white/70 dark:bg-zinc-950/70 border-zinc-200/30 dark:border-zinc-800/30 shadow-sm"
          : "bg-white/95 dark:bg-zinc-950/95 border-zinc-200/50 dark:border-zinc-800/50 shadow-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* ロゴ/タイトル */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
              <Image
                src={IMAGE_URLS.LOGO}
                alt="ドッジボール愛護団体"
                fill
                className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
                priority
                onError={(e) => {
                  console.error("ロゴ画像の読み込みに失敗しました");
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <span className="hidden sm:inline-block text-xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary relative">
              ドッジボール愛護団体
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />
            </span>
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden sm:flex items-center gap-8">
            <Link
              href="/#members"
              className="text-sm font-semibold tracking-wide text-muted-foreground transition-colors hover:text-foreground relative group uppercase"
              onClick={handleMembersClick}
            >
              メンバー紹介
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 ${
                  currentPath === "/" ? "w-0 group-hover:w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
            <Link
              href="/gallery"
              className={`text-sm font-semibold tracking-wide transition-colors relative group uppercase ${
                currentPath === "/gallery"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ギャラリー
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary transition-all duration-300 ${
                  currentPath === "/gallery" ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          </nav>

          {/* モバイルメニューボタン */}
          <button
            className="sm:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <nav
            className="sm:hidden border-t border-zinc-200/50 dark:border-zinc-800/50 py-4 space-y-2"
            aria-label="モバイルナビゲーション"
          >
            <Link
              href="/#members"
              className="block px-4 py-2 text-sm font-semibold tracking-wide text-muted-foreground transition-colors hover:text-foreground uppercase"
              onClick={handleMembersClick}
            >
              メンバー紹介
            </Link>
            <Link
              href="/gallery"
              className="block px-4 py-2 text-sm font-semibold tracking-wide text-muted-foreground transition-colors hover:text-foreground uppercase"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ギャラリー
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

