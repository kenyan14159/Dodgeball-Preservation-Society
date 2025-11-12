"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { Member } from "@/data/members";
import { formatBirthday } from "@/lib/dateUtils";

// フォーカストラップ用のユーティリティ
const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
  );
};

interface ModalProps {
  member: Member;
  members: Member[];
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function Modal({
  member,
  members,
  onClose,
  onPrevious,
  onNext,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  // モーダルが開いたときにフォーカスを管理
  useEffect(() => {
    if (!modalRef.current) return;

    // 現在のフォーカスを保存
    previousFocusRef.current = document.activeElement as HTMLElement;

    // フォーカス可能な要素を取得
    const focusableElements = getFocusableElements(modalRef.current);
    firstFocusableRef.current = focusableElements[0] || null;
    lastFocusableRef.current = focusableElements[focusableElements.length - 1] || null;

    // 最初のフォーカス可能な要素にフォーカスを移動
    if (firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    } else {
      modalRef.current.focus();
    }

    // キーボードイベントハンドラー
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        onPrevious();
      } else if (e.key === "ArrowRight") {
        onNext();
      } else if (e.key === "Tab") {
        // フォーカストラップの実装
        if (!modalRef.current) return;
        const focusableElements = getFocusableElements(modalRef.current);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // スクロールを無効化
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      // モーダルが閉じられたときに元のフォーカスに戻す
      previousFocusRef.current?.focus();
    };
  }, [onClose, onPrevious, onNext, member]);

  // モーダルの外側をクリックしたときに閉じる
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        ref={modalRef}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card shadow-2xl focus:outline-none"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 前のメンバーボタン */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-3 text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="前のメンバー"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* 次のメンバーボタン */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-3 text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="次のメンバー"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 z-10 rounded-full bg-background/80 p-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="閉じる"
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
        </button>

        {/* メンバー画像 */}
        <div className="relative h-96 w-full overflow-hidden bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900">
          {member.imageUrl ? (
            <Image
              src={member.imageUrl}
              alt={`${member.name}のプロフィール写真`}
              fill
              className="object-contain"
              sizes="100vw"
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
        </div>

        {/* メンバー情報 */}
        <div className="p-8">
          <div className="mb-4">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h3
                id="modal-title"
                className="text-3xl font-bold text-card-foreground relative inline-block"
              >
                {member.name}
                <span className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" />
              </h3>
              {member.instagramUrl && (
                <a
                  href={member.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 rounded-full p-3 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={`${member.name}のInstagram`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                  >
                    <defs>
                      <linearGradient id="instagram-gradient-modal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#833AB4" />
                        <stop offset="50%" stopColor="#E1306C" />
                        <stop offset="100%" stopColor="#FCAF45" />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#instagram-gradient-modal)"
                      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                    />
                  </svg>
                </a>
              )}
            </div>
            {member.nameRomaji && (
              <div className="mt-3">
                <span className="text-base font-medium text-muted-foreground">
                  {member.nameRomaji}
                </span>
              </div>
            )}
            {formatBirthday(member.birthday) && (
              <div className="mt-3 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-muted-foreground"
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
                <span className="text-base font-medium text-muted-foreground">
                  {formatBirthday(member.birthday)}
                </span>
              </div>
            )}
          </div>
          <p id="modal-description" className="leading-relaxed text-muted-foreground">{member.profile}</p>
        </div>
      </div>
    </div>
  );
}

