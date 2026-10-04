"use client";

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createFlareTexture } from './textures';

export interface FeatureStarProps {
    id: string;
    position: [number, number, number];
    color: string;
    focused: boolean;
    dimmed: boolean;
    reducedMotion?: boolean;
    registerRef: (id: string, ref: React.RefObject<THREE.Sprite | null>) => void;
}

/**
 * A large, glowing feature star marking one portfolio section — purely
 * decorative (not hoverable or clickable; navigation lives in `NavMenu`).
 * Expelled from the origin by the big bang out to its resting spot, then
 * pulses gently (twinkle) and grows when its section is opened via the
 * menu. Reports its own ref up so the camera rig can fly toward its live
 * world position when that happens.
 */
export default function FeatureStar({ id, position, color, focused, dimmed, reducedMotion = false, registerRef }: FeatureStarProps) {
    const spriteRef = useRef<THREE.Sprite>(null!);
    const texture = useMemo(() => createFlareTexture(color), [color]);
    // Slightly different flight speed per star so they don't all settle in lockstep.
    const burstSpeed = useMemo(() => 0.55 + Math.abs(Math.sin(position[0] * 7.3 + position[2] * 3.1)) * 0.5, [position]);

    useEffect(() => {
        registerRef(id, spriteRef);
    }, [id, registerRef]);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        const eased = reducedMotion ? 1 : 1 - Math.exp(-t * burstSpeed);
        spriteRef.current.position.set(position[0] * eased, position[1] * eased, position[2] * eased);

        const twinkle = 0.88 + Math.sin(t * 1.8 + position[0] * 12.3) * 0.12;
        const focusBoost = focused ? 1.15 : 1;
        const scale = 0.85 * twinkle * focusBoost;
        spriteRef.current.scale.set(scale, scale, 1);

        const mat = spriteRef.current.material as THREE.SpriteMaterial;
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, dimmed ? 0.08 : 1, 0.08);
    });

    return (
        <sprite ref={spriteRef}>
            <spriteMaterial map={texture} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
    );
}
