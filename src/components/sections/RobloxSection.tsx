"use client";

import { useEffect, useState } from 'react';
import { Play, Users, Eye, Building2, ExternalLink } from 'lucide-react';
import { useSectionLocale } from '../../lib/useSectionLocale';
import { GAMES, ROLE_LABELS, ROLE_STYLES, STUDIOS, SPOTLIGHT_USER_IDS, type Game } from '../../apps/roblox/constants';

type ProfileData = {
    username: string;
    displayName: string;
    hasVerifiedBadge: boolean;
    avatarUrl: string | null;
};

type GameStats = Record<string, { visits: number; playing: number; favorites: number; description: string }>;
type Thumbnails = Record<string, string>;

type SpotlightUser = {
    id: number;
    username: string;
    displayName: string;
    hasVerifiedBadge: boolean;
    avatarUrl: string | null;
};

// Module-level session cache — survives re-mounts, resets on full page reload.
let _profile: ProfileData | null = null;
let _stats: GameStats | null = null;
let _thumbs: Thumbnails | null = null;
let _visits: number | null = null;
let _spotlight: SpotlightUser[] | null = null;

/**
 * Formats a large integer into a compact human-readable string.
 * Examples: 1234567 → "1.2M", 89500 → "89.5K", 42 → "42".
 */
function fmt(n: number): string {
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return n.toLocaleString();
}

/**
 * Roblox section — profile header and a "Continue Playing" grid of games
 * contributed to by this account, with live player/visit counts.
 */
export default function RobloxSection() {
    const { t } = useSectionLocale('roblox');

    const [profile, setProfile] = useState<ProfileData | null>(_profile);
    const [stats, setStats] = useState<GameStats | null>(_stats);
    const [thumbs, setThumbs] = useState<Thumbnails | null>(_thumbs);
    const [visits, setVisits] = useState<number | null>(_visits);
    const [spotlight, setSpotlight] = useState<SpotlightUser[] | null>(_spotlight);
    const [loading, setLoading] = useState(!_profile || !_stats || !_thumbs);
    const [error, setError] = useState<string | null>(null);

    const uids = GAMES.map(g => g.universeID).join(',');

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
            if (p) { _profile = p; setProfile(p); }
            if (s?.data) { _stats = s.data; setStats(s.data); }
            if (th?.data) { _thumbs = th.data; setThumbs(th.data); }
            setLoading(false);
        }).catch(() => {
            if (!alive) return;
            setError(t('error'));
            setLoading(false);
        });

        return () => { alive = false; };
    }, []);

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

    useEffect(() => {
        if (_spotlight) return;
        let alive = true;

        fetch(`/api/roblox/users?userIds=${SPOTLIGHT_USER_IDS.join(',')}`)
            .then(r => r.ok ? r.json() : Promise.reject())
            .then((data: { data: SpotlightUser[] }) => {
                if (!alive) return;
                _spotlight = data.data;
                setSpotlight(data.data);
            })
            .catch(() => { /* spotlight is non-blocking; silently swallow errors */ });

        return () => { alive = false; };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-40">
                <span className="text-xs text-on-surface-variant uppercase tracking-widest animate-pulse">{t('loading')}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-40">
                <span className="text-xs text-red-400 uppercase">{error}</span>
            </div>
        );
    }

    return (
        <div>
            {/* Profile header */}
            <div className="glass-panel px-5 py-4 flex items-center gap-4 mb-6">
                <div className="w-14 h-14 shrink-0 overflow-hidden border border-outline/40">
                    {profile?.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" draggable={false} />
                    ) : (
                        <div className="w-full h-full bg-primary/10" />
                    )}
                </div>

                <div className="min-w-0">
                    <div className="text-[10px] text-on-surface-variant/70 uppercase tracking-widest mb-0.5">{t('greeting')},</div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xl font-extrabold text-on-surface leading-none truncate">
                            {profile?.username ?? 'Cheeteau'}
                        </span>
                        {profile?.hasVerifiedBadge && (
                            <img src="/verified.svg" alt="Verified" width={18} height={18} className="shrink-0" draggable={false} />
                        )}
                    </div>
                    {visits !== null && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-primary">
                            <Eye size={11} />
                            <span className="text-[11px] font-bold text-on-surface">{visits.toLocaleString()}</span>
                            <span className="text-[9px] text-on-surface-variant/70 uppercase tracking-wide">{t('label_contributed_visits')}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Continue Playing */}
            <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest whitespace-nowrap">{t('section_playing')}</span>
                <div className="flex-1 h-px bg-outline/20" />
                <span className="text-[9px] text-on-surface-variant/50 uppercase whitespace-nowrap">{GAMES.length} {t('games_count')}</span>
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
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

            {/* Studios I've worked for */}
            <div className="flex items-center gap-3 mb-3 mt-8">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest whitespace-nowrap">{t('section_studios')}</span>
                <div className="flex-1 h-px bg-outline/20" />
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                {STUDIOS.map(studio => (
                    <a
                        key={studio.name}
                        href={studio.href}
                        target="_blank"
                        rel="noreferrer"
                        className="glass-panel p-4 flex items-start gap-3 hover:border-primary/60 transition-colors group"
                    >
                        <div className="w-10 h-10 shrink-0 border border-outline/40 bg-primary/10 flex items-center justify-center">
                            <Building2 size={18} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors flex items-center gap-1.5">
                                {studio.name}
                                <ExternalLink size={10} className="text-on-surface-variant/50 shrink-0" />
                            </h3>
                            <p className="text-[10px] text-on-surface-variant leading-relaxed mt-1">{studio.description}</p>
                        </div>
                    </a>
                ))}
            </div>

            {/* Spotlight */}
            <div className="flex items-center gap-3 mb-3 mt-8">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest whitespace-nowrap">{t('section_spotlight')}</span>
                <div className="flex-1 h-px bg-outline/20" />
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
                {(spotlight ?? SPOTLIGHT_USER_IDS.map(id => ({ id, username: '', displayName: '', hasVerifiedBadge: false, avatarUrl: null }))).map(user => (
                    <a
                        key={user.id}
                        href={`https://www.roblox.com/users/${user.id}/profile`}
                        target="_blank"
                        rel="noreferrer"
                        className="glass-panel p-3 flex flex-col items-center gap-2 text-center hover:border-primary/60 transition-colors"
                    >
                        <div className="w-16 h-16 border border-outline/40 overflow-hidden shrink-0">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" draggable={false} />
                            ) : (
                                <div className="w-full h-full bg-primary/10 animate-pulse" />
                            )}
                        </div>
                        <div className="min-w-0 w-full">
                            <div className="flex items-center justify-center gap-1">
                                <span className="text-xs font-bold text-on-surface truncate">{user.displayName || ' '}</span>
                                {user.hasVerifiedBadge && (
                                    <img src="/verified.svg" alt="Verified" width={12} height={12} className="shrink-0" draggable={false} />
                                )}
                            </div>
                            <span className="text-[10px] text-on-surface-variant/60 truncate block">
                                {user.username ? `@${user.username}` : ' '}
                            </span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}

