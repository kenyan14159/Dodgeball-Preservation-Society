"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface GlitchTextProps {
    text: string;
    className?: string;
    as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
    delay?: number;
    glitchIntensity?: "low" | "medium" | "high";
}

export default function GlitchText({
    text,
    className = "",
    as: Component = "span",
    delay = 0,
    glitchIntensity = "medium",
}: GlitchTextProps) {
    const [isGlitching, setIsGlitching] = useState(false);
    const [displayText, setDisplayText] = useState(text);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const glitchChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?ｱｲｳｴｵｶｷｸｹｺ";

    const intensityConfig = {
        low: { interval: 5000, duration: 150, probability: 0.3 },
        medium: { interval: 3000, duration: 200, probability: 0.5 },
        high: { interval: 1500, duration: 300, probability: 0.7 },
    };

    const config = intensityConfig[glitchIntensity];

    useEffect(() => {
        const startGlitch = () => {
            if (Math.random() > config.probability) return;

            setIsGlitching(true);

            // Scramble text
            const scrambled = text
                .split("")
                .map((char) =>
                    Math.random() > 0.7
                        ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
                        : char
                )
                .join("");

            setDisplayText(scrambled);

            // Reset after duration
            timeoutRef.current = setTimeout(() => {
                setDisplayText(text);
                setIsGlitching(false);
            }, config.duration);
        };

        // Initial delay
        const initialTimeout = setTimeout(() => {
            startGlitch();
            intervalRef.current = setInterval(startGlitch, config.interval);
        }, delay);

        return () => {
            clearTimeout(initialTimeout);
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [text, delay, config]);

    const MotionComponent = motion[Component];

    return (
        <MotionComponent
            className={`relative inline-block ${className}`}
            data-text={text}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay / 1000 }}
        >
            {/* Main text */}
            <span
                className={`relative z-10 ${isGlitching ? "animate-rgb-split" : ""}`}
            >
                {displayText}
            </span>

            {/* Glitch layers */}
            {isGlitching && (
                <>
                    <span
                        className="absolute inset-0 text-[var(--neon-cyan)] opacity-80"
                        style={{
                            transform: "translate(-2px, -1px)",
                            clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)",
                        }}
                        aria-hidden="true"
                    >
                        {displayText}
                    </span>
                    <span
                        className="absolute inset-0 text-[var(--neon-magenta)] opacity-80"
                        style={{
                            transform: "translate(2px, 1px)",
                            clipPath: "polygon(0 55%, 100% 55%, 100% 100%, 0 100%)",
                        }}
                        aria-hidden="true"
                    >
                        {displayText}
                    </span>
                </>
            )}
        </MotionComponent>
    );
}
