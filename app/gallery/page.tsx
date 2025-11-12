"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ImageData {
  url: string;
  id: number;
}

export default function GalleryPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleImages, setVisibleImages] = useState<Set<number>>(new Set());
  const [isScrolled, setIsScrolled] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // JSONファイルから画像URLを読み込む
  useEffect(() => {
    const loadImages = async () => {
      try {
        const response = await fetch("/img/image.json");
        const urls: string[] = await response.json();
        
        // ランダムにシャッフル
        const shuffled = [...urls].sort(() => Math.random() - 0.5);
        
        // 画像データに変換
        const imageData: ImageData[] = shuffled.map((url, index) => ({
          url,
          id: index,
        }));
        
        setImages(imageData);
        setLoading(false);
      } catch (error) {
        console.error("画像の読み込みに失敗しました:", error);
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  // Intersection Observerで画像の表示を監視
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imageId = parseInt(
              entry.target.getAttribute("data-image-id") || "0"
            );
            setVisibleImages((prev) => new Set(prev).add(imageId));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    const elements = document.querySelectorAll("[data-image-id]");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      elements.forEach((el) => observerRef.current?.unobserve(el));
      observerRef.current?.disconnect();
    };
  }, [images]);

  // ランダムにシャッフルする関数
  const shuffleImages = () => {
    const shuffled = [...images].sort(() => Math.random() - 0.5);
    setImages(shuffled);
    setVisibleImages(new Set());
  };

  // スクロール検知
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-black">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">画像を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-black">
      {/* ヘッダー */}
      <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
        isScrolled 
          ? "bg-white/70 dark:bg-zinc-950/70 border-zinc-200/30 dark:border-zinc-800/30 shadow-sm" 
          : "bg-white/95 dark:bg-zinc-950/95 border-zinc-200/50 dark:border-zinc-800/50 shadow-sm"
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* ロゴ/タイトル */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                <Image
                  src="https://wprs.my-hobby.space/wp-content/uploads/2025/11/dozzi_love.jpg"
                  alt="ドッジボール愛護団体"
                  fill
                  className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
                  priority
                  unoptimized
                />
              </div>
              <span className="hidden sm:inline-block text-xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary relative">
                ドッジボール愛護団体
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />
              </span>
            </Link>

            {/* ナビゲーション */}
            <nav className="hidden sm:flex items-center gap-8">
              <Link
                href="/#members"
                className="text-sm font-semibold tracking-wide text-muted-foreground transition-colors hover:text-foreground relative group uppercase"
              >
                メンバー紹介
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/gallery"
                className="text-sm font-semibold tracking-wide text-foreground transition-colors relative group uppercase"
              >
                ギャラリー
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-accent to-primary" />
              </Link>
            </nav>

            {/* モバイルメニューボタン */}
            <div className="sm:hidden">
              <Link
                href="/gallery"
                className="text-sm font-semibold tracking-wide text-foreground transition-colors uppercase"
              >
                ギャラリー
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 pt-32">
        {/* タイトルセクション */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground sm:text-6xl relative inline-block">
            ギャラリー
            <span className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" />
          </h1>
          <div className="mt-6">
            <button
              onClick={shuffleImages}
              className="group relative overflow-hidden rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <span className="relative z-10">画像をシャッフル</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
            </button>
          </div>
        </div>

        {/* ギャラリーグリッド */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={`${image.id}-${index}`}
              data-image-id={image.id}
              className={`group relative aspect-square overflow-hidden rounded-xl bg-card shadow-lg transition-all duration-700 ${
                visibleImages.has(image.id)
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-8 opacity-0 scale-95"
              }`}
              style={{
                transitionDelay: `${(index % 20) * 50}ms`,
              }}
            >
              {/* 画像 */}
              <div className="relative h-full w-full">
                <Image
                  src={image.url}
                  alt={`Gallery image ${image.id + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  unoptimized
                />
                
                {/* オーバーレイ */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                {/* ホバー時の情報 */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                  <p className="text-sm font-medium text-white">
                    画像 {image.id + 1}
                  </p>
                </div>
              </div>

              {/* シャインエフェクト */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-all duration-1000 group-hover:translate-x-full group-hover:opacity-100" />
            </div>
          ))}
        </div>

        {/* フッター */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-8">
            {images.length}枚の画像を表示中
          </p>
          <Link
            href="/"
            className="group relative inline-block overflow-hidden rounded-full bg-foreground px-8 py-4 text-base font-medium text-background transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <span className="relative z-10">トップページに戻る</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
          </Link>
        </div>
      </div>

      {/* 固定のトップページに戻るボタン */}
      <Link
        href="/"
        className="fixed bottom-8 right-8 z-40 group flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        aria-label="トップページに戻る"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </Link>
    </div>
  );
}

