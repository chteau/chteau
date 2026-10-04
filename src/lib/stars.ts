import { getStore } from '@netlify/blobs';
import { createHash, randomUUID } from 'node:crypto';

/** A visitor-submitted star, as sent to the client — never includes `ownerHash`. */
export interface VisitorStar {
    id: string;
    githubUrl?: string;
    robloxUrl?: string;
    avatarUrl?: string;
    /** Roblox's verified-badge status for the linked account — GitHub has no equivalent concept here. */
    verified?: boolean;
    message: string;
    color: string;
    position: [number, number, number];
    createdAt: string;
}

interface StoredStar extends VisitorStar {
    /** sha256(ip + fingerprint) — used only to enforce one star per visitor, never exposed. */
    ownerHash: string;
}

const STORE_NAME = 'visitor-stars';
const BLOB_KEY = 'all';

// Green, deliberately — none of the 5 feature stars (sectionStars.ts) or the
// decoy-galaxy palette use green, so a visitor star is never mistaken for one
// of ours at a glance. A few shades for twinkle variety, all clearly green.
const PALETTE = ['#4ade80', '#22c55e', '#86efac', '#34d399'];

/** Random point in the same shell FieldGalaxies/BackgroundStars occupy, well clear of our own nebula. */
function randomPosition(): [number, number, number] {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const dist = 18 + Math.random() * 27;
    return [
        Math.sin(phi) * Math.cos(theta) * dist,
        Math.cos(phi) * 0.8 * dist,
        Math.sin(phi) * Math.sin(theta) * dist,
    ];
}

/** Derives the per-visitor ownership hash from their IP and client fingerprint. */
export function hashOwner(ip: string, fingerprint: string): string {
    return createHash('sha256').update(`${ip}:${fingerprint}`).digest('hex');
}

function toPublic(star: StoredStar): VisitorStar {
    return {
        id: star.id,
        githubUrl: star.githubUrl,
        robloxUrl: star.robloxUrl,
        avatarUrl: star.avatarUrl,
        verified: star.verified,
        message: star.message,
        color: star.color,
        position: star.position,
        createdAt: star.createdAt,
    };
}

async function readAll(): Promise<StoredStar[]> {
    try {
        const store = getStore(STORE_NAME);
        const data = await store.get(BLOB_KEY, { type: 'json' });
        return Array.isArray(data) ? (data as StoredStar[]) : [];
    } catch (err) {
        // Netlify Blobs needs a linked site/deploy context (auto-injected on
        // Netlify; absent in plain `next dev` without the Netlify CLI) — degrade
        // to an empty list rather than 500ing the public listing endpoint.
        console.warn('[stars] Netlify Blobs unavailable, returning an empty list:', err);
        return [];
    }
}

async function writeAll(stars: StoredStar[]): Promise<void> {
    const store = getStore(STORE_NAME);
    await store.setJSON(BLOB_KEY, stars);
}

/** All visitor stars, public fields only. */
export async function listPublicStars(): Promise<VisitorStar[]> {
    const stars = await readAll();
    return stars.map(toPublic);
}

/**
 * Whether this visitor has already submitted a star — by ownership hash
 * (IP + client fingerprint, the soft per-browser deterrent) or by already
 * owning a star under the same verified GitHub/Roblox identity (a stronger
 * guarantee: survives a cleared fingerprint, a different browser, or a VPN,
 * since it's tied to an account that was actually proven to be theirs).
 */
export async function hasAlreadySubmitted(ownerHash: string, githubUrl?: string, robloxUrl?: string): Promise<boolean> {
    const stars = await readAll();
    return stars.some(
        (s) =>
            s.ownerHash === ownerHash ||
            (!!githubUrl && s.githubUrl === githubUrl) ||
            (!!robloxUrl && s.robloxUrl === robloxUrl)
    );
}

/** Appends a new visitor star and returns its public representation. */
export async function addStar(input: {
    githubUrl?: string;
    robloxUrl?: string;
    avatarUrl?: string;
    verified?: boolean;
    message: string;
    ownerHash: string;
}): Promise<VisitorStar> {
    const stars = await readAll();
    const star: StoredStar = {
        id: randomUUID(),
        githubUrl: input.githubUrl,
        robloxUrl: input.robloxUrl,
        avatarUrl: input.avatarUrl,
        verified: input.verified,
        message: input.message,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        position: randomPosition(),
        createdAt: new Date().toISOString(),
        ownerHash: input.ownerHash,
    };
    stars.push(star);
    await writeAll(stars);
    return toPublic(star);
}
