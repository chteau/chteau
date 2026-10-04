"use client";

import { ExternalLink, GitBranch, Tag } from 'lucide-react';
import { useSectionLocale } from '../../lib/useSectionLocale';
import { PROJECTS, resolveAppUrl, type Project } from '../../apps/explorer/projects';

/**
 * Projects section — a responsive card grid over `PROJECTS`. Each card shows
 * the thumbnail, title, description, tags, and links to the live demo and
 * GitHub repository when available.
 */
export default function ProjectsSection() {
    const { t } = useSectionLocale('explorer');

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {PROJECTS.map(project => (
                <ProjectCard key={project.id} project={project} openLabel={t('explorer_open_app')} githubLabel={t('explorer_open_github')} />
            ))}
        </div>
    );
}

function ProjectCard({ project, openLabel, githubLabel }: { project: Project; openLabel: string; githubLabel: string }) {
    const appUrl = resolveAppUrl(project);

    return (
        <div className="glass-panel overflow-hidden flex flex-col hover:border-primary/60 transition-colors group">
            <div className="aspect-video bg-black/40 relative overflow-hidden shrink-0">
                {project.thumbnail ? (
                    <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-on-surface-variant/50 uppercase tracking-widest">
                        No Preview
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="p-4 flex flex-col gap-2.5 flex-1">
                <h3 className="text-sm font-bold text-on-surface tracking-wide group-hover:text-primary transition-colors">
                    {project.title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                    {project.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                    {project.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 text-[9px] uppercase tracking-wide px-2 py-0.5 glass-chip text-on-surface-variant">
                            <Tag size={8} /> {tag}
                        </span>
                    ))}
                </div>

                <div className="flex gap-2 pt-2">
                    {appUrl && (
                        <a
                            href={appUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 bg-primary/90 hover:bg-primary text-white py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors"
                        >
                            <ExternalLink size={11} /> {openLabel}
                        </a>
                    )}
                    {project.githubUrl && (
                        <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 glass-chip hover:border-primary/60 text-on-surface py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors"
                        >
                            <GitBranch size={11} /> {githubLabel}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
