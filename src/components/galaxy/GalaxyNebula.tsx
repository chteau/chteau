"use client";

import NebulaLayer from './NebulaLayer';

/**
 * The galaxy's visible body — two layered, billboarded shader planes
 * painting a swirled, domain-warped nebula cloud (spiral arms, bright core,
 * fine stellar grain) in one continuous painterly field, instead of a
 * particle swarm. This is what the camera and feature stars orbit around.
 */
export default function GalaxyNebula() {
    return (
        <group>
            <NebulaLayer
                size={[23, 14]}
                swirl={2.4}
                seed={12.4}
                opacity={0.95}
                colorCore="#fff2ff"
                colorMid="#c042e8"
                colorEdge="#2a1a7a"
            />
            <NebulaLayer
                size={[18, 11]}
                swirl={-1.8}
                seed={47.8}
                opacity={0.5}
                colorCore="#ffe9ff"
                colorMid="#6a3bdb"
                colorEdge="#1c2f8f"
            />
        </group>
    );
}
