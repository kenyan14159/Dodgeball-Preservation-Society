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
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <span className="text-lg font-bold tracking-tight text-[var(--foreground)] transition-opacity group-hover:opacity-80">
              DOZZI
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-xs font-mono tracking-widest transition-colors hover:text-[var(--foreground)] group ${(link.href === "/gallery" && currentPath === "/gallery") ||
                    (link.href === "/#members" && currentPath === "/")
                    ? "text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)]"
                  }`}
                onClick={link.onClick}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden relative w-10 h-10 flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
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
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              className="sm:hidden overflow-hidden bg-[var(--background)] border-b border-[var(--border)]"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              aria-label="Mobile Navigation"
            >
              <div className="py-4 space-y-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="block px-4 py-3 text-sm font-mono tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
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
