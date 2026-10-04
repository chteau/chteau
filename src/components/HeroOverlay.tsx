"use client";

import { useCHTEAUSDK } from '../sdk/CHTEAUSDK';

/**
 * Centered hero wordmark shown over the galaxy overview — purely
 * decorative now that the feature stars aren't interactive themselves
 * (navigation lives in `NavMenu`). Each line sits on a sharp-edged, dark
 * translucent pane (no border radius, no backdrop-filter dependency — just
 * a flat tint, cheap everywhere) that keeps the text legible no matter how
 * bright the nebula gets behind it. Fades/lifts in each time it (re)appears.
 */
export default function HeroOverlay({ visible }: { visible: boolean }) {
    const sdk = useCHTEAUSDK();

    return (
        <div
            className={`absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-6 transition-opacity duration-500 ${
                visible ? 'opacity-100' : 'opacity-0'
            }`}
        >
            <style>{`
                @keyframes hero-fade-up {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div
                className="bg-black/55 px-8 py-4"
                style={{ animation: visible ? 'hero-fade-up 0.7s ease-out both' : 'none' }}
            >
                <h1
                    className="font-display text-4xl sm:text-6xl font-medium text-white"
                    style={{ letterSpacing: '0.04em' }}
                >
                    {sdk.t('welcome_title')}
                </h1>
            </div>

            <div
                className="mt-4 bg-black/55 px-5 py-2"
                style={{ animation: visible ? 'hero-fade-up 0.7s ease-out 0.15s both' : 'none' }}
            >
                <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-[0.25em]">
                    {sdk.t('welcome_subtitle')}
                </p>
            </div>
        </div>
    );
}
