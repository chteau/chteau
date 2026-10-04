const DRAFT_KEY = 'chteau_star_draft';

export interface StarDraft {
    message: string;
    robloxUrl: string;
}

/** Whether a draft is waiting — checked on page load after a GitHub sign-in redirect to reopen the form. */
export function hasStarDraft(): boolean {
    try {
        return sessionStorage.getItem(DRAFT_KEY) !== null;
    } catch {
        return false;
    }
}

/** Saves the in-progress form right before a `signIn()` redirect takes the visitor away from the page. */
export function saveStarDraft(draft: StarDraft): void {
    try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
        // Best-effort — storage can throw in private-browsing contexts.
    }
}

/** Reads back and clears the draft once (so a later reload doesn't resurrect it). */
export function takeStarDraft(): StarDraft | null {
    try {
        const raw = sessionStorage.getItem(DRAFT_KEY);
        if (!raw) return null;
        sessionStorage.removeItem(DRAFT_KEY);
        return JSON.parse(raw) as StarDraft;
    } catch {
        return null;
    }
}
