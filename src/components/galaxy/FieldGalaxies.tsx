"use client";

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import NebulaLayer from './NebulaLayer';

interface FieldDef {
    direction: THREE.Vector3;
    restDist: number;
    speed: number;
    swirl: number;
    seed: number;
    size: [number, number];
    opacity: number;
    colorCore: string;
    colorMid: string;
    colorEdge: string;
}

// Deliberately far from our own purple/magenta palette (see GalaxyNebula)
// so ours reads as visually distinct the instant it's picked out.
const PALETTES: Array<[string, string, string]> = [
    ['#e8fbff', '#22d3ee', '#0b3a6b'],
    ['#fff4e6', '#fb923c', '#7a2a0a'],
    ['#f0fff0', '#4ade80', '#0a4a2a'],
    ['#ffe9f3', '#f472b6', '#5a0a3a'],
    ['#fffbe8', '#fde047', '#7a5a0a'],
    ['#eef0ff', '#818cf8', '#1a1a6b'],
    ['#ffecec', '#f87171', '#5a0a0a'],
];

/**
 * Builds `count` randomly shaped/colored galaxy defs, each with its own
 * outward flight speed. Scattered within the same shell the background
 * stars occupy (and beyond) — well past our own camera's resting orbit
 * distance — so none of them ever reads as sitting behind or beside our
 * own nebula; they're part of the distant backdrop, not the foreground.
 */
function buildFieldDefs(count: number): FieldDef[] {
    return Array.from({ length: count }).map((_, i) => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const direction = new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi) * 0.8, Math.sin(phi) * Math.sin(theta));
        const palette = PALETTES[i % PALETTES.length];
        const width = 0.9 + Math.random() * 2.0;
        // Most spiral with a random swirl strength; some stay unswirled for elliptical-galaxy variety.
        const swirl = Math.random() < 0.3 ? (Math.random() - 0.5) * 0.4 : (Math.random() - 0.5) * 5;

        return {
            direction,
            restDist: 30 + Math.random() * 26,
            speed: 0.22 + Math.random() * 0.3,
            swirl,
            seed: Math.random() * 100,
            size: [width, width * (0.5 + Math.random() * 0.35)] as [number, number],
            opacity: 0.55 + Math.random() * 0.3,
            colorCore: palette[0],
            colorMid: palette[1],
            colorEdge: palette[2],
        };
    });
}

const FADE_OUT_DURATION_S = 0.8;

function FieldGalaxy({ def, reducedMotion, fadingOut }: { def: FieldDef; reducedMotion: boolean; fadingOut: boolean }) {
    const groupRef = useRef<THREE.Group>(null!);
    const fadeStart = useRef<number | null>(null);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        const eased = reducedMotion ? 1 : 1 - Math.exp(-t * def.speed);
        const dist = eased * def.restDist;
        groupRef.current.position.set(def.direction.x * dist, def.direction.y * dist, def.direction.z * dist);
        const grow = reducedMotion ? 1 : THREE.MathUtils.smoothstep(t, 0.1, 2.4);

        let fade = 1;
        if (fadingOut) {
            if (fadeStart.current === null) fadeStart.current = t;
            fade = 1 - Math.min((t - fadeStart.current) / FADE_OUT_DURATION_S, 1);
        }

        groupRef.current.scale.setScalar(grow * fade);
    });

    return (
        <group ref={groupRef}>
            <NebulaLayer
                size={def.size}
                swirl={def.swirl}
                seed={def.seed}
                opacity={def.opacity}
                colorCore={def.colorCore}
                colorMid={def.colorMid}
                colorEdge={def.colorEdge}
            />
        </group>
    );
}

/**
 * The scattered field of "other" galaxies born alongside ours — each its
 * own random shape (spiral or elliptical), swirl, and color palette,
 * physically expelled from the origin out to a resting spot well beyond
 * our own nebula's extent. Mounted only for the big bang intro; once the
 * camera finishes dollying in on ours, pass `fadingOut` to ease every one
 * of them down to nothing (rather than cutting whatever's still in frame)
 * before the parent scene unmounts this whole group.
 */
export default function FieldGalaxies({
    count = 46,
    reducedMotion = false,
    fadingOut = false,
}: {
    count?: number;
    reducedMotion?: boolean;
    fadingOut?: boolean;
}) {
    const defs = useMemo(() => buildFieldDefs(count), [count]);

    return (
        <group>
            {defs.map((def, i) => (
                <FieldGalaxy key={i} def={def} reducedMotion={reducedMotion} fadingOut={fadingOut} />
            ))}
        </group>
    );
}

export { FADE_OUT_DURATION_S };
