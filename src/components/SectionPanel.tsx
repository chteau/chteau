"use client";

import { useEffect } from 'react';
import { ArrowLeft, FolderOpen, Gamepad2, Github, Mail, Newspaper, Telescope, User, X, type LucideIcon } from 'lucide-react';
import { useCHTEAUSDK } from '../sdk/CHTEAUSDK';
import type { SectionId } from './galaxy/types';
import type { VisitorStar } from '../lib/stars';
import ProjectsSection from './sections/ProjectsSection';
import GitHubSection from './sections/GitHubSection';
import RobloxSection from './sections/RobloxSection';
import BioSection from './sections/BioSection';
import BlogSection from './sections/BlogSection';
import StarExplorerSection from './sections/StarExplorerSection';

const SECTION_ICON: Record<SectionId, LucideIcon> = {
    projects: FolderOpen,
    github: Github,
    roblox: Gamepad2,
    bio: User,
    contact: Mail,
    blog: Newspaper,
    stars: Telescope,
};

/**
 * Glassmorphic content panel shown once the camera has arrived at a focused
 * feature star. Renders the matching section component and closes back to
 * the galaxy overview via its button or the Escape key.
 *
 * @param onFocusStar - Only used by the `stars` section: hands a picked visitor star up to `GalaxyExperience`,
 *                      which flies the camera to it and opens `VisitorStarModal`.
 */
export default function SectionPanel({
    sectionId,
    onClose,
    onFocusStar,
}: {
    sectionId: SectionId;
    onClose: () => void;
    onFocusStar: (star: VisitorStar) => void;
}) {
    const sdk = useCHTEAUSDK();
    const Icon = SECTION_ICON[sectionId];

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in" id="section-panel-overlay">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                id="section-panel-backdrop"
            />

            <div className="glass-panel relative w-full sm:max-w-6xl h-[88vh] sm:h-[85vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-outline/20 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer sm:hidden"
                        id="section-panel-back"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-xs uppercase font-bold tracking-wide">{sdk.t('panel_back')}</span>
                    </button>

                    <div className="hidden sm:flex items-center gap-2.5">
                        <Icon size={18} className="text-primary" />
                        <span className="text-sm font-bold uppercase tracking-wider text-on-surface">
                            {sdk.t(`star_${sectionId}`)}
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-8 h-8 glass-chip flex items-center justify-center text-on-surface-variant hover:text-white hover:border-primary/60 transition-colors cursor-pointer"
                        title={sdk.t('panel_close')}
                        id="section-panel-close"
                    >
                        <X size={15} />
                    </button>
                </div>

                <div className="grow overflow-y-auto scrollbar-custom p-5">
                    {sectionId === 'projects' && <ProjectsSection />}
                    {sectionId === 'github' && <GitHubSection />}
                    {sectionId === 'roblox' && <RobloxSection />}
                    {(sectionId === 'bio' || sectionId === 'contact') && (
                        <BioSection initialTab={sectionId === 'contact' ? 'contact' : 'origin'} />
                    )}
                    {sectionId === 'blog' && <BlogSection />}
                    {sectionId === 'stars' && <StarExplorerSection onFocusStar={onFocusStar} />}
                </div>
            </div>
        </div>
    );
}
