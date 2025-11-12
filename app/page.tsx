"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Member {
  id: string;
  name: string;
  nameKana?: string;
  nameEn?: string;
  nameRomaji?: string;
  profile: string;
  imageUrl?: string;
}

const members: Member[] = [
  {
    id: "1",
    name: "大毛利寛太",
    nameRomaji: "Kanta Oomori",
    profile: "ドッジボール愛護団体の可愛いキャラ代表。料理、勉強、スポーツと、あらゆる分野で才能を発揮するハイスペック男子。その完璧ぶりで数々の女性を虜にしてきた罪深き男である。現在は我々の胃袋を支える料理担当として活躍中。可愛い顔して腕前は一流、まさに「可愛いは正義」を体現する貴重な存在だ。",
    imageUrl: "https://wprs.my-hobby.space/wp-content/uploads/2025/11/dozzi_member9.jpg",
  },
  {
    id: "4",
    name: "佐藤匠真",
    nameRomaji: "Takuma Sato",
    profile: "ドッジボール愛護団体随一のシスコン。大沢屈指の大金持ちとして、我々に何度も豪華な開会式を提供してくれる包容力の持ち主。自宅にはBBQ場、大型バスを完備という規格外ぶり。豊橋の大学では特技のギターで女性を落としまくった実績を持つが、本人曰く「お姉ちゃん以外興味ない」とのこと。その一途さ、むしろ清々しい。",
    imageUrl: "https://wprs.my-hobby.space/wp-content/uploads/2025/11/dozzi_member2-scaled.jpeg",
  },
  {
    id: "5",
    name: "清水大夢",
    nameRomaji: "Hiromu Shimizu",
    profile: "大沢野の異端児。小学・中学時代から学校全体のムードメーカーとして君臨。高校卒業後は地元の営業マンとしてスキルを磨き、今年はなんとオーストラリアへ武者修行に出発。その圧倒的行動力と営業スキルは、我々にとっても必須レベル。彼がいれば場が盛り上がる、そんな男だ。",
    imageUrl: "https://wprs.my-hobby.space/wp-content/uploads/2025/11/dozzi_member3.jpeg",
  },
  {
    id: "3",
    name: "中川敷司",
    nameRomaji: "Atsushi Nakagawa",
    profile: "大沢野随一のゲーマー。一時期はドッジボール愛護団体から離脱するも、涙の復帰会見で感動の復活を果たした男。最近では大沢野最強の男・守田に腕相撲で勝つため、大好きなゲームを封印して筋トレに没頭中。2026年1月2日、世紀の腕相撲対決を見逃すな!果たして下剋上は成るのか!?",
    imageUrl: "https://wprs.my-hobby.space/wp-content/uploads/2025/11/dozzi_member8.jpeg",
  },
  {
    id: "10",
    name: "中沢そら",
    nameRomaji: "Sora Nakazawa",
    profile: "大沢野のゴキブリ。学生時代、ゴキブリのような縦横無尽の動きでサッカー部の仲間をサポートし続けた献身的プレイヤー。中学時代には全国大会出場に貢献するなど、その機動力は折り紙付き。この会では「ウケ狙い大会」を考案し、数々の伝説的ネタを生み出してきた張本人。ただし、作成者だからといってネタが面白いとは誰も言っていない…。今年から転職を決意。新しい環境でも、あの「ゴキブリ並みのスピード感」で駆け抜けてくれるはずだ。",
    imageUrl: "https://wprs.my-hobby.space/wp-content/uploads/2025/11/dozzi_member5.jpeg",
  },
  {
    id: "9",
    name: "氷見哲太",
    nameRomaji: "Tetta Himi",
    profile: "煽りの天才。誰よりも負けず嫌いで、ボールを持ったら力尽きるまで追いかけ回してくる異常体力の持ち主。数々の問題を起こしてきたが、お得意の忍耐力で試練を乗り越え、大学2年で箱根駅伝6区出場という快挙を達成。煽りスキルと忍耐力、この二刀流が彼の武器だ。",
    imageUrl: "https://wprs.my-hobby.space/wp-content/uploads/2025/11/dozzi_member7.jpeg",
  },
  {
    id: "8",
    name: "二村昇太朗",
    nameRomaji: "Shotaro Futamura",
    profile: "富山を裏切りし男。小学・中学時代はこの会のモブキャラとして裏方を支えていた縁の下の力持ち。高校・大学と県外に進学し、富山の不便さを痛感。そして大学卒業後は東京で就職を決意。「みんなと離れて寂しいです…」という本音がにじむ、実は愛郷心溢れる男である。",
    imageUrl: "https://wprs.my-hobby.space/wp-content/uploads/2025/11/dozzi_member1.jpeg",
  },
  {
    id: "7",
    name: "村上徳都",
    nameRomaji: "Norito Murakami",
    profile: "野球バカの権化。彼の人生=肉、女の子、野球。この三大要素で構成されている。様々なものを犠牲にしながら野球一筋に生きてきた男。超面倒くさがり屋のため、彼の家の前に集合させられてドッジボールをしたのは今となってはいい思い出。ちなみに彼の帰宅時間は1秒である。",
    imageUrl: "https://wprs.my-hobby.space/wp-content/uploads/2025/11/dozzi_member4.jpeg",
  },
  {
    id: "6",
    name: "守田ひろやす",
    nameRomaji: "Hiroyasu Morita",
    profile: "黄色いカバンの伝説。大沢最強の男。小学生時代は喧嘩番長として恐れられていたが、中学生で突如キャラ変してまさかのおとなしキャラに。しかし最強の肩書きは健在で、誰も近寄れない絶対的存在感を放つ。黄色いカバンを持って走ってくる姿は、もはや恐怖。その一言に尽きる。",
    imageUrl: "https://wprs.my-hobby.space/wp-content/uploads/2025/11/dozzi_member6.jpeg",
  },
];

