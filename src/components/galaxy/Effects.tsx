"use client";

import { EffectComposer, Bloom } from '@react-three/postprocessing';

/**
 * Post-processing bloom pass — gives the galaxy's bright core, particle arms
 * and feature stars their soft glow. Skipped entirely under reduced-motion
 * is not necessary (it's a static visual effect, not an animation), so it
 * always renders.
 */
export default function Effects() {
    return (
        <EffectComposer>
            <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.2} intensity={0.6} mipmapBlur radius={0.5} />
        </EffectComposer>
    );
}
