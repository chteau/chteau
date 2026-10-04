"use client";

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import HeroOverlay from '../HeroOverlay';
import SectionPanel from '../SectionPanel';
import LanguageSwitcher from '../LanguageSwitcher';
import NavMenu from '../NavMenu';
import AddStarForm from '../AddStarForm';
import VisitorStarModal from '../VisitorStarModal';
import { hasStarDraft } from '../../lib/starDraft';
import type { SectionId } from './types';
import type { VisitorStar } from '../../lib/stars';

// The Three.js canvas touches `window`/`document` at module scope (texture
// generation, matchMedia) so it must never render during SSR.
const GalaxyScene = dynamic(() => import('./GalaxyScene'), { ssr: false });

const PANEL_REVEAL_DELAY_MS = 650;

/**
 * Orchestrates the galaxy experience: the 3D scene (which opens on its own
 * big-bang intro), the hero title (held back until that intro lands), the
 * language switcher, the nav menu (section selection, the blog, the Star
 * Explorer, and the "add a star" form — the feature stars themselves are
 * decorative), the section panel that appears once the camera has arrived
 * at the chosen star, and the visitor-star modal that appears the same way
 * when one is picked from the Star Explorer.
 */
export default function GalaxyExperience() {
    const [focusedId, setFocusedId] = useState<SectionId | null>(null);
    const [panelVisible, setPanelVisible] = useState(false);
    const [focusedStar, setFocusedStar] = useState<VisitorStar | null>(null);
    const [starModalVisible, setStarModalVisible] = useState(false);
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

    useEffect(() => {
        if (!focusedStar) {
            setStarModalVisible(false);
            return;
        }
        const timer = setTimeout(() => setStarModalVisible(true), PANEL_REVEAL_DELAY_MS);
        return () => clearTimeout(timer);
    }, [focusedStar]);

    // Reopens the form after a GitHub sign-in redirect left a draft behind (see AddStarForm/starDraft).
    useEffect(() => {
        if (hasStarDraft()) setAddStarOpen(true);
    }, []);

    const selectStar = useCallback((id: SectionId) => setFocusedId(id), []);
    const closePanel = useCallback(() => setFocusedId(null), []);
    const handleIntroComplete = useCallback(() => setIntroDone(true), []);

    // Picking a star from the Star Explorer closes that panel (so the camera flight is unobstructed)
    // and flies to the star instead; closing the resulting modal returns to the overview.
    const focusStar = useCallback((star: VisitorStar) => {
        setFocusedId(null);
        setFocusedStar(star);
    }, []);
    const closeStarModal = useCallback(() => setFocusedStar(null), []);

    return (
        <div className="w-screen h-screen relative overflow-hidden bg-black select-none" id="galaxy-root">
            <GalaxyScene
                focusedId={focusedId}
                focusedStarId={focusedStar?.id ?? null}
                onClearStarFocus={closeStarModal}
                onIntroComplete={handleIntroComplete}
            />
            <HeroOverlay visible={introDone && !focusedId && !focusedStar} />
            <LanguageSwitcher />
            <NavMenu visible={introDone} onSelect={selectStar} onAddStar={() => setAddStarOpen(true)} />
            {panelVisible && focusedId && <SectionPanel sectionId={focusedId} onClose={closePanel} onFocusStar={focusStar} />}
            {starModalVisible && focusedStar && <VisitorStarModal star={focusedStar} onClose={closeStarModal} />}
            {addStarOpen && <AddStarForm onClose={() => setAddStarOpen(false)} />}
        </div>
    );
}
