"use client";

// Dependencies
import { useState, useEffect, useMemo } from 'react';
import OSWindow from './OSWindow';
import StartMenu from './StartMenu';
import { useCHTEAUSDK } from '../sdk/CHTEAUSDK';
import { useProcessManager } from '../runtime/ProcessManagerContext';
import { Monitor, Network } from 'lucide-react';
import { APP_REGISTRY } from '../runtime/appRegistry';
import { resolveIcon } from '../runtime/iconResolver';
import DesktopWidgetLayer from './DesktopWidgetLayer';

/**
 * Input attributes for DesktopView.
 */
interface DesktopViewProps {
    onToggleCRT: () => void;
    onPowerOff: () => void;
    crtEnabled: boolean;
}

/**
 * Desktop interface for wide screens: launcher icons, taskbar, clock, and the
 * live window layer. Icons come from the app registry; windows + taskbar are
 * driven entirely by the ProcessManager's process table.
 *
 * @param props - CRT / power controls
 */
export default function DesktopView({
    onToggleCRT,
    onPowerOff,
    crtEnabled,
}: DesktopViewProps) {
    const sdk = useCHTEAUSDK();
    const { state, dispatch } = useProcessManager();
    const [startMenuOpen, setStartMenuOpen] = useState(false);
    const [timeStr, setTimeStr] = useState('00:00:00');

    // Stable list of installed apps for launcher icons.
    const apps = useMemo(() => Object.values(APP_REGISTRY), []);
    const processes = Object.values(state.processes);

    // The topmost (focused) pid is the last entry of the focus stack.
    const activePid = state.focusStack[state.focusStack.length - 1] ?? null;

    // Launch notepad automatically on first desktop render
    useEffect(() => {
        dispatch({ type: 'LAUNCH_APP', appId: 'notepad' });
    }, []);

    // Maintain real-time taskbar clock
    useEffect(() => {
        /**
         * Refreshes the taskbar clock string each second.
         */
        const updateTime = () => {
            const now = new Date();
            setTimeStr(
                now.getHours().toString().padStart(2, '0') + ':' +
                now.getMinutes().toString().padStart(2, '0') + ':' +
                now.getSeconds().toString().padStart(2, '0')
            );
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className="hidden lg:block w-screen h-screen relative overflow-hidden bg-transparent select-none"
            onClick={() => setStartMenuOpen(false)}
            id="desktop-workspace"
        >
            {/* Desktop Grid Layout — auto-populated from APP_REGISTRY */}
            <div className="absolute top-0 left-0 p-8 grid grid-flow-row grid-rows-6 gap-6 w-fit z-10 select-none content-start">
                {apps.map(app => {
                    const Icon = resolveIcon(app.icon, app.id);
                    return (
                        <button
                            key={app.id}
                            onClick={() => dispatch({ type: 'LAUNCH_APP', appId: app.id })}
                            className="group desktop-icon flex flex-col items-center justify-center gap-1 p-2 w-20 cursor-pointer hover:bg-blue-500/25 text-center transition-all"
                            id={`desktop-icon-${app.id}`}
                        >
                            <div className="w-12 h-12 flex items-center justify-center relative">
                                <Icon
                                    size={32}
                                    className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-all duration-200 pointer-events-none"
                                />
                                {app.desktopBadge && (
                                    <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 animate-ping pointer-events-none" />
                                )}
                            </div>
                            <span className="text-[10px] text-white font-bold text-center px-0.5 truncate max-w-17.5 select-none pointer-events-none drop-shadow-[0_1px_3px_rgba(0,0,0,1)]">
                                {sdk.t(`desktop_${app.id}`)}
                            </span>
                        </button>
                    );
                })}

            </div>

            {/* Desktop Widget Layer — draggable gadgets, sits between icons and windows */}
            <DesktopWidgetLayer />

            {/* Window Viewports Portal Layer — one frame per live process */}
            <div className="absolute inset-0 pt-4 pb-12 px-24 z-20 pointer-events-none">
                <div className="relative w-full h-full pointer-events-none">
                    {processes.map(proc => (
                        <OSWindow key={proc.pid} pid={proc.pid} />
                    ))}
                </div>
            </div>

            {/* Start Button pop-up menu */}
            {startMenuOpen && (
                <StartMenu
                    onOpenApp={(appId) => dispatch({ type: 'LAUNCH_APP', appId })}
                    onToggleCRT={onToggleCRT}
                    onPowerOff={onPowerOff}
                    crtEnabled={crtEnabled}
                    onClose={() => setStartMenuOpen(false)}
                />
            )}

            {/* Taskbar Row Controls — Windows XP Luna Blue */}
            <footer
                className="fixed bottom-0 left-0 w-full h-10 z-1000 flex items-center px-1 justify-between select-none"
                style={{ background: 'linear-gradient(180deg, #3a78d8 0%, #2060c0 15%, #1852ae 85%, #1248a0 100%)', borderTop: '2px solid #5090e8' }}
            >
                <div className="flex items-center gap-1.5 h-full">
                    {/* XP-style green Start button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setStartMenuOpen(!startMenuOpen);
                        }}
                        className="flex items-center gap-1.5 text-white px-4 font-extrabold text-sm tracking-wide italic hover:brightness-110 active:brightness-90 active:translate-y-px cursor-pointer h-8"
                        style={{
                            background: startMenuOpen
                                ? 'linear-gradient(180deg, #289015 0%, #3aa820 40%, #2a9010 100%)'
                                : 'linear-gradient(180deg, #58c83a 0%, #3aa820 40%, #289015 100%)',
                            border: '1px solid #1a6010',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)',
                        }}
                        id="taskbar-btn-void"
                    >
                        <div className="w-4 h-4 shrink-0 opacity-90">
                            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="8" r="7" fill="white" fillOpacity="0.3"/>
                                <path d="M8 2 L14 8 L8 14 L2 8 Z" fill="white" fillOpacity="0.7"/>
                            </svg>
                        </div>
                        <span>{sdk.t('start_menu_btn')}</span>
                    </button>

                    <div className="h-6 w-px bg-white/20 mx-1" />

                    {/* Taskbar live process list — one tab per running process */}
                    <div className="hidden sm:flex items-center gap-1 max-w-[60vw]">
                        {processes.map((proc) => {
                            const isWinActive = activePid === proc.pid && proc.status !== 'minimized';
                            const appMeta = APP_REGISTRY[proc.appId];
                            const IconComp = resolveIcon(appMeta?.icon ?? '', proc.appId);
                            const tabName = appMeta ? sdk.t(`desktop_${proc.appId}`) : proc.title;

                            return (
                                <button
                                    key={proc.pid}
                                    onClick={() => {
                                        if (isWinActive) {
                                            dispatch({ type: 'MINIMIZE_PROCESS', pid: proc.pid });
                                        } else if (proc.status === 'minimized') {
                                            dispatch({ type: 'RESTORE_PROCESS', pid: proc.pid });
                                        } else {
                                            dispatch({ type: 'FOCUS_PROCESS', pid: proc.pid });
                                        }
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1 text-[11px] max-w-33.75 truncate font-bold text-left text-white cursor-pointer active:translate-y-px transition-all"
                                    style={isWinActive
                                        ? { background: 'linear-gradient(180deg, #1040a0 0%, #1c5cc0 100%)', border: '1px solid #0a2e80', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.45)' }
                                        : { background: 'linear-gradient(180deg, #4888d8 0%, #2060b8 100%)', border: '1px solid #1848a8', boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }
                                    }
                                    id={`taskbar-item-${proc.appId}-${proc.pid}`}
                                >
                                    <IconComp size={11} className="shrink-0" />
                                    <span className="truncate">{tabName}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* XP-style system tray */}
                <div
                    className="flex items-center gap-2.5 py-1.5 px-3.5 h-7 text-[10px] text-white select-none mr-1"
                    style={{ background: 'linear-gradient(180deg, #1840a8 0%, #0a2878 100%)', border: '1px solid #0a246a', boxShadow: 'inset 1px 1px 3px rgba(0,0,30,0.6)' }}
                >
                    <button
                        onClick={onToggleCRT}
                        className="flex items-center gap-1 text-[9px] hover:text-yellow-300 border-r border-white/20 pr-2.5 cursor-pointer transition-colors"
                        title="Toggle CRT Screen emission shader"
                        id="taskbar-btn-crt-toggle"
                    >
                        <Monitor size={11} className={crtEnabled ? 'text-yellow-300' : 'text-white/50'} />
                        <span className="lg:block hidden">{crtEnabled ? sdk.t('trackbar_crt') + ': ON' : sdk.t('trackbar_crt') + ': OFF'}</span>
                    </button>

                    <div className="flex items-center gap-1" title="Signal Active check">
                        <Network size={11} className="text-white/80 shrink-0" />
                        <span className="text-[9px] lg:block hidden">{sdk.t('trackbar_status')}</span>
                    </div>

                    <div className="h-4 w-px bg-white/20 lg:block hidden" />

                    <span className="font-bold text-white select-text">
                        {timeStr}
                    </span>
                </div>
            </footer>
        </div>
    );
}
