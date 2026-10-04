"use client";

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import HeroOverlay from '../HeroOverlay';
import SectionPanel from '../SectionPanel';
import LanguageSwitcher from '../LanguageSwitcher';
import NavMenu from '../NavMenu';
import AddStarForm from '../AddStarForm';
import { hasStarDraft } from '../../lib/starDraft';
import type { SectionId } from './types';

// The Three.js canvas touches `window`/`document` at module scope (texture
// generation, matchMedia) so it must never render during SSR.
const GalaxyScene = dynamic(() => import('./GalaxyScene'), { ssr: false });

const PANEL_REVEAL_DELAY_MS = 650;

/**
 * Orchestrates the galaxy experience: the 3D scene (which opens on its own
 * big-bang intro), the hero title (held back until that intro lands), the
 * language switcher, the nav menu (section selection, the blog, and the
 * "add a star" form — the feature stars themselves are decorative), and
 * the section panel that appears once the camera has arrived at the
 * chosen star.
 */
export default function GalaxyExperience() {
    const [focusedId, setFocusedId] = useState<SectionId | null>(null);
    const [panelVisible, setPanelVisible] = useState(false);
    const [introDone, setIntroDone] = useState(false);
    const [addStarOpen, setAddStarOpen] = useState(false);

    useEffect(() => {
        if (!focusedId) {
            setPanelVisible(false);
            return;
        }
        const timer = setTimeout(() => setPanelVisible(true), PANEL_REVEAL_DELAY_MS);
        return () => clearTimeout(timer);
    }, [focusedId]);

    // Reopens the form after a GitHub sign-in redirect left a draft behind (see AddStarForm/starDraft).
    useEffect(() => {
        if (hasStarDraft()) setAddStarOpen(true);
    }, []);

    const selectStar = useCallback((id: SectionId) => setFocusedId(id), []);
    const closePanel = useCallback(() => setFocusedId(null), []);
    const handleIntroComplete = useCallback(() => setIntroDone(true), []);

    return (
        <div className="w-screen h-screen relative overflow-hidden bg-black select-none" id="galaxy-root">
            <GalaxyScene focusedId={focusedId} onIntroComplete={handleIntroComplete} />
            <HeroOverlay visible={introDone && !focusedId} />
            <LanguageSwitcher />
            <NavMenu visible={introDone} onSelect={selectStar} onAddStar={() => setAddStarOpen(true)} />
            {panelVisible && focusedId && <SectionPanel sectionId={focusedId} onClose={closePanel} />}
            {addStarOpen && <AddStarForm onClose={() => setAddStarOpen(false)} />}
        </div>
    );
}
