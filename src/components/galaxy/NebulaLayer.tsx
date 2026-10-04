"use client";

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const VERTEX_SHADER = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// A single billboarded plane painted with a domain-warped, swirled fbm
// cloud — this is what reads as a whole spiral galaxy body (arms, core
// glow, fine stellar grain) instead of thousands of discrete particles.
const FRAGMENT_SHADER = `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform float uAspect;
    uniform float uSwirl;
    uniform float uSeed;
    uniform vec3 uColorCore;
    uniform vec3 uColorMid;
    uniform vec3 uColorEdge;
    uniform float uOpacity;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed) * 43758.5453123); }
    float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    mat2 rot(float a) { float s = sin(a), c = cos(a); return mat2(c, s, -s, c); }
    float fbm(vec2 p) {
        float v = 0.0; float amp = 0.5;
        for (int i = 0; i < 6; i++) {
            v += amp * noise(p);
            p = rot(0.6) * p * 2.05;
            amp *= 0.56;
        }
        return v;
    }

    void main() {
        vec2 c = vUv - 0.5;
        c.x *= uAspect;
        float dist = length(c) * 2.0;
        float angle = atan(c.y, c.x);

        // Logarithmic-ish swirl: twist the sampling angle more sharply near
        // the core, easing off toward the rim, to carve spiral arms out of
        // the noise field instead of an isotropic blob. uSwirl near 0 reads
        // as an unswirled, elliptical-galaxy-like blob instead.
        float twist = angle + uTime * 0.012 + uSwirl / (dist * 2.2 + 0.35);
        vec2 sp = vec2(cos(twist), sin(twist)) * dist;

        float n1 = fbm(sp * 2.6 + 4.0);
        float n2 = fbm(sp * 5.8 - 7.0 + uTime * 0.01);
        float n3 = fbm(sp * 12.0 + 2.0 - uTime * 0.008);
        float cloud = n1 * 0.52 + n2 * 0.33 + n3 * 0.15;
        cloud = pow(clamp(cloud, 0.0, 1.0), 1.35);

        float shape = smoothstep(1.05, 0.0, dist);
        float density = clamp(cloud * 1.25, 0.0, 1.0) * shape;

        vec3 color = mix(uColorEdge, uColorMid, smoothstep(0.75, 0.15, dist));
        color = mix(color, uColorCore, smoothstep(0.3, 0.0, dist) * (0.55 + 0.45 * cloud));

        // Fine stellar grain — thresholded high-frequency noise, brighter
        // toward the core, giving the dust its sparkle without discrete points.
        float grain = noise(sp * 90.0 + uTime * 0.04);
        float sparkle = smoothstep(0.975, 1.0, grain) * shape * (0.5 + 0.5 * cloud);

        vec3 finalColor = color * (0.45 + 1.05 * cloud) + sparkle * vec3(1.0, 0.95, 1.0) * 2.2;
        float alpha = (density * 0.9 + sparkle) * uOpacity;

        gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 1.0));
    }
`;

export interface NebulaLayerProps {
    size: [number, number];
    swirl: number;
    seed: number;
    opacity: number;
    colorCore: string;
    colorMid: string;
    colorEdge: string;
}

/**
 * A single billboarded, shader-painted spiral/elliptical nebula plane —
 * the shared building block for both the real galaxy (`GalaxyNebula`,
 * layering two of these) and the big bang intro's scattered field of
 * randomly generated "other" galaxies (`FieldGalaxies`, one
 * differently-parameterized instance each).
 */
export default function NebulaLayer({ size, swirl, seed, opacity, colorCore, colorMid, colorEdge }: NebulaLayerProps) {
    const matRef = useRef<THREE.ShaderMaterial>(null!);
    const meshRef = useRef<THREE.Mesh>(null!);
    const { camera } = useThree();

    // Billboard to the camera every frame — a flat plane with a fixed
    // orientation would show its hard edge the moment the camera drifts
    // off-axis, so it must always face the viewer regardless of orbiting.
    useFrame(({ clock }) => {
        matRef.current.uniforms.uTime.value = clock.getElapsedTime();
        meshRef.current.quaternion.copy(camera.quaternion);
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={size} />
            <shaderMaterial
                ref={matRef}
                vertexShader={VERTEX_SHADER}
                fragmentShader={FRAGMENT_SHADER}
                uniforms={{
                    uTime: { value: 0 },
                    uAspect: { value: size[0] / size[1] },
                    uSwirl: { value: swirl },
                    uSeed: { value: seed },
                    uColorCore: { value: new THREE.Color(colorCore) },
                    uColorMid: { value: new THREE.Color(colorMid) },
                    uColorEdge: { value: new THREE.Color(colorEdge) },
                    uOpacity: { value: opacity },
                }}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}
