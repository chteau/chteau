import { getStore } from '@netlify/blobs';
import { readJsonBlob } from './blobStore';

export type Vote = 'up' | 'down';

export interface ReactionCounts {
    up: number;
    down: number;
}

interface StoredReactions {
    /** fingerprint -> vote, one per visitor so re-voting flips/clears rather than stacking. */
    votes: Record<string, Vote>;
}

const STORE_NAME = 'blog-reactions';

function toCounts(stored: StoredReactions): ReactionCounts {
    let up = 0;
    let down = 0;
    for (const vote of Object.values(stored.votes)) {
        if (vote === 'up') up++;
        else down++;
    }
    return { up, down };
}

async function readSlug(slug: string): Promise<StoredReactions> {
    const data = await readJsonBlob<unknown>(STORE_NAME, slug, { votes: {} });
    return data && typeof data === 'object' && 'votes' in data ? (data as StoredReactions) : { votes: {} };
}

/** A post's current reaction counts and, if `fingerprint` is given, that visitor's own vote. */
export async function getReactions(slug: string, fingerprint?: string): Promise<ReactionCounts & { myVote: Vote | null }> {
    const stored = await readSlug(slug);
    return { ...toCounts(stored), myVote: (fingerprint && stored.votes[fingerprint]) || null };
}

/**
 * Casts, flips, or clears a visitor's vote on a post: sending the same vote
 * again clears it, sending the other one flips it — one vote per fingerprint.
 */
export async function castVote(slug: string, fingerprint: string, vote: Vote): Promise<ReactionCounts & { myVote: Vote | null }> {
    const store = getStore(STORE_NAME);
    const stored = await readSlug(slug);

    const myVote = stored.votes[fingerprint] === vote ? null : vote;
    if (myVote) {
        stored.votes[fingerprint] = myVote;
    } else {
        delete stored.votes[fingerprint];
    }

    await store.setJSON(slug, stored);
    return { ...toCounts(stored), myVote };
}
