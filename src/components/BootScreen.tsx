"use client";

// Dependencies
import { useState, useEffect } from 'react';

/**
 * Configuration interface for the BootScreen splash component.
 */
interface BootScreenProps {
    onDone: () => void;
}

/**
 * Renders a Windows XP-style boot splash screen that animates on first load, then fades out.
 * The OS desktop mounts underneath during the animation and is revealed on completion.
 *
 * @example
 * <BootScreen onDone={() => setIsBooting(false)} />
 *
 * @param props - Callback triggered after the fade-out transition ends
 * @returns Full-screen animated boot overlay
 */
export default function BootScreen({ onDone }: BootScreenProps) {
    const [fading, setFading] = useState(false);

    useEffect(() => {
        const fadeTimer = setTimeout(() => setFading(true), 2200);
        return () => clearTimeout(fadeTimer);
    }, []);

    return (
        <>
            <style>{`
                @keyframes boot-block {
                    0%   { transform: translateX(-30px); opacity: 0; }
                    20%  { opacity: 1; }
                    80%  { opacity: 1; }
                    100% { transform: translateX(170px); opacity: 0; }
                }
                .boot-block { animation: boot-block 1.6s infinite linear; }
            `}</style>

            <div
                onTransitionEnd={fading ? onDone : undefined}
                className={`fixed inset-0 z-99999 flex flex-col items-center justify-center bg-black text-white transition-opacity duration-600 ease-in-out ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
            >
                {/* Windows flag logo + title */}
                <div className="flex flex-col items-center mb-7.5">
                    <div
                        className="text-4xl font-light tracking-[-1px] text-[#f0f0f0]"
                        style={{ textShadow: '0 0 14px rgba(255,255,255,0.2)' }}
                    >
                        Cht<b className="font-semibold text-white">eau</b> OS
                    </div>
                    <div className="mt-1.25 text-[11px] text-[#bbb] tracking-[0.5px]">
                        Full-Stack Developer Edition
                    </div>
                </div>

                {/* Loading bar */}
                <div className="w-40 h-4 border border-[#3a3a3a] bg-[#111] p-0.5 overflow-hidden flex gap-0.5">
                    <div
                        className="boot-block w-10 h-full"
                        style={{
                            background: 'linear-gradient(to bottom, #5b9bd5, #2e7ac4)',
                        }}
                    />
                </div>

                {/* Copyright */}
                <div className="absolute bottom-10 text-[10px] text-[#777] text-center leading-[1.7]">
                    <b className="text-[#999]">Cheeteau · Full-Stack Developer Portfolio</b>
                </div>
            </div>
        </>
    );
}
