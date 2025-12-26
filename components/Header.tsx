"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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

  const navLinks = [
    { href: "/#members", label: "MEMBERS", onClick: handleMembersClick },
    { href: "/gallery", label: "GALLERY", onClick: () => setIsMobileMenuOpen(false) },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? "glass"
          : "bg-transparent"
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* ロゴ/タイトル */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            data-cursor-text="HOME"
          >
            <motion.div
              className="relative h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 overflow-hidden rounded-lg"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={IMAGE_URLS.LOGO}
                alt="ドッジボール愛護団体"
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  console.error("ロゴ画像の読み込みに失敗しました");
                  e.currentTarget.style.display = "none";
                }}
              />
              {/* Neon glow on hover */}
              <div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  boxShadow: "0 0 20px var(--neon-cyan), inset 0 0 10px var(--neon-cyan)",
                }}
              />
            </motion.div>
            <span className="hidden sm:inline-block text-lg font-black tracking-tight text-[var(--foreground)] transition-colors group-hover:text-[var(--neon-cyan)]">
              DOZZI
            </span>
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden sm:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-xs font-mono tracking-[0.2em] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] group"
                onClick={link.onClick}
                data-cursor-hover
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-[var(--neon-cyan)] transition-all duration-300 ${(link.href === "/gallery" && currentPath === "/gallery") ||
                      (link.href === "/#members" && currentPath === "/")
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                    }`}
                  style={{
                    boxShadow: currentPath === link.href.replace("/#members", "/")
                      ? "0 0 10px var(--neon-cyan)"
                      : "none",
                  }}
                />
              </Link>
            ))}
          </nav>

          {/* モバイルメニューボタン */}
          <motion.button
            className="sm:hidden relative w-10 h-10 flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={isMobileMenuOpen}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative w-6 h-4">
              <motion.span
                className="absolute left-0 w-full h-px bg-[var(--foreground)]"
                animate={{
                  top: isMobileMenuOpen ? "50%" : "0%",
                  rotate: isMobileMenuOpen ? 45 : 0,
                  translateY: isMobileMenuOpen ? "-50%" : 0,
                }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="absolute left-0 top-1/2 w-full h-px bg-[var(--foreground)]"
                animate={{
                  opacity: isMobileMenuOpen ? 0 : 1,
                  scaleX: isMobileMenuOpen ? 0 : 1,
                }}
                transition={{ duration: 0.2 }}
                style={{ translateY: "-50%" }}
              />
              <motion.span
                className="absolute left-0 w-full h-px bg-[var(--foreground)]"
                animate={{
                  bottom: isMobileMenuOpen ? "50%" : "0%",
                  rotate: isMobileMenuOpen ? -45 : 0,
                  translateY: isMobileMenuOpen ? "50%" : 0,
                }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.button>
        </div>

        {/* モバイルメニュー */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              className="sm:hidden overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              aria-label="モバイルナビゲーション"
            >
              <div className="py-4 space-y-1 border-t border-[var(--border)]">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className="block px-4 py-3 text-sm font-mono tracking-[0.2em] text-[var(--muted-foreground)] transition-colors hover:text-[var(--neon-cyan)] hover:bg-[var(--secondary)] rounded-lg"
                      onClick={link.onClick}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
