/** Union of valid sidebar tab identifiers for the GitHub app. */
export type TabId = 'profile' | 'repos' | 'stars';

/**
 * GitHub username whose data is displayed throughout the app.
 * Update this constant to point the app at a different account.
 */
export const GITHUB_USERNAME = 'chteau';

/**
 * Maps GitHub language names to their canonical hex colours, matching the
 * colour dots shown on github.com repository listings.
 */
export const LANGUAGE_COLORS: Record<string, string> = {
    TypeScript:  '#3178c6',
    JavaScript:  '#f1e05a',
    Python:      '#3572A5',
    Go:          '#00ADD8',
    Rust:        '#dea584',
    HTML:        '#e34c26',
    CSS:         '#563d7c',
    'C#':        '#178600',
    'C++':       '#f34b7d',
    C:           '#555555',
    Java:        '#b07219',
    PHP:         '#4F5D95',
    Ruby:        '#701516',
    Dart:        '#00B4AB',
    Lua:         '#000080',
    Luau:        '#00A2FF',
    Swift:       '#ffac45',
    Kotlin:      '#A97BFF',
    Shell:       '#89e051',
    Vue:         '#41b883',
    SCSS:        '#c6538c',
    GDScript:    '#355570',
    Dockerfile:  '#384d54',
    Nix:         '#7e7eff',
};
