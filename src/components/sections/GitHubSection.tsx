"use client";

import { useState } from 'react';
import { User, BookOpen, Star, type LucideIcon } from 'lucide-react';
import { useSectionLocale } from '../../lib/useSectionLocale';
import { GITHUB_USERNAME } from '../../apps/github/constants';
import { ProfileTab } from '../../apps/github/tabs/ProfileTab';
import { RepositoriesTab } from '../../apps/github/tabs/RepositoriesTab';
import { StarsTab } from '../../apps/github/tabs/StarsTab';

type TabId = 'profile' | 'repos' | 'stars';

/**
 * GitHub section — profile, public repos, and starred repos, each loaded on
 * first access and cached for the session. Reuses the existing tab content
 * components as-is; only the surrounding chrome changed.
 */
export default function GitHubSection() {
    const [activeTab, setActiveTab] = useState<TabId>('profile');
    const { t } = useSectionLocale('github');

    const tabs: { id: TabId; Icon: LucideIcon; label: string }[] = [
        { id: 'profile', Icon: User, label: t('tab_profile') },
        { id: 'repos', Icon: BookOpen, label: t('tab_repos') },
        { id: 'stars', Icon: Star, label: t('tab_stars') },
    ];

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
                <div className="flex flex-wrap gap-2">
                    {tabs.map(({ id, Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors cursor-pointer ${
                                activeTab === id
                                    ? 'bg-primary text-white'
                                    : 'glass-chip text-on-surface-variant hover:text-on-surface'
                            }`}
                        >
                            <Icon size={12} />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
                <a
                    href={`https://github.com/${GITHUB_USERNAME}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-on-surface-variant hover:text-primary transition-colors"
                >
                    github.com/{GITHUB_USERNAME}
                </a>
            </div>

            {activeTab === 'profile' && <ProfileTab t={t} />}
            {activeTab === 'repos' && <RepositoriesTab t={t} />}
            {activeTab === 'stars' && <StarsTab t={t} />}
        </div>
    );
}
