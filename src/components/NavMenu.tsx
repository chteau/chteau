"use client";

import { FolderOpen, Github, Gamepad2, User, Mail, Newspaper, Sparkles, Telescope, type LucideIcon } from 'lucide-react';
import { useCHTEAUSDK } from '../sdk/CHTEAUSDK';
import type { SectionId } from './galaxy/types';

const NAV_ITEMS: { id: SectionId; Icon: LucideIcon }[] = [
    { id: 'projects', Icon: FolderOpen },
    { id: 'github', Icon: Github },
    { id: 'roblox', Icon: Gamepad2 },
    { id: 'bio', Icon: User },
    { id: 'contact', Icon: Mail },
    { id: 'blog', Icon: Newspaper },
];

const ITEM_CLASS =
    'flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide whitespace-nowrap text-on-surface-variant hover:text-white hover:bg-white/10 transition-colors cursor-pointer';

/**
 * Discreet bottom-center navigation — the feature stars in the galaxy are
 * purely decorative, so this is how sections actually get opened. Every
 * item (including Blog) just opens its `SectionPanel`, same as the others.
 * "Star Explorer" (browse/find visitor stars) and "Add a Star" sit after
 * the divider as the two visitor-star actions, open vs. contribute.
 */
export default function NavMenu({
    visible,
    onSelect,
    onAddStar,
}: {
    visible: boolean;
    onSelect: (id: SectionId) => void;
    onAddStar: () => void;
}) {
    const sdk = useCHTEAUSDK();

    return (
        <nav
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-40 glass-chip flex items-center gap-1 p-1.5 transition-opacity duration-500 ${
                visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            id="section-nav-menu"
        >
            {NAV_ITEMS.map(({ id, Icon }) => (
                <button key={id} onClick={() => onSelect(id)} className={ITEM_CLASS} id={`nav-btn-${id}`}>
                    <Icon size={13} />
                    <span className="hidden sm:inline">{sdk.t(`star_${id}`)}</span>
                </button>
            ))}

            <div className="w-px h-5 bg-white/15 mx-1" />

            <button onClick={() => onSelect('stars')} className={ITEM_CLASS} id="nav-btn-stars">
                <Telescope size={13} />
                <span className="hidden sm:inline">{sdk.t('star_stars')}</span>
            </button>

            <button onClick={onAddStar} className={ITEM_CLASS} id="nav-btn-add-star">
                <Sparkles size={13} />
                <span className="hidden sm:inline">{sdk.t('nav_add_star')}</span>
            </button>
        </nav>
    );
}
