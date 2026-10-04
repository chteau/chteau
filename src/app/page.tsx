"use client";

// Dependencies
import dynamic from 'next/dynamic';

// The Three.js canvas touches `window`/`document` at module scope, so it
// must never render during SSR.
const GalaxyExperience = dynamic(() => import('../components/galaxy/GalaxyExperience'), { ssr: false });

export default function Page() {
    return <GalaxyExperience />;
}
