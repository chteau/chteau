"use client";

// Dependencies
import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
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
    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);

        if (typeof window !== 'undefined') {
            localStorage.setItem('chteau_language', lang);
        }
    }, []);

    /**
     * Returns the translation for a given key in the current language.
     *
     * @param key The key to translate
     * @returns The translation for the given key
     */
    const t = useCallback((key: string): string => {
        const dict: Record<string, string> = TRANSLATIONS[language] ?? TRANSLATIONS['en'];
        return dict[key] ?? (TRANSLATIONS['en'] as Record<string, string>)[key] ?? key;
    }, [language]);

    const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

    return (
        <CHTEAUSDKContext.Provider value={value}>
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
