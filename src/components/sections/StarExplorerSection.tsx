"use client";

import { useEffect, useState } from 'react';
import { Telescope } from 'lucide-react';
import { useCHTEAUSDK } from '../../sdk/CHTEAUSDK';
import type { VisitorStar } from '../../lib/stars';

/**
 * Every visitor-submitted star as a browsable grid — the stars themselves
 * are tiny and scattered across the galaxy, so this is how you actually
 * find one (including your own after submitting it). Picking a card hands
 * the star up to `GalaxyExperience` via `onFocusStar`, which flies the
 * camera to it and opens `VisitorStarModal`.
 */
export default function StarExplorerSection({ onFocusStar }: { onFocusStar: (star: VisitorStar) => void }) {
    const sdk = useCHTEAUSDK();
    const [stars, setStars] = useState<VisitorStar[] | null>(null);

    useEffect(() => {
        fetch('/api/stars', { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((data) => setStars(Array.isArray(data.stars) ? data.stars : []))
            .catch(() => setStars([]));
    }, []);

    if (stars === null) {
        return (
            <div className="flex items-center justify-center h-40">
                <span className="text-xs text-on-surface-variant uppercase tracking-widest animate-pulse">…</span>
            </div>
        );
    }

    if (stars.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Telescope size={40} className="text-on-surface-variant" />
                    <p className="text-sm text-on-surface-variant">{sdk.t('stars_explorer_empty')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {stars.map((star) => (
                <button
                    key={star.id}
                    onClick={() => onFocusStar(star)}
                    className="glass-panel text-left p-4 flex items-start gap-3 hover:border-primary/60 transition-colors cursor-pointer"
                    id={`star-explorer-card-${star.id}`}
                >
                    <div className="relative shrink-0">
                        {star.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={star.avatarUrl} alt="" width={40} height={40} />
                        ) : (
                            <div className="w-10 h-10" style={{ backgroundColor: star.color }} />
                        )}
                        {star.verified && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src="/verified.svg"
                                alt="Verified"
                                width={14}
                                height={14}
                                className="absolute -bottom-1 -right-1"
                            />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm text-on-surface-variant leading-snug line-clamp-3">{star.message}</p>
                        <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-wide mt-1.5">
                            {new Date(star.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </button>
            ))}
        </div>
    );
}
