"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Member } from "@/data/members";
import { formatBirthday } from "@/lib/dateUtils";

// Focus trap utility
const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const elements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  return Array.from(elements) as HTMLElement[];
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
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const currentIndex = members.findIndex((m) => m.id === member.id);

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;

    if (modalRef.current) {
      const focusableElements = getFocusableElements(modalRef.current);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        onPrevious();
      } else if (e.key === "ArrowRight") {
        onNext();
      } else if (e.key === "Tab" && modalRef.current) {
        const focusableElements = getFocusableElements(modalRef.current);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrevious, onNext]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        ref={modalRef}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-2xl"
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-all backdrop-blur-md border border-white/10"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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

        <div className="flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
          {/* Image Section */}
          <div className="relative w-full md:w-1/2 aspect-[3/4] flex-shrink-0 bg-[var(--secondary)]">
            {member.imageUrl ? (
              <Image
                src={member.imageUrl}
                alt={member.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[var(--muted-foreground)]">
                <span className="text-8xl font-black opacity-20">
                  {member.name.charAt(0)}
                </span>
              </div>
            )}

            {/* Navigation Buttons (Mobile) */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between md:hidden">
              <button
                onClick={onPrevious}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md"
                aria-label="Previous member"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
              <button
                onClick={onNext}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md"
                aria-label="Next member"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 p-8 sm:p-10 space-y-8 bg-[var(--card)]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted-foreground)]">
                <span>{String(currentIndex + 1).padStart(2, "0")}</span>
                <span>/</span>
                <span>{String(members.length).padStart(2, "0")}</span>
              </div>
              <div>
                <h2
                  id="modal-title"
                  className="text-3xl sm:text-4xl font-black tracking-tight"
                >
                  {member.name}
                </h2>
                {member.nameRomaji && (
                  <p className="text-sm font-mono text-[var(--muted-foreground)] uppercase tracking-widest mt-1">
                    {member.nameRomaji}
                  </p>
                )}
              </div>
            </div>

            <div className="h-px bg-[var(--border)]" />

            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                {formatBirthday(member.birthday) && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--secondary)] text-sm text-[var(--muted-foreground)] font-mono">
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
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatBirthday(member.birthday)}
                  </div>
                )}

                {member.instagramUrl && (
                  <a
                    href={member.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--secondary)] text-sm font-mono hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    Instagram
                  </a>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--muted-foreground)]">
                  Profile
                </h3>
                <p className="text-base leading-relaxed text-[var(--foreground)]">
                  {member.profile}
                </p>
              </div>
            </div>

            <div className="h-px bg-[var(--border)]" />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-between">
              <button
                onClick={onPrevious}
                className="inline-flex items-center gap-2 text-sm font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                PREV
              </button>
              <button
                onClick={onNext}
                className="inline-flex items-center gap-2 text-sm font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                NEXT
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
