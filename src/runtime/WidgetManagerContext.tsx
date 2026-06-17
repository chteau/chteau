"use client";

import {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useCallback,
    type ReactNode,
    type Dispatch,
} from 'react';
import type { WidgetManagerState, WidgetManagerAction } from '../types/widget';
import { WIDGET_REGISTRY } from './widgetRegistry';

const STORAGE_KEY = 'chteau_widgets_v2';

const TASKBAR_H = 40;
const WIDGET_MARGIN = 20;

function buildDefaultState(): WidgetManagerState {
    const state: WidgetManagerState = {};
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 900;

    for (const [id, manifest] of Object.entries(WIDGET_REGISTRY)) {
        let x = manifest.defaultPosition.x;
        let y = manifest.defaultPosition.y;

        if (manifest.defaultAnchor === 'bottom-right') {
            x = vw - manifest.defaultSize.width - WIDGET_MARGIN;
            y = vh - manifest.defaultSize.height - TASKBAR_H - WIDGET_MARGIN;
        }

        state[id] = { x, y, visible: true };
    }
    return state;
}

function loadState(): WidgetManagerState {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored) as WidgetManagerState;
            // Merge with defaults so newly added widgets appear on first load
            const defaults = buildDefaultState();
            for (const id of Object.keys(defaults)) {
                if (!parsed[id]) parsed[id] = defaults[id];
            }
            return parsed;
        }
    } catch {}
    return buildDefaultState();
}

function widgetReducer(state: WidgetManagerState, action: WidgetManagerAction): WidgetManagerState {
    switch (action.type) {
        case 'SHOW_WIDGET':
            return { ...state, [action.widgetId]: { ...state[action.widgetId], visible: true } };
        case 'HIDE_WIDGET':
            return { ...state, [action.widgetId]: { ...state[action.widgetId], visible: false } };
        case 'TOGGLE_WIDGET': {
            const current = state[action.widgetId];
            return { ...state, [action.widgetId]: { ...current, visible: !current?.visible } };
        }
        case 'MOVE_WIDGET':
            return { ...state, [action.widgetId]: { ...state[action.widgetId], x: action.x, y: action.y } };
        case 'INIT':
            return action.state;
        default:
            return state;
    }
}

interface WidgetManagerContextValue {
    state: WidgetManagerState;
    dispatch: Dispatch<WidgetManagerAction>;
    toggleWidget: (widgetId: string) => void;
}

const WidgetManagerContext = createContext<WidgetManagerContextValue | null>(null);

export function WidgetManagerProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(widgetReducer, undefined, buildDefaultState);

    // Hydrate from localStorage after mount (avoids SSR mismatch)
    useEffect(() => {
        dispatch({ type: 'INIT', state: loadState() });
    }, []);

    // Persist to localStorage on every state change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {}
    }, [state]);

    const toggleWidget = useCallback((widgetId: string) => {
        dispatch({ type: 'TOGGLE_WIDGET', widgetId });
    }, []);

    return (
        <WidgetManagerContext.Provider value={{ state, dispatch, toggleWidget }}>
            {children}
        </WidgetManagerContext.Provider>
    );
}

export function useWidgetManager(): WidgetManagerContextValue {
    const ctx = useContext(WidgetManagerContext);
    if (!ctx) throw new Error('useWidgetManager must be used inside WidgetManagerProvider');
    return ctx;
}
