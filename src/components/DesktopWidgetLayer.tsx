"use client";

import { Suspense } from 'react';
import { useWidgetManager } from '../runtime/WidgetManagerContext';
import { WIDGET_REGISTRY } from '../runtime/widgetRegistry';
import { WIDGET_COMPONENTS } from '../runtime/widgetLoader';
import WidgetFrame from './WidgetFrame';

/**
 * Desktop layer that renders all visible widgets as draggable gadgets.
 * Sits between desktop icons (z-10) and OS windows (z-20).
 */
export default function DesktopWidgetLayer() {
    const { state } = useWidgetManager();

    return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
            <div className="relative w-full h-full pointer-events-none">
                {Object.entries(WIDGET_REGISTRY).map(([widgetId, manifest]) => {
                    const WidgetComponent = WIDGET_COMPONENTS[widgetId];
                    const widgetState = state[widgetId];

                    if (!widgetState?.visible || !WidgetComponent) return null;

                    return (
                        <WidgetFrame
                            key={widgetId}
                            widgetId={widgetId}
                            name={manifest.name}
                            width={manifest.defaultSize.width}
                            height={manifest.defaultSize.height}
                        >
                            <Suspense fallback={
                                <div className="flex items-center justify-center h-full text-[9px] font-mono text-on-surface-variant/30 uppercase tracking-widest animate-pulse">
                                    Loading...
                                </div>
                            }>
                                <WidgetComponent widgetId={widgetId} />
                            </Suspense>
                        </WidgetFrame>
                    );
                })}
            </div>
        </div>
    );
}
