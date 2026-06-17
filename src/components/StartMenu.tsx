"use client";

// Dependencies
import { EyeOff, Power, Globe } from 'lucide-react';
import { useCHTEAUSDK } from '../sdk/CHTEAUSDK';
import { APP_REGISTRY } from '../runtime/appRegistry';
import { resolveIcon } from '../runtime/iconResolver';

/**
 * Interface representing the property constraints of the StartMenu component.
 */
interface StartMenuProps {
    onOpenApp: (appId: string) => void;
    onToggleCRT: () => void;
    onPowerOff: () => void;
    crtEnabled: boolean;
    onClose: () => void;
}

/**
 * Windows-style retro navigation start menu containing shortcuts to core application frames and OS preferences.
 *
 * @param {StartMenuProps} props - Configuration inputs and click listeners
 * @returns {React.ReactElement} - Interactive pop-up menu structure
 */
export default function StartMenu({ onOpenApp, onToggleCRT, onPowerOff, crtEnabled, onClose }: StartMenuProps) {
    const sdk = useCHTEAUSDK();

    /**
     * Dispatches the action to trigger app launching on item select.
     *
     * @param {string} appId - Identifier label of the target app
     * @returns {void}
     */
    const handleItemClick = (appId: string) => {
        onOpenApp(appId);
        onClose();
    };

    return (
        <div
            className="absolute bottom-11 left-1.5 w-72 select-none z-1001 overflow-hidden"
            style={{ background: '#ece9d8', border: '2px solid #0054e3', boxShadow: '4px 4px 10px rgba(0,0,0,0.5)' }}
            onClick={(e) => e.stopPropagation()}
            id="os-start-menu"
        >
            {/* Header banner */}
            <div
                className="flex items-center gap-3 px-3 py-2"
                style={{ background: 'linear-gradient(180deg, #2870d8 0%, #1252b8 100%)' }}
            >
                <div className="w-10 h-10 bg-white/20 flex items-center justify-center shrink-0 border-2 border-white/40">
                    <span className="text-white font-extrabold text-sm">C_</span>
                </div>
                <div>
                    <p className="text-white font-bold text-sm leading-tight">CHTEAU OS</p>
                    <p className="text-blue-200 text-[9px]">Portfolio · System</p>
                </div>
            </div>

            {/* Two-column XP layout */}
            <div className="flex min-h-0">
                {/* Left: pinned apps — white background */}
                <div className="flex-1 bg-white border-r border-[#b8d0f0] flex flex-col">
                    <div className="p-1 space-y-0.5 grow">
                        {Object.values(APP_REGISTRY).map(app => {
                            const Icon = resolveIcon(app.icon, app.id);
                            return (
                                <button
                                    key={app.id}
                                    onClick={() => handleItemClick(app.id)}
                                    className="w-full flex items-center gap-2.5 px-2 py-1.5 text-left text-[11px] text-black hover:text-white transition-colors cursor-pointer group"
                                    style={{ '--tw-hover-bg': '#3168c8' } as React.CSSProperties}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#3168c8')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                                    id={`start-menu-item-${app.id}`}
                                >
                                    <Icon size={16} className="shrink-0 text-blue-600 group-hover:text-white" />
                                    <div className="flex flex-col text-left">
                                        <span className="font-bold leading-tight">{sdk.t(`desktop_${app.id}`)}</span>
                                        <span className="text-[8px] opacity-60 group-hover:opacity-80">{app.name}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="border-t border-[#d0d0d0] p-1">
                        <button
                            onClick={() => { onToggleCRT(); onClose(); }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-[10px] text-black hover:text-white transition-colors cursor-pointer"
                            onMouseEnter={e => (e.currentTarget.style.background = '#3168c8')}
                            onMouseLeave={e => (e.currentTarget.style.background = '')}
                            id="start-menu-item-crt-toggle"
                        >
                            <EyeOff size={12} className="shrink-0" />
                            <span>{crtEnabled ? `Disable ${sdk.t('start_filter')}` : `Enable ${sdk.t('start_filter')}`}</span>
                        </button>
                    </div>
                </div>

                {/* Right: settings panel — light blue tint */}
                <div className="w-28 flex flex-col" style={{ background: '#d8e8f8' }}>
                    <div className="p-2 border-b border-[#b8cce8]">
                        <p className="text-[9px] font-bold text-primary-container uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Globe size={9} />
                            {sdk.t('start_language')}
                        </p>
                        <div className="flex gap-1">
                            {(['en', 'fr', 'br'] as const).map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => sdk.setLanguage(lang)}
                                    className="flex-1 text-center py-1 text-[9px] font-bold uppercase transition-all cursor-pointer"
                                    style={sdk.language === lang
                                        ? { background: '#1252b8', color: 'white', border: '1px solid #0a3090' }
                                        : { background: 'white', color: '#333', border: '1px solid #b0c8e8' }
                                    }
                                >
                                    {lang === 'en' ? 'EN' : lang === 'fr' ? 'FR' : 'BR'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* XP-style dark blue footer with Turn Off */}
            <div
                className="flex items-center justify-end gap-2 px-3 py-1.5"
                style={{ background: 'linear-gradient(180deg, #2870d8 0%, #1252b8 100%)', borderTop: '1px solid #4888e8' }}
            >
                <button
                    onClick={onPowerOff}
                    className="flex items-center gap-1.5 text-white text-[10px] font-bold px-3 py-1 cursor-pointer hover:brightness-110 transition-all"
                    style={{ background: 'linear-gradient(180deg, #e06050 0%, #b83020 100%)', border: '1px solid #801818', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
                    id="start-menu-item-logoff"
                >
                    <Power size={10} className="shrink-0" />
                    <span>{sdk.t('start_power')}</span>
                </button>
            </div>
        </div>
    );
}
