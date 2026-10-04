"use client";

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { INTRO_START_POS, ORBIT_START_POS, INTRO_HOLD_END_S, INTRO_DOLLY_END_S } from './introTiming';

const ORBIT_RADIUS = ORBIT_START_POS.z;
const ORBIT_HEIGHT = ORBIT_START_POS.y;
const ORBIT_SPEED = 0.028; // radians/sec — slow drift around the static nebula
const DEFAULT_LOOKAT = new THREE.Vector3(0, 0, 0);
const FOCUS_DISTANCE = 2.6;
const BASE_FOV = 50;

function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * Drives the scene's single camera through its whole life: a wide
 * establishing shot of the big bang, an ease-in-out dolly down onto our
 * galaxy (always at the origin), and — once that lands — the normal
 * interactive behavior: slow orbiting with mouse parallax, or drifting
 * toward and looking at whichever feature star is focused.
 *
 * @param focusedRef - Ref to the focused star's sprite, or null for the overview. Ignored until the intro completes.
 * @param mouse - Normalized pointer position [-1, 1] for the overview's subtle parallax drift.
 * @param reducedMotion - When true, skips the intro dolly (snaps straight to the resting pose) and the parallax/orbit drift.
 * @param onIntroComplete - Called once, the first frame the intro dolly finishes (or immediately, under reduced motion).
 */
export default function CameraRig({
    focusedRef,
    mouse,
    reducedMotion,
    onIntroComplete,
}: {
    focusedRef: React.RefObject<THREE.Sprite | null> | null;
    mouse: React.RefObject<{ x: number; y: number }>;
    reducedMotion: boolean;
    onIntroComplete?: () => void;
}) {
    const { camera } = useThree();
    const introDone = useRef(false);
    const orbitAngle = useRef(0);
    const lookAtTarget = useRef(new THREE.Vector3().copy(DEFAULT_LOOKAT));
    const starWorldPos = useRef(new THREE.Vector3());
    const desiredPos = useRef(new THREE.Vector3(0, ORBIT_HEIGHT, ORBIT_RADIUS));
    const orbitPos = useRef(new THREE.Vector3());
    const dir = useRef(new THREE.Vector3());

    useFrame(({ clock }, delta) => {
        const t = clock.getElapsedTime();

        if (!introDone.current) {
            const persp = camera as THREE.PerspectiveCamera;
            if (typeof persp.fov === 'number') {
                persp.fov = BASE_FOV + (reducedMotion ? 0 : Math.exp(-t * 7) * 9);
                persp.updateProjectionMatrix();
            }

            if (reducedMotion) {
                camera.position.copy(ORBIT_START_POS);
            } else if (t < INTRO_HOLD_END_S) {
                camera.position.copy(INTRO_START_POS);
            } else if (t < INTRO_DOLLY_END_S) {
                const dollyT = (t - INTRO_HOLD_END_S) / (INTRO_DOLLY_END_S - INTRO_HOLD_END_S);
                camera.position.lerpVectors(INTRO_START_POS, ORBIT_START_POS, easeInOutCubic(dollyT));
            } else {
                camera.position.copy(ORBIT_START_POS);
            }
            camera.lookAt(DEFAULT_LOOKAT);

            if (reducedMotion || t >= INTRO_DOLLY_END_S) {
                introDone.current = true;
                orbitAngle.current = 0;
                onIntroComplete?.();
            }
            return;
        }

        const lerpFactor = reducedMotion ? 1 : Math.min(delta * 2.2, 1);
        const focused = !!focusedRef?.current;

        if (!focused && !reducedMotion) {
            orbitAngle.current += delta * ORBIT_SPEED;
        }

        orbitPos.current.set(
            Math.sin(orbitAngle.current) * ORBIT_RADIUS,
            ORBIT_HEIGHT,
            Math.cos(orbitAngle.current) * ORBIT_RADIUS
        );

        if (focusedRef?.current) {
            focusedRef.current.getWorldPosition(starWorldPos.current);
            dir.current.subVectors(orbitPos.current, starWorldPos.current).normalize();
            desiredPos.current.copy(starWorldPos.current).addScaledVector(dir.current, FOCUS_DISTANCE);
            lookAtTarget.current.lerp(starWorldPos.current, lerpFactor);
        } else {
            const parallaxX = reducedMotion ? 0 : mouse.current.x * 0.5;
            const parallaxY = reducedMotion ? 0 : mouse.current.y * 0.25;
            desiredPos.current.set(orbitPos.current.x + parallaxX, orbitPos.current.y + parallaxY, orbitPos.current.z);
            lookAtTarget.current.lerp(DEFAULT_LOOKAT, lerpFactor);
        }

        camera.position.lerp(desiredPos.current, lerpFactor);
        camera.lookAt(lookAtTarget.current);
    });

    return null;
}
