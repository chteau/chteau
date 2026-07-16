"use client";

// Dependencies
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from 'motion/react';
import { useCHTEAUSDK } from '../sdk/CHTEAUSDK';
import { useProcessManager } from '../runtime/ProcessManagerContext';
import { APP_REGISTRY } from '../runtime/appRegistry';
import { resolveIcon } from '../runtime/iconResolver';
import { ArrowLeft, SquareStack, Wifi, SignalHigh, BatteryFull, Monitor, Power, X } from 'lucide-react';
import MobileAppHost from './MobileAppHost';
import type { OSProcess } from '../types/process';
import type { AppManifest } from '../types/manifest';

/** Fallback tile color for apps that don't declare a manifest `mobileColor`. */
const DEFAULT_TILE_COLOR = '#3a3a3a';

/**
 * Some app icon assets bleed closer to their own canvas edge than others, so
 * rendering every icon at the same box size still reads as visually
 * mismatched. These per-app multipliers even out the apparent glyph size —
 * mobile shell only, doesn't affect the desktop icon resolver.
 */
const ICON_VISUAL_SCALE: Record<string, number> = {
    notepad: 1,
    explorer: 0.95,
    github: 0.85,
    roblox: 0.88,
};

/**
 * Input attributes for MobileView.
 */
interface MobileViewProps {
    onPowerOff: () => void;
    onToggleCRT: () => void;
    crtEnabled: boolean;
}

/**
 * Squircle app icon rendered with a per-app skeuomorphic gradient (manifest
 * `mobileColor`) — used on both the home-screen grid and the app switcher.
 *
 * @param appId - App id, resolves the icon glyph, color, and visual scale.
 * @param icon - Manifest icon name, forwarded to the icon resolver.
 * @param color - Manifest `mobileColor`, or the default tile color.
 * @param size - Tile edge length in pixels.
 * @param badge - Whether to render the small notification dot.
 */
function AppIconTile({
    appId,
    icon,
    color,
    size = 64,
    badge = false,
}: {
    appId: string;
    icon: string;
    color?: string;
    size?: number;
    badge?: boolean;
}) {
    const Icon = resolveIcon(icon, appId);
    const tileColor = color ?? DEFAULT_TILE_COLOR;
    const iconScale = ICON_VISUAL_SCALE[appId] ?? 1;

    return (
        <div
            className="relative border overflow-hidden flex items-center justify-center active:scale-95 transition-transform shadow-[0_4px_14px_rgba(0,0,0,0.35)]"
            style={{
                width: size,
                height: size,
                borderRadius: Math.round(size * 0.28),
                background: `linear-gradient(155deg, color-mix(in srgb, ${tileColor} 65%, white) 0%, ${tileColor} 55%, color-mix(in srgb, ${tileColor} 78%, black) 100%)`,
                borderColor: `color-mix(in srgb, ${tileColor} 55%, black)`,
            }}
        >
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />
            <Icon size={Math.round(size * 0.56 * iconScale)} className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
            {badge && (
                <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-black/30 z-20" />
            )}
        </div>
    );
}

/**
 * App switcher card. Tap re-opens the app; swiping it right (or tapping the
 * close chip) terminates its process. Dragging on the horizontal axis (while
 * the switcher grid itself only ever scrolls vertically) avoids fighting the
 * browser's native scroll gesture. A drag-vs-tap guard keeps a slightly
 * missed swipe from being read as a tap that reopens the app.
 *
 * @param proc - Running process backing this card.
 * @param meta - App manifest, for the icon glyph/color.
 * @param label - Localised app title.
 * @param onOpen - Re-opens the app and closes the switcher.
 * @param onClose - Terminates the process.
 */
