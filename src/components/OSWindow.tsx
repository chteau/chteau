"use client";

// Dependencies
import { useEffect, useRef, useMemo, useState, useCallback, Suspense } from 'react';
import { motion, useDragControls, useMotionValue, type PanInfo } from 'motion/react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { useProcessManager } from '../runtime/ProcessManagerContext';
import { useCHTEAUSDK } from '../sdk/CHTEAUSDK';
import { APP_COMPONENTS } from '../runtime/appLoader';
import { buildRuntime } from '../runtime/buildRuntime';
import {
    loadAppLocale,
    createScopedT,
    type LocaleBundle,
} from '../runtime/localeResolver';
import AppErrorBoundary from './AppErrorBoundary';

const TASKBAR_HEIGHT = 40;

/**
 * Props for a process-bound window frame.
 */
interface OSWindowProps {
    /** Process id this window renders. Drives all state from the manager. */
    pid: number;
}

/**
 * Floating, draggable window frame bound to a single OS process. Reads window
 * geometry/status from the ProcessManager, loads the app's locale bundle,
 * builds the injected runtime, and renders the app inside a crash boundary.
 *
 * Minimized windows stay mounted (display:none) to preserve in-app state.
 *
 * @param props - Process id binding
 */
export default function OSWindow({ pid }: OSWindowProps) {
    const { state, dispatch, notify, registerEmail } = useProcessManager();
    const sdk = useCHTEAUSDK();

    const dragControls = useDragControls();
    const motionX = useMotionValue(0);
    const motionY = useMotionValue(0);
    const pendingDragEvent = useRef<PointerEvent | null>(null);

    const proc = state.processes[pid];
    const locale = sdk.language;
    const isMaximizedValue = proc?.windowState.isMaximized ?? false;

    // Clear residual drag transform when maximized so the fixed overlay lands
    // exactly at top:0 left:0 regardless of prior drag history.
    useEffect(() => {
        if (isMaximizedValue) {
            motionX.set(0);
            motionY.set(0);
        }
    }, [isMaximizedValue, motionX, motionY]);

    // After MAXIMIZE_PROCESS un-maximizes (isMaximizedValue flips to false) and
    // the motion.div re-renders with drag={true}, fire the stored pointer event
    // so the drag starts immediately without requiring a new pointer-down.
    useEffect(() => {
        if (!isMaximizedValue && pendingDragEvent.current) {
            const evt = pendingDragEvent.current;
            pendingDragEvent.current = null;
            dragControls.start(evt);
        }
    }, [isMaximizedValue, dragControls]);

    // Load the app's locale bundle whenever the process or OS locale changes.
    const [bundle, setBundle] = useState<LocaleBundle>({});
    const [localeLoading, setLocaleLoading] = useState(true);

    const appId = proc?.appId;

    /**
     * Loads the app's locale bundle.
     */
    useEffect(() => {
        if (!appId) return;
        let active = true;

        setLocaleLoading(true);
        loadAppLocale(appId, locale).then((b) => {
            if (!active) return;
            setBundle(b);
            setLocaleLoading(false);
        });

        return () => {
            active = false;
        };
    }, [appId, locale]);

    /**
     * Scoped translator for both the title bar and the app itself.
     */
    const t = useMemo(() => createScopedT(bundle), [bundle]);

    /**
     * Build the runtime once per (pid, locale, t) so app effects keying on
     * `runtime` don't re-fire on unrelated parent re-renders.
     */
    const runtime = useMemo(() => {
        if (!appId) return null;
        return buildRuntime(pid, appId, locale, t, dispatch, {
            onNotify: notify,
            onRegisterEmail: registerEmail,
        });
    }, [pid, appId, locale, t, dispatch, notify, registerEmail]);

    /**
     * Marks a process crashed when its app throws past the error boundary.
     */
    const handleCrash = useCallback(
        (crashedPid: number) => dispatch({ type: 'MARK_CRASHED', pid: crashedPid }),
        [dispatch]
    );

    /**
     * Persists the final window position after a drag completes.
     */
    const handleDragEnd = useCallback(
        (_e: unknown, info: PanInfo) => {
            if (!proc) return;
            dispatch({
                type: 'MOVE_WINDOW',
                pid,
                x: Math.round(proc.windowState.x + info.offset.x),
                y: Math.round(proc.windowState.y + info.offset.y),
            });
            motionX.set(0);
            motionY.set(0);
        },
        [dispatch, pid, proc, motionX, motionY]
    );

    if (!proc) return null;

    const { windowState, status } = proc;
    const { x, y, width, height, isMaximized, zIndex } = windowState;
    const isMinimized = status === 'minimized';

    const AppComponent = APP_COMPONENTS[proc.appId];
    const title = (bundle['app_title'] as string) || proc.title;

    const windowStyle = isMaximized
        ? {
            top: 0,
            left: 0,
            width: '100vw',
            height: `calc(100vh - ${TASKBAR_HEIGHT}px)`,
            zIndex,
        }
        : {
            top: y,
            left: x,
            width: width ?? 'min(820px, calc(100vw - 2.5rem))',
            height: height ?? 'min(580px, calc(100vh - 5rem))',
            zIndex,
        };

    return (
        <motion.div
            key={pid}
            initial={isMaximized ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            drag={!isMaximized}
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            onDragEnd={handleDragEnd}
            onPointerDown={() => dispatch({ type: 'FOCUS_PROCESS', pid })}
            className={`${isMaximized ? 'fixed' : 'absolute'} os-window flex flex-col overflow-hidden select-none pointer-events-auto`}
            style={{ x: motionX, y: motionY, ...windowStyle, ...(isMinimized ? { display: 'none' } : null) }}
            id={`os-window-${proc.appId}`}
        >
            {/* Title Bar dragging handle zone */}
            <div
                onPointerDown={(e) => {
                    dispatch({ type: 'FOCUS_PROCESS', pid });
                    if (!isMaximized) dragControls.start(e);
                }}
                onPointerMove={(e) => {
                    if (!isMaximized || e.buttons === 0 || pendingDragEvent.current) return;
                    pendingDragEvent.current = e.nativeEvent;
                    dispatch({ type: 'MAXIMIZE_PROCESS', pid });
                }}
                onDoubleClick={() => dispatch({ type: 'MAXIMIZE_PROCESS', pid })}
                className="os-title-bar flex items-center justify-between select-none py-1 px-2 cursor-move text-white active:cursor-grabbing"
                id={`window-title-bar-${proc.appId}`}
            >
                <div className="flex items-center gap-2 pointer-events-none">
                    <span className="text-[11px] font-bold flex items-center gap-1.5 drop-shadow">
                        {title}
                    </span>
                </div>

                {/* Window controls — XP-style rounded gradient buttons */}
                <div className="flex items-center gap-0.5">

                    {/* Minimize button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: 'MINIMIZE_PROCESS', pid });
                        }}
                        className="w-5.5 h-5 flex items-center justify-center transition-all active:translate-y-px cursor-pointer hover:brightness-110"
                        style={{ background: 'linear-gradient(180deg, #a8c8e8 0%, #5898d0 40%, #3878c0 100%)', border: '1px solid #1555b0', boxShadow: '0 1px 2px rgba(0,0,0,0.35)' }}
                        title="Minimize"
                        id={`window-btn-minimize-${proc.appId}`}
                    >
                        <Minus size={9} strokeWidth={3} />
                    </button>

                    {/* Maximize button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: 'MAXIMIZE_PROCESS', pid });
                        }}
                        className="w-5.5 h-5 flex items-center justify-center transition-all active:translate-y-px cursor-pointer hover:brightness-110"
                        style={{ background: 'linear-gradient(180deg, #a8c8e8 0%, #5898d0 40%, #3878c0 100%)', border: '1px solid #1555b0', boxShadow: '0 1px 2px rgba(0,0,0,0.35)' }}
                        title={isMaximized ? 'Restore' : 'Maximize'}
                        id={`window-btn-maximize-${proc.appId}`}
                    >
                        {isMaximized ? (
                            <Copy size={9} strokeWidth={3} className="rotate-180" />
                        ) : (
                            <Square size={9} strokeWidth={3} />
                        )}
                    </button>

                    {/* Close button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: 'CLOSE_PROCESS', pid });
                        }}
                        className="w-5.5 h-5 flex items-center justify-center transition-all active:translate-y-px cursor-pointer hover:brightness-110"
                        style={{ background: 'linear-gradient(180deg, #f0a090 0%, #e04030 40%, #b82020 100%)', border: '1px solid #901818', boxShadow: '0 1px 2px rgba(0,0,0,0.35)' }}
                        title="Close"
                        id={`window-btn-close-${proc.appId}`}
                    >
                        <X size={9} strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grow flex flex-col overflow-hidden bg-white text-on-surface" id={`window-body-${proc.appId}`}>
                {localeLoading || !runtime || !AppComponent ? (
                    <div className="flex items-center justify-center h-full text-[10px] font-mono text-on-surface-variant/60 uppercase tracking-widest animate-pulse">
                        Loading module...
                    </div>
                ) : (
                    <Suspense fallback={
                        <div className="flex items-center justify-center h-full text-[10px] font-mono text-on-surface-variant/60 uppercase tracking-widest animate-pulse">
                            Loading module...
                        </div>
                    }>
                        <AppErrorBoundary pid={pid} appId={proc.appId} onCrash={handleCrash}>
                            <AppComponent runtime={runtime} />
                        </AppErrorBoundary>
                    </Suspense>
                )}
            </div>
        </motion.div>
    );
}
