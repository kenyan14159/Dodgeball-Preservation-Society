"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface CustomCursorProps {
    className?: string;
}

export default function CustomCursor({ className = "" }: CustomCursorProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [hoverText, setHoverText] = useState<string | null>(null);
    const [isPointerDevice, setIsPointerDevice] = useState(true);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 400 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        // Check if device has fine pointer (mouse)
        const mediaQuery = window.matchMedia("(pointer: fine)");
        setIsPointerDevice(mediaQuery.matches);

        if (!mediaQuery.matches) return;

        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            setIsVisible(true);
        };

        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

        // Handle hoverable elements
        const handleElementMouseEnter = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const hoverableParent = target.closest(
                'a, button, [role="button"], [data-cursor-hover]'
            );

            if (hoverableParent) {
                setIsHovering(true);
                const text = hoverableParent.getAttribute("data-cursor-text");
                setHoverText(text);
            }
        };

        const handleElementMouseLeave = () => {
            setIsHovering(false);
            setHoverText(null);
        };

        window.addEventListener("mousemove", moveCursor);
        document.addEventListener("mouseenter", handleMouseEnter);
        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("mouseover", handleElementMouseEnter);
        document.addEventListener("mouseout", handleElementMouseLeave);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            document.removeEventListener("mouseenter", handleMouseEnter);
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("mouseover", handleElementMouseEnter);
            document.removeEventListener("mouseout", handleElementMouseLeave);
        };
    }, [cursorX, cursorY]);

    if (!isPointerDevice) return null;

    return (
        <>
            {/* Main cursor circle */}
            <motion.div
                className={`fixed top-0 left-0 pointer-events-none z-[10000] mix-blend-difference ${className}`}
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                }}
            >
                <motion.div
                    className="relative flex items-center justify-center"
                    animate={{
                        width: isHovering ? 80 : 40,
                        height: isHovering ? 80 : 40,
                        x: isHovering ? -40 : -20,
                        y: isHovering ? -40 : -20,
                    }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                >
                    {/* Outer ring */}
                    <motion.div
                        className="absolute inset-0 rounded-full border-2"
                        style={{
                            borderColor: isHovering ? "var(--neon-cyan)" : "white",
                        }}
                        animate={{
                            scale: isVisible ? 1 : 0,
                            opacity: isVisible ? 1 : 0,
                        }}
                        transition={{ duration: 0.15 }}
                    />

                    {/* Inner dot */}
                    <motion.div
                        className="absolute rounded-full bg-white"
                        animate={{
                            width: isHovering ? 4 : 6,
                            height: isHovering ? 4 : 6,
                            opacity: isVisible ? 1 : 0,
                        }}
                        transition={{ duration: 0.15 }}
                    />

                    {/* Hover text */}
                    {hoverText && (
                        <motion.span
                            className="absolute text-xs font-bold uppercase tracking-widest text-white whitespace-nowrap"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            {hoverText}
                        </motion.span>
                    )}
                </motion.div>
            </motion.div>

            {/* Trailing effect */}
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999] opacity-50"
                style={{
                    x: cursorX,
                    y: cursorY,
                    backgroundColor: "var(--neon-magenta)",
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    opacity: isVisible ? 0.5 : 0,
                }}
            />
        </>
    );
}
