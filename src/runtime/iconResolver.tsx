// Dependencies
import React from 'react';

// Assets
import notepadIconData from '../apps/notepad/icon.png';
import explorerIconData from '../apps/explorer/icon.png';
import githubIconData from '../apps/github/icon.png';
import robloxIconData from '../apps/roblox/icon.png';
import genericIconData from '../assets/Generic.png';

// Types
export type IconProps = { size?: number; className?: string };
export type IconComponent = React.ComponentType<IconProps>;

// Maps
const PNG_MAP: Record<string, string> = {
    notepad: notepadIconData.src,
    explorer: explorerIconData.src,
    github: githubIconData.src,
    roblox: robloxIconData.src,
};

// Constants
const GENERIC_SRC = genericIconData.src;
const pngIconCache = new Map<string, IconComponent>();

/**
 * Creates a React component that renders a PNG icon.
 * 
 * @param src - The source URL of the PNG image.
 * @returns A React component that renders the PNG image.
 */
function makePngIcon(src: string): IconComponent {
    if (pngIconCache.has(src)) return pngIconCache.get(src)!;
    const Icon = ({ size = 24, className }: IconProps) => (
        <img
            src={src}
            alt=""
            width={size}
            height={size}
            className={className}
            style={{ objectFit: 'contain', display: 'block' }}
            onError={(e) => { e.currentTarget.src = GENERIC_SRC; }}
        />
    );
    Icon.displayName = `PngIcon(${src})`;
    pngIconCache.set(src, Icon);
    return Icon;
}

/**
 * Resolves a manifest icon to a renderable component.
 * Resolution order:
 *   1. appId match in PNG_MAP → app-specific PNG
 *   2. manifest icon starting with '/' → explicit public path
 *   3. Lucide name lookup
 *   4. Generic.png fallback
 */
export function resolveIcon(iconName: string, appId?: string): IconComponent {
    if (appId && PNG_MAP[appId]) return makePngIcon(PNG_MAP[appId]);
    if (iconName.startsWith('/')) return makePngIcon(iconName);

    return makePngIcon(GENERIC_SRC);
}
