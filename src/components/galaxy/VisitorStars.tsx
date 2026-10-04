"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { createFlareTexture } from './textures';

interface VisitorStar {
    id: string;
    githubUrl?: string;
    robloxUrl?: string;
    avatarUrl?: string;
    verified?: boolean;
    message: string;
    color: string;
    position: [number, number, number];
    createdAt: string;
}

// ~55% smaller than the decorative feature stars' 0.5 base scale, same glow texture/twinkle/hover-boost behavior.
const BASE_SCALE = 0.22;

function VisitorStarPoint({
    star,
    selected,
    onSelect,
}: {
    star: VisitorStar;
    selected: boolean;
    onSelect: (id: string | null) => void;
}) {
    const spriteRef = useRef<THREE.Sprite>(null!);
    const [hovered, setHovered] = useState(false);
    const texture = useMemo(() => createFlareTexture(star.color), [star.color]);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        const twinkle = 0.8 + Math.sin(t * 1.6 + star.position[0] * 9.1) * 0.15;
        const boost = hovered || selected ? 1.5 : 1;
        const scale = BASE_SCALE * twinkle * boost;
        spriteRef.current.scale.set(scale, scale, 1);
    });

    return (
        <sprite
            ref={spriteRef}
            position={star.position}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
                document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                setHovered(false);
                document.body.style.cursor = 'auto';
            }}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(selected ? null : star.id);
            }}
        >
            <spriteMaterial map={texture} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
            {(hovered || selected) && (
                <Html center distanceFactor={9} style={{ pointerEvents: selected ? 'auto' : 'none' }}>
                    {selected ? (
                        <div className="glass-chip px-3.5 py-2.5 text-[11px] -translate-y-10 w-[220px] space-y-1.5">
                            <div className="flex items-start gap-2.5">
                                {star.avatarUrl && (
                                    <div className="relative shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={star.avatarUrl} alt="" width={32} height={32} />
                                        {star.verified && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src="/verified.svg"
                                                alt="Verified"
                                                width={13}
                                                height={13}
                                                className="absolute -bottom-1 -right-1"
                                            />
                                        )}
                                    </div>
                                )}
                                <p className="text-on-surface leading-snug">{star.message}</p>
                            </div>
                            {(star.githubUrl || star.robloxUrl) && (
                                <div className="flex gap-3 pt-0.5">
                                    {star.githubUrl && (
                                        <a href={star.githubUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                            GitHub
                                        </a>
                                    )}
                                    {star.robloxUrl && (
                                        <a href={star.robloxUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                            Roblox
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="glass-chip px-2.5 py-1 text-[10px] text-on-surface-variant whitespace-nowrap -translate-y-8">
                            Click to read
                        </div>
                    )}
                </Html>
            )}
        </sprite>
    );
}

/**
 * Every visitor-submitted star, fetched once on mount and re-fetched when
 * `AddStarForm` fires `visitor-star-added` (it lives outside the Canvas, so
 * a window event is the simplest bridge). Unlike the 5 decorative feature
 * stars, these are interactive: hover previews, click opens the visitor's
 * message and links.
 */
export default function VisitorStars() {
    const [stars, setStars] = useState<VisitorStar[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchStars = () => {
            fetch('/api/stars')
                .then((r) => (r.ok ? r.json() : Promise.reject()))
                .then((data) => setStars(Array.isArray(data.stars) ? data.stars : []))
                .catch(() => {});
        };

        fetchStars();
        window.addEventListener('visitor-star-added', fetchStars);
        return () => window.removeEventListener('visitor-star-added', fetchStars);
    }, []);

    return (
        <group>
            {stars.map((star) => (
                <VisitorStarPoint key={star.id} star={star} selected={selectedId === star.id} onSelect={setSelectedId} />
            ))}
        </group>
    );
}
