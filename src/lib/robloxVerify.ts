import { createHash } from 'node:crypto';
import { robloxFetch } from '../app/api/roblox/utils';

/**
 * Deterministic per-visitor code a Roblox profile owner pastes into their
 * public bio to prove they control it — same idea as a DNS TXT-record
 * domain check. No secret involved: the security comes from needing actual
 * edit access to that specific profile's "About" section, not from the
 * code being unguessable.
 *
 * Letters only (A-Z), no digits: Roblox's bio text filter censors anything
 * that looks like a phone number, which includes short runs of digits —
 * a hex code (0-9A-F) hits that constantly. Mapping hash bytes onto the
 * alphabet instead sidesteps the filter entirely.
 */
export function robloxVerificationCode(fingerprint: string, userId: string): string {
    const hash = createHash('sha256').update(`${fingerprint}:${userId}:star-verify`).digest();
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += String.fromCharCode(65 + (hash[i] % 26));
    }
    return code;
}

interface RobloxUserResponse {
    description?: string;
    hasVerifiedBadge?: boolean;
}

/**
 * Checks the bio-code and reads the account's verified-badge status in one
 * fetch (both come off the same Roblox users endpoint, so submitting a star
 * doesn't need a second round-trip just to know whether to show the badge).
 */
export async function checkRobloxBio(userId: string, code: string): Promise<{ bioVerified: boolean; hasVerifiedBadge: boolean }> {
    try {
        const res = await robloxFetch<RobloxUserResponse>(`https://users.roblox.com/v1/users/${userId}`, { noStore: true });
        return {
            bioVerified: (res.description ?? '').toUpperCase().includes(code),
            hasVerifiedBadge: !!res.hasVerifiedBadge,
        };
    } catch (err) {
        console.warn('[robloxVerify] Failed to fetch Roblox profile for verification:', err);
        return { bioVerified: false, hasVerifiedBadge: false };
    }
}
