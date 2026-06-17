"use client";

// Dependencies
import { useState, useEffect } from 'react';
import { Star, GitFork, Scale, ExternalLink } from 'lucide-react';
import { GITHUB_USERNAME, LANGUAGE_COLORS } from '../constants';
import { cacheGet, cacheSet } from '../cache';

// Interfaces
interface Repo {
    id: number;
    name: string;
    html_url: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    fork: boolean;
    license: { spdx_id: string } | null;
    pushed_at: string;
}

/** Combined render state for this tab. */
interface TabState {
    repos: Repo[];
    loading: boolean;
    error: string | null;
}

interface Props {
    t: (key: string) => string;
}

const CACHE_KEY = 'github:repos';

/**
 * Returns a human-readable relative time string for an ISO 8601 timestamp.
 *
 * @param iso - ISO 8601 date string (e.g. from `pushed_at`)
 * @returns Relative string such as "3 days ago" or "today"
 */
function timeAgo(iso: string): string {
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
    if (days === 0)  return 'today';
    if (days === 1)  return '1 day ago';
    if (days < 30)   return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months === 1)  return '1 month ago';
    if (months < 12)   return `${months} months ago`;
    const years = Math.floor(days / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
}

/**
 * Repositories tab — sorted list of the user's public GitHub repos with
 * language dot, star/fork counts, license, fork badge, and last-push age.
 *
 * Results are fetched once per session and stored in the module-level cache
 * so switching away and back does not trigger additional API calls.
 *
 * @param t - Scoped translator bound to the github locale bundle
 */
export function RepositoriesTab({ t }: Props) {
    const [state, setState] = useState<TabState>(() => {
        const cached = cacheGet<Repo[]>(CACHE_KEY);
        return { repos: cached ?? [], loading: cached == null, error: null };
    });

    const { repos, loading, error } = state;

    useEffect(() => {
        // Cache hit — nothing to fetch
        if (!state.loading) return;

        let alive = true;

        fetch(`/api/github?type=repos&username=${GITHUB_USERNAME}`)
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then(d => {
                if (!alive) return;
                const data: Repo[] = Array.isArray(d.repos) ? d.repos : [];
                cacheSet(CACHE_KEY, data);
                setState({ repos: data, loading: false, error: null });
            })
            .catch(() => {
                if (!alive) return;
                setState(prev => ({ ...prev, loading: false, error: t('error') }));
            });

        return () => { alive = false; };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-40">
                <span className="text-xs text-on-surface/50 uppercase tracking-widest animate-pulse">{t('loading')}</span>
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
        <div className="space-y-5">
            {/* Header */}
            <div>
                <div className="text-xs text-on-surface/65 font-bold tracking-widest mb-1">{t('repos_entry')}</div>
                <h2 className="text-2xl text-on-primary-container uppercase tracking-wider font-extrabold border-b border-outline/40 pb-2">
                    {t('repos_title')}
                </h2>
                <div className="text-sm text-on-surface/65 mt-1 italic">{t('repos_subtitle')}</div>
            </div>

            {repos.length === 0 ? (
                <p className="text-xs text-on-surface/40 italic">{t('no_repos')}</p>
            ) : (
                <div className="space-y-2">
                    {repos.map(repo => (
                        <div
                            key={repo.id}
                            className="border border-outline/30 bg-surface-container-low p-3 hover:border-outline/60 transition-colors group"
                        >
                            {/* Name + external link */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <a
                                        href={repo.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-bold text-on-primary-container hover:underline truncate"
                                    >
                                        {repo.name}
                                    </a>
                                    {repo.fork && (
                                        <span className="flex items-center gap-0.5 text-[11px] text-on-surface/60 border border-outline/20 px-1 py-px shrink-0">
                                            <GitFork size={8} /> {t('label_forked')}
                                        </span>
                                    )}
                                </div>
                                <a
                                    href={repo.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                >
                                    <ExternalLink size={11} className="text-on-surface/40 hover:text-on-primary-container" />
                                </a>
                            </div>

                            {/* Description */}
                            {repo.description && (
                                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed line-clamp-2">
                                    {repo.description}
                                </p>
                            )}

                            {/* Meta row */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                                {repo.language && (
                                    <span className="flex items-center gap-1 text-xs text-on-surface/70">
                                        <span
                                            className="w-2 h-2 rounded-full inline-block"
                                            style={{ backgroundColor: LANGUAGE_COLORS[repo.language] ?? '#888' }}
                                        />
                                        {repo.language}
                                    </span>
                                )}
                                {repo.stargazers_count > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-on-surface/70">
                                        <Star size={9} /> {repo.stargazers_count}
                                    </span>
                                )}
                                {repo.forks_count > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-on-surface/70">
                                        <GitFork size={9} /> {repo.forks_count}
                                    </span>
                                )}
                                {repo.license && repo.license.spdx_id !== 'NOASSERTION' && (
                                    <span className="flex items-center gap-1 text-xs text-on-surface/70">
                                        <Scale size={9} /> {repo.license.spdx_id}
                                    </span>
                                )}
                                <span className="text-xs text-on-surface/55 ml-auto">
                                    {timeAgo(repo.pushed_at)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
