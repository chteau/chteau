"use client";

import { useEffect, useState } from 'react';
import { Music2, Disc3 } from 'lucide-react';
import { defineWidget } from '../../runtime/defineWidget';

interface SpotifyTrack {
    name: string;
    artist: string;
    album: string;
    albumArt: string | null;
    duration: number;
    progress: number;
    url: string;
}

interface NowPlayingData {
    isPlaying: boolean;
    track?: SpotifyTrack;
    error?: string;
}

function formatMs(ms: number): string {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

export default defineWidget(() => {
    const [data, setData] = useState<NowPlayingData | null>(null);
    const [liveProgress, setLiveProgress] = useState(0);

    const fetchNowPlaying = async () => {
        try {
            const res = await fetch('/api/spotify');
            const json: NowPlayingData = await res.json();
            setData(json);
            if (json.track) setLiveProgress(json.track.progress);
        } catch {
            setData({ isPlaying: false, error: 'Connection failed' });
        }
    };

    // Poll every 8 seconds
    useEffect(() => {
        fetchNowPlaying();
        const interval = setInterval(fetchNowPlaying, 8_000);
        return () => clearInterval(interval);
    }, []);

    // Advance progress bar locally each second when playing
    useEffect(() => {
        if (!data?.isPlaying || !data.track) return;
        const tick = setInterval(() => {
            setLiveProgress(p => Math.min(p + 1000, data.track!.duration));
        }, 1000);
        return () => clearInterval(tick);
    }, [data?.isPlaying, data?.track?.name]);

    // Initial loading state
    if (!data) {
        return (
            <div className="flex items-center justify-center h-full bg-surface-container-low">
                <Disc3
                    size={22}
                    className="text-on-surface-variant/50 animate-spin"
                    style={{ animationDuration: '3s' }}
                />
            </div>
        );
    }

    // Nothing playing / idle
    if (!data.isPlaying || !data.track) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-2 bg-surface-container-low">
                <Music2 size={18} className="text-on-surface-variant/50" />
                <span className="text-[8px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                    {data.error ? 'Unavailable' : 'Nothing playing'}
                </span>
            </div>
        );
    }

    const { track } = data;
    const progressPct = Math.min((liveProgress / track.duration) * 100, 100);

    return (
        <div className="flex flex-col h-full bg-surface-container-low">
            {/* Main row: album art + track info */}
            <div className="flex items-center gap-3 px-3 pt-2.5 pb-2 flex-1 min-h-0">
                {/* Album art */}
                <div className="relative shrink-0">
                    {track.albumArt ? (
                        <img
                            src={track.albumArt}
                            alt={track.album}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover border border-outline/30 shadow-[1px_1px_0_black]"
                        />
                    ) : (
                        <div className="w-16 h-16 border border-outline/30 bg-surface-container flex items-center justify-center shadow-[1px_1px_0_black]">
                            <Music2 size={24} className="text-on-surface-variant/20" />
                        </div>
                    )}
                    {/* Pulsing green "now playing" dot */}
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1DB954] opacity-60" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1DB954] border border-black" />
                    </span>
                </div>

                {/* Track metadata */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <a
                        href={track.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] font-bold text-on-surface truncate hover:text-primary transition-colors leading-tight"
                        title={track.name}
                    >
                        {track.name}
                    </a>
                    <span
                        className="text-[11px] text-on-surface-variant truncate leading-tight"
                        title={track.artist}
                    >
                        {track.artist}
                    </span>
                    <span
                        className="text-[10px] text-on-surface-variant/70 truncate leading-tight"
                        title={track.album}
                    >
                        {track.album}
                    </span>
                    {/* Spotify branding */}
                    <div className="flex items-center gap-1 mt-0.5">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-[#1DB954] shrink-0" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                        <span className="text-[9px] text-on-surface-variant/60 uppercase tracking-wider">
                            Spotify
                        </span>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="px-3 pb-2.5 shrink-0">
                <div className="w-full h-0.5 bg-outline/15 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#1DB954] transition-all duration-1000 ease-linear"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-on-surface-variant/70">
                        {formatMs(liveProgress)}
                    </span>
                    <span className="text-[9px] text-on-surface-variant/70">
                        {formatMs(track.duration)}
                    </span>
                </div>
            </div>
        </div>
    );
});
