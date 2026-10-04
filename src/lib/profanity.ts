import {
    DataSet,
    RegExpMatcher,
    englishDataset,
    pattern,
    resolveConfusablesTransformer,
    resolveLeetSpeakTransformer,
    toAsciiLowerCaseTransformer,
    skipNonAlphabeticTransformer,
    collapseDuplicatesTransformer,
} from 'obscenity';

interface PhraseMetadata {
    originalWord: string;
}

/**
 * Curated French slurs/vulgarities. The transformer chain below already
 * normalizes leetspeak substitutions, inserted whitespace/punctuation and
 * repeated characters before matching, so only the base word forms are
 * needed here — the same evasion resistance that covers the (much larger)
 * built-in English dataset applies to these automatically.
 */
const FRENCH_WORDS = [
    'pute', 'putain', 'salope', 'salopard', 'connard', 'connasse',
    'encule', 'enculé', 'enculee', 'enculée', 'nique', 'niquer',
    'batard', 'bâtard', 'fdp', 'pd', 'pede', 'pédé', 'tapette',
    'negro', 'négro', 'bougnoule', 'youpin', 'chinetoque', 'bamboula',
    'mongolien', 'trisomique', 'attarde', 'attardé',
];

const dataset = FRENCH_WORDS.reduce(
    (ds, word) =>
        ds.addPhrase((phrase) =>
            phrase.setMetadata({ originalWord: word } satisfies PhraseMetadata).addPattern(pattern`${word}`)
        ),
    new DataSet<PhraseMetadata>().addAll(englishDataset)
);

// Built explicitly (rather than the `englishRecommendedTransformers` preset)
// because `skipNonAlphabeticTransformer` — which normalizes away spaces and
// punctuation inserted between letters ("f u c k", "f.u.c.k") — isn't part
// of that preset, and that's exactly one of the evasion tricks this needs
// to catch.
const matcher = new RegExpMatcher({
    ...dataset.build(),
    blacklistMatcherTransformers: [
        resolveConfusablesTransformer(),
        resolveLeetSpeakTransformer(),
        toAsciiLowerCaseTransformer(),
        skipNonAlphabeticTransformer(),
        collapseDuplicatesTransformer(),
    ],
});

/**
 * Checks whether `text` contains profanity — English (via obscenity's
 * built-in dataset, covering common swears and slurs) or French (the
 * curated list above) — resistant to common evasion tricks (leetspeak,
 * inserted spaces/punctuation, repeated letters). Best-effort: solid
 * coverage for English and French, not an exhaustive list for every
 * language.
 */
export function containsProfanity(text: string): boolean {
    return matcher.hasMatch(text);
}
