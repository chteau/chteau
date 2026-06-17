// Dependencies
import notepadManifest from '../apps/notepad/manifest.json';
import explorerManifest from '../apps/explorer/manifest.json';
import githubManifest from '../apps/github/manifest.json';
import robloxManifest from '../apps/roblox/manifest.json';
import type { AppManifest } from '../types/manifest';

/**
 * Synchronous registry of installed app packages, keyed by app id.
 * Manifests are static JSON imported at build time — no async lookup needed
 * for icon/window/permission metadata.
 */
export const APP_REGISTRY: Record<string, AppManifest> = {
    notepad: notepadManifest as AppManifest,
    explorer: explorerManifest as AppManifest,
    github: githubManifest as AppManifest,
    roblox: robloxManifest as AppManifest,
};
