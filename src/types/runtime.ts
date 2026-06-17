// Dependencies
import type { ToastType } from './process';

/**
 * Injected capability surface handed to every running app instance.
 * Apps never reach into OS internals directly — they call through `runtime`.
 */
export interface ChteauRuntime {
    /** Scoped translator: resolves a key against this app's locale bundle. */
    t: (key: string) => string;

    /** Active OS locale code (e.g. 'en', 'fr', 'br'). */
    locale: string;
    process: { pid: number; appId: string; exit: () => void };

    window: {
        setTitle: (title: string) => void;
        minimize: () => void;
        maximize: () => void;
        close: () => void;
    };

    os: {
        notify: (title: string, body: string, type?: ToastType) => void;
        launch: (appId: string) => void;
        /** Persists a contact email back to the host shell. */
        registerEmail: (email: string) => void;
        ipc: {
            send: (targetPid: number, channel: string, data: unknown) => void;
            on: (channel: string, cb: (data: unknown) => void) => () => void;
        };
    };
}

/**
 * Props every Xero app component receives.
 */
export interface AppProps {
    runtime: ChteauRuntime;
}

/**
 * Factory signature consumed by `defineApp`.
 */
export type AppFactory = (props: AppProps) => React.JSX.Element;
