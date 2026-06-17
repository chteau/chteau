"use client";

import { useState, useRef, useEffect } from 'react';
import { Tag, FolderOpen, ExternalLink, GitBranch } from 'lucide-react';
import { defineApp } from '../../runtime/defineApp';
import { PROJECTS, resolveAppUrl, type Project } from './projects';

/**
 * Projects explorer app.
 *
 * Renders a three-panel file-explorer layout:
 * - **Left sidebar** — tag filters derived from `PROJECTS`.
 * - **Center panel** — switches automatically between card grid (wide) and
 *   compact list rows (narrow) via a `ResizeObserver` on the panel itself.
 * - **Right inspector** — details and links for the currently selected project.
 *
 * All visible strings are resolved through the scoped runtime translator so
 * the UI respects the OS language setting (en / fr / br).
 */
export default defineApp(({ runtime }) => {
    const { t } = runtime;
    const [selectedId, setSelectedId] = useState<string>(PROJECTS[0]?.id ?? '');
    const [currentTag, setCurrentTag] = useState<string | null>(null);
    const [isListView, setIsListView] = useState(false);
    const centerRef = useRef<HTMLDivElement>(null);

    /** Switch to list view when the center panel is too narrow for cards. */
    useEffect(() => {
        const el = centerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            setIsListView(entry.contentRect.width < 380);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const allTags = Array.from(new Set(PROJECTS.flatMap(p => p.tags)));

    const filtered = currentTag
        ? PROJECTS.filter(p => p.tags.includes(currentTag))
        : PROJECTS;

    const selected = PROJECTS.find(p => p.id === selectedId) ?? PROJECTS[0] ?? null;

    return (
        <div className="flex flex-col h-full bg-white text-on-surface font-mono overflow-hidden" id="app-explorer">

            {/* Menu bar + path */}
            <div className="bg-surface-container border-b border-outline/30 px-2 py-1.5 flex items-center justify-between text-[11px] select-none text-on-surface-variant shrink-0">
                <div className="flex items-center gap-4">
                    {['File', 'Edit', 'View', 'Tools', 'Help'].map(item => (
                        <span key={item} className="cursor-pointer hover:text-primary transition-colors uppercase">{item}</span>
                    ))}
                </div>
                <div className="text-[10px] bg-surface-container border border-outline/40 px-2 py-0.5 tracking-tight flex items-center gap-1">
                    <FolderOpen size={10} className="text-primary-container" />
                    <span>{t('explorer_path_label')}</span>
                </div>
            </div>

            {/* Main layout */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">

                {/* Left sidebar — tag filters */}
                <div className="w-full lg:w-44 bg-surface-container-low lg:border-r border-b lg:border-b-0 border-outline/30 p-3 select-none flex lg:flex-col gap-3 shrink-0 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto">
                    <div className="space-y-1 lg:w-full shrink-0">
                        <div className="text-[9px] text-primary uppercase font-bold tracking-wider mb-1 lg:block hidden">
                            {t('explorer_tags_label')}
                        </div>
                        <button
                            onClick={() => setCurrentTag(null)}
                            className={`w-full text-left text-xs px-2 py-1 flex items-center justify-between hover:bg-surface-container hover:text-primary transition-colors cursor-pointer ${currentTag === null ? 'bg-primary-container text-white border border-outline' : 'text-on-surface/70'}`}
                        >
                            <span>{t('explorer_all_projects')}</span>
                            <span className="text-[9px] opacity-60">({PROJECTS.length})</span>
                        </button>

                        {allTags.map(tag => {
                            const count = PROJECTS.filter(p => p.tags.includes(tag)).length;
                            return (
                                <button
                                    key={tag}
                                    onClick={() => setCurrentTag(tag)}
                                    className={`w-full text-left text-xs px-2 py-1 flex items-center justify-between hover:bg-surface-container hover:text-primary transition-colors cursor-pointer ${currentTag === tag ? 'bg-primary-container text-white border border-outline' : 'text-on-surface/70'}`}
                                >
                                    <span className="flex items-center gap-1">
                                        <Tag size={10} />
                                        {tag}
                                    </span>
                                    <span className="text-[10px] opacity-65">({count})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Center — grid or list depending on available width */}
                <div ref={centerRef} className="flex-1 overflow-y-auto scrollbar-custom bg-white min-h-0">
                    {isListView ? (
                        <div className="flex flex-col divide-y divide-outline/20">
                            {filtered.map(project => (
                                <ProjectRow
                                    key={project.id}
                                    project={project}
                                    isSelected={selected?.id === project.id}
                                    onSelect={() => setSelectedId(project.id)}
                                    openLabel={t('explorer_open_app')}
                                    githubLabel={t('explorer_open_github')}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filtered.map(project => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    isSelected={selected?.id === project.id}
                                    onSelect={() => setSelectedId(project.id)}
                                    openLabel={t('explorer_open_app')}
                                    githubLabel={t('explorer_open_github')}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right — inspector panel */}
                {selected && (
                    <Inspector
                        project={selected}
                        openLabel={t('explorer_open_app')}
                        githubLabel={t('explorer_open_github')}
                        inspectorLabel={t('explorer_inspector_label')}
                    />
                )}
            </div>

            {/* Footer */}
            <div className="bg-surface-container-high border-t border-outline/30 p-1 px-3 text-[10px] flex justify-between uppercase select-none text-on-surface-variant shrink-0">
                <span>{filtered.length} {filtered.length === 1 ? 'project' : 'projects'}</span>
                <span>INDEX // {t('explorer_footer_vault')}</span>
            </div>
        </div>
    );
});

/* Sub-components */
/** Shared props for both card and row project renderers. */
interface ProjectItemProps {
    project: Project;
    isSelected: boolean;
    onSelect: () => void;
    openLabel: string;
    githubLabel: string;
}

/**
 * Compact list row rendered when the center panel is narrow (< 380 px).
 * Mimics the Windows Explorer "List" view: small thumbnail, title, tag pills,
 * and inline action buttons — all on a single horizontal line.
 *
 * @param project - Project data to render.
 * @param isSelected - Whether this row is currently active in the inspector.
 * @param onSelect - Callback fired when the row body is clicked.
 * @param openLabel - Localised label for the "Open App" button.
 * @param githubLabel - Localised label for the "GitHub" button.
 */
function ProjectRow({ project, isSelected, onSelect, openLabel, githubLabel }: ProjectItemProps) {
    const appUrl = resolveAppUrl(project);

    return (
        <div
            onClick={onSelect}
            className={`group flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-surface-container transition-colors ${isSelected ? 'bg-primary-container/10 border border-primary' : 'border border-transparent'}`}
        >

            {/* Title */}
            <span className="flex-1 text-[11px] font-bold truncate group-hover:text-primary transition-colors">
                {project.title}
            </span>

            {/* Action buttons */}
            <div className="flex gap-1 shrink-0 ml-1" onClick={e => e.stopPropagation()}>
                {appUrl && (
                    <a
                        href={appUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-0.5 bg-primary-container text-white px-1.5 py-0.5 text-[8px] font-bold uppercase border border-outline hover:bg-primary transition-colors"
                    >
                        <ExternalLink size={8} />
                        <span>{openLabel}</span>
                    </a>
                )}
                {project.githubUrl && (
                    <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-0.5 bg-surface-container text-on-surface px-1.5 py-0.5 text-[8px] font-bold uppercase border border-outline/50 hover:border-primary hover:text-primary transition-colors"
                    >
                        <GitBranch size={8} />
                        <span>{githubLabel}</span>
                    </a>
                )}
            </div>
        </div>
    );
}

/**
 * Project card rendered in the center grid (default wide view).
 *
 * Displays the project thumbnail (or a placeholder), its title, and action
 * buttons for opening the live app and the GitHub repository. Clicking the
 * card body (outside the buttons) selects the project in the inspector.
 *
 * @param project - Project data to render.
 * @param isSelected - Whether this card is currently active in the inspector.
 * @param onSelect - Callback fired when the card body is clicked.
 * @param openLabel - Localised label for the "Open App" button.
 * @param githubLabel - Localised label for the "GitHub" button.
 */
function ProjectCard({ project, isSelected, onSelect, openLabel, githubLabel }: ProjectItemProps) {
    const appUrl = resolveAppUrl(project);

    return (
        <div
            onClick={onSelect}
            className={`group cursor-pointer border p-1 rounded-none hover:border-primary transition-all duration-200 flex flex-col ${isSelected ? 'border-primary bg-primary-container/10 shadow-[0_0_8px_rgba(215,0,21,0.25)]' : 'border-outline/30'}`}
        >
            {/* Thumbnail */}
            <div className="aspect-video border border-outline/40 bg-surface-container-high mb-2 overflow-hidden relative">
                {project.thumbnail ? (
                    <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300 pointer-events-none"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] text-on-surface-variant/40 uppercase tracking-widest bg-surface-container-high select-none">
                        No Preview
                    </div>
                )}
                <div className="absolute inset-x-0 bottom-0 py-0.5 px-1 bg-black/80 border-t border-outline/20 text-[8px] flex items-center justify-between">
                    <span className="text-[8px] text-primary/80">APP</span>
                    <span className="text-[8px] text-green-500 font-bold">LIVE</span>
                </div>
            </div>

            {/* Title */}
            <p className="text-[10px] font-bold truncate text-center group-hover:text-primary transition-colors leading-tight px-1 mb-2">
                {project.title}
            </p>

            {/* Action buttons — stopPropagation prevents card selection when clicking links */}
            <div className="flex gap-1 mt-auto px-0.5 pb-0.5" onClick={e => e.stopPropagation()}>
                {appUrl && (
                    <a
                        href={appUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-0.5 bg-primary-container text-white py-0.5 text-[8px] font-bold uppercase border border-outline hover:bg-primary transition-colors cursor-pointer"
                    >
                        <ExternalLink size={8} />
                        <span>{openLabel}</span>
                    </a>
                )}
                {project.githubUrl && (
                    <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-0.5 bg-surface-container text-on-surface py-0.5 text-[8px] font-bold uppercase border border-outline/50 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                    >
                        <GitBranch size={8} />
                        <span>{githubLabel}</span>
                    </a>
                )}
            </div>
        </div>
    );
}

/**
 * Right-hand inspector panel showing full details for the selected project.
 *
 * Renders the thumbnail preview, title, description, tag pills, a metadata
 * block (live URL and GitHub URL when present), and full-width action buttons.
 *
 * @param project - The currently selected project to inspect.
 * @param openLabel - Localised label for the "Open App" button.
 * @param githubLabel - Localised label for the "GitHub" button.
 * @param inspectorLabel - Localised panel header string.
 */
function Inspector({
    project,
    openLabel,
    githubLabel,
    inspectorLabel,
}: {
    project: Project;
    openLabel: string;
    githubLabel: string;
    inspectorLabel: string;
}) {
    const appUrl = resolveAppUrl(project);

    return (
        <div className="w-full lg:w-80 bg-surface-container lg:border-l border-t lg:border-t-0 border-outline/40 p-4 select-text flex flex-col shrink-0 overflow-y-auto max-h-75 lg:max-h-none">
            <div className="space-y-4 text-left flex-1">
                <div className="flex items-center justify-between border-b border-primary-container/40 pb-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-primary">{inspectorLabel}</div>
                </div>

                {/* Thumbnail preview */}
                <div className="aspect-video border-2 border-outline bg-surface-container-high relative overflow-hidden shadow-[3px_3px_0_rgba(0,0,0,0.4)]">
                    {project.thumbnail ? (
                        <>
                            <img
                                src={project.thumbnail}
                                alt={project.title}
                                className="w-full h-full object-cover brightness-90"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-on-surface-variant/40 uppercase tracking-widest">
                            No Preview
                        </div>
                    )}
                </div>

                {/* Title + description */}
                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-primary tracking-wider border-b border-outline/25 pb-1">
                        {project.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                        {project.description}
                    </p>
                </div>

                {/* Tags */}
                <div className="space-y-1.5 flex flex-col">
                    <span className="text-[9.5px] uppercase font-bold text-primary-container">Attributes:</span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {project.tags.map((tag, i) => (
                            <span
                                key={i}
                                className="text-[9px] border border-outline/30 px-2 py-0.5 bg-surface-container text-on-surface-variant hover:border-primary transition-colors"
                            >
                                #{tag.toUpperCase()}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Meta */}
                <div className="text-[9px] text-on-surface-variant leading-normal space-y-1 bg-surface-container p-2 border border-outline/30">
                    {appUrl && <div className="truncate">URL : {appUrl}</div>}
                    {project.githubUrl && <div className="truncate">GIT : {project.githubUrl}</div>}
                    <div>ID  : {project.id}</div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 border-t border-outline/20 pt-3 flex flex-col gap-2">
                {appUrl && (
                    <a
                        href={appUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-center flex items-center justify-center gap-2 bg-primary-container text-white py-1.5 text-xs font-bold uppercase border border-outline hover:bg-primary transition-colors cursor-pointer"
                    >
                        <ExternalLink size={11} />
                        <span>{openLabel}</span>
                    </a>
                )}
                {project.githubUrl && (
                    <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-center flex items-center justify-center gap-2 bg-surface-container text-on-surface py-1.5 text-xs font-bold uppercase border border-outline/50 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                    >
                        <GitBranch size={11} />
                        <span>{githubLabel}</span>
                    </a>
                )}
            </div>
        </div>
    );
}
