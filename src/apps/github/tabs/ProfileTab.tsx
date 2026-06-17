"use client";

// Dependencies
import React, { useState, useEffect } from 'react';
import { MapPin, Building2, Link2 } from 'lucide-react';
import { GITHUB_USERNAME } from '../constants';
import { cacheGet, cacheSet } from '../cache';

// Interfaces
interface GitHubUser {
    login: string;
    name: string | null;
    bio: string | null;
    avatar_url: string;
    location: string | null;
    company: string | null;
    blog: string;
    followers: number;
    following: number;
    public_repos: number;
}

interface GitHubOrg {
    id: number;
    login: string;
    avatar_url: string;
}

interface ContributionDay {
    contributionCount: number;
    date: string;
}

interface ContributionWeek {
    contributionDays: ContributionDay[];
}

/** Unified shape stored in the session cache under `github:profile`. */
interface ProfileCacheEntry {
    profile: GitHubUser;
    orgs: GitHubOrg[];
    weeks: ContributionWeek[];
    total: number;
    hasToken: boolean;
    readme: string | null;
}

/** Combined render state for this tab. */
interface ProfileState {
    profile: GitHubUser | null;
    orgs: GitHubOrg[];
    weeks: ContributionWeek[];
    total: number;
    hasToken: boolean;
    readme: string | null;
    loading: boolean;
    error: string | null;
}

interface Props {
    t: (key: string) => string;
}

const CACHE_KEY = 'github:profile';

/**
 * Maps a raw contribution count to its GitHub-style dark-mode hex colour.
 *
 * @param count - Number of contributions on a given day
 * @returns Hex colour string
 */
function contribColor(count: number): string {
    if (count === 0) return '#ebedf0';
    if (count <= 3) return '#9be9a8';
    if (count <= 6) return '#40c463';
    if (count <= 9) return '#30a14e';
    return '#216e39';
}

/**
 * Converts a subset of inline Markdown syntax to React nodes.
 * Handles: `code`, **bold**, *italic*, ~~strikethrough~~, [link](url).
 *
 * @param text - Raw Markdown text for a single line
 * @returns Mixed array of strings and React elements
 */
function renderInline(text: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[([^\]]+)\]\(([^)]+)\)|~~[^~]+~~)/g;
    let last = 0;
    let key = 0;
    let m: RegExpExecArray | null;

    while ((m = pattern.exec(text)) !== null) {
        if (m.index > last) parts.push(text.slice(last, m.index));
        const s = m[0];
        if (s.startsWith('`')) parts.push(<code key={key++} className="bg-surface-container px-1 text-on-primary-container font-mono text-[10px]">{s.slice(1, -1)}</code>);
        else if (s.startsWith('**')) parts.push(<strong key={key++} className="text-on-surface font-bold">{s.slice(2, -2)}</strong>);
        else if (s.startsWith('~~')) parts.push(<del key={key++} className="opacity-40">{s.slice(2, -2)}</del>);
        else if (s.startsWith('*')) parts.push(<em key={key++} className="italic">{s.slice(1, -1)}</em>);
        else if (s.startsWith('[')) parts.push(<a key={key++} href={m[3]} target="_blank" rel="noopener noreferrer" className="text-[#39d353] hover:underline">{m[2]}</a>);
        last = m.index + s.length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts.length > 0 ? parts : text;
}

/**
 * Renders a GitHub-flavoured Markdown string as lightweight React elements.
 * Supports fenced code blocks, ATX headings (H1–H3), unordered lists,
 * horizontal rules, and inline formatting via `renderInline`.
 *
 * @param content - Raw Markdown string
 */
