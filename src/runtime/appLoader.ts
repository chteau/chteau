// Dependencies
import dynamic from 'next/dynamic';
import type { AppProps } from '../types/runtime';

/**
 * Lazily-loaded app component map. Each app's bundle is code-split via
 * `next/dynamic` so an app's JS is only fetched when first launched.
 */
// A `loading` fallback gives next/dynamic its own local Suspense boundary.
// Without one, the lazy import suspends all the way up to the page's root
// boundary and briefly unmounts the entire OS shell (background, status
// bar, gesture bar) instead of just the app's own content area.
const NO_LOADING_UI = () => null;

export const APP_COMPONENTS: Record<string, React.ComponentType<AppProps>> = {
    notepad: dynamic(() => import('../apps/notepad/index'), { loading: NO_LOADING_UI }),
    explorer: dynamic(() => import('../apps/explorer/index'), { loading: NO_LOADING_UI }),
    github: dynamic(() => import('../apps/github/index'), { loading: NO_LOADING_UI }),
    roblox: dynamic(() => import('../apps/roblox/index'), { loading: NO_LOADING_UI }),
};
