import { getStore } from '@netlify/blobs';
import { randomUUID } from 'node:crypto';
import { readJsonBlob } from './blobStore';

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
    const data = await readJsonBlob<unknown>(STORE_NAME, slug, []);
    return Array.isArray(data) ? (data as Comment[]) : [];
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
