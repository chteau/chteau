"use client";

import { useState } from 'react';
import { User, BookOpen, Star } from 'lucide-react';
import { defineApp } from '../../runtime/defineApp';
import type { TabId } from './constants';
import { GITHUB_USERNAME } from './constants';
import { ProfileTab }      from './tabs/ProfileTab';
import { RepositoriesTab } from './tabs/RepositoriesTab';
import { StarsTab }        from './tabs/StarsTab';

/**
 * GitHub viewer app — three-tab interface exposing the profile page,
 * public repository list, and starred repository list for the configured
 * GitHub account. Mirrors the Notepad app structure: menu bar → sidebar
 * tab strip → scrollable content area → status bar.
 *
 * All data fetching is delegated to the individual tab components so each
 * tab only loads its data on first access and caches it for the session.
 */
export default defineApp(({ runtime }) => {
    const { t } = runtime;
    const [activeTab, setActiveTab] = useState<TabId>('profile');

    const tabs: { id: TabId; Icon: React.ElementType; label: string }[] = [
        { id: 'profile', Icon: User,     label: t('tab_profile') },
        { id: 'repos',   Icon: BookOpen, label: t('tab_repos')   },
        { id: 'stars',   Icon: Star,     label: t('tab_stars')   },
    ];

    /** Human-readable status bar label derived from the active tab. */
    const statusLabel = {
        profile: 'USER PROFILE',
        repos:   'PUBLIC REPOS',
        stars:   'STARRED REPOS',
    }[activeTab];

    return (
        <div className="flex flex-col h-full bg-white text-on-surface font-mono select-text" id="app-github">
            {/* Menu bar */}
            <div className="bg-surface-container border-b border-outline/40 px-2 py-1 flex items-center gap-4 text-xs select-none">
                {['Profile', 'View', 'Help'].map(item => (
                    <span key={item} className="cursor-pointer hover:text-on-surface/60 transition-colors text-xs uppercase">
                        {item}
                    </span>
                ))}
            </div>

            <div className="grow flex flex-col md:flex-row overflow-hidden">
                {/* Sidebar */}
                <div className="w-full md:w-44 md:shrink-0 bg-surface-container-low md:border-r border-b md:border-b-0 border-outline/30 flex md:flex-col select-none">
                    {tabs.map(({ id, Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-2 p-3 text-left border-r md:border-r-0 md:border-b border-outline/20 text-xs transition-colors uppercase cursor-pointer ${
                                activeTab === id
                                    ? 'bg-primary-container text-white border-l-2 border-l-primary font-bold'
                                    : 'text-on-surface/70 hover:bg-surface-container-high hover:text-on-surface'
                            }`}
                        >
                            <Icon size={14} className={activeTab === id ? 'text-white' : ''} />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="grow p-5 overflow-y-auto scrollbar-custom bg-white flex flex-col justify-between">
                    <div>
                        {activeTab === 'profile' && <ProfileTab      t={t} />}
                        {activeTab === 'repos'   && <RepositoriesTab t={t} />}
                        {activeTab === 'stars'   && <StarsTab        t={t} />}
                    </div>

                    <div className="mt-8 text-[11px] text-on-surface/50 uppercase text-right border-t border-outline/10 pt-2">
                        CHTEAU_GITHUB_VIEWER // API: GITHUB.COM
                    </div>
                </div>
            </div>

            {/* Status bar */}
            <div className="bg-surface-container-high border-t border-outline/30 p-1 px-3 text-xs flex justify-between uppercase select-none text-on-surface-variant">
                <span>{statusLabel}</span>
                <span>github.com/{GITHUB_USERNAME}</span>
            </div>
        </div>
    );
});
