import { NextResponse } from 'next/server';
import { serialize } from 'next-mdx-remote/serialize';
import { getPost } from '../../../../../lib/blog';

/**
 * A single post, pre-compiled for client-side rendering: `serialize()` runs
 * the MDX pipeline here (server-side) and returns a plain-JSON result that
 * `next-mdx-remote`'s client `<MDXRemote>` can hydrate directly — the post
 * view is a `SectionPanel` tab, not its own route, so the compile step can't
 * happen in a Server Component the way `next-mdx-remote/rsc` expects.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPost(slug);
    if (!post) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const mdxSource = await serialize(post.content);
    return NextResponse.json({
        slug: post.slug,
        title: post.title,
        date: post.date,
        excerpt: post.excerpt,
        mdxSource,
    });
}
