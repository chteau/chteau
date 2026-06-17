/**
 * A loaded app locale bundle. Values are strings, or string arrays for
 * multi-paragraph content blocks (rendered by the app itself).
 */
export type LocaleBundle = Record<string, string | string[]>;

type LocaleImporter = () => Promise<{ default: LocaleBundle }>;

/**
 * Explicit static import map. Next.js cannot statically analyze dynamic
 * template-literal imports, so every app/locale pair is registered here.
 * Adding a new app means adding its three locale importers below.
 */
const LOCALE_IMPORTERS: Record<string, Record<string, LocaleImporter>> = {
  notepad: {
    en: () => import('../apps/notepad/locales/en.json'),
    fr: () => import('../apps/notepad/locales/fr.json'),
    br: () => import('../apps/notepad/locales/br.json'),
  },
  explorer: {
    en: () => import('../apps/explorer/locales/en.json'),
    fr: () => import('../apps/explorer/locales/fr.json'),
    br: () => import('../apps/explorer/locales/br.json'),
  },
  github: {
    en: () => import('../apps/github/locales/en.json'),
    fr: () => import('../apps/github/locales/fr.json'),
    br: () => import('../apps/github/locales/br.json'),
  },
};

/**
 * Loads an app's locale bundle for the given locale, falling back to 'en'
 * if the requested locale file is missing or fails to load. Returns an empty
 * object only if both the requested locale and 'en' fail.
 *
 * @param appId - Registered app identifier
 * @param locale - Target locale code (e.g. 'fr')
 */
export async function loadAppLocale(
  appId: string,
  locale: string
): Promise<LocaleBundle> {
  const importers = LOCALE_IMPORTERS[appId];
  if (!importers) return {};

  const tryLoad = async (loc: string): Promise<LocaleBundle | null> => {
    const importer = importers[loc];
    if (!importer) return null;
    try {
      const mod = await importer();
      return mod.default ?? (mod as unknown as LocaleBundle);
    } catch {
      return null;
    }
  };

  const primary = await tryLoad(locale);
  if (primary) return primary;

  if (locale !== 'en') {
    const fallback = await tryLoad('en');
    if (fallback) return fallback;
  }

  return {};
}

/**
 * Builds a scoped translator bound to a loaded bundle. String keys resolve
 * to their value; missing keys return the key itself (so the UI degrades to
 * a readable token rather than `undefined`). Array-valued keys are not
 * returned here — apps read those via `getArray`.
 */
export function createScopedT(
  messages: LocaleBundle
): (key: string) => string {
  return (key: string): string => {
    const value = messages[key];
    if (typeof value === 'string') return value;
    return key;
  };
}

/**
 * Reads an array-valued key from a bundle (e.g. paragraph blocks).
 * Returns an empty array if the key is missing or not an array.
 */
export function getArray(messages: LocaleBundle, key: string): string[] {
  const value = messages[key];
  return Array.isArray(value) ? value : [];
}
