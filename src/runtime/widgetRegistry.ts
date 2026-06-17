import spotifyManifest from '../widgets/spotify/manifest.json';
import type { WidgetManifest } from '../types/widget';

/**
 * Synchronous registry of installed widget packages, keyed by widget id.
 * Parallel to APP_REGISTRY — manifests are static JSON imported at build time.
 */
export const WIDGET_REGISTRY: Record<string, WidgetManifest> = {
    spotify: spotifyManifest as WidgetManifest,
};
