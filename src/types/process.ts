/**
 * Lifecycle phase of a live OS process.
 */
export type ProcessStatus = 'running' | 'minimized' | 'crashed';

/**
 * Severity / intent category of an OS notification toast.
 */
export type ToastType = 'info' | 'error' | 'success' | 'system';

/**
 * Geometric + depth state of a single window frame.
 */
export interface WindowState {
    x: number;
    y: number;
    width?: number;
    height?: number;
    isMaximized: boolean;
    zIndex: number;
}

/**
 * A single running application instance tracked by the ProcessManager.
 */
export interface OSProcess {
    pid: number;
    appId: string;
    status: ProcessStatus;
    windowState: WindowState;
    startedAt: number;
    title: string;
}

/**
 * Reducer-managed state for all live processes.
 */
export interface ProcessManagerState {
    processes: Record<number, OSProcess>;
    pidCounter: number;
    focusStack: number[];
}

/**
 * Discriminated action union driving the process reducer.
 */
export type ProcessManagerAction =
    | { type: 'LAUNCH_APP'; appId: string }
    | { type: 'CLOSE_PROCESS'; pid: number }
    | { type: 'MINIMIZE_PROCESS'; pid: number }
    | { type: 'MAXIMIZE_PROCESS'; pid: number }
    | { type: 'RESTORE_PROCESS'; pid: number }
    | { type: 'FOCUS_PROCESS'; pid: number }
    | { type: 'MOVE_WINDOW'; pid: number; x: number; y: number }
    | { type: 'RESIZE_WINDOW'; pid: number; width: number; height: number }
    | { type: 'SET_TITLE'; pid: number; title: string }
    | { type: 'MARK_CRASHED'; pid: number };