export default function Home() {
  const [visibleMembers, setVisibleMembers] = useState<Set<string>>(new Set());
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [imageCount, setImageCount] = useState(20);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const shuffleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingStartTimeRef = useRef<number>(0);

  // 画像を読み込んでランダムに選択（useCallbackでメモ化）
  const shuffleImages = useCallback(() => {
    if (allImages.length === 0 || typeof window === "undefined" || !mounted) return;

    // Tailwindの標準ブレークポイントに基づいて枚数を決定
    const getImageCount = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (width < 640) {
        // モバイル: 2列で画面の高さを埋める（約8-10行）
        const rows = Math.ceil(height / (width / 2));
        return Math.max(16, rows * 2); // 最低16枚、画面高さに応じて調整
      }
      if (width < 1024) {
        // タブレット: 3列で画面の高さを埋める（約4-5行）
        const rows = Math.ceil(height / (width / 3));
        return Math.max(12, rows * 3);
      }
      // デスクトップ: 4列で画面の高さを埋める（約5行）
      const rows = Math.ceil(height / (width / 4));
      return Math.max(20, rows * 4);
    };

    const count = getImageCount();
    setImageCount(count);
    const shuffled = [...allImages].sort(() => Math.random() - 0.5);
    setHeroImages(shuffled.slice(0, count));
  }, [allImages, mounted]);

  // マウント状態の管理（ハイドレーションエラー回避）
  useEffect(() => {
    setMounted(true);
  }, []);

  // 初回画像読み込み
  useEffect(() => {
    if (!mounted) return;
    
    const loadImages = async () => {
      loadingStartTimeRef.current = Date.now();
      
      // プログレスバーのアニメーション
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 100);

      try {
        const response = await fetch("/img/main.json");
        const images: string[] = await response.json();
        setAllImages(images);
        setLoadingProgress(100);
        
        // 最小表示時間を確保（2秒）
        const elapsedTime = Date.now() - loadingStartTimeRef.current;
        const minDisplayTime = 2000;
        const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
        
        setTimeout(() => {
          clearInterval(progressInterval);
          setLoading(false);
        }, remainingTime);
      } catch (error) {
        console.error("画像の読み込みに失敗しました:", error);
        clearInterval(progressInterval);
        setLoading(false);
      }
    };

    loadImages();
  }, [mounted]);

  // 画像が読み込まれたらシャッフル
  useEffect(() => {
    if (allImages.length > 0 && !loading && mounted) {
      // 初回読み込み時に画面サイズに応じた枚数を設定
      if (typeof window !== "undefined") {
        const width = window.innerWidth;
        const height = window.innerHeight;
        let initialCount = 20;
        
        if (width < 640) {
          const rows = Math.ceil(height / (width / 2));
          initialCount = Math.max(16, rows * 2);
        } else if (width < 1024) {
          const rows = Math.ceil(height / (width / 3));
          initialCount = Math.max(12, rows * 3);
        } else {
          const rows = Math.ceil(height / (width / 4));
          initialCount = Math.max(20, rows * 4);
        }
        setImageCount(initialCount);
      }
      shuffleImages();
    }
  }, [allImages, loading, shuffleImages, mounted]);

  // 画面サイズ変更時に画像枚数を再計算（デバウンス付き）
  useEffect(() => {
    if (!mounted) return;
    
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(() => {
        shuffleImages();
      }, 200);
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

  // 定期的に画像をシャッフル（5秒ごと）
  useEffect(() => {
    if (allImages.length === 0 || !mounted) return;

    shuffleIntervalRef.current = setInterval(() => {
      shuffleImages();
    }, 5000);

    return () => {
      if (shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current);
      }
    };
  }, [shuffleImages, mounted, allImages.length]);

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
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const elements = document.querySelectorAll("[data-member-id]");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      elements.forEach((el) => observerRef.current?.unobserve(el));
      observerRef.current?.disconnect();
    };
  }, [mounted]);

  // ESCキーでモーダルを閉じる、矢印キーで前後のメンバーに移動
  useEffect(() => {
    if (!mounted) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedMember) return;

      if (e.key === "Escape") {
        setSelectedMember(null);
      } else if (e.key === "ArrowLeft") {
        const currentIndex = members.findIndex((m) => m.id === selectedMember.id);
        const prevMember = currentIndex > 0 ? members[currentIndex - 1] : members[members.length - 1];
        setSelectedMember(prevMember);
      } else if (e.key === "ArrowRight") {
        const currentIndex = members.findIndex((m) => m.id === selectedMember.id);
        const nextMember = currentIndex < members.length - 1 ? members[currentIndex + 1] : members[0];
        setSelectedMember(nextMember);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMember, mounted]);

  // スクロール検知
  useEffect(() => {
    if (!mounted) return;
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted]);

  // トップに戻る関数
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-black">
      {/* ローディング画面 */}
      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-black overflow-hidden">
          {/* 背景アニメーション */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="flex flex-col items-center justify-center gap-8 relative z-10 px-4">
            {/* ローディング画像 */}
            <div className="relative flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96">
              {/* グローエフェクト */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-2xl animate-pulse" />
              
              {/* 回転するリング */}
              <div className="absolute -inset-4 border-4 border-transparent border-t-primary border-r-accent rounded-3xl animate-spin" style={{ animationDuration: '3s' }} />
              
              {/* 画像コンテナ */}
              <div className="relative w-full h-full overflow-hidden rounded-3xl shadow-2xl ring-4 ring-primary/20 dark:ring-primary/10">
                <Image
                  src="https://wprs.my-hobby.space/wp-content/uploads/2025/11/dozzi_love.jpg"
                  alt="ドッジボール愛護団体"
                  fill
                  className="object-cover"
                  priority
                  unoptimized
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
                  >
                    <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground font-medium text-center">
                  {Math.round(loadingProgress)}%
                </p>
              </div>
              
              {/* ローディングアニメーション */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0ms' }} />
                <div className="w-3 h-3 bg-accent rounded-full animate-bounce shadow-lg" style={{ animationDelay: '150ms' }} />
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce shadow-lg" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        </div>
      )}

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
                href="#members"
                className="text-sm font-semibold tracking-wide text-muted-foreground transition-colors hover:text-foreground relative group uppercase"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('members')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                メンバー紹介
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/gallery"
                className="text-sm font-semibold tracking-wide text-muted-foreground transition-colors hover:text-foreground relative group uppercase"
              >
                ギャラリー
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
              </Link>
            </nav>

            {/* モバイルメニューボタン */}
            <div className="sm:hidden">
              <Link
                href="/gallery"
                className="text-sm font-semibold tracking-wide text-muted-foreground transition-colors hover:text-foreground uppercase"
              >
                ギャラリー
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="relative min-h-screen overflow-hidden">
        {/* 背景画像グリッド */}
        <div className="absolute inset-0 grid grid-cols-2 gap-0.5 sm:gap-1 md:grid-cols-3 md:gap-2 lg:grid-cols-4 lg:gap-3">
          {loading ? (
            // ローディング状態（後で専用コンポーネントを作成）
            Array.from({ length: imageCount }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse bg-zinc-200 dark:bg-zinc-800"
              />
            ))
          ) : (
            heroImages.map((imageUrl, index) => (
              <div
                key={`hero-${imageUrl}-${index}`}
                className="group relative aspect-square overflow-hidden transition-all duration-500 ease-out opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]"
                style={{
                  animationDelay: `${index * 30}ms`,
                }}
              >
                <Image
                  src={imageUrl}
                  alt={`Hero image ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  unoptimized
                  priority={index < 4}
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
            className="group relative inline-block overflow-hidden rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <span className="relative z-10">ギャラリーを見る</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
          </Link>
        </div>

        {/* メンバーグリッド */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member, index) => (
            <div
              key={member.id}
              data-member-id={member.id}
              onClick={() => setSelectedMember(member)}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-700 hover:shadow-xl ${
                visibleMembers.has(member.id)
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              {/* カード背景グラデーション */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* メンバー画像 */}
              <div className="relative h-96 w-full overflow-hidden bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900">
                {member.imageUrl ? (
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
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
              <div className="p-6">
                <div className="mb-3">
                  <h3 className="text-2xl font-bold text-card-foreground relative inline-block">
                    {member.name}
                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />
                  </h3>
                  {member.nameRomaji && (
                    <div className="mt-2">
                      <span className="text-sm text-muted-foreground">
                        {member.nameRomaji}
                      </span>
                    </div>
                  )}
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  {member.profile}
                </p>
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
      {selectedMember && (() => {
        const currentIndex = members.findIndex((m) => m.id === selectedMember.id);
        const prevMember = currentIndex > 0 ? members[currentIndex - 1] : members[members.length - 1];
        const nextMember = currentIndex < members.length - 1 ? members[currentIndex + 1] : members[0];
        
        return (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 前のメンバーボタン */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMember(prevMember);
              }}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-3 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
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
                setSelectedMember(nextMember);
              }}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-3 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
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
              onClick={() => setSelectedMember(null)}
              className="absolute left-4 top-4 z-10 rounded-full bg-background/80 p-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
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
              {selectedMember.imageUrl ? (
                <Image
                  src={selectedMember.imageUrl}
                  alt={selectedMember.name}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-4xl font-bold text-foreground/30">
                    {selectedMember.name.charAt(0)}
                  </div>
                </div>
              )}
            </div>

            {/* メンバー情報 */}
            <div className="p-8">
              <div className="mb-4">
                <h3 className="text-3xl font-bold text-card-foreground relative inline-block">
                  {selectedMember.name}
                  <span className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" />
                </h3>
                {selectedMember.nameRomaji && (
                  <div className="mt-3">
                    <span className="text-base font-medium text-muted-foreground">
                      {selectedMember.nameRomaji}
                    </span>
                  </div>
                )}
              </div>
              <p className="leading-relaxed text-muted-foreground">
                {selectedMember.profile}
              </p>
            </div>
          </div>
        </div>
        );
      })()}

      {/* トップに戻るボタン */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 group flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
          aria-label="トップに戻る"
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
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
