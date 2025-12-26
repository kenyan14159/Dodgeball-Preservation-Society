"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import ScanlineOverlay from "@/components/ScanlineOverlay";
import { members, type Member } from "@/data/members";
import {
  ANIMATION_DELAYS,
  TIMERS,
  SCROLL_THRESHOLDS,
  IMAGE_COUNTS,
  OBSERVER_CONFIG,
  PROGRESS,
  IMAGE_URLS,
} from "@/lib/constants";
import { formatBirthday } from "@/lib/dateUtils";

export default function Home() {
  const [visibleMembers, setVisibleMembers] = useState<Set<string>>(new Set());
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [imageCount, setImageCount] = useState<number>(IMAGE_COUNTS.DEFAULT);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const shuffleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingStartTimeRef = useRef<number>(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Tailwindの標準ブレークポイントに基づいて枚数を決定（共通関数）
  const getImageCount = useCallback(() => {
    if (typeof window === "undefined") return IMAGE_COUNTS.DEFAULT;

    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width < 640) {
      const rows = Math.ceil(height / (width / 2));
      return Math.max(IMAGE_COUNTS.MOBILE_MIN, rows * 2);
    }
    if (width < 1024) {
      const rows = Math.ceil(height / (width / 3));
      return Math.max(IMAGE_COUNTS.TABLET_MIN, rows * 3);
    }
    const rows = Math.ceil(height / (width / 4));
    return Math.max(IMAGE_COUNTS.DESKTOP_MIN, rows * 4);
  }, []);

  // 画像を読み込んでランダムに選択
  const shuffleImages = useCallback(() => {
    if (allImages.length === 0 || typeof window === "undefined" || !mounted) return;

    const count = getImageCount();
    setImageCount(count);
    const shuffled = [...allImages].sort(() => Math.random() - 0.5);
    setHeroImages(shuffled.slice(0, count));
  }, [allImages, mounted, getImageCount]);

  // マウント状態の管理
  useEffect(() => {
    setMounted(true);
  }, []);

  // 初回画像読み込み
  useEffect(() => {
    if (!mounted) return;

    const loadImages = () => {
      loadingStartTimeRef.current = Date.now();
      setError(null);

      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= PROGRESS.MAX_BEFORE_COMPLETE) return prev;
          return prev + Math.random() * PROGRESS.INCREMENT_MAX;
        });
      }, TIMERS.PROGRESS_UPDATE_INTERVAL);

      // R2 CDNから1〜1093の連番画像URLを生成
      const baseUrl = "https://pub-16818221908f443cbb90e24fc96a2791.r2.dev/Dodgeball/dozzi";
      const totalImages = 1093;
      const images: string[] = [];

      for (let i = 1; i <= totalImages; i++) {
        images.push(`${baseUrl}${i}.JPEG`);
      }

      setAllImages(images);
      setLoadingProgress(100);

      const elapsedTime = Date.now() - loadingStartTimeRef.current;
      const remainingTime = Math.max(0, TIMERS.LOADING_MIN_DISPLAY - elapsedTime);

      setTimeout(() => {
        clearInterval(progressInterval);
        setLoading(false);
      }, remainingTime);
    };

    loadImages();
  }, [mounted]);

  // 画像が読み込まれたらシャッフル
  useEffect(() => {
    if (allImages.length > 0 && !loading && mounted) {
      const initialCount = getImageCount();
      setImageCount(initialCount);
      shuffleImages();
    }
  }, [allImages, loading, shuffleImages, mounted, getImageCount]);

  // 画面サイズ変更時に画像枚数を再計算
  useEffect(() => {
    if (!mounted) return;

    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(() => {
        shuffleImages();
      }, TIMERS.RESIZE_DEBOUNCE);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [shuffleImages, mounted]);

  // 定期的に画像をシャッフル
  useEffect(() => {
    if (allImages.length === 0 || !mounted) return;

    shuffleIntervalRef.current = setInterval(() => {
      if (!isScrolling) {
        shuffleImages();
      }
    }, TIMERS.IMAGE_SHUFFLE_INTERVAL);

    return () => {
      if (shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current);
      }
    };
  }, [shuffleImages, mounted, allImages.length, isScrolling]);

  // Intersection Observer
  useEffect(() => {
    if (!mounted) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const memberId = entry.target.getAttribute("data-member-id");
            if (memberId) {
              setVisibleMembers((prev) => new Set(prev).add(memberId));
            }
          }
        });
      },
      {
        threshold: OBSERVER_CONFIG.THRESHOLD,
        rootMargin: OBSERVER_CONFIG.MEMBER_ROOT_MARGIN,
      }
    );

    const elements = document.querySelectorAll("[data-member-id]");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      elements.forEach((el) => observerRef.current?.unobserve(el));
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [mounted]);

  // スクロール検知
  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > SCROLL_THRESHOLDS.SHOW_SCROLL_TOP);

      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [mounted]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePreviousMember = () => {
    if (!selectedMember) return;
    const currentIndex = members.findIndex((m) => m.id === selectedMember.id);
    const prevMember =
      currentIndex > 0 ? members[currentIndex - 1] : members[members.length - 1];
    setSelectedMember(prevMember);
  };

  const handleNextMember = () => {
    if (!selectedMember) return;
    const currentIndex = members.findIndex((m) => m.id === selectedMember.id);
    const nextMember =
      currentIndex < members.length - 1 ? members[currentIndex + 1] : members[0];
    setSelectedMember(nextMember);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Scanline Overlay */}
      <ScanlineOverlay opacity={0.02} />

      {/* ローディング画面 */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)] overflow-hidden"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            role="status"
            aria-live="polite"
            aria-label="読み込み中"
          >
            {/* 背景グリッド */}
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(var(--neon-cyan) 1px, transparent 1px),
                                  linear-gradient(90deg, var(--neon-cyan) 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
              }}
            />

            {/* 動く背景オーブ */}
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
              style={{ background: "var(--gradient-glitch)" }}
              animate={{
                x: ["-25%", "25%", "-25%"],
                y: ["-25%", "25%", "-25%"],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative z-10 flex flex-col items-center">
              {/* メインローダー */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                {/* 外側の回転リング */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: "2px solid transparent",
                    borderTopColor: "var(--neon-cyan)",
                    borderRightColor: "var(--neon-cyan)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />

                {/* 中間リング（逆回転） */}
                <motion.div
                  className="absolute inset-3 rounded-full"
                  style={{
                    border: "2px solid transparent",
                    borderBottomColor: "var(--neon-magenta)",
                    borderLeftColor: "var(--neon-magenta)",
                  }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />

                {/* 内側リング */}
                <motion.div
                  className="absolute inset-6 rounded-full"
                  style={{
                    border: "1px solid var(--neon-amber)",
                    opacity: 0.5,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* 中央のパーセント表示 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    className="text-3xl sm:text-4xl font-mono font-bold gradient-text"
                    key={Math.round(loadingProgress)}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {Math.round(loadingProgress)}
                  </motion.span>
                </div>
              </div>

              {/* テキストエリア */}
              <motion.div
                className="mt-12 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* ブランド名 */}
                <div className="overflow-hidden">
                  <motion.h1
                    className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[0.2em] uppercase"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <span className="gradient-text">DOZZI</span>
                  </motion.h1>
                </div>

                {/* サブテキスト */}
                <motion.p
                  className="mt-4 text-xs sm:text-sm font-mono tracking-[0.3em] uppercase text-[var(--muted-foreground)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  Dodgeball Preservation Society
                </motion.p>

                {/* プログレスバー */}
                <div className="mt-8 w-48 sm:w-64 mx-auto">
                  <div className="h-px bg-[var(--border)] relative overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-[var(--neon-cyan)]"
                      style={{ boxShadow: "0 0 10px var(--neon-cyan)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${loadingProgress}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* ステータステキスト */}
                <motion.div
                  className="mt-6 flex items-center justify-center gap-2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)]" />
                  <span className="text-xs font-mono uppercase tracking-widest text-[var(--muted-foreground)]">
                    Loading Experience
                  </span>
                </motion.div>
              </motion.div>
            </div>

            {/* コーナーデコレーション */}
            <div className="absolute top-8 left-8 w-16 h-16 border-l border-t border-[var(--border)] opacity-30" />
            <div className="absolute top-8 right-8 w-16 h-16 border-r border-t border-[var(--border)] opacity-30" />
            <div className="absolute bottom-8 left-8 w-16 h-16 border-l border-b border-[var(--border)] opacity-30" />
            <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-[var(--border)] opacity-30" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* エラー表示 */}
      {error && (
        <motion.div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass px-6 py-4 rounded-lg max-w-md mx-4"
          style={{ border: "1px solid var(--neon-magenta)" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-[var(--neon-magenta)]">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm underline font-medium hover:text-[var(--neon-cyan)] transition-colors"
            >
              再読み込み
            </button>
          </div>
        </motion.div>
      )}

      {/* ヘッダー */}
      <Header currentPath="/" />

      {/* ヒーローセクション */}
      <section className="relative min-h-screen overflow-hidden">
        {/* 背景画像グリッド */}
        <div className="absolute inset-0 grid grid-cols-2 gap-0.5 sm:gap-1 md:grid-cols-3 md:gap-2 lg:grid-cols-4 lg:gap-3">
          {loading ? (
            Array.from({ length: imageCount }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse bg-[var(--secondary)]"
                aria-hidden="true"
              />
            ))
          ) : (
            heroImages.map((imageUrl, index) => (
              <motion.div
                key={`hero-${imageUrl}-${index}`}
                className="group relative aspect-square overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.03,
                }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
              >
                <Image
                  src={imageUrl}
                  alt={`ドッジボール愛護団体の活動写真 ${index + 1}`}
                  fill
                  className="object-cover transition-all duration-500 group-hover:brightness-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  priority={index < IMAGE_COUNTS.PRIORITY_COUNT}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                {/* VHS effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.03) 2px, rgba(0,240,255,0.03) 4px)",
                  }}
                />
              </motion.div>
            ))
          )}
        </div>

        {/* Center overlay with title */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="glass px-8 py-6 sm:px-12 sm:py-8 rounded-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: loading ? 0 : 1, y: loading ? 20 : 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-[0.3em] gradient-text">
              DOZZI
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-[var(--muted-foreground)] tracking-widest font-mono">
              since 2003
            </p>
          </motion.div>
        </div>

        {/* スクロールインジケーター */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: loading ? 0 : 1 }}
          transition={{ delay: 1 }}
        >
          <span className="text-xs text-[var(--muted-foreground)] font-mono uppercase tracking-widest">
            Scroll
          </span>
          <motion.div
            className="w-px h-12 bg-gradient-to-b from-[var(--neon-cyan)] to-transparent"
            animate={{ scaleY: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </section>

      {/* メンバー紹介セクション */}
      <section id="members" className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          className="mb-20 flex flex-col items-start gap-4"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-baseline gap-4">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
              メンバー紹介
            </h2>
            <span className="text-[var(--neon-cyan)] font-mono text-lg">
              {String(members.length).padStart(2, "0")} MEMBERS
            </span>
          </div>
          <div className="w-full max-w-md h-px bg-gradient-to-r from-[var(--neon-cyan)] via-[var(--neon-magenta)] to-transparent" />
        </motion.div>

        {/* メンバーグリッド - 非対称レイアウト */}
        <div className="space-y-16 sm:space-y-24">
          {members.map((member, index) => {
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={member.id}
                data-member-id={member.id}
                className={`flex flex-col gap-6 sm:gap-8 ${isEven ? "sm:flex-row" : "sm:flex-row-reverse"
                  }`}
                initial={{ opacity: 0, x: isEven ? -100 : 100 }}
                animate={{
                  opacity: visibleMembers.has(member.id) ? 1 : 0,
                  x: visibleMembers.has(member.id) ? 0 : isEven ? -100 : 100,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* 画像 */}
                <div
                  className="relative w-full sm:w-1/2 lg:w-2/5 aspect-[3/4] overflow-hidden rounded-2xl group cursor-pointer"
                  onClick={() => setSelectedMember(member)}
                  data-cursor-text="VIEW"
                  data-cursor-hover
                >
                  {member.imageUrl ? (
                    <Image
                      src={member.imageUrl}
                      alt={`${member.name}のプロフィール写真`}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--secondary)]">
                      <span className="text-6xl font-black text-[var(--muted-foreground)]">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Neon border on hover */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      boxShadow: "inset 0 0 30px var(--neon-cyan), 0 0 30px var(--neon-cyan)",
                    }}
                  />
                </div>

                {/* 情報 */}
                <div
                  className={`flex flex-col justify-center sm:w-1/2 lg:w-3/5 ${isEven ? "sm:pl-8 lg:pl-16" : "sm:pr-8 lg:pr-16"
                    }`}
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
                        {member.name}
                      </h3>
                      {member.nameRomaji && (
                        <p className="text-sm font-mono text-[var(--muted-foreground)] uppercase tracking-widest mt-1">
                          {member.nameRomaji}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {formatBirthday(member.birthday) && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[var(--secondary)] text-[var(--muted-foreground)]">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {formatBirthday(member.birthday)}
                        </span>
                      )}
                      {member.instagramUrl && (
                        <a
                          href={member.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[var(--secondary)] text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)] hover:text-[var(--background)] transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                          Instagram
                        </a>
                      )}
                    </div>

                    <p className="text-base sm:text-lg leading-relaxed text-[var(--muted-foreground)]">
                      {member.profile}
                    </p>

                    <button
                      onClick={() => setSelectedMember(member)}
                      className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-[var(--neon-cyan)] hover:text-[var(--neon-magenta)] transition-colors group"
                    >
                      詳細を見る
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ギャラリーリンク */}
        <motion.div
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Link
            href="/gallery"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-mono uppercase tracking-widest text-sm transition-all duration-300 neon-border hover:bg-[var(--neon-cyan)] hover:text-[var(--background)] group"
            data-cursor-text="GO"
          >
            ギャラリーを見る
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </motion.div>
      </section>

      {/* 団体についてセクション */}
      <section className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
            ドッジボール愛護団体とは
          </h2>
          <div className="w-full max-w-md h-px bg-gradient-to-r from-[var(--neon-magenta)] via-[var(--neon-amber)] to-transparent mt-4" />
        </motion.div>

        <div className="max-w-4xl space-y-8">
          {[
            "小学生時代に結成された団体。名前の由来は、小学校で開催されたドッジボール大会のチーム名である。もちろん優勝した。ドッジボールにかける思いは本物で、学校のドッジボール大会前には授業中からウォーミングアップを始めるほどの熱意ぶり。しかしテスト中だったため先生に激怒され、数名が出場停止という本末転倒な結末を迎えた伝説も持つ。",
            "元々は加入メンバーも多かったが、様々な事情により人数が減少し、現在の9名に絞られた。",
            "私たちの遊びは、登山、野球、ドッジボール、人狼ゲーム…と多岐にわたる。高校進学でバラバラになった後も、年に1〜2回は必ず旅行を敢行。(金沢、下呂、白馬、山梨、佐渡島、富山県内など)",
          ].map((text, i) => (
            <motion.p
              key={i}
              className="text-lg sm:text-xl leading-relaxed text-[var(--muted-foreground)]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              {text}
            </motion.p>
          ))}

          <motion.p
            className="text-xl sm:text-2xl font-bold leading-relaxed gradient-text"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            それぞれが異なる目標に向かって一生懸命取り組みながらも、集まればバカ騒ぎ。そんな最高の仲間たちの集まりである。
          </motion.p>
        </div>
      </section>

      {/* モーダル */}
      <AnimatePresence>
        {selectedMember && (
          <Modal
            member={selectedMember}
            members={members}
            onClose={() => setSelectedMember(null)}
            onPrevious={handlePreviousMember}
            onNext={handleNextMember}
          />
        )}
      </AnimatePresence>

      {/* トップに戻るボタン */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 group neon-border"
            style={{ backgroundColor: "var(--background)" }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            aria-label="トップに戻る"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[var(--neon-cyan)] transition-transform duration-300 group-hover:-translate-y-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