interface GameCardProps {
    game: Game;
    stats: { visits: number; playing: number } | null;
    thumb: string | null;
    playLabel: string;
    playingLabel: string;
    visitsLabel: string;
}

function GameCard({ game, stats, thumb, playLabel, playingLabel, visitsLabel }: GameCardProps) {
    const roleLabel = ROLE_LABELS[game.role];
    const roleStyle = ROLE_STYLES[game.role];

    return (
        <div className="glass-panel overflow-hidden flex flex-col group hover:border-primary/60 transition-colors">
            <div className="aspect-video bg-black/40 relative overflow-hidden shrink-0">
                {thumb ? (
                    <img src={thumb} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" draggable={false} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] text-on-surface-variant/50 uppercase tracking-widest">No Preview</div>
                )}
                <div className={`absolute top-1.5 right-1.5 text-[9px] font-bold px-2 py-0.5 uppercase tracking-wide leading-tight ${roleStyle}`}>
                    {roleLabel}
                </div>
            </div>

            <div className="px-3 py-2 flex items-center justify-between glass-chip border-t-0">
                {stats !== null ? (
                    <>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                            <Users size={12} className="text-primary shrink-0" />
                            {fmt(stats.playing)} <span className="text-on-surface-variant font-normal">{playingLabel}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                            <Eye size={12} className="text-primary shrink-0" />
                            {fmt(stats.visits)} <span className="text-on-surface-variant font-normal">{visitsLabel}</span>
                        </span>
                    </>
                ) : (
                    <div className="w-full h-4 bg-white/5 animate-pulse" />
                )}
            </div>

            <div className="p-3 flex flex-col gap-2 flex-1">
                <h3 className="text-xs font-bold text-on-surface leading-tight line-clamp-2 group-hover:text-primary transition-colors">{game.title}</h3>
                <p className="text-[10px] text-on-surface-variant leading-relaxed line-clamp-3">{game.description}</p>
                <a
                    href={game.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-auto flex items-center justify-center gap-1.5 bg-primary/90 hover:bg-primary text-white py-1.5 text-[10px] font-bold uppercase transition-colors"
                    draggable={false}
                >
                    <Play size={9} className="fill-current" /> {playLabel}
                </a>
            </div>
        </div>
    );
}
