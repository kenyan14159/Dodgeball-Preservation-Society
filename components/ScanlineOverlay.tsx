"use client";

import { useEffect, useState } from "react";

interface ScanlineOverlayProps {
    opacity?: number;
    showNoise?: boolean;
}

export default function ScanlineOverlay({
    opacity = 0.03,
    showNoise = true,
}: ScanlineOverlayProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <>
            {/* Scanline effect */}
            <div
                className="fixed inset-0 pointer-events-none z-[9997]"
                style={{
                    background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, ${opacity * 3}) 2px,
            rgba(0, 0, 0, ${opacity * 3}) 4px
          )`,
                }}
                aria-hidden="true"
            />

            {/* Moving scanline */}
            <div
                className="fixed left-0 right-0 h-[2px] pointer-events-none z-[9998]"
                style={{
                    background: "linear-gradient(90deg, transparent, var(--neon-cyan), transparent)",
                    opacity: opacity * 5,
                    animation: "scanline 8s linear infinite",
                }}
                aria-hidden="true"
            />

            {/* Noise overlay */}
            {showNoise && (
                <div
                    className="fixed inset-0 pointer-events-none z-[9996]"
                    style={{
                        opacity: opacity,
                        animation: "noise-flicker 0.5s infinite",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                    aria-hidden="true"
                />
            )}

            {/* Vignette effect */}
            <div
                className="fixed inset-0 pointer-events-none z-[9995]"
                style={{
                    background: "radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(0,0,0,0.4) 100%)",
                }}
                aria-hidden="true"
            />
        </>
    );
}
