/**
 * Static, serializable descriptor for an installable app package.
 * Loaded synchronously from each app's `manifest.json`.
 */
export interface AppManifest {
    id: string;
    name: string;
    version: string;
    author: string;

    /** Lucide icon name resolved at render time. */
    icon: string;
    permissions: string[];
    window: { width?: number; height?: number; x: number; y: number };
    multiInstance: boolean;
    desktopBadge?: boolean;
}
