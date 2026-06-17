import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { WidgetProps } from '../types/widget';

/**
 * Async map of widget components, loaded on demand via next/dynamic.
 * Parallel to APP_COMPONENTS — mirrors the appLoader pattern.
 */
export const WIDGET_COMPONENTS: Record<string, ComponentType<WidgetProps>> = {
    spotify: dynamic(() => import('../widgets/spotify'), { ssr: false }),
};
