"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  const [allImages, setAllImages] = useState<string[]>([]);
  const [imageCount, setImageCount] = useState<number>(IMAGE_COUNTS.DEFAULT);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const shuffleImages = useCallback(() => {
    if (allImages.length === 0 || typeof window === "undefined" || !mounted) return;
    const count = getImageCount();
    setImageCount(count);
    const shuffled = [...allImages].sort(() => Math.random() - 0.5);
    setHeroImages(shuffled.slice(0, count));
  }, [allImages, mounted, getImageCount]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadImages = () => {
      // R2 CDN
      const baseUrl = "https://pub-16818221908f443cbb90e24fc96a2791.r2.dev/Dodgeball/dozzi";
      const totalImages = 1093;
      const images: string[] = [];

      for (let i = 1; i <= totalImages; i++) {
        images.push(`${baseUrl}${i}.JPEG`);
      }

      setAllImages(images);

      // Short simple loader
      setTimeout(() => {
        setLoading(false);
      }, 1200);
    };

    loadImages();
  }, [mounted]);

  useEffect(() => {
    if (allImages.length > 0 && !loading && mounted) {
      const initialCount = getImageCount();
      setImageCount(initialCount);
      shuffleImages();
    }
  }, [allImages, loading, shuffleImages, mounted, getImageCount]);

  useEffect(() => {
    if (!mounted) return;
    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        shuffleImages();
      }, TIMERS.RESIZE_DEBOUNCE);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [shuffleImages, mounted]);

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
      { threshold: 0.1, rootMargin: "0px" }
    );
    const elements = document.querySelectorAll("[data-member-id]");
    elements.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [mounted, loading]); // Re-run when loading finishes to catch elements

  useEffect(() => {
    if (!mounted) return;
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePreviousMember = () => {
    if (!selectedMember) return;
    const currentIndex = members.findIndex((m) => m.id === selectedMember.id);
    const prevMember = currentIndex > 0 ? members[currentIndex - 1] : members[members.length - 1];
    setSelectedMember(prevMember);
  };

  const handleNextMember = () => {
    if (!selectedMember) return;
    const currentIndex = members.findIndex((m) => m.id === selectedMember.id);
    const nextMember = currentIndex < members.length - 1 ? members[currentIndex + 1] : members[0];
    setSelectedMember(nextMember);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-neutral-800 selection:text-white">
      {/* Simple Loading Screen */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)]"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold tracking-widest uppercase">DOZZI</h1>
              <p className="mt-2 text-xs font-mono tracking-[0.3em] text-[var(--muted-foreground)]">LOADING</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header currentPath="/" />

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-[var(--background)]">
        <div className="absolute inset-0 grid grid-cols-2 gap-px sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 opacity-40">
          {!loading && heroImages.map((imageUrl, index) => (
            <motion.div
              key={`hero-${index}`}
              className="relative aspect-square overflow-hidden grayscale hover:grayscale-0 transition-all duration-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.02 }}
            >
              <Image
                src={imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="25vw"
              />
            </motion.div>
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4 mix-blend-difference text-white">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter"
            >
              DOZZI
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-sm sm:text-base font-mono tracking-[0.5em] uppercase"
            >
              Dodgeball Preservation Society
            </motion.p>
          </div>
        </div>
      </section>

      {/* Members Section */}
      <section id="members" className="container mx-auto px-4 py-32 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">MEMBERS</h2>
          <div className="w-12 h-0.5 bg-[var(--foreground)] mx-auto opacity-20"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              data-member-id={member.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{
                opacity: visibleMembers.has(member.id) ? 1 : 0,
                y: visibleMembers.has(member.id) ? 0 : 40,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="group cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              <div className="aspect-[3/4] relative overflow-hidden bg-[var(--secondary)] mb-6">
                {member.imageUrl ? (
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--muted-foreground)]">
                    No Image
                  </div>
                )}
                {/* Minimal overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
              </div>

              <div className="flex justify-between items-baseline border-b border-[var(--border)] pb-4 mb-4 group-hover:border-[var(--foreground)] transition-colors duration-300">
                <h3 className="text-2xl font-bold tracking-tight">{member.name}</h3>
                <span className="text-xs font-mono text-[var(--muted-foreground)] uppercase tracking-widest">
                  {member.nameRomaji}
                </span>
              </div>

              <p className="text-[var(--muted-foreground)] text-sm leading-relaxed line-clamp-3">
                {member.profile}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <Link
            href="/gallery"
            className="inline-block px-12 py-4 border border-[var(--border)] font-mono text-xs tracking-widest hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors duration-300"
          >
            VIEW GALLERY
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-[var(--secondary)] py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-12 tracking-tight">ABOUT US</h2>
          <div className="space-y-8 text-[var(--muted-foreground)] font-light leading-loose text-lg">
            <p>
              小学生時代に結成された団体。名前の由来は、小学校で開催されたドッジボール大会のチーム名である。もちろん優勝した。ドッジボールにかける思いは本物で、学校のドッジボール大会前には授業中からウォーミングアップを始めるほどの熱意ぶり。しかしテスト中だったため先生に激怒され、数名が出場停止という本末転倒な結末を迎えた伝説も持つ。
            </p>
            <p>
              元々は加入メンバーも多かったが、様々な事情により人数が減少し、現在の9名に絞られた。
            </p>
            <p>
              私たちの遊びは、登山、野球、ドッジボール、人狼ゲーム…と多岐にわたる。高校進学でバラバラになった後も、年に1〜2回は必ず旅行を敢行。
            </p>
            <p className="text-[var(--foreground)] pt-8 font-medium">
              それぞれが異なる目標に向かって一生懸命取り組みながらも、集まればバカ騒ぎ。そんな最高の仲間たちの集まりである。
            </p>
          </div>
        </div>
      </section>

      {/* Modal & ScrollTop */}
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

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 right-8 z-40 p-4 mix-blend-difference text-white"
          >
            SCROLL UP
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
