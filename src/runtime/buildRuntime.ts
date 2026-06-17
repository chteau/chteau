// Dependencies
import type { ChteauRuntime, ToastType } from '../types';
import type { ProcessManagerAction } from '../types/process';
import { ipc } from './ipcSingleton';

/**
 * Host callbacks the runtime needs but which live outside the process reducer
 * (toasts + email registration are owned by the shell SDK).
 */
export interface RuntimeHostHooks {
    onNotify: (title: string, body: string, type?: ToastType) => void;
    onRegisterEmail: (email: string) => void;
}

/**
 * Constructs the capability surface handed to a single running app instance.
 * The pid is closed over so IPC subscriptions and lifecycle calls are always
 * scoped to the correct process without the app needing to know its own pid.
 *
 * @param pid - Process id this runtime belongs to
 * @param appId - App package id
 * @param locale - Active OS locale code
 * @param t - Scoped translator bound to the app's locale bundle
 * @param dispatch - Process manager dispatch
 * @param hooks - Shell-owned callbacks (notify / register email)
 */
export function buildRuntime(
    pid: number,
    appId: string,
    locale: string,
    t: (k: string) => string,
    dispatch: React.Dispatch<ProcessManagerAction>,
    hooks: RuntimeHostHooks
): ChteauRuntime {
    return {
        t,
        locale,

        process: {
            pid,
            appId,
            exit: () => dispatch({ type: 'CLOSE_PROCESS', pid }),
        },

        window: {
            setTitle: (title) => dispatch({ type: 'SET_TITLE', pid, title }),
            minimize: () => dispatch({ type: 'MINIMIZE_PROCESS', pid }),
            maximize: () => dispatch({ type: 'MAXIMIZE_PROCESS', pid }),
            close: () => dispatch({ type: 'CLOSE_PROCESS', pid }),
        },

        os: {
            notify: hooks.onNotify,
            launch: (targetAppId) => dispatch({ type: 'LAUNCH_APP', appId: targetAppId }),
            registerEmail: hooks.onRegisterEmail,
            ipc: {
                send: (targetPid, channel, data) => ipc.send(targetPid, channel, data),
                on: (channel, cb) => ipc.onFor(pid, channel, cb),
            },
        },
    };
}
