// Dependencies
import type {
    OSProcess,
    ProcessManagerState,
    ProcessManagerAction,
} from '../types/process';
import { APP_REGISTRY } from './appRegistry';

/**
 * Base z-index floor. Windows are stacked `BASE + index * STEP` in
 * focus-stack order so the most recently focused window always wins.
 */
const Z_BASE = 100;
const Z_STEP = 2;

/**
 * Recomputes each process's zIndex from focus-stack ordering. The last pid
 * in the stack is on top. Processes not in the stack (minimized) keep their
 * existing zIndex — they're hidden anyway.
 * 
 * @param state - The current state
 * @returns The new state
 */
function rederiveZ(state: ProcessManagerState): Record<number, OSProcess> {
    const next = { ...state.processes };

    state.focusStack.forEach((pid, index) => {
        const proc = next[pid];

        if (!proc) return;
        next[pid] = {
            ...proc,
            windowState: { ...proc.windowState, zIndex: Z_BASE + index * Z_STEP },
        };
    });

    return next;
}

/**
 * Moves a pid to the top of the focus stack and re-derives z-indices.
 * Shared by FOCUS_PROCESS and the LAUNCH_APP single-instance guard.
 * 
 * @param state - The current state
 * @param pid - The pid of the process to focus
 * @returns The new state
 */
function focus(state: ProcessManagerState, pid: number): ProcessManagerState {
    if (!state.processes[pid]) return state;

    const focusStack = [...state.focusStack.filter((p) => p !== pid), pid];
    const intermediate: ProcessManagerState = { ...state, focusStack };

    return { ...intermediate, processes: rederiveZ(intermediate) };
}

/**
 * Pure reducer governing the lifecycle of every running app instance.
 * Side effects (IPC cleanup, toasts) live in the provider middleware — this
 * function only transforms state.
 * 
 * @param state - The current state
 * @param action - The action to dispatch
 * @returns The new state
 */
export function processReducer(
    state: ProcessManagerState,
    action: ProcessManagerAction
): ProcessManagerState {
    switch (action.type) {

        /**
         * Launches a new app instance.
         */
        case 'LAUNCH_APP': {
            const manifest = APP_REGISTRY[action.appId];

            if (!manifest) {
                // Unknown app id — ignore rather than crash the shell.
                return state;
            }

            // Single-instance guard: re-focus the existing running/minimized
            // instance instead of spawning a duplicate. Restore if minimized.
            if (!manifest.multiInstance) {
                const existing = Object.values(state.processes).find(
                    (p) => p.appId === action.appId
                );

                if (existing) {
                    const restored: ProcessManagerState = {
                        ...state,
                        processes: {
                            ...state.processes,
                            [existing.pid]: { ...existing, status: 'running' },
                        },
                    };

                    return focus(restored, existing.pid);
                }
            }

            const pid = state.pidCounter + 1;
            const newProcess: OSProcess = {
                pid,
                appId: manifest.id,
                status: 'running',
                title: manifest.name,
                startedAt: Date.now(),
                windowState: {
                    x: manifest.window.x,
                    y: manifest.window.y,
                    width: manifest.window.width,
                    height: manifest.window.height,
                    isMaximized: false,
                    zIndex: Z_BASE,
                },
            };

            const launched: ProcessManagerState = {
                ...state,
                pidCounter: pid,
                processes: { ...state.processes, [pid]: newProcess },
                focusStack: [...state.focusStack, pid],
            };

            return { ...launched, processes: rederiveZ(launched) };
        }

        /**
         * Brings an already-running process to the front.
         */
        case 'FOCUS_PROCESS':
            return focus(state, action.pid);

        /**
         * Hides a process behind the taskbar without terminating it.
         */
        case 'MINIMIZE_PROCESS': {
            const proc = state.processes[action.pid];
            if (!proc) return state;

            return {
                ...state,
                processes: {
                    ...state.processes,
                    [action.pid]: { ...proc, status: 'minimized' },
                },
                focusStack: state.focusStack.filter((p) => p !== action.pid),
            };
        }

        /**
         * Toggles a window between maximized and restored sizes.
         */
        case 'MAXIMIZE_PROCESS': {
            const proc = state.processes[action.pid];
            if (!proc) return state;

            return {
                ...state,
                processes: {
                    ...state.processes,
                    [action.pid]: {
                        ...proc,
                        windowState: {
                            ...proc.windowState,
                            isMaximized: !proc.windowState.isMaximized,
                        },
                    },
                },
            };
        }

        /**
         * Restores a minimized process to 'running' state and brings it to front.
         */
        case 'RESTORE_PROCESS': {
            const proc = state.processes[action.pid];
            if (!proc) return state;
            const restored: ProcessManagerState = {
                ...state,
                processes: {
                    ...state.processes,
                    [action.pid]: { ...proc, status: 'running' },
                },
            };

            return focus(restored, action.pid);
        }

        /**
         * Removes a process entirely and cleans up its stack position.
         */
        case 'CLOSE_PROCESS': {
            if (!state.processes[action.pid]) return state;

            const processes = { ...state.processes };
            delete processes[action.pid];

            return {
                ...state,
                processes,
                focusStack: state.focusStack.filter((p) => p !== action.pid),
            };
        }

        /**
         * Marks a process as crashed and keeps it visible for diagnostics.
         */
        case 'MARK_CRASHED': {
            const proc = state.processes[action.pid];
            if (!proc) return state;

            return {
                ...state,
                processes: {
                    ...state.processes,
                    [action.pid]: { ...proc, status: 'crashed' },
                },
            };
        }

        /**
         * Updates a window's top-left coordinates.
         */
        case 'MOVE_WINDOW': {
            const proc = state.processes[action.pid];
            if (!proc) return state;

            return {
                ...state,
                processes: {
                    ...state.processes,
                    [action.pid]: {
                        ...proc,
                        windowState: { ...proc.windowState, x: action.x, y: action.y },
                    },
                },
            };
        }

        /**
         * Updates a window's width and height.
         */
        case 'RESIZE_WINDOW': {
            const proc = state.processes[action.pid];
            if (!proc) return state;

            return {
                ...state,
                processes: {
                    ...state.processes,
                    [action.pid]: {
                        ...proc,
                        windowState: {
                            ...proc.windowState,
                            width: action.width,
                            height: action.height,
                        },
                    },
                },
            };
        }

        /**
         * Updates a window title string.
         */
        case 'SET_TITLE': {
            const proc = state.processes[action.pid];
            if (!proc) return state;

            return {
                ...state,
                processes: {
                    ...state.processes,
                    [action.pid]: { ...proc, title: action.title },
                },
            };
        }

        /**
         * Default: no-op for unknown actions.
         */
        default:
            return state;
    }
}
