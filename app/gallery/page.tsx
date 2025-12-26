"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import ScanlineOverlay from "@/components/ScanlineOverlay";


interface ImageData {
  url: string;
  id: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  // マウント状態の管理
  useEffect(() => {
    setMounted(true);
  }, []);

  // R2 CDNから画像URLを生成（クライアントサイドのみ）
  useEffect(() => {
    if (!mounted) return;

    // 少し遅延させてから画像を生成
    const timer = setTimeout(() => {
      // プログレスバーのアニメーション
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        setLoadingProgress(Math.min(progress, 90));
        if (progress >= 90) {
          clearInterval(progressInterval);
        }
      }, 50);

      // R2 CDNから1〜1093の連番画像URLを生成
      const baseUrl = "https://pub-16818221908f443cbb90e24fc96a2791.r2.dev/Dodgeball/dozzi";
      const totalImages = 1093;
      const urls: string[] = [];

      for (let i = 1; i <= totalImages; i++) {
        urls.push(`${baseUrl}${i}.JPEG`);
      }

      // Fisher-Yatesシャッフル（クライアントサイドのみで実行）
      for (let i = urls.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [urls[i], urls[j]] = [urls[j], urls[i]];
      }

      // 画像データに変換
      const imageData: ImageData[] = urls.map((url, index) => ({
        url,
        id: `img-${index}`,
      }));

      setImages(imageData);
      setLoadingProgress(100);

      setTimeout(() => {
        clearInterval(progressInterval);
        setLoading(false);
      }, 300);
    }, 100);

    return () => clearTimeout(timer);
  }, [mounted]);

  // シャッフル
  const shuffleImages = () => {
    const shuffled = [...images].sort(() => Math.random() - 0.5);
    setImages(shuffled);
  };

  // ライトボックスを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage]);

  // マウント前は空のdivを返す（ハイドレーション対策）
  if (!mounted) {
    return <div className="min-h-screen bg-[var(--background)]" />;
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)] overflow-hidden">
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
            <div className="overflow-hidden">
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[0.2em] uppercase"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <span className="gradient-text">GALLERY</span>
              </motion.h1>
            </div>

            <motion.p
              className="mt-4 text-xs sm:text-sm font-mono tracking-[0.3em] uppercase text-[var(--muted-foreground)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {images.length > 0 ? `${images.length} Photos` : "Loading Photos..."}
            </motion.p>

            {/* プログレスバー */}
            <div className="mt-8 w-48 sm:w-64 mx-auto">
              <div className="h-px bg-[var(--border)] relative overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[var(--neon-magenta)]"
                  style={{ boxShadow: "0 0 10px var(--neon-magenta)" }}
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
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--neon-magenta)]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--muted-foreground)]">
                Preparing Gallery
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* コーナーデコレーション */}
        <div className="absolute top-8 left-8 w-16 h-16 border-l border-t border-[var(--border)] opacity-30" />
        <div className="absolute top-8 right-8 w-16 h-16 border-r border-t border-[var(--border)] opacity-30" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-l border-b border-[var(--border)] opacity-30" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-[var(--border)] opacity-30" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Scanline Overlay */}
      <ScanlineOverlay opacity={0.02} />

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
      <Header currentPath="/gallery" />

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 pt-32">
        {/* タイトルセクション */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
                ギャラリー
              </h1>
              <div className="mt-2 flex items-center gap-4">
                <div className="w-24 h-px bg-gradient-to-r from-[var(--neon-magenta)] to-transparent" />
                <span className="text-sm font-mono text-[var(--muted-foreground)]">
                  {images.length} PHOTOS
                </span>
              </div>
            </div>

            <motion.button
              onClick={shuffleImages}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-mono uppercase tracking-widest text-xs transition-all duration-300 neon-border hover:bg-[var(--neon-magenta)] hover:text-[var(--background)]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Shuffle
            </motion.button>
          </div>
        </motion.div>

        {/* ギャラリーグリッド */}
        {images.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--muted-foreground)] text-lg">
              画像がありません
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer bg-gray-900"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: (index % 20) * 0.05,
                  ease: "easeOut"
                }}
                onClick={() => setSelectedImage(image)}
                whileHover={{ scale: 1.02, zIndex: 10 }}
              >
                <Image
                  src={image.url}
                  alt={`ドッジボール愛護団体の活動写真 ${index + 1}`}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                {/* ホバーオーバーレイ */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* VHSエフェクト */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.03) 2px, rgba(0,240,255,0.03) 4px)",
                  }}
                />

                {/* ホバー時のインデックス表示 */}
                <div className="absolute bottom-2 left-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="text-xs font-mono text-white/80">
                    #{String(index + 1).padStart(4, "0")}
                  </span>
                </div>

                {/* ネオンボーダー */}
                <div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow: "inset 0 0 20px var(--neon-magenta)",
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* フッター */}
        <motion.div
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-mono uppercase tracking-widest text-sm transition-all duration-300 neon-border hover:bg-[var(--neon-cyan)] hover:text-[var(--background)] group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            </svg>
            Back to Home
          </Link>
        </motion.div>
      </div>

      {/* 固定のトップに戻るボタン */}
      <motion.div
        className="fixed bottom-8 right-8 z-40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Link
          href="/"
          className="flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 group neon-border"
          style={{ backgroundColor: "var(--background)" }}
          aria-label="トップページに戻る"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-[var(--neon-cyan)] transition-transform duration-300 group-hover:-translate-y-1"
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
      </motion.div>

      {/* ライトボックス */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              onClick={() => setSelectedImage(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>

            <motion.div
              className="relative max-w-5xl max-h-[85vh] w-full h-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage.url}
                alt="拡大画像"
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
