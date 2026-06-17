"use client";

import { useCallback, type ReactNode } from 'react';
import { motion, useDragControls, useMotionValue, type PanInfo } from 'motion/react';
import { GripHorizontal } from 'lucide-react';
import { useWidgetManager } from '../runtime/WidgetManagerContext';

interface WidgetFrameProps {
    widgetId: string;
    name: string;
    children: ReactNode;
    width: number;
    height: number;
}

/**
 * Draggable desktop gadget frame — the Windows XP-style container for widgets.
 * Handles drag-to-reposition via Framer Motion and hides via WidgetManager.
 */
export default function WidgetFrame({ widgetId, name, children, width, height }: WidgetFrameProps) {
    const { state, dispatch } = useWidgetManager();
    const dragControls = useDragControls();
    const dragX = useMotionValue(0);
    const dragY = useMotionValue(0);
    const widgetState = state[widgetId];

    const handleDragEnd = useCallback(
        (_e: unknown, info: PanInfo) => {
            if (!widgetState) return;
            dispatch({
                type: 'MOVE_WIDGET',
                widgetId,
                x: Math.round(widgetState.x + info.offset.x),
                y: Math.round(widgetState.y + info.offset.y),
            });
            // Reset Framer's internal transform so it doesn't stack on top of the new CSS position
            dragX.set(0);
            dragY.set(0);
        },
        [dispatch, widgetId, widgetState, dragX, dragY]
    );

    if (!widgetState?.visible) return null;

    return (
        <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute select-none pointer-events-auto"
            style={{
                top: widgetState.y,
                left: widgetState.x,
                x: dragX,
                y: dragY,
                width,
                height,
                zIndex: 15,
            }}
        >
            <div className="w-full h-full flex flex-col border-2 border-primary/80 bg-surface shadow-[3px_3px_6px_rgba(0,0,0,0.5)] overflow-hidden">
                {/* Drag handle header — XP mini title bar */}
                <div
                    onPointerDown={(e) => dragControls.start(e)}
                    className="flex items-center justify-between px-2 py-1 cursor-move select-none shrink-0"
                    style={{ background: 'linear-gradient(180deg, #5994e3 0%, #1558b8 50%, #1060cc 100%)' }}
                >
                    <div className="flex items-center gap-1.5 pointer-events-none">
                        <GripHorizontal size={9} className="text-white/60" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white drop-shadow">
                            {name}
                        </span>
                    </div>
                </div>

                {/* Widget content */}
                <div className="flex-1 overflow-hidden min-h-0">
                    {children}
                </div>
            </div>
        </motion.div>
    );
}
