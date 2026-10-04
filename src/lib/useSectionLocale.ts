"use client";

import { useEffect, useState } from 'react';
import { useCHTEAUSDK } from '../sdk/CHTEAUSDK';
import { loadSectionLocale, createScopedT, type LocaleBundle } from './localeResolver';

/**
 * Loads a section's locale bundle for the active CHTEAU SDK language and
 * returns a scoped translator bound to it, re-resolving whenever the
 * language changes.
 *
 * @param sectionId - Registered section id (matches a key in `LOCALE_IMPORTERS`)
 */
export function useSectionLocale(sectionId: string) {
    const { language } = useCHTEAUSDK();
    const [bundle, setBundle] = useState<LocaleBundle>({});

    useEffect(() => {
        let active = true;
        loadSectionLocale(sectionId, language).then((b) => {
            if (active) setBundle(b);
        });
        return () => { active = false; };
    }, [sectionId, language]);

    return { t: createScopedT(bundle), bundle };
}
