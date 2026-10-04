/**
 * Shell-level types for the CHTEAU SDK (i18n). Section-local types live
 * beside their section in `src/apps/*`.
 */

export type Language = 'en' | 'fr' | 'br';

/** Shared context attributes provided by the CHTEAU SDK. */
export interface CHTEAUSDKContextProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}
