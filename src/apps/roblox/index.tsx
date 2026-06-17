"use client";

import { useState, useEffect } from 'react';
import { Play, Users, Eye } from 'lucide-react';
import { defineApp } from '../../runtime/defineApp';
import { GAMES, ROBLOX_USER_ID, ROLE_LABELS, ROLE_STYLES, type Game } from './constants';

// Types

type ProfileData = {
    username: string;
    displayName: string;
    hasVerifiedBadge: boolean;
    avatarUrl: string | null;
};

type GameStats = Record<string, { visits: number; playing: number; favorites: number; description: string }>;
type Thumbnails = Record<string, string>;

// Module-level session cache — survives tab switches, resets on full page reload.
let _profile: ProfileData | null = null;
let _stats: GameStats | null = null;
let _thumbs: Thumbnails | null = null;
let _visits: number | null = null;

/**
 * Formats a large integer into a compact human-readable string.
 * Examples: 1234567 → "1.2M", 89500 → "89.5K", 42 → "42".
 *
 * @param n - Non-negative integer to format
 */
function fmt(n: number): string {
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return n.toLocaleString();
}

/**
 * Roblox viewer app.
 *
 * Displays the authenticated user's profile (avatar, username, verified badge)
 * and a curated "Continue Playing" grid of Roblox games contributed to by this
 * account. Each game card shows the live thumbnail, real-time player / visit
 * counts fetched from the Roblox API, the contributor role, a short description,
 * and a direct Play link.
 *
 * All three API calls (`/api/roblox/profile`, `/api/roblox/games`,
 * `/api/roblox/thumbnails`) are fired in parallel on first render and stored in
 * module-level session cache so re-opening the window is instant.
 */