function SimpleMarkdown({ content }: { content: string }) {
    const lines = content.split('\n');
    const out: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Fenced code block
        if (line.trimStart().startsWith('```')) {
            const code: string[] = [];
            i++;
            while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
                code.push(lines[i]);
                i++;
            }
            out.push(
                <pre key={out.length} className="bg-surface-container border border-outline/20 p-3 text-[10px] text-on-surface overflow-x-auto my-2 font-mono">
                    <code>{code.join('\n')}</code>
                </pre>
            );
            i++;
            continue;
        }

        // Unordered list block — consume consecutive list items at once
        if (/^[-*+] /.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^[-*+] /.test(lines[i])) {
                items.push(lines[i].slice(2));
                i++;
            }
            out.push(
                <ul key={out.length} className="my-1 space-y-0.5">
                    {items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-on-surface-variant ml-2">
                            <span className="text-[#39d353] mt-0.5 shrink-0">•</span>
                            <span>{renderInline(item)}</span>
                        </li>
                    ))}
                </ul>
            );
            continue;
        }

        // ATX headings
        if (line.startsWith('### ')) out.push(<h3 key={out.length} className="text-xs font-bold text-on-primary-container mt-4 mb-1 uppercase tracking-wide">{renderInline(line.slice(4))}</h3>);
        else if (line.startsWith('## ')) out.push(<h2 key={out.length} className="text-sm font-bold text-on-primary-container mt-4 mb-2 border-b border-outline/20 pb-1">{renderInline(line.slice(3))}</h2>);
        else if (line.startsWith('# ')) out.push(<h1 key={out.length} className="text-base font-bold text-on-primary-container mt-4 mb-2 border-b border-outline/30 pb-1">{renderInline(line.slice(2))}</h1>);
        else if (/^---+$/.test(line.trim())) out.push(<hr key={out.length} className="border-outline/20 my-2" />);
        else if (line.trim() === '') out.push(<div key={out.length} className="h-2" />);
        else out.push(<p key={out.length} className="text-sm text-on-surface-variant leading-relaxed">{renderInline(line)}</p>);

        i++;
    }

    return <div className="space-y-0.5">{out}</div>;
}

/**
 * GitHub profile tab — avatar, bio, stats, organizations, contribution
 * calendar for the current year, and the user's profile README.
 *
 * Data is fetched once per session and stored in the module-level cache so
 * switching tabs does not trigger additional API calls.
 *
 * @param t - Scoped translator bound to the github locale bundle
 */
