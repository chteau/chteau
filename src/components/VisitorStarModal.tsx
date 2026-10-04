"use client";

import { Telescope, X } from 'lucide-react';
import { useCHTEAUSDK } from '../sdk/CHTEAUSDK';
import type { VisitorStar } from '../lib/stars';

/**
 * The full-detail view of a visitor star, opened from the Star Explorer
 * panel (as opposed to the small in-canvas popover shown on a direct
 * hover/click in 3D) — same glass-panel chrome as `SectionPanel`, sized
 * like `AddStarForm` since it's a single message, not a whole section.
 */
export default function VisitorStarModal({ star, onClose }: { star: VisitorStar; onClose: () => void }) {
    const sdk = useCHTEAUSDK();

    return (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in" id="visitor-star-modal-overlay">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} id="visitor-star-modal-backdrop" />

            <div className="glass-panel relative w-full sm:max-w-md flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-outline/20 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <Telescope size={18} className="text-primary" />
                        <span className="text-sm font-bold uppercase tracking-wider text-on-surface">{sdk.t('star_stars')}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 glass-chip flex items-center justify-center text-on-surface-variant hover:text-white hover:border-primary/60 transition-colors cursor-pointer"
                        title={sdk.t('panel_close')}
                        id="visitor-star-modal-close"
                    >
                        <X size={15} />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                        {star.avatarUrl && (
                            <div className="relative shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={star.avatarUrl} alt="" width={48} height={48} />
                                {star.verified && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src="/verified.svg"
                                        alt="Verified"
                                        width={16}
                                        height={16}
                                        className="absolute -bottom-1 -right-1"
                                    />
                                )}
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-on-surface leading-relaxed">{star.message}</p>
                            <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-wide mt-1.5">
                                {new Date(star.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {(star.githubUrl || star.robloxUrl) && (
                        <div className="flex gap-4 pt-3 border-t border-outline/15">
                            {star.githubUrl && (
                                <a
                                    href={star.githubUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-bold uppercase tracking-wide text-primary hover:underline"
                                >
                                    GitHub
                                </a>
                            )}
                            {star.robloxUrl && (
                                <a
                                    href={star.robloxUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-bold uppercase tracking-wide text-primary hover:underline"
                                >
                                    Roblox
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
