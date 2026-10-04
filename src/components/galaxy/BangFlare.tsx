"use client";

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createFlareTexture } from './textures';

/**
 * The big bang's initial flash — a bright core plus a wide horizontal
 * lens-flare streak at the origin, bursting then fully decaying to nothing
 * within the first couple of seconds (the scene unmounts it once the intro
 * completes, so it never needs to settle into a permanent glow).
 */
export default function BangFlare() {
    const ref = useRef<THREE.Sprite>(null!);
    const texture = useMemo(() => createFlareTexture('#f3e3ff'), []);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        const burst = Math.exp(-t * 1.6);
        const sx = (2.5 + burst * 9) * 1.6;
        const sy = 2.5 + burst * 9;
        ref.current.scale.set(sx, sy, 1);
        (ref.current.material as THREE.SpriteMaterial).opacity = Math.max(0, burst * 1.6 - 0.02);
    });

    return (
        <sprite ref={ref} position={[0, 0, 0]}>
            <spriteMaterial map={texture} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
    );
}
