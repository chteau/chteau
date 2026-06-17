/**
 * Legacy shell-level types retained for the CHTEAU SDK, toasts, terminal
 * lines, and gallery assets. App-package types live in the sibling modules.
 */

/**
 * Single line of dialogue or diagnostic inside the terminal emulator.
 */
export interface TerminalLine {
    text: string;
    type: 'input' | 'output' | 'error' | 'success' | 'system';
    timestamp: string;
}

/**
 * Retro slide-out notification toast model.
 */
export interface ToastMessage {
    id: string;
    title: string;
    description: string;
    type: 'info' | 'error' | 'success' | 'system';
    duration?: number;
}

export type Language = 'en' | 'fr' | 'br';

/**
 * Shared context attributes provided by the CHTEAU OS SDK.
 */
export interface CHTEAUSDKContextProps {
    toasts: ToastMessage[];
    launchToast: (title: string, description: string, type?: 'info' | 'error' | 'success' | 'system', duration?: number) => void;
    removeToast: (id: string) => void;
    registerEmailAddress: (email: string) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}
