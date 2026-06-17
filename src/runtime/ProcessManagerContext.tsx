"use client";

// Dependencies
import React, {
    createContext,
    useContext,
    useReducer,
    useRef,
    useCallback,
    useMemo,
    ReactNode,
} from 'react';
import type {
    ProcessManagerState,
    ProcessManagerAction,
    ToastType,
} from '../types/process';
import { processReducer } from './processReducer';
import { ipc } from './ipcSingleton';

/**
 * Host-shell callbacks the runtime depends on but the reducer cannot own
 * (toasts + email persistence live in the CHTEAU SDK above this provider).
 */
export interface ProcessManagerContextValue {
    state: ProcessManagerState;
    dispatch: React.Dispatch<ProcessManagerAction>;
    notify: (title: string, body: string, type?: ToastType) => void;
    registerEmail: (email: string) => void;
}

const ProcessManagerContext = createContext<ProcessManagerContextValue | undefined>(
    undefined
);

const INITIAL_STATE: ProcessManagerState = {
    processes: {},
    pidCounter: 0,
    focusStack: [],
};

interface ProcessManagerProviderProps {
    children: ReactNode;
    onNotify: (title: string, body: string, type?: ToastType) => void;
    onRegisterEmail: (email: string) => void;
}

/**
 * Owns the process reducer and layers side-effecting middleware over raw
 * dispatch: closing a process also flushes its IPC subscriptions so dead
 * listeners cannot leak. Host callbacks are held in refs so `buildRuntime`
 * can read the freshest version without re-subscribing apps.
 *
 * @param props - children + shell-owned notify / email callbacks
 */
export function ProcessManagerProvider({
    children,
    onNotify,
    onRegisterEmail,
}: ProcessManagerProviderProps) {
    const [state, rawDispatch] = useReducer(processReducer, INITIAL_STATE);
    const notifyRef = useRef(onNotify);
    const registerEmailRef = useRef(onRegisterEmail);

    notifyRef.current = onNotify;
    registerEmailRef.current = onRegisterEmail;

    /**
     * Middleware dispatch. Runs the reducer, then performs side effects that
     * must happen on specific actions (IPC teardown on close).
     *
     * @param action - The action to dispatch
     */
    const dispatch = useCallback((action: ProcessManagerAction) => {
        rawDispatch(action);
        if (action.type === 'CLOSE_PROCESS') {
            ipc.cleanup(action.pid);
        }
    }, []);

    /**
     * Calls the current notify callback in a ref-stable wrapper.
     * 
     * @param title - The title of the notification
     * @param body - The body of the notification
     * @param type - The type of the notification
     */
    const notify = useCallback(
        (title: string, body: string, type?: ToastType) =>
            notifyRef.current(title, body, type),
        []
    );

    /**
     * Calls the current email-register callback in a ref-stable wrapper.
     * 
     * @param email - The email to register
     */
    const registerEmail = useCallback(
        (email: string) => registerEmailRef.current(email),
        []
    );

    /**
     * Memoizes the context value to avoid unnecessary re-renders.
     */
    const value = useMemo<ProcessManagerContextValue>(
        () => ({ state, dispatch, notify, registerEmail }),
        [state, dispatch, notify, registerEmail]
    );

    return (
        <ProcessManagerContext.Provider value={value}>
            {children}
        </ProcessManagerContext.Provider>
    );
}

/**
 * Hook exposing process state, dispatch, and stable host callbacks.
 */
export function useProcessManager(): ProcessManagerContextValue {
    const ctx = useContext(ProcessManagerContext);
    if (!ctx) {
        throw new Error(
            'useProcessManager must be used within a ProcessManagerProvider.'
        );
    }

    return ctx;
}
