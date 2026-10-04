"use client";

// Dependencies
import { createContext, useContext, useState, ReactNode } from 'react';
import { CHTEAUSDKContextProps, Language } from '../types';
import { TRANSLATIONS } from '../data';

/** React Context carrying the galaxy site's shared state — language and translations. */
const CHTEAUSDKContext = createContext<CHTEAUSDKContextProps | undefined>(undefined);

interface CHTEAUSDKProviderProps {
    children: ReactNode;
}

/** Provides the shared SDK context (i18n) to the galaxy experience. */
export function CHTEAUSDKProvider({ children }: CHTEAUSDKProviderProps) {
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

    return (
        <CHTEAUSDKContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </CHTEAUSDKContext.Provider>
    );
}

/** Access hook for the shared SDK context — must be used within `CHTEAUSDKProvider`. */
export function useCHTEAUSDK(): CHTEAUSDKContextProps {
    const context = useContext(CHTEAUSDKContext);
    if (!context) {
        throw new Error('useCHTEAUSDK must be utilized within a valid CHTEAUSDKProvider stack.');
    }
    return context;
}
