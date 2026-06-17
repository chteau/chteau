"use client";

// Dependencies
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ToastMessage, CHTEAUSDKContextProps, Language } from '../types';
import { TRANSLATIONS } from '../data';

/**
 * React Context containing core operating system SDK systems like message toasts and translations.
 */
const CHTEAUSDKContext = createContext<CHTEAUSDKContextProps | undefined>(undefined);

interface CHTEAUSDKProviderProps {
    children: ReactNode;
    onAddEmailAddress: (email: string) => void;
}

/**
 * Provider wrapping the primary viewport to activate modular SDK protocols.
 *
 * @param {CHTEAUSDKProviderProps} props - Configuration inputs containing children nodes
 * @returns {React.ReactElement} - Decorated children node with interactive SDK features
 */
export function CHTEAUSDKProvider({ children, onAddEmailAddress }: CHTEAUSDKProviderProps) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [language, setLanguageState] = useState<Language>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('chteau_language') as Language;
            if (saved === 'en' || saved === 'fr' || saved === 'br') return saved;
        }

        return 'en';
    });

    /**
     * Changes the current language.
     * 
     * @param lang The target language
     */
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);

        if (typeof window !== 'undefined') {
            localStorage.setItem('chteau_language', lang);
        }
    };

    /**
     * Returns the translation for a given key in the current language.
     * 
     * @param key The key to translate
     * @returns The translation for the given key
     */
    const t = (key: string): string => {
        const dict = TRANSLATIONS[language] || TRANSLATIONS['en'];
        return (dict as any)[key] || (TRANSLATIONS['en'] as any)[key] || key;
    };

    /**
     * Removes a specific notification message by identifier.
     * 
     * @param id The identifier of the toast to remove
     */
    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    /**
     * Triggers a slide-out retro notification toast from the screen corner.
     * 
     * @param title The title of the toast
     * @param description The description of the toast
     * @param type The type of the toast
     * @param duration The duration of the toast
     */
    const launchToast = (
        title: string,
        description: string,
        type: 'info' | 'error' | 'success' | 'system' = 'info',
        duration = 5000
    ) => {
        // Check if we should allow toasts to prevent redundant noise
        // Critical system errors and success indicators are kept, but standard ones are minimized
        const id = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const newToast: ToastMessage = { id, title, description, type, duration };

        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    };

    /**
     * Registers a digital message node link.
     * 
     * @param email The email address to register
     */
    const registerEmailAddress = (email: string) => {
        onAddEmailAddress(email);
        launchToast(
            'SIGNAL CONNECTED',
            `Address ${email} registered.`,
            'success',
            4000
        );
    };

    return (
        <CHTEAUSDKContext.Provider value={{ toasts, launchToast, removeToast, registerEmailAddress, language, setLanguage, t }}>
            {children}
        </CHTEAUSDKContext.Provider>
    );
}

/**
 * Access hook providing custom functions for applications to use Chteau OS capabilities.
 *
 * @returns {CHTEAUSDKContextProps} - Core operating capabilities
 */
export function useCHTEAUSDK(): CHTEAUSDKContextProps {
    const context = useContext(CHTEAUSDKContext);
    if (!context) {
        throw new Error('useCHTEAUSDK must be utilized within a valid CHTEAUSDKProvider stack.');
    }
    return context;
}
