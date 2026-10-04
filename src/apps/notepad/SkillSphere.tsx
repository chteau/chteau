"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Code2 } from 'lucide-react';
import { SKILL_ICONS } from './skillIcons';

const AUTO_SPEED = 0.0022;
const DAMPING = 0.94;
const DRAG_SENSITIVITY = 0.006;
const TILT_LIMIT = 1.1;
const BADGE_SIZE = 48;
const SPHERE_FILL = 0.47;
const HOVER_SCALE_BOOST = 1.18;

interface Point3 {
    x: number;
    y: number;
    z: number;
}

/** Evenly distributes `n` points on a unit sphere (Fibonacci lattice) — avoids clustering near the poles. */
function fibonacciSphere(n: number): Point3[] {
    const points: Point3[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 2;
        const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = goldenAngle * i;
        points.push({ x: Math.cos(theta) * radiusAtY, y, z: Math.sin(theta) * radiusAtY });
    }
    return points;
}

/**
 * A rotating sphere of brand-icon badges — pseudo-3D done by hand (points
 * placed on a Fibonacci sphere, rotated with plain trig and redrawn via
 * `translate3d`/`opacity`/`z-index` every frame, no CSS 3D transforms and no
 * WebGL). The galaxy elsewhere on the site already owns the one WebGL
 * context worth spending; this stays a cheap, always-smooth DOM animation so
 * it doesn't cost low-end devices a second one. Auto-rotates; drag (mouse or
 * touch) spins it, with the drag's last velocity carried on as inertia that
 * eases back into the idle auto-rotation. Hovering a badge freezes the
 * rotation and brings it to the front so its name/description can be read
 * in the caption below.
 */
export default function SkillSphere() {
    const wrapRef = useRef<HTMLDivElement>(null);
    const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);
    const hoveredRef = useRef<number | null>(null);
    const points = useMemo(() => fibonacciSphere(SKILL_ICONS.length), []);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useEffect(() => {
        hoveredRef.current = hoveredIndex;
    }, [hoveredIndex]);

    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;

        let radius = Math.min(wrap.clientWidth, wrap.clientHeight) * SPHERE_FILL;
        const ro = new ResizeObserver(() => {
            radius = Math.min(wrap.clientWidth, wrap.clientHeight) * SPHERE_FILL;
        });
        ro.observe(wrap);

        let angleY = 0.6;
        let angleX = -0.25;
        let velY = AUTO_SPEED;
        let velX = 0;
        let dragging = false;
        let lastX = 0;
        let lastY = 0;
        let raf = 0;

        const render = () => {
            if (!dragging && hoveredRef.current === null) {
                velY += (AUTO_SPEED - velY) * 0.02;
                velX *= DAMPING;
                angleY += velY;
                angleX = Math.max(-TILT_LIMIT, Math.min(TILT_LIMIT, angleX + velX));
            }

            const cosY = Math.cos(angleY);
            const sinY = Math.sin(angleY);
            const cosX = Math.cos(angleX);
            const sinX = Math.sin(angleX);

            points.forEach((p, i) => {
                const x = p.x * cosY - p.z * sinY;
                const zRot = p.x * sinY + p.z * cosY;
                const y = p.y * cosX - zRot * sinX;
                const z = p.y * sinX + zRot * cosX;

                const depth = (z + 1) / 2;
                const isHovered = hoveredRef.current === i;
                const scale = (0.55 + depth * 0.55) * (isHovered ? HOVER_SCALE_BOOST : 1);
                const el = badgeRefs.current[i];
                if (el) {
                    el.style.transform = `translate3d(${x * radius}px, ${y * radius}px, 0) scale(${scale})`;
                    el.style.opacity = isHovered ? '1' : String(0.35 + depth * 0.65);
                    el.style.zIndex = isHovered ? '9999' : String(Math.round(depth * 1000));
                }
            });

            raf = requestAnimationFrame(render);
        };
        raf = requestAnimationFrame(render);

        const onPointerDown = (e: PointerEvent) => {
            dragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            wrap.setPointerCapture?.(e.pointerId);
        };
        const onPointerMove = (e: PointerEvent) => {
            if (!dragging) return;
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            lastX = e.clientX;
            lastY = e.clientY;
            velY = dx * DRAG_SENSITIVITY;
            velX = dy * DRAG_SENSITIVITY;
            angleY += velY;
            angleX = Math.max(-TILT_LIMIT, Math.min(TILT_LIMIT, angleX + velX));
        };
        const onPointerUp = () => {
            dragging = false;
        };

        wrap.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            wrap.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [points]);

    const hovered = hoveredIndex !== null ? SKILL_ICONS[hoveredIndex] : null;

    return (
        <div>
            <div
                ref={wrapRef}
                className="relative w-full h-[58vh] min-h-[340px] max-h-[640px] select-none touch-none cursor-grab active:cursor-grabbing"
            >
                {SKILL_ICONS.map((icon, i) => (
                    <div
                        key={icon.key}
                        ref={(el) => {
                            badgeRefs.current[i] = el;
                        }}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex((cur) => (cur === i ? null : cur))}
                        className={`absolute left-1/2 top-1/2 flex items-center justify-center bg-surface-container-high border cursor-pointer transition-colors ${
                            hoveredIndex === i ? 'border-primary' : 'border-outline/40'
                        }`}
                        style={{
                            width: BADGE_SIZE,
                            height: BADGE_SIZE,
                            marginLeft: -BADGE_SIZE / 2,
                            marginTop: -BADGE_SIZE / 2,
                            willChange: 'transform',
                            boxShadow: hoveredIndex === i ? '0 0 16px 1px rgba(192, 94, 255, 0.55)' : undefined,
                        }}
                    >
                        {icon.path ? (
                            <svg viewBox="0 0 24 24" width={24} height={24} fill={icon.color} aria-hidden="true">
                                <path d={icon.path} />
                            </svg>
                        ) : (
                            <Code2 size={22} color={icon.color} aria-hidden="true" />
                        )}
                    </div>
                ))}
            </div>

            <div className="h-9 flex items-center justify-center text-center px-4">
                {hovered && (
                    <p className="text-xs leading-snug">
                        <span className="font-bold text-primary uppercase tracking-wide">{hovered.label}</span>
                        <span className="text-on-surface-variant"> — {hovered.description}</span>
                    </p>
                )}
            </div>
        </div>
    );
}
