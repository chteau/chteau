"use client";

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const VERTEX_SHADER = `
    attribute float aScale;
    attribute float aPhase;
    attribute vec3 aDirection;
    attribute float aFinalDist;
    attribute float aSpeed;
    varying float vPhase;
    uniform float uTime;
    uniform float uReduced;
    void main() {
        float eased = uReduced > 0.5 ? 1.0 : (1.0 - exp(-uTime * aSpeed));
        vec3 pos = aDirection * eased * aFinalDist;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = aScale * (52.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
        vPhase = aPhase + uTime * 1.4;
    }
`;

const FRAGMENT_SHADER = `
    precision mediump float;
    varying float vPhase;
    void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        float circle = smoothstep(0.5, 0.4, d);
        float twinkle = 0.25 + 0.6 * (0.5 + 0.5 * sin(vPhase));
        gl_FragColor = vec4(vec3(1.0, 0.98, 1.0), circle * twinkle);
    }
`;

/**
 * Distant twinkling starfield — thousands of points expelled from the big
 * bang's origin, each flying out along its own direction/speed to settle
 * into a shell, then twinkling in place via a sine-wave phase flicker.
 *
 * @param count - Number of background stars.
 * @param radius - Shell radius the stars settle within.
 * @param reducedMotion - When true, skips the flight — every star sits at its final position immediately.
 */
export default function BackgroundStars({
    count = 3000,
    radius = 40,
    reducedMotion = false,
}: {
    count?: number;
    radius?: number;
    reducedMotion?: boolean;
}) {
    const materialRef = useRef<THREE.ShaderMaterial>(null!);

    const { directions, finalDists, speeds, scales, phases } = useMemo(() => {
        const directions = new Float32Array(count * 3);
        const finalDists = new Float32Array(count);
        const speeds = new Float32Array(count);
        const scales = new Float32Array(count);
        const phases = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            directions[i3] = Math.sin(phi) * Math.cos(theta);
            directions[i3 + 1] = Math.cos(phi);
            directions[i3 + 2] = Math.sin(phi) * Math.sin(theta);

            finalDists[i] = radius * (0.35 + Math.random() * 0.65);
            speeds[i] = 0.45 + Math.random() * 1.3;
            scales[i] = 0.4 + Math.pow(Math.random(), 2.8) * 1.6;
            phases[i] = Math.random() * Math.PI * 2;
        }

        return { directions, finalDists, speeds, scales, phases };
    }, [count, radius]);

    const positions = useMemo(() => new Float32Array(count * 3), [count]);

    useFrame(({ clock }) => {
        if (!materialRef.current) return;
        materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    });

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-aDirection" count={directions.length / 3} array={directions} itemSize={3} />
                <bufferAttribute attach="attributes-aFinalDist" count={finalDists.length} array={finalDists} itemSize={1} />
                <bufferAttribute attach="attributes-aSpeed" count={speeds.length} array={speeds} itemSize={1} />
                <bufferAttribute attach="attributes-aScale" count={scales.length} array={scales} itemSize={1} />
                <bufferAttribute attach="attributes-aPhase" count={phases.length} array={phases} itemSize={1} />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                vertexShader={VERTEX_SHADER}
                fragmentShader={FRAGMENT_SHADER}
                uniforms={{ uTime: { value: 0 }, uReduced: { value: reducedMotion ? 1 : 0 } }}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
