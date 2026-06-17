"use client";

// Dependencies
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCHTEAUSDK } from '../sdk/CHTEAUSDK';
import { useProcessManager } from '../runtime/ProcessManagerContext';
import { FolderOpen, FileText, Terminal as TermIcon, Wifi, ChevronLeft, Home, Power } from 'lucide-react';
import MobileAppHost from './MobileAppHost';

/**
 * Input attributes for MobileView.
 */
interface MobileViewProps {
    onPowerOff: () => void;
    onToggleCRT: () => void;
    crtEnabled: boolean;
}

/**
 * Handheld viewport (<=1024px) providing fullscreen single-app navigation,
 * status bars, and a quick dock. App rendering is delegated to MobileAppHost,
 * which builds the same injected runtime used by the desktop window frames.
 *
 * @param props - CRT / power controls
 */
export default function MobileView({ onPowerOff, onToggleCRT, crtEnabled }: MobileViewProps) {
    const sdk = useCHTEAUSDK();
    const { state, dispatch } = useProcessManager();
    const [activeAppId, setActiveAppId] = useState<string | null>(null);
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

    /**
     * Opens an installed app fullscreen, launching its process on first open.
     * Single-instance apps reuse their existing process via the reducer guard.
     *
     * @param appId - Target app id
     */
    const openApp = (appId: string) => {
        dispatch({ type: 'LAUNCH_APP', appId });
        setActiveAppId(appId);
    };

    // Resolve the live process backing the active app (last launched wins).
    const activeProc = activeAppId
        ? Object.values(state.processes).find(p => p.appId === activeAppId) ?? null
        : null;

    /**
     * Uppercase title label for the active app header.
     *
     * @returns Active app title label
     */
    const getAppTitle = (): string => {
        if (activeAppId === 'notepad') return sdk.t('desktop_notepad').toUpperCase();
        if (activeAppId === 'explorer') return sdk.t('desktop_explorer').toUpperCase();
        if (activeAppId === 'terminal') return sdk.t('desktop_terminal').toUpperCase();
        return '';
    };

    return (
        <div
            className="flex lg:hidden h-screen w-screen flex-col justify-between bg-transparent text-on-surface relative select-none font-mono"
            id="mobile-workspace"
        >
            {/* Top Status Bar */}
            <header className="h-9 bg-surface-container border-b border-outline/30 flex items-center justify-between px-4 text-[10px] text-on-surface-variant font-bold select-none shrink-0 z-50">
                <div className="flex items-center gap-1.5">
                    <span className="text-white font-black tracking-tighter">CHTEAU_MOBILE</span>
                    <Wifi size={10} className="text-primary" />
                </div>
                <div>
                    <span className="text-white text-xs">{currentTime}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-[9px]">LTE</span>
                    <div className="flex items-center gap-0.5 border border-outline px-0.5 py-px h-3 w-5 relative">
                        <div className="bg-primary-container h-full w-[80%]" />
                        <div className="absolute top-0.5 -right-0.5 h-1.5 w-0.5 bg-outline" />
                    </div>
                </div>
            </header>

            {/* Screen Router Viewport */}
            <main className="grow relative overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">
                    {activeAppId === null ? (
                        /* Home Icon Screen */
                        <motion.div
                            key="home"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.18 }}
                            className="h-full w-full flex flex-col justify-between p-6 overflow-y-auto"
                        >
                            <div className="space-y-6">
                                {/* Welcome header */}
                                <div className="text-center font-serif py-4 border-b border-outline/25">
                                    <span className="text-[9.5px] tracking-widest text-shadow-outline font-mono block uppercase">{sdk.t('welcome_subtitle')}</span>
                                    <h1 className="text-3xl italic uppercase tracking-tighter font-black text-white">{sdk.t('welcome_title')}</h1>
                                </div>

                                {/* Navigation Launcher Nodes */}
                                <div className="grid grid-cols-4 gap-y-6 gap-x-3 pt-4 justify-items-center">

                                    {/* STORY icon */}
                                    <button
                                        onClick={() => openApp('notepad')}
                                        className="flex flex-col items-center gap-1.5 cursor-pointer max-w-17.5 text-center"
                                        id="mobile-btn-story"
                                    >
                                        <div className="w-14 h-14 bg-surface-container border border-outline flex items-center justify-center relative rounded-md active:scale-95 transition-all shadow-[2px_2px_0_black]">
                                            <FileText size={22} className="text-primary-container" />
                                            <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                                        </div>
                                        <span className="text-[10px] tracking-tighter text-on-surface text-center font-bold">
                                            {sdk.t('desktop_notepad')}
                                        </span>
                                    </button>

                                    {/* Projects icon */}
                                    <button
                                        onClick={() => openApp('explorer')}
                                        className="flex flex-col items-center gap-1.5 cursor-pointer max-w-17.5 text-center"
                                        id="mobile-btn-explorer"
                                    >
                                        <div className="w-14 h-14 bg-surface-container border border-outline flex items-center justify-center rounded-md active:scale-95 transition-all shadow-[2px_2px_0_black]">
                                            <FolderOpen size={22} className="text-primary-container" />
                                        </div>
                                        <span className="text-[10px] tracking-tighter text-on-surface text-center font-bold">
                                            {sdk.t('desktop_explorer')}
                                        </span>
                                    </button>

                                    {/* CORE_SYS icon */}
                                    <button
                                        onClick={() => openApp('terminal')}
                                        className="flex flex-col items-center gap-1.5 cursor-pointer max-w-17.5 text-center"
                                        id="mobile-btn-terminal"
                                    >
                                        <div className="w-14 h-14 bg-surface-container border border-outline flex items-center justify-center rounded-md active:scale-95 transition-all shadow-[2px_2px_0_black]">
                                            <TermIcon size={22} className="text-primary" />
                                        </div>
                                        <span className="text-[10px] tracking-tighter text-on-surface text-center font-bold">
                                            {sdk.t('desktop_terminal')}
                                        </span>
                                    </button>

                                </div>
                            </div>

                            {/* Utility parameters and Shutoff panel */}
                            <div className="space-y-3 pt-6 border-t border-outline/20 mt-12 text-left">
                                <button
                                    onClick={onToggleCRT}
                                    className="w-full py-2 border border-outline/40 hover:bg-surface-container text-xs flex items-center justify-between px-3 text-on-surface-variant active:scale-95 bg-surface-container-low transition-colors cursor-pointer"
                                    id="mobile-btn-crt-toggle"
                                >
                                    <span className="uppercase tracking-tight text-[10px]">{sdk.t('trackbar_crt')}</span>
                                    <span className={crtEnabled ? 'text-green-400 font-bold' : 'text-on-surface/40'}>
                                        {crtEnabled ? '[ON]' : '[OFF]'}
                                    </span>
                                </button>

                                <button
                                    onClick={onPowerOff}
                                    className="w-full py-2 border-2 border-red-950 bg-red-950/10 hover:bg-neutral-800 text-xs flex items-center justify-between px-3 text-red-400 hover:text-white transition-colors active:scale-95 cursor-pointer"
                                    id="mobile-btn-power"
                                >
                                    <span className="uppercase tracking-wider font-bold text-[9px]">{sdk.t('start_power')}</span>
                                    <Power size={11} className="shrink-0" />
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
                            className="absolute inset-0 bg-black flex flex-col justify-between"
                        >
                            {/* Back controls navigation subbar */}
                            <div className="h-8 bg-surface-container border-b border-outline/35 px-2.5 flex items-center justify-between text-[11px] text-on-surface-variant select-none">
                                <button
                                    onClick={() => setActiveAppId(null)}
                                    className="flex items-center gap-1 text-primary hover:text-white font-bold active:translate-y-[0.5px] cursor-pointer/80 cursor-pointer"
                                    id="mobile-app-close-control"
                                >
                                    <ChevronLeft size={14} strokeWidth={2.5} className="shrink-0" />
                                    <span>{sdk.t('start_programs')}</span>
                                </button>
                                <div className="font-bold tracking-wider text-white text-[10px] uppercase">
                                    {getAppTitle()}
                                </div>
                                <div className="w-10" />
                            </div>

                            {/* Main viewport region for active application frame */}
                            <div className="grow overflow-hidden relative">
                                {activeProc ? (
                                    <MobileAppHost pid={activeProc.pid} />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-[10px] font-mono text-on-surface-variant/50 uppercase tracking-widest">
                                        Module unavailable
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* FOOTER QUICK DOCK INDICES */}
            <footer className="h-11 bg-surface-container border-t-2 border-outline/60 flex items-center justify-around px-4 shrink-0 z-40 select-none">
                <button
                    onClick={() => openApp('notepad')}
                    className={`p-1.5 transition-colors cursor-pointer ${activeAppId === 'notepad' ? 'text-primary' : 'text-on-surface-variant/60'}`}
                    id="mobile-dock-btn-notepad"
                >
                    <FileText size={18} />
                </button>

                <button
                    onClick={() => openApp('explorer')}
                    className={`p-1.5 transition-colors cursor-pointer ${activeAppId === 'explorer' ? 'text-primary' : 'text-on-surface-variant/60'}`}
                    id="mobile-dock-btn-explorer"
                >
                    <FolderOpen size={18} />
                </button>

                <button
                    onClick={() => setActiveAppId(null)}
                    className="flex items-center justify-center p-2 rounded-full border border-outline bg-black text-primary-container hover:text-white transition-colors cursor-pointer active:scale-95"
                    id="mobile-dock-btn-home"
                >
                    <Home size={16} />
                </button>

                <button
                    onClick={() => openApp('terminal')}
                    className={`p-1.5 transition-colors cursor-pointer ${activeAppId === 'terminal' ? 'text-primary' : 'text-on-surface-variant/60'}`}
                    id="mobile-dock-btn-terminal"
                >
                    <TermIcon size={18} />
                </button>

            </footer>
        </div>
    );
}
