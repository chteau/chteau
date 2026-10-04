"use client";

import { useCHTEAUSDK } from '../sdk/CHTEAUSDK';
import type { Language } from '../types';

const LANGUAGES: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'br', label: 'BR' },
];

/** Discreet corner language switcher — three letters, no chrome. */
export default function LanguageSwitcher() {
    const { language, setLanguage } = useCHTEAUSDK();

    return (
        <div className="absolute top-4 right-4 z-40 glass-chip flex items-center gap-0.5 p-1" id="language-switcher">
            {LANGUAGES.map(({ code, label }) => (
                <button
                    key={code}
                    onClick={() => setLanguage(code)}
                    className={`px-2.5 py-1 text-[10px] font-bold tracking-wide transition-colors cursor-pointer ${
                        language === code ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    id={`language-btn-${code}`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
