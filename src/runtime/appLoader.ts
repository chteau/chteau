// Dependencies
import dynamic from 'next/dynamic';
import type { AppProps } from '../types/runtime';

/**
 * Lazily-loaded app component map. Each app's bundle is code-split via
 * `next/dynamic` so an app's JS is only fetched when first launched.
 */
export const APP_COMPONENTS: Record<string, React.ComponentType<AppProps>> = {
    notepad: dynamic(() => import('../apps/notepad/index')),
    explorer: dynamic(() => import('../apps/explorer/index')),
    github: dynamic(() => import('../apps/github/index')),
};