export default defineApp(({ runtime }) => {
    const { t } = runtime;

    const [profile, setProfile] = useState<ProfileData | null>(_profile);
    const [stats, setStats] = useState<GameStats | null>(_stats);
    const [thumbs, setThumbs] = useState<Thumbnails | null>(_thumbs);
    const [visits, setVisits] = useState<number | null>(_visits);
    const [loading, setLoading] = useState(!_profile || !_stats || !_thumbs);
    const [error, setError] = useState<string | null>(null);

    const uids = GAMES.map(g => g.universeID).join(',');

    // Main data — profile, game stats, thumbnails loaded together.
    useEffect(() => {
        if (_profile && _stats && _thumbs) return;
        let alive = true;

        Promise.all([
            _profile ? Promise.resolve(null) : fetch('/api/roblox/profile').then(r => {
                if (!r.ok) throw new Error('profile');
                return r.json();
            }),
            _stats ? Promise.resolve(null) : fetch(`/api/roblox/games?universeIds=${uids}`).then(r => {
                if (!r.ok) throw new Error('games');
                return r.json();
            }),
            _thumbs ? Promise.resolve(null) : fetch(`/api/roblox/thumbnails?universeIds=${uids}`).then(r => {
                if (!r.ok) throw new Error('thumbnails');
                return r.json();
            }),
        ]).then(([p, s, th]) => {
            if (!alive) return;
            if (p)        { _profile = p;      setProfile(p); }
            if (s?.data)  { _stats   = s.data; setStats(s.data); }
            if (th?.data) { _thumbs  = th.data; setThumbs(th.data); }
            setLoading(false);
        }).catch(() => {
            if (!alive) return;
            setError(t('error'));
            setLoading(false);
        });

        return () => { alive = false; };
    }, []);

    // Contributed visits — fetched independently so the game grid shows immediately
    // even if this aggregation call takes longer on first load (cache miss).
    useEffect(() => {
        if (_visits !== null) return;
        let alive = true;

        fetch('/api/roblox/visits')
            .then(r => r.ok ? r.json() : Promise.reject())
            .then((data: { totalContributedVisits: number }) => {
                if (!alive) return;
                _visits = data.totalContributedVisits;
                setVisits(data.totalContributedVisits);
            })
            .catch(() => { /* visits are non-blocking; silently swallow errors */ });

        return () => { alive = false; };
    }, []);

    return (
        <div className="flex flex-col h-full bg-white text-on-surface font-mono" id="app-roblox">

            {/* Menu bar */}
            <div className="bg-surface-container border-b border-outline/40 px-2 py-1 flex items-center gap-4 text-xs select-none shrink-0">
                {['Profile', 'Games', 'Help'].map(item => (
                    <span key={item} className="cursor-pointer hover:text-on-surface/60 transition-colors uppercase">
                        {item}
                    </span>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-custom min-h-0">
                {loading ? (
                    <SkeletonLoader />
                ) : error ? (
                    <div className="p-6 text-xs text-red-500 uppercase tracking-widest">{error}</div>
                ) : (
                    <>
                        {/* Profile header */}
                        <div className="bg-white border-b border-outline/20 px-5 py-4 flex items-center gap-4 select-text shrink-0">
                            <div className="w-14 h-14 shrink-0 border-2 border-outline/50 overflow-hidden bg-surface-container shadow-[2px_2px_0_rgba(0,0,0,0.18)]">
                                {profile?.avatarUrl ? (
                                    <img
                                        src={profile.avatarUrl}
                                        alt={profile.username}
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-primary/10" />
                                )}
                            </div>

                            <div className="min-w-0">
                                <div className="text-[10px] text-on-surface/50 uppercase tracking-widest mb-0.5">
                                    {t('greeting')},
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[22px] font-extrabold text-on-surface leading-none truncate">
                                        {profile?.username ?? 'Cheeteau'}
                                    </span>
                                    {profile?.hasVerifiedBadge && (
                                        <img
                                            src="/verified.svg"
                                            alt="Verified"
                                            width={20}
                                            height={20}
                                            className="shrink-0 mt-0.5"
                                            draggable={false}
                                        />
                                    )}
                                </div>
                                <div className="text-[9px] text-on-surface/35 uppercase tracking-wide mt-1">
                                    UID: {ROBLOX_USER_ID} // ROBLOX.COM
                                </div>
                                <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-outline/15">
                                    <Eye size={11} className="text-primary shrink-0" />
                                    {visits !== null ? (
                                        <>
                                            <span className="text-[11px] font-bold text-on-surface">
                                                {visits.toLocaleString()}
                                            </span>
                                            <span className="text-[9px] text-on-surface/50 uppercase tracking-wide">
                                                {t('label_contributed_visits')}
                                            </span>
                                        </>
                                    ) : (
                                        <div className="h-2.5 w-40 bg-surface-container-high animate-pulse rounded-none" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Continue Playing */}
                        <div className="p-4 bg-surface-container-low">
                            <div className="flex items-center gap-3 mb-3 select-none">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest whitespace-nowrap">
                                    {t('section_playing')}
                                </span>
                                <div className="flex-1 h-px bg-outline/20" />
                                <span className="text-[9px] text-on-surface/40 uppercase whitespace-nowrap">
                                    {GAMES.length} {t('games_count')}
                                </span>
                            </div>

                            {/* Cards capped at 200px wide so they never balloon on large windows */}
                            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                                {GAMES.map(game => (
                                    <GameCard
                                        key={game.universeID}
                                        game={game}
                                        stats={stats?.[game.universeID.toString()] ?? null}
                                        thumb={thumbs?.[game.universeID.toString()] ?? null}
                                        playLabel={t('btn_play')}
                                        playingLabel={t('label_playing')}
                                        visitsLabel={t('label_visits')}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Status bar */}
            <div className="bg-surface-container-high border-t border-outline/30 p-1 px-3 text-xs flex justify-between uppercase select-none text-on-surface-variant shrink-0">
                <span>{t('status_label')}</span>
                <span>roblox.com/{profile?.username ?? 'Cheeteau'}</span>
            </div>
        </div>
    );
});


// Sub-components

interface GameCardProps {
    game: Game;
    stats: { visits: number; playing: number } | null;
    thumb: string | null;
    playLabel: string;
    playingLabel: string;
    visitsLabel: string;
}

/**
 * Single game card inside the "Continue Playing" grid.
 *
 * Renders the game thumbnail with a role badge overlay, a stats strip showing
 * current player count and total visits, the game title, a short description,
 * and a Play button that opens the Roblox game page in a new tab.
 *
 * @param game          - Static game metadata from the constants file
 * @param stats         - Live stats from the API; null while loading or on error
 * @param thumb         - Thumbnail URL from the API; null while loading or on error
 * @param playLabel     - Localised "Play" button label
 * @param playingLabel  - Localised label for the active player count
 * @param visitsLabel   - Localised label for the visit count
 */
function GameCard({ game, stats, thumb, playLabel, playingLabel, visitsLabel }: GameCardProps) {
    const roleLabel = ROLE_LABELS[game.role];
    const roleStyle = ROLE_STYLES[game.role];

    return (
        <div className="group border border-outline/30 bg-white hover:border-primary transition-all duration-150 flex flex-col overflow-hidden shadow-[2px_2px_0_rgba(0,0,0,0.06)] hover:shadow-[2px_2px_0_rgba(0,84,227,0.15)]">

            {/* Thumbnail */}
            <div className="aspect-video bg-surface-container-high relative overflow-hidden shrink-0">
                {thumb ? (
                    <img
                        src={thumb}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300 pointer-events-none"
                        draggable={false}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[9px] text-on-surface/25 uppercase tracking-widest select-none">No Preview</span>
                    </div>
                )}

                {/* Role badge */}
                <div className={`absolute top-1.5 right-1.5 text-[9px] font-bold px-2 py-0.5 uppercase tracking-wide leading-tight ${roleStyle}`}>
                    {roleLabel}
                </div>
            </div>

            {/* Stats strip — separated from thumbnail so text is always readable */}
            <div className="bg-surface-container-high border-b border-outline/20 px-3 py-1.5 flex items-center justify-between shrink-0">
                {stats !== null ? (
                    <>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface/80">
                            <Users size={13} className="text-primary shrink-0" />
                            <span>{fmt(stats.playing)}</span>
                            <span className="text-on-surface/45 font-normal">{playingLabel}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface/80">
                            <Eye size={13} className="text-primary shrink-0" />
                            <span>{fmt(stats.visits)}</span>
                            <span className="text-on-surface/45 font-normal">{visitsLabel}</span>
                        </span>
                    </>
                ) : (
                    <div className="w-full h-4 bg-surface-container animate-pulse" />
                )}
            </div>

            {/* Card body */}
            <div className="p-3 flex flex-col flex-1 min-h-0 gap-2">
                <h3 className="text-xs font-bold text-on-surface leading-tight line-clamp-2 group-hover:text-primary transition-colors select-text">
                    {game.title}
                </h3>

                <p className="text-[10px] text-on-surface/55 leading-relaxed line-clamp-3 select-text">
                    {game.description}
                </p>

                <a
                    href={game.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-auto flex items-center justify-center gap-1.5 bg-primary-container text-white py-1.5 text-[10px] font-bold uppercase hover:bg-primary transition-colors cursor-pointer border border-transparent select-none"
                    draggable={false}
                >
                    <Play size={9} className="shrink-0 fill-current" />
                    <span>{playLabel}</span>
                </a>
            </div>
        </div>
    );
}

/**
 * Full-screen skeleton shown while profile, stats, and thumbnails are loading.
 * Mirrors the real layout so the page doesn't shift on data arrival.
 */
function SkeletonLoader() {
    return (
        <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="bg-white border-b border-outline/20 px-5 py-4 flex items-center gap-4">
                <div className="w-14 h-14 bg-surface-container-high border border-outline/30 shrink-0" />
                <div className="space-y-2">
                    <div className="h-2 w-10 bg-surface-container-high" />
                    <div className="h-6 w-36 bg-surface-container-high" />
                    <div className="h-2 w-24 bg-surface-container-high" />
                </div>
            </div>

            {/* Grid skeleton */}
            <div className="p-4 bg-surface-container-low">
                <div className="h-2.5 w-32 bg-surface-container-high mb-4" />
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="border border-outline/20 flex flex-col">
                            <div className="aspect-video bg-surface-container-high" />
                            <div className="h-7 bg-surface-container border-b border-outline/20" />
                            <div className="p-2 space-y-1.5">
                                <div className="h-2.5 bg-surface-container-high" />
                                <div className="h-2 w-3/4 bg-surface-container-high" />
                                <div className="h-2 w-1/2 bg-surface-container-high" />
                                <div className="h-5 bg-surface-container-high mt-2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
