"use client";

// Dependencies
import { useState, useEffect, useMemo } from 'react';
import { MapPin, Building2, Link2 } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
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

// GitHub profile READMEs commonly wrap images/badges in raw HTML (`<div
// align="center">`, `<img>`, `<br/>`...). `marked` parses that alongside the
// Markdown; this hook then forces every link it produces to open safely in
// a new tab. Registered once at module scope.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
    }
});

/**
 * Parses a GitHub-flavoured Markdown README (which may embed raw HTML) and
 * sanitizes the result before it's ever handed to `dangerouslySetInnerHTML`,
 * since this content comes from an external API response, not our own code.
 *
 * @param content - Raw Markdown/HTML README content
 * @returns Sanitized HTML safe to inject
 */
function renderReadmeHtml(content: string): string {
    const rawHtml = marked.parse(content, { async: false, gfm: true, breaks: true }) as string;
    return DOMPurify.sanitize(rawHtml, {
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'form'],
    });
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

        const safeJson = (r: Response) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        };

        Promise.all([
            fetch(`/api/github?type=profile&username=${GITHUB_USERNAME}`).then(safeJson),
            fetch(`/api/github?type=contributions&username=${GITHUB_USERNAME}&year=${currentYear}`).then(safeJson),
            fetch(`/api/github?type=readme&username=${GITHUB_USERNAME}`).then(safeJson),
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
    const readmeHtml = useMemo(() => (readme ? renderReadmeHtml(readme) : ''), [readme]);

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

            {/* Profile README — parsed Markdown/HTML, sanitized before injection since it comes from the GitHub API */}
            {readme ? (
                <div>
                    <h3 className="text-xs font-bold text-on-surface/65 tracking-widest uppercase mb-2">
                        {t('label_readme')}
                    </h3>
                    <div
                        className="border border-outline/20 bg-surface-container-low p-4 max-h-72 overflow-y-auto scrollbar-custom text-sm text-on-surface-variant leading-relaxed [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-on-primary-container [&_h1]:border-b [&_h1]:border-outline/30 [&_h1]:pb-1 [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-on-primary-container [&_h2]:border-b [&_h2]:border-outline/20 [&_h2]:pb-1 [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-on-primary-container [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:mt-4 [&_h3]:mb-1 [&_p]:my-2 [&_a]:text-[#39d353] [&_a]:hover:underline [&_strong]:text-on-surface [&_strong]:font-bold [&_code]:bg-surface-container [&_code]:px-1 [&_code]:text-on-primary-container [&_code]:font-mono [&_code]:text-[10px] [&_pre]:bg-surface-container [&_pre]:border [&_pre]:border-outline/20 [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:my-2 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_li]:my-0.5 [&_hr]:border-outline/20 [&_hr]:my-3 [&_img]:max-w-full [&_img]:inline-block [&_blockquote]:border-l-2 [&_blockquote]:border-outline/30 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:opacity-80 [&_del]:opacity-40 [&_table]:w-full [&_table]:text-xs [&_th]:border [&_th]:border-outline/20 [&_th]:p-1 [&_td]:border [&_td]:border-outline/20 [&_td]:p-1"
                        dangerouslySetInnerHTML={{ __html: readmeHtml }}
                    />
                </div>
            ) : (
                <div className="text-xs text-on-surface/50 italic">{t('no_readme')}</div>
            )}
        </div>
    );
}
