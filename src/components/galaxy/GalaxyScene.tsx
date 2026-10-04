"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import GalaxyNebula from './GalaxyNebula';
import BackgroundStars from './BackgroundStars';
import FeatureStar from './FeatureStar';
import FieldGalaxies, { FADE_OUT_DURATION_S } from './FieldGalaxies';
import VisitorStars from './VisitorStars';
import BangFlare from './BangFlare';
import CameraRig from './CameraRig';
import Effects from './Effects';
import { INTRO_START_POS, ORBIT_START_POS, INTRO_DOLLY_END_S } from './introTiming';
import { SECTION_STARS } from './sectionStars';
import type { SectionId } from './types';

/** Our own galaxy condensing out of the bang — grows from a compact seed up to its full size as the intro plays. */
function GrowingNebula({ reducedMotion }: { reducedMotion: boolean }) {
    const groupRef = useRef<THREE.Group>(null!);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        const grow = reducedMotion ? 1 : THREE.MathUtils.smoothstep(t, 0.15, INTRO_DOLLY_END_S - 0.4);
        groupRef.current.scale.setScalar(0.08 + grow * 0.92);
    });

    return (
        <group ref={groupRef}>
            <GalaxyNebula />
        </group>
    );
}

/**
 * Full-screen Three.js galaxy — one continuous scene, mounted once: it
 * opens on a big-bang intro (a flash, background stars and a scattered
 * field of randomly generated "other" galaxies physically expelled from
 * the origin, and our own galaxy condensing into its full form) under a
 * wide establishing shot, eases the camera in on our own galaxy, then
 * sheds the intro-only decoration and hands off to the normal
 * orbiting/click-to-explore interaction. Falls back to a static gradient
 * if WebGL is unavailable.
 *
 * @param focusedId - The currently selected section (chosen from `NavMenu`), or null for the overview.
 * @param focusedStarId - A visitor star's id, chosen from the Star Explorer panel — flies the camera to it the
 *                        same way `focusedId` does for a section, but doesn't drive `SectionPanel`.
 * @param onIntroComplete - Called once the intro (or its reduced-motion/no-WebGL equivalent) has finished.
 */
export default function GalaxyScene({
    focusedId,
    focusedStarId,
    onIntroComplete,
}: {
    focusedId: SectionId | null;
    focusedStarId?: string | null;
    onIntroComplete?: () => void;
}) {
    const [reducedMotion, setReducedMotion] = useState(
        () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
    const [webglOk, setWebglOk] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [introDone, setIntroDone] = useState(false);
    const [fieldGalaxiesMounted, setFieldGalaxiesMounted] = useState(true);
    const mouse = useRef({ x: 0, y: 0 });
    const starRefs = useRef<Record<string, React.RefObject<THREE.Sprite | null>>>({});

    useEffect(() => {
        try {
            const probe = document.createElement('canvas');
            const ctx = probe.getContext('webgl2') || probe.getContext('webgl');
            if (!ctx) setWebglOk(false);
        } catch {
            setWebglOk(false);
        }

        setIsMobile(window.innerWidth < 768);

        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleMq = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mq.addEventListener('change', handleMq);

        const handleMove = (e: PointerEvent) => {
            mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
        };
        window.addEventListener('pointermove', handleMove);

        return () => {
            mq.removeEventListener('change', handleMq);
            window.removeEventListener('pointermove', handleMove);
        };
    }, []);

    const registerRef = useCallback((id: string, ref: React.RefObject<THREE.Sprite | null>) => {
        starRefs.current[id] = ref;
    }, []);

    const handleIntroComplete = useCallback(() => {
        setIntroDone(true);
        onIntroComplete?.();
    }, [onIntroComplete]);

    // No WebGL means no scripted intro either — tell the shell immediately
    // so chrome like the hero title isn't stuck waiting on a camera that will never move.
    useEffect(() => {
        if (!webglOk) onIntroComplete?.();
    }, [webglOk, onIntroComplete]);

    // Keep the field galaxies mounted a little past the intro so they can
    // ease out (see `fadingOut` below) instead of being cut mid-frame.
    useEffect(() => {
        if (!introDone) return;
        const timer = setTimeout(() => setFieldGalaxiesMounted(false), FADE_OUT_DURATION_S * 1000 + 150);
        return () => clearTimeout(timer);
    }, [introDone]);

    if (!webglOk) {
        return (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#2a1550_0%,_#0a0518_55%,_#000_100%)]" />
        );
    }

    const activeFocusKey = focusedStarId ?? focusedId;
    const focusedRef = activeFocusKey ? starRefs.current[activeFocusKey] ?? null : null;

    return (
        <Canvas
            camera={{ position: (reducedMotion ? ORBIT_START_POS : INTRO_START_POS).toArray(), fov: 50 }}
            gl={{ antialias: true }}
            className="absolute inset-0"
        >
            <color attach="background" args={['#000000']} />
            <Suspense fallback={null}>
                <BackgroundStars count={isMobile ? 1800 : 3500} reducedMotion={reducedMotion} />
                {!introDone && <BangFlare />}
                {fieldGalaxiesMounted && (
                    <FieldGalaxies count={isMobile ? 22 : 46} reducedMotion={reducedMotion} fadingOut={introDone} />
                )}
                <GrowingNebula reducedMotion={reducedMotion} />
                <VisitorStars registerRef={registerRef} />
                {SECTION_STARS.map(star => (
                    <FeatureStar
                        key={star.id}
                        id={star.id}
                        position={star.position}
                        color={star.color}
                        focused={focusedId === star.id}
                        dimmed={!!(focusedId || focusedStarId) && focusedId !== star.id}
                        reducedMotion={reducedMotion}
                        registerRef={registerRef}
                    />
                ))}
                <CameraRig
                    focusedRef={focusedRef}
                    mouse={mouse}
                    reducedMotion={reducedMotion}
                    onIntroComplete={handleIntroComplete}
                />
                <Effects />
            </Suspense>
        </Canvas>
    );
}
