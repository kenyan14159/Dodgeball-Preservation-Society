"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
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
      // モバイル: 2列で画面の高さを埋める
      const rows = Math.ceil(height / (width / 2));
      return Math.max(IMAGE_COUNTS.MOBILE_MIN, rows * 2);
    }
    if (width < 1024) {
      // タブレット: 3列で画面の高さを埋める
      const rows = Math.ceil(height / (width / 3));
      return Math.max(IMAGE_COUNTS.TABLET_MIN, rows * 3);
    }
    // デスクトップ: 4列で画面の高さを埋める
    const rows = Math.ceil(height / (width / 4));
    return Math.max(IMAGE_COUNTS.DESKTOP_MIN, rows * 4);
  }, []);

  // 画像を読み込んでランダムに選択（useCallbackでメモ化）
  const shuffleImages = useCallback(() => {
    if (allImages.length === 0 || typeof window === "undefined" || !mounted) return;

    const count = getImageCount();
    setImageCount(count);
    const shuffled = [...allImages].sort(() => Math.random() - 0.5);
    setHeroImages(shuffled.slice(0, count));
  }, [allImages, mounted, getImageCount]);

  // マウント状態の管理（ハイドレーションエラー回避）
  useEffect(() => {
    setMounted(true);
  }, []);

  // 初回画像読み込み
  useEffect(() => {
    if (!mounted) return;

    const loadImages = async () => {
      loadingStartTimeRef.current = Date.now();
      setError(null);

      // プログレスバーのアニメーション
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= PROGRESS.MAX_BEFORE_COMPLETE) return prev;
          return prev + Math.random() * PROGRESS.INCREMENT_MAX;
        });
      }, TIMERS.PROGRESS_UPDATE_INTERVAL);

      try {
        const response = await fetch("/img/main.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const images: string[] = await response.json();
        setAllImages(images);
        setLoadingProgress(100);

        // 最小表示時間を確保
        const elapsedTime = Date.now() - loadingStartTimeRef.current;
        const remainingTime = Math.max(0, TIMERS.LOADING_MIN_DISPLAY - elapsedTime);

        setTimeout(() => {
          clearInterval(progressInterval);
          setLoading(false);
        }, remainingTime);
      } catch (error) {
        console.error("画像の読み込みに失敗しました:", error);
        clearInterval(progressInterval);
        setError("画像の読み込みに失敗しました。ページを再読み込みしてください。");
        setLoading(false);
      }
    };

    loadImages();
  }, [mounted]);

  // 画像が読み込まれたらシャッフル
  useEffect(() => {
    if (allImages.length > 0 && !loading && mounted) {
      // 初回読み込み時に画面サイズに応じた枚数を設定
      const initialCount = getImageCount();
      setImageCount(initialCount);
      shuffleImages();
    }
  }, [allImages, loading, shuffleImages, mounted, getImageCount]);

  // 画面サイズ変更時に画像枚数を再計算（デバウンス付き）
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

  // 定期的に画像をシャッフル（スクロール中は停止）
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

  // Intersection Observerでメンバーカードの表示を監視
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
      
      // スクロール中フラグを設定
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

  // トップに戻る関数
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // モーダル関連の関数
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-black">
      {/* ローディング画面 */}
      {loading && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-black overflow-hidden"
          role="status"
          aria-live="polite"
          aria-label="読み込み中"
        >
          {/* 背景アニメーション */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>

          <div className="flex flex-col items-center justify-center gap-8 relative z-10 px-4">
            {/* ローディング画像 */}
            <div className="relative flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96">
              {/* グローエフェクト */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-2xl animate-pulse" />

              {/* 回転するリング */}
              <div
                className="absolute -inset-4 border-4 border-transparent border-t-primary border-r-accent rounded-3xl animate-spin"
                style={{ animationDuration: "3s" }}
              />

              {/* 画像コンテナ */}
              <div className="relative w-full h-full overflow-hidden rounded-3xl shadow-2xl ring-4 ring-primary/20 dark:ring-primary/10">
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

                {/* シャインエフェクト */}
                <div className="absolute inset-0 -left-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
              </div>
            </div>

            {/* タイトル */}
            <div className="text-center space-y-6 w-full max-w-md">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground relative inline-block mx-auto">
                ドッジボール愛護団体
                <span className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary via-accent to-primary transform scale-x-0 animate-[scaleX_1.5s_ease-out_forwards]" />
              </h1>

              {/* プログレスバー */}
              <div className="w-full max-w-xs mx-auto space-y-3">
                <div className="h-2 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-300 ease-out shadow-lg"
                    style={{ width: `${loadingProgress}%` }}
                    role="progressbar"
                    aria-valuenow={Math.round(loadingProgress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground font-medium text-center">
                  {Math.round(loadingProgress)}%
                </p>
              </div>

              {/* ローディングアニメーション */}
              <div className="flex items-center justify-center gap-3" aria-hidden="true">
                <div
                  className="w-3 h-3 bg-primary rounded-full animate-bounce shadow-lg"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-3 h-3 bg-accent rounded-full animate-bounce shadow-lg"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-3 h-3 bg-primary rounded-full animate-bounce shadow-lg"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-destructive text-destructive-foreground px-6 py-4 rounded-lg shadow-lg max-w-md mx-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center justify-between gap-4">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm underline font-medium"
            >
              再読み込み
            </button>
          </div>
        </div>
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
                className="aspect-square animate-pulse bg-zinc-200 dark:bg-zinc-800"
                aria-hidden="true"
              />
            ))
          ) : (
            heroImages.map((imageUrl, index) => (
              <div
                key={`hero-${imageUrl}-${index}`}
                className="group relative aspect-square overflow-hidden transition-all duration-500 ease-out opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]"
                style={{
                  animationDelay: `${index * ANIMATION_DELAYS.HERO_IMAGE}ms`,
                }}
              >
                <Image
                  src={imageUrl}
                  alt={`ドッジボール愛護団体の活動写真 ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  priority={index < IMAGE_COUNTS.PRIORITY_COUNT}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            ))
          )}
        </div>

        {/* スクロールインジケーター */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-sm text-foreground/70 font-medium">スクロール</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-foreground/70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* メンバー紹介セクション */}
      <section id="members" className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl relative inline-block">
            メンバー紹介
            <span className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" />
          </h2>
          <Link
            href="/gallery"
            className="group relative inline-block overflow-hidden rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <span className="relative z-10">ギャラリーを見る</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
          </Link>
        </div>

        {/* メンバーグリッド */}
        <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member, index) => (
            <div
              key={member.id}
              data-member-id={member.id}
              onClick={() => setSelectedMember(member)}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-700 hover:shadow-xl focus-within:ring-2 focus-within:ring-primary ${
                visibleMembers.has(member.id)
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{
                transitionDelay: `${index * ANIMATION_DELAYS.MEMBER_CARD}ms`,
              }}
              tabIndex={0}
              role="button"
              aria-label={`${member.name}のプロフィールを開く`}
              aria-describedby={`member-description-${member.id}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedMember(member);
                }
              }}
            >
              {/* カード背景グラデーション */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* メンバー画像 */}
              <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900">
                {member.imageUrl ? (
                  <Image
                    src={member.imageUrl}
                    alt={`${member.name}のプロフィール写真`}
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-4xl font-bold text-foreground/30">
                      {member.name.charAt(0)}
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>

              {/* メンバー情報 */}
              <div className="p-4 sm:p-6">
                <div className="mb-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-card-foreground relative inline-block">
                      {member.name}
                      <span className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />
                    </h3>
                    {member.instagramUrl && (
                      <a
                        href={member.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-shrink-0 rounded-full p-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={`${member.name}のInstagram`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <defs>
                            <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#833AB4" />
                              <stop offset="50%" stopColor="#E1306C" />
                              <stop offset="100%" stopColor="#FCAF45" />
                            </linearGradient>
                          </defs>
                          <path
                            fill="url(#instagram-gradient)"
                            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                  {member.nameRomaji && (
                    <div className="mt-2">
                      <span className="text-sm text-muted-foreground">
                        {member.nameRomaji}
                      </span>
                    </div>
                  )}
                  {formatBirthday(member.birthday) && (
                    <div className="mt-2 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm text-muted-foreground">
                        {formatBirthday(member.birthday)}
                      </span>
                    </div>
                  )}
                </div>
                <p id={`member-description-${member.id}`} className="text-sm sm:text-base leading-relaxed text-muted-foreground">{member.profile}</p>
              </div>

              {/* ホバー時のアクセント */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-accent transition-all duration-500 group-hover:w-full" />
            </div>
          ))}
        </div>
      </section>

      {/* 団体についてセクション */}
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl relative inline-block mb-8">
            ドッジボール愛護団体とは
            <span className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" />
          </h2>
        </div>

        <div className="max-w-4xl mx-auto space-y-6 text-lg leading-relaxed text-muted-foreground">
          <p>
            小学生時代に結成された団体。名前の由来は、小学校で開催されたドッジボール大会のチーム名である。もちろん優勝した。ドッジボールにかける思いは本物で、学校のドッジボール大会前には授業中からウォーミングアップを始めるほどの熱意ぶり。しかしテスト中だったため先生に激怒され、数名が出場停止という本末転倒な結末を迎えた伝説も持つ。
          </p>
          <p>
            元々は加入メンバーも多かったが、様々な事情により人数が減少し、現在の9名に絞られた。
          </p>
          <p>
            私たちの遊びは、登山、野球、ドッジボール、人狼ゲーム…と多岐にわたる。高校進学でバラバラになった後も、年に1〜2回は必ず旅行を敢行。(金沢、下呂、白馬、山梨、佐渡島、富山県内など)
          </p>
          <p className="text-foreground font-medium">
            それぞれが異なる目標に向かって一生懸命取り組みながらも、集まればバカ騒ぎ。そんな最高の仲間たちの集まりである。
          </p>
        </div>
      </section>

      {/* モーダル */}
      {selectedMember && (
        <Modal
          member={selectedMember}
          members={members}
          onClose={() => setSelectedMember(null)}
          onPrevious={handlePreviousMember}
          onNext={handleNextMember}
        />
      )}

      {/* トップに戻るボタン */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 group flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="トップに戻る"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-1"
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
        </button>
      )}
    </div>
  );
}
