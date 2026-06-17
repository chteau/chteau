"use client";

// Dependencies
import { useState, useEffect } from 'react';

// Views
import DesktopView from './components/DesktopView';
import MobileView from './components/MobileView';

// Utilities
import CRTOverlay from './components/CRTOverlay';
import OSNotificationToasts from './components/OSNotificationToasts';
import ShaderBackground from './components/ShaderBackground';
import BootScreen from './components/BootScreen';

// SDKs & Runtimes
import { CHTEAUSDKProvider, useCHTEAUSDK } from './sdk/CHTEAUSDK';
import { ProcessManagerProvider } from './runtime/ProcessManagerContext';
import { WidgetManagerProvider } from './runtime/WidgetManagerContext';

// Icons
import { Power } from 'lucide-react';

/**
 * Chteau OS viewport rendering workspace. Window/process lifecycle is
 * owned by ProcessManagerProvider; this component handles only power state,
 * responsive layout, and CRT shaders.
 *
 * @returns Viewport with translated attributes
 */
function ChteauOSViewport({
    isPoweredOn,
    setIsPoweredOn,
}: {
    isPoweredOn: boolean;
    setIsPoweredOn: (val: boolean) => void;
}) {
    const sdk = useCHTEAUSDK();
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
    const [crtEnabled, setCrtEnabled] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

    // Track screen dimensions with tablet breakpoint of 1024px
    useEffect(() => {
        /**
         * Updates screen viewport states to trigger mobile layout transitions.
         */
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="w-screen h-screen bg-[#060606] text-on-surface select-none relative overflow-hidden flex flex-col justify-between" id="app-viewport">
            {/* Power Off State Frame — XP shutdown style */}
            {!isPoweredOn ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10000 p-6 text-center select-none" style={{ background: 'linear-gradient(180deg, #1a52c8 0%, #0a2878 100%)' }} id="power-off-screen">
                    <div className="mb-6 flex flex-col items-center gap-2">
                        <div className="w-16 h-16 border-4 border-white/30 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                            <Power size={28} className="text-white" strokeWidth={1.5} />
                        </div>
                    </div>

                    <h1 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Tahoma, Verdana, sans-serif' }}>
                        {sdk.t('power_title')}
                    </h1>
                    <p className="text-sm text-blue-200 max-w-xs leading-relaxed mb-8" style={{ fontFamily: 'Tahoma, Verdana, sans-serif' }}>
                        {sdk.t('power_desc')}
                    </p>

                    <button
                        onClick={() => setIsPoweredOn(true)}
                        className="flex items-center gap-2 text-white px-6 py-2 text-sm font-bold cursor-pointer active:scale-95 transition-all hover:brightness-110"
                        style={{ background: 'linear-gradient(180deg, #58c83a 0%, #3aa820 40%, #289015 100%)', border: '1px solid #1a6010', boxShadow: '0 2px 6px rgba(0,0,0,0.5)', fontFamily: 'Tahoma, Verdana, sans-serif' }}
                    >
                        <Power size={13} strokeWidth={2.5} />
                        <span>{sdk.t('power_btn')}</span>
                    </button>
                </div>
            ) : (
                /* Standard Main Operating Layout */
                <>
                    {/* Wallpaper Shader Background */}
                    <ShaderBackground />

                    {/* CRT Overlay screen visualizer (global filter) */}
                    <CRTOverlay
                        enabled={crtEnabled}
                        scanlines={true}
                        vignette={true}
                        flicker={!isMobile} // Disable flickers on mobile and tablets to reduce rendering cycles
                    />

                    {/* Windows Notification stack */}
                    <OSNotificationToasts />

                    {isMobile ? (
                        <MobileView
                            onPowerOff={() => setIsPoweredOn(false)}
                            onToggleCRT={() => setCrtEnabled(!crtEnabled)}
                            crtEnabled={crtEnabled}
                        />
                    ) : (
                        <DesktopView
                            onToggleCRT={() => setCrtEnabled(!crtEnabled)}
                            onPowerOff={() => setIsPoweredOn(false)}
                            crtEnabled={crtEnabled}
                        />
                    )}
                </>
            )}
        </div>
    );
}

/**
 * Bridges the CHTEAU SDK (toasts + email) into the ProcessManager so app
 * runtimes can notify and register emails. Lives inside both providers.
 *
 * @returns Wrapped viewport bound to the live process manager
 */
function ChteauOSShell({
    isPoweredOn,
    setIsPoweredOn,
}: {
    isPoweredOn: boolean;
    setIsPoweredOn: (val: boolean) => void;
}) {
    const sdk = useCHTEAUSDK();

    return (
        <ProcessManagerProvider
            onNotify={sdk.launchToast}
            onRegisterEmail={sdk.registerEmailAddress}
        >
            <WidgetManagerProvider>
                <ChteauOSViewport isPoweredOn={isPoweredOn} setIsPoweredOn={setIsPoweredOn} />
            </WidgetManagerProvider>
        </ProcessManagerProvider>
    );
}

/**
 * Main application bootstrapping entrypoint for Chteau OS.
 * Owns power state and email persistence; delegates window/process lifecycle
 * to the ProcessManager and toasts/language to the CHTEAU SDK.
 *
 * @example
 * <App />
 *
 * @returns Ground application layout wrapper
 */
export default function App() {
    const [isBooting, setIsBooting] = useState(true);
    const [isPoweredOn, setIsPoweredOn] = useState(true);

    // Local memory subscriber tracking registered link addresses
    const [registeredEmails, setRegisteredEmails] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('chteau_registered_emails');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    /**
     * Registers a unique email address to local device storage.
     *
     * @param email - Unique interface address
     */
    const handleRegisterEmail = (email: string) => {
        if (registeredEmails.includes(email)) return;
        const updated = [...registeredEmails, email];
        setRegisteredEmails(updated);
        try {
            localStorage.setItem('chteau_registered_emails', JSON.stringify(updated));
        } catch (e) {
            console.warn('Could not persist email link locally.', e);
        }
    };

    return (
        <>
            {isBooting && <BootScreen onDone={() => setIsBooting(false)} />}
            <CHTEAUSDKProvider onAddEmailAddress={handleRegisterEmail}>
                <ChteauOSShell isPoweredOn={isPoweredOn} setIsPoweredOn={setIsPoweredOn} />
            </CHTEAUSDKProvider>
        </>
    );
}
