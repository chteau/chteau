import { NextResponse } from 'next/server';
import { getAllPosts } from '../../../../lib/blog';

/** Every post's frontmatter, newest first — the blog list is a `SectionPanel` tab, not a route, so it's fetched client-side. */
export async function GET() {
    return NextResponse.json({ posts: getAllPosts() });
}
