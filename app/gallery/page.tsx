"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import {
  ANIMATION_DELAYS,
  OBSERVER_CONFIG,
} from "@/lib/constants";

interface ImageData {
  url: string;
  id: string; // URLベースの一意IDに変更
}

export default function GalleryPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // マウント状態の管理
  useEffect(() => {
    setMounted(true);
  }, []);

  // JSONファイルから画像URLを読み込む
  useEffect(() => {
    if (!mounted) return;

    const loadImages = async () => {
      setError(null);
      try {
        const response = await fetch("/img/image.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const urls: string[] = await response.json();

        // ランダムにシャッフル
        const shuffled = [...urls].sort(() => Math.random() - 0.5);

        // 画像データに変換（URLベースの一意IDを使用）
        const imageData: ImageData[] = shuffled.map((url) => ({
          url,
          id: url, // URLをIDとして使用
        }));

        setImages(imageData);
        setLoading(false);
      } catch (error) {
        console.error("画像の読み込みに失敗しました:", error);
        setError("画像の読み込みに失敗しました。ページを再読み込みしてください。");
        setLoading(false);
      }
    };

    loadImages();
  }, [mounted]);

  // Intersection Observerで画像の表示を監視
  useEffect(() => {
    if (!mounted || images.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imageId = entry.target.getAttribute("data-image-id");
            if (imageId) {
              setVisibleImages((prev) => new Set(prev).add(imageId));
            }
          }
        });
      },
      {
        threshold: OBSERVER_CONFIG.THRESHOLD,
        rootMargin: OBSERVER_CONFIG.ROOT_MARGIN,
      }
    );

    const elements = document.querySelectorAll("[data-image-id]");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      elements.forEach((el) => observerRef.current?.unobserve(el));
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [images, mounted]);

  // ランダムにシャッフルする関数（IDは維持）
  const shuffleImages = () => {
    const shuffled = [...images].sort(() => Math.random() - 0.5);
    setImages(shuffled);
    // シャッフル後も表示状態は維持（IDがURLベースなので）
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-black">
        <div className="text-center">
          <div
            className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"
            role="status"
            aria-label="読み込み中"
          />
          <p className="text-muted-foreground" aria-live="polite">
            画像を読み込んでいます...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-black">
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
              className="text-sm underline font-medium focus:outline-none focus:ring-2 focus:ring-destructive-foreground"
            >
              再読み込み
            </button>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <Header currentPath="/gallery" />

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
              className="group relative overflow-hidden rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="画像をシャッフル"
            >
              <span className="relative z-10">画像をシャッフル</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
            </button>
          </div>
        </div>

        {/* ギャラリーグリッド */}
        {images.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              画像がありません。ページを再読み込みしてください。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                data-image-id={image.id}
                className={`group relative aspect-square overflow-hidden rounded-xl bg-card shadow-lg transition-all duration-700 ${
                  visibleImages.has(image.id)
                    ? "translate-y-0 opacity-100 scale-100"
                    : "translate-y-8 opacity-0 scale-95"
                }`}
                style={{
                  transitionDelay: `${(index % 20) * ANIMATION_DELAYS.GALLERY_IMAGE}ms`,
                }}
              >
                {/* 画像 */}
                <div className="relative h-full w-full">
                  <Image
                    src={image.url}
                    alt={`ドッジボール愛護団体の活動写真 ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  {/* オーバーレイ */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* ホバー時の情報 */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                    <p className="text-sm font-medium text-white">画像 {index + 1}</p>
                  </div>
                </div>

                {/* シャインエフェクト */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-all duration-1000 group-hover:translate-x-full group-hover:opacity-100" />
              </div>
            ))}
          </div>
        )}

        {/* フッター */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-8" aria-live="polite">
            {images.length}枚の画像を表示中
          </p>
          <Link
            href="/"
            className="group relative inline-block overflow-hidden rounded-full bg-foreground px-8 py-4 text-base font-medium text-background transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <span className="relative z-10">トップページに戻る</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
          </Link>
        </div>
      </div>

      {/* 固定のトップページに戻るボタン */}
      <Link
        href="/"
        className="fixed bottom-8 right-8 z-40 group flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="トップページに戻る"
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </Link>
    </div>
  );
}