function SwitcherCard({
    proc,
    meta,
    label,
    onOpen,
    onClose,
}: {
    proc: OSProcess;
    meta?: AppManifest;
    label: string;
    onOpen: () => void;
    onClose: () => void;
}) {
    const dragged = useRef(false);
    const x = useMotionValue(0);
    // Fades the icon/label toward the swipe direction — a visual cue that
    // releasing past the threshold will close the app. The close chip stays
    // fully opaque so it's always legible.
    const contentOpacity = useTransform(x, [0, 120], [1, 0.2]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: 140, scale: 0.85 }}
            transition={{ duration: 0.16 }}
            drag="x"
            style={{ x, touchAction: 'none' }}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.65}
            onDrag={(_e, info: PanInfo) => {
                if (Math.abs(info.offset.x) > 8) dragged.current = true;
            }}
            onDragEnd={(_e, info: PanInfo) => {
                if (info.offset.x > 55 || info.velocity.x > 450) onClose();
                setTimeout(() => { dragged.current = false; }, 0);
            }}
            onClick={() => {
                if (dragged.current) return;
                onOpen();
            }}
            whileTap={{ scale: 0.96 }}
            className="relative rounded-lg border border-white/15 bg-white/5 backdrop-blur-md p-4 flex flex-col items-center gap-2 cursor-pointer"
            id={`mobile-switcher-card-${proc.pid}`}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/65 border border-white/20 flex items-center justify-center text-white/80 hover:text-white cursor-pointer z-10"
                id={`mobile-switcher-close-${proc.pid}`}
            >
                <X size={15} />
            </button>
            <motion.div style={{ opacity: contentOpacity }} className="flex flex-col items-center gap-2">
                <AppIconTile appId={proc.appId} icon={meta?.icon ?? ''} color={meta?.mobileColor} size={48} />
                <span className="text-[10px] font-bold text-white truncate max-w-full">
                    {label}
                </span>
            </motion.div>
        </motion.div>
    );
}

/**
 * Handheld viewport (<=1024px) styled as its own original mobile OS shell —
 * a translucent status bar, a glass "widget" header, a skeuomorphic app-icon
 * grid, and a full-width gesture bar (back / home / app-switcher) — rather
 * than a shrunk clone of the desktop window manager. App rendering is
 * delegated to MobileAppHost, which builds the same injected runtime used
 * by the desktop window frames.
 *
 * @param props - CRT / power controls
 */
