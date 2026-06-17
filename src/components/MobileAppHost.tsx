"use client";

// Dependencies
import { useEffect, useMemo, useState, useCallback } from 'react';
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

/**
 * Props for the mobile fullscreen app host.
 */
interface MobileAppHostProps {
    /** Process id of the app to render fullscreen. */
    pid: number;
}

/**
 * Renders a single running process fullscreen for the mobile shell. Shares the
 * same locale loading + runtime construction + crash isolation as OSWindow,
 * minus the draggable window chrome (the mobile shell supplies its own header).
 *
 * @param props - Process id binding
 */
export default function MobileAppHost({ pid }: MobileAppHostProps) {
    const { state, dispatch, notify, registerEmail } = useProcessManager();
    const sdk = useCHTEAUSDK();
    const proc = state.processes[pid];
    const appId = proc?.appId;
    const locale = sdk.language;

    const [bundle, setBundle] = useState<LocaleBundle>({});
    const [localeLoading, setLocaleLoading] = useState(true);

    /**
     * Locale loading effect.
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
     * Translation function.
     */
    const t = useMemo(() => createScopedT(bundle), [bundle]);

    /**
     * Runtime builder.
     */
    const runtime = useMemo(() => {
        if (!appId) return null;

        return buildRuntime(pid, appId, locale, t, dispatch, {
            onNotify: notify,
            onRegisterEmail: registerEmail,
        });
    }, [pid, appId, locale, t, dispatch, notify, registerEmail]);

    /**
     * Crash handler.
     */
    const handleCrash = useCallback(
        (crashedPid: number) => dispatch({ type: 'MARK_CRASHED', pid: crashedPid }),
        [dispatch]
    );

    if (!proc) return null;

    const AppComponent = APP_COMPONENTS[proc.appId];

    if (localeLoading || !runtime || !AppComponent) {
        return (
            <div className="flex items-center justify-center h-full text-[10px] font-mono text-on-surface-variant/60 uppercase tracking-widest animate-pulse">
                Loading module...
            </div>
        );
    }

    return (
        <AppErrorBoundary pid={pid} appId={proc.appId} onCrash={handleCrash}>
            <AppComponent runtime={runtime} />
        </AppErrorBoundary>
    );
}