export function ProfileTab({ t }: Props) {
    const currentYear = new Date().getFullYear();

    const [state, setState] = useState<ProfileState>(() => {
        const cached = cacheGet<ProfileCacheEntry>(CACHE_KEY);
        if (cached) {
            return { ...cached, loading: false, error: null };
        }
        return { profile: null, orgs: [], weeks: [], total: 0, hasToken: false, readme: null, loading: true, error: null };
    });

    useEffect(() => {
        // Cache hit — nothing to fetch
        if (!state.loading) return;

        let alive = true;

        Promise.all([
            fetch(`/api/github?type=profile&username=${GITHUB_USERNAME}`).then(r => r.json()),
            fetch(`/api/github?type=contributions&username=${GITHUB_USERNAME}&year=${currentYear}`).then(r => r.json()),
            fetch(`/api/github?type=readme&username=${GITHUB_USERNAME}`).then(r => r.json()),
        ]).then(([pd, cd, rd]) => {
            if (!alive) return;

            const entry: ProfileCacheEntry = {
                profile: pd.profile ?? null,
                orgs: pd.orgs ?? [],
                weeks: cd.weeks ?? [],
                total: cd.total ?? 0,
                hasToken: cd.hasToken ?? false,
                readme: rd.readme ?? null,
            };

            cacheSet(CACHE_KEY, entry);
            setState({ ...entry, loading: false, error: null });
        }).catch(() => {
            if (!alive) return;
            setState(prev => ({ ...prev, loading: false, error: t('error') }));
        });

        return () => { alive = false; };
    }, []);

    const { profile, orgs, weeks, total, hasToken, readme, loading, error } = state;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-40">
                <span className="text-xs text-on-surface/50 uppercase tracking-widest animate-pulse">{t('loading')}</span>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex items-center justify-center h-40">
                <span className="text-xs text-red-400 uppercase">{error ?? t('error')}</span>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <div className="text-xs text-on-surface/65 font-bold tracking-widest mb-1">{t('profile_entry')}</div>
                <h2 className="text-2xl text-on-primary-container uppercase tracking-wider font-extrabold border-b border-outline/40 pb-2">
                    {t('profile_title')}
                </h2>
            </div>

            {/* Avatar + info */}
            <div className="flex items-start gap-4 flex-wrap">
                <div className="w-16 h-16 border border-outline/50 overflow-hidden shrink-0 shadow-[1px_1px_0_black]">
                    <img src={profile.avatar_url} alt={profile.login} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-extrabold text-on-surface uppercase tracking-wide">
                        {profile.name ?? profile.login}
                    </div>
                    <div className="text-xs text-on-surface/60 mb-1">@{profile.login}</div>
                    {profile.bio && (
                        <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs">{profile.bio}</p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                        {profile.location && (
                            <span className="flex items-center gap-1 text-xs text-on-surface/70">
                                <MapPin size={10} /> {profile.location}
                            </span>
                        )}
                        {profile.company && (
                            <span className="flex items-center gap-1 text-xs text-on-surface/70">
                                <Building2 size={10} /> {profile.company.replace(/^@/, '')}
                            </span>
                        )}
                        {profile.blog && (
                            <span className="flex items-center gap-1 text-xs text-on-surface/70">
                                <Link2 size={10} />
                                <a
                                    href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-on-primary-container"
                                >
                                    {profile.blog.replace(/^https?:\/\//, '')}
                                </a>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
                {([
                    [profile.public_repos, t('label_repos')],
                    [profile.followers, t('label_followers')],
                    [profile.following, t('label_following')],
                ] as [number, string][]).map(([val, label]) => (
                    <div key={label} className="border border-outline/30 bg-surface-container-low p-3 text-center">
                        <div className="text-lg font-extrabold text-on-primary-container">{val}</div>
                        <div className="text-[11px] text-on-surface/70 uppercase tracking-widest">{label}</div>
                    </div>
                ))}
            </div>

            {/* Organizations */}
            {orgs.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold text-on-surface/65 tracking-widest uppercase mb-2">
                        {t('label_orgs')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {orgs.map(org => (
                            <div key={org.id} className="flex items-center gap-1.5 border border-outline/30 bg-surface-container-low px-2 py-1.5">
                                <img src={org.avatar_url} alt={org.login} className="w-4 h-4 rounded-sm" />
                                <span className="text-xs text-on-surface-variant">{org.login}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Contribution calendar */}
            <div>
                <h3 className="text-xs font-bold text-on-surface/65 tracking-widest uppercase mb-2">
                    {t('label_contribs')} {currentYear}
                    {hasToken && total > 0 && (
                        <span className="ml-2 text-[#39d353] normal-case">— {total} {t('label_total')}</span>
                    )}
                </h3>

                {!hasToken ? (
                    <div className="border border-outline/20 bg-surface-container-low p-4 text-center">
                        <span className="text-xs text-on-surface/60 uppercase tracking-widest">{t('no_token')}</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto pb-1">
                        <div className="flex gap-0.75">
                            {weeks.map((week, wi) => (
                                <div key={wi} className="flex flex-col gap-0.75">
                                    {week.contributionDays.map((day, di) => (
                                        <div
                                            key={di}
                                            title={`${day.date}: ${day.contributionCount} contribution${day.contributionCount !== 1 ? 's' : ''}`}
                                            className="w-2.5 h-2.5 rounded-xs cursor-default"
                                            style={{ backgroundColor: contribColor(day.contributionCount) }}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                        {/* Legend */}
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-on-surface/60 select-none">
                            <span>Less</span>
                            {['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'].map(c => (
                                <div key={c} className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: c }} />
                            ))}
                            <span>More</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Profile README */}
            {readme ? (
                <div>
                    <h3 className="text-xs font-bold text-on-surface/65 tracking-widest uppercase mb-2">
                        {t('label_readme')}
                    </h3>
                    <div className="border border-outline/20 bg-surface-container-low p-4 max-h-72 overflow-y-auto scrollbar-custom">
                        <SimpleMarkdown content={readme} />
                    </div>
                </div>
            ) : (
                <div className="text-xs text-on-surface/50 italic">{t('no_readme')}</div>
            )}
        </div>
    );
}