export default function MobileView({ onPowerOff, onToggleCRT, crtEnabled }: MobileViewProps) {
    const sdk = useCHTEAUSDK();
    const { state, dispatch } = useProcessManager();
    const [activeAppId, setActiveAppId] = useState<string | null>(null);
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState<string>('00:00');

    // Maintain mobile status clock
    useEffect(() => {
        /**
         * Refreshes the status-bar clock periodically.
         */
        const updateStats = () => {
            const now = new Date();
            setCurrentTime(
                now.getHours().toString().padStart(2, '0') + ':' +
                now.getMinutes().toString().padStart(2, '0')
            );
        };
        updateStats();
        const interval = setInterval(updateStats, 15000);
        return () => clearInterval(interval);
    }, []);

    // Installed apps for the home-screen grid — same source of truth as desktop.
    const apps = useMemo(() => Object.values(APP_REGISTRY), []);
    const runningProcesses = Object.values(state.processes);

    /**
     * Opens an installed app fullscreen, launching its process on first open.
     * Single-instance apps reuse their existing process via the reducer guard.
     *
     * @param appId - Target app id
     */
    const openApp = (appId: string) => {
        dispatch({ type: 'LAUNCH_APP', appId });
        setActiveAppId(appId);
        setSwitcherOpen(false);
    };

    /** Returns to the home screen without terminating the active app's process. */
    const goHome = () => {
        setActiveAppId(null);
        setSwitcherOpen(false);
    };

    /** Gesture-bar back action: closes the switcher, else backs out of the active app. */
    const goBack = () => {
        if (switcherOpen) {
            setSwitcherOpen(false);
            return;
        }
        if (activeAppId !== null) setActiveAppId(null);
    };

    /**
     * Terminates a running process from the app switcher. Auto-hides the
     * switcher once the last running app is closed.
     *
     * @param pid - Process id to close
     * @param appId - App id backing that process, to clear it if active
     */
    const closeProcess = (pid: number, appId: string) => {
        dispatch({ type: 'CLOSE_PROCESS', pid });
        if (activeAppId === appId) setActiveAppId(null);
        if (runningProcesses.length <= 1) setSwitcherOpen(false);
    };

    // Resolve the live process backing the active app (last launched wins).
    const activeProc = activeAppId
        ? runningProcesses.find(p => p.appId === activeAppId) ?? null
        : null;
    const activeAppMeta = activeAppId ? APP_REGISTRY[activeAppId] : null;

    const canGoBack = switcherOpen || activeAppId !== null;

    return (
        <div
            className="flex lg:hidden h-screen w-screen flex-col justify-between bg-transparent text-on-surface relative select-none font-mono"
            id="mobile-workspace"
        >
            {/* Top Status Bar */}
            <header className="h-9 bg-black/25 backdrop-blur-md flex items-center justify-between px-4 text-[10px] text-white/80 font-bold select-none shrink-0 z-50">
                <div className="flex items-center gap-1.5">
                    <span className="text-white font-black tracking-tighter">CHTEAU_MOBILE</span>
                </div>
                <div>
                    <span className="text-white text-xs tabular-nums">{currentTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px]">LTE</span>
                    <SignalHigh size={11} className="text-white/80" />
                    <Wifi size={11} className="text-white/80" />
                    <BatteryFull size={13} className="text-white/80" />
                </div>
            </header>

            {/* Screen Router Viewport */}
            <main className="grow relative overflow-hidden flex flex-col">
                <AnimatePresence>
                    {activeAppId === null ? (
                        /* Home Icon Screen */
                        <motion.div
                            key="home"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.18 }}
                            className="absolute inset-0 flex flex-col p-5 overflow-y-auto"
                        >
                            {/* Glass "widget" header — clock + portfolio tagline */}
                            <div className="rounded-lg bg-primary-container/60 backdrop-blur-xl border border-white/15 px-5 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)] shrink-0">
                                <div className="text-[9.5px] uppercase tracking-[0.2em] text-white/70 font-bold [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
                                    {sdk.t('welcome_subtitle')}
                                </div>
                                <div className="flex items-end justify-between mt-1">
                                    <h1 className="text-3xl italic font-black text-white tracking-tight [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
                                        {sdk.t('welcome_title')}
                                    </h1>
                                    <span className="text-xl font-bold text-white/90 tabular-nums [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
                                        {currentTime}
                                    </span>
                                </div>
                            </div>

                            {/* Skeuomorphic app-icon grid */}
                            <div className="grid grid-cols-4 gap-y-6 gap-x-3 justify-items-center pt-8">
                                {apps.map(app => (
                                    <button
                                        key={app.id}
                                        onClick={() => openApp(app.id)}
                                        className="flex flex-col items-center gap-1.5 cursor-pointer max-w-17.5 text-center"
                                        id={`mobile-btn-${app.id}`}
                                    >
                                        <AppIconTile appId={app.id} icon={app.icon} color={app.mobileColor} badge={app.desktopBadge} />
                                        <span className="text-[10px] tracking-tight text-white text-center font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
                                            {sdk.t(`desktop_${app.id}`)}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Quick toggles — compact control-center style pills */}
                            <div className="flex items-center justify-center gap-4 pt-10 pb-2 mt-auto">
                                <button
                                    onClick={onToggleCRT}
                                    className="flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/15 px-4 py-2 active:scale-95 transition-transform cursor-pointer"
                                    id="mobile-btn-crt-toggle"
                                >
                                    <Monitor size={13} className={crtEnabled ? 'text-yellow-300' : 'text-white/50'} />
                                    <span className="text-[9px] uppercase tracking-tight text-white/80 font-bold">
                                        {sdk.t('trackbar_crt')} {crtEnabled ? '[ON]' : '[OFF]'}
                                    </span>
                                </button>

                                <button
                                    onClick={onPowerOff}
                                    className="flex items-center gap-1.5 rounded-full bg-red-950/40 backdrop-blur-md border border-red-500/30 px-4 py-2 active:scale-95 transition-transform cursor-pointer"
                                    id="mobile-btn-power"
                                >
                                    <Power size={13} className="text-red-400 shrink-0" />
                                    <span className="text-[9px] uppercase tracking-wider font-bold text-red-400">
                                        {sdk.t('start_power')}
                                    </span>
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        /* ================== IN-APP STACK SHELL ================== */
                        <motion.div
                            key="app"
                            initial={{ x: '100vw', opacity: 0.9 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100vw', opacity: 0.9 }}
                            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
                            className="absolute inset-0 flex flex-col justify-between"
                            style={{
                                background: `linear-gradient(180deg, color-mix(in srgb, ${activeAppMeta?.mobileColor ?? DEFAULT_TILE_COLOR} 45%, black) 0%, #000 100%)`,
                            }}
                        >
                            {/* Slim in-app title bar — navigation lives in the gesture bar below */}
                            <div className="h-7 bg-black/40 backdrop-blur-md flex items-center justify-center text-[10px] text-white select-none shrink-0">
                                <span className="font-bold tracking-wider uppercase">
                                    {sdk.t(`desktop_${activeAppId}`)}
                                </span>
                            </div>

                            {/* Main viewport region for active application frame */}
                            <div className="grow overflow-hidden relative">
                                {activeProc ? (
                                    <MobileAppHost pid={activeProc.pid} />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-[10px] font-mono text-white/60 uppercase tracking-widest">
                                        Module unavailable
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* App switcher overlay — running processes, closeable/swipeable */}
                <AnimatePresence>
                    {switcherOpen && runningProcesses.length > 0 && (
                        <motion.div
                            key="switcher"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 24 }}
                            transition={{ duration: 0.16 }}
                            className="absolute inset-0 z-50 bg-black/85 backdrop-blur-lg p-5 overflow-y-auto"
                            id="mobile-app-switcher"
                        >
                            <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-4 text-center">
                                {sdk.t('start_programs')}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <AnimatePresence>
                                    {runningProcesses.map(proc => (
                                        <SwitcherCard
                                            key={proc.pid}
                                            proc={proc}
                                            meta={APP_REGISTRY[proc.appId]}
                                            label={sdk.t(`desktop_${proc.appId}`)}
                                            onOpen={() => {
                                                setActiveAppId(proc.appId);
                                                setSwitcherOpen(false);
                                            }}
                                            onClose={() => closeProcess(proc.pid, proc.appId)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Full-width gesture bar — back / home / app switcher */}
            <footer
                className="shrink-0 z-40 select-none bg-black/35 backdrop-blur-md border-t border-white/10"
                id="mobile-gesture-bar"
            >
                <div className="flex items-center justify-center gap-20 py-2.5">
                    <button
                        onClick={goBack}
                        className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors cursor-pointer ${canGoBack ? 'text-white/85 active:scale-90' : 'text-white/25 pointer-events-none'}`}
                        id="mobile-nav-back"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <button
                        onClick={goHome}
                        className="w-9 h-9 flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                        id="mobile-nav-home"
                    >
                        <div className="w-5 h-5 rounded-full border-2 border-white/85" />
                    </button>

                    <button
                        onClick={() => setSwitcherOpen(o => !o)}
                        className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors cursor-pointer active:scale-90 ${switcherOpen ? 'bg-white/20 text-white' : 'text-white/85'}`}
                        id="mobile-nav-switcher"
                    >
                        <SquareStack size={20} />
                    </button>
                </div>
            </footer>
        </div>
    );
}
