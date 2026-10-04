"use client";

const STORAGE_KEY = 'chteau_visitor_id';

/**
 * A stable per-browser token, generated once and persisted in localStorage.
 * Combined with the request IP server-side, it's a soft one-star-per-visitor
 * deterrent — not a hard guarantee (clearing storage and changing IP both
 * bypass it), appropriate for a "leave your mark" community feature rather
 * than real fraud prevention.
 */
export function getVisitorFingerprint(): string {
    try {
        const existing = localStorage.getItem(STORAGE_KEY);
        if (existing) return existing;
        const id = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, id);
        return id;
    } catch {
        return 'no-storage';
    }
}
