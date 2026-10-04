import { getStore } from '@netlify/blobs';
import { randomUUID } from 'node:crypto';

export interface Comment {
    id: string;
    slug: string;
    authorLogin: string;
    authorName: string;
    authorAvatar: string;
    body: string;
    createdAt: string;
}

const STORE_NAME = 'blog-comments';

async function readSlug(slug: string): Promise<Comment[]> {
    try {
        const store = getStore(STORE_NAME);
        const data = await store.get(slug, { type: 'json' });
        return Array.isArray(data) ? (data as Comment[]) : [];
    } catch (err) {
        // See the matching comment in src/lib/stars.ts — degrade to an empty
        // thread rather than 500ing when Blobs has no site/deploy context.
        console.warn('[comments] Netlify Blobs unavailable, returning an empty thread:', err);
        return [];
    }
}

/** All comments for a given post slug, oldest first. */
export async function listComments(slug: string): Promise<Comment[]> {
    return readSlug(slug);
}

/** Appends a new comment to a post's thread and returns it. */
export async function addComment(input: {
    slug: string;
    authorLogin: string;
    authorName: string;
    authorAvatar: string;
    body: string;
}): Promise<Comment> {
    const store = getStore(STORE_NAME);
    const comments = await readSlug(input.slug);
    const comment: Comment = {
        id: randomUUID(),
        slug: input.slug,
        authorLogin: input.authorLogin,
        authorName: input.authorName,
        authorAvatar: input.authorAvatar,
        body: input.body,
        createdAt: new Date().toISOString(),
    };
    comments.push(comment);
    await store.setJSON(input.slug, comments);
    return comment;
}
