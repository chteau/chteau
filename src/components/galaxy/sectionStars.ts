import type { SectionId } from './types';

export interface StarDef {
    id: SectionId;
    position: [number, number, number];
    color: string;
}

/** Fixed world positions + tint colors for the 5 feature stars, scattered across the spiral's arms. */
export const SECTION_STARS: StarDef[] = [
    { id: 'projects', position: [3.4, -0.4, 2.0], color: '#7dd3fc' },
    { id: 'github', position: [-3.2, 0.3, -1.6], color: '#e5e7eb' },
    { id: 'roblox', position: [2.1, -1.6, -2.9], color: '#fb923c' },
    { id: 'bio', position: [-2.6, -1.1, 2.7], color: '#f472b6' },
    { id: 'contact', position: [-0.8, -2.0, 3.2], color: '#fde047' },
];
