import { NextResponse } from 'next/server';
import { serialize } from 'next-mdx-remote/serialize';
import rehypeSlug from 'rehype-slug';
import GithubSlugger from 'github-slugger';
import { getPost } from '../../../../../lib/blog';

/** One `##` heading's text and the id `rehype-slug` gives its rendered element, for the sidebar table of contents. */
interface Heading {
    text: string;
    slug: string;
}

/**
 * Pulls every `## heading` out of the raw MDX source, slugging each with the
 * same `github-slugger` algorithm `rehype-slug` uses internally (including
 * its duplicate-heading `-1`/`-2` suffixing) so these ids always match the
 * ones actually rendered onto the compiled headings.
 */
function extractHeadings(content: string): Heading[] {
    const slugger = new GithubSlugger();
    const headings: Heading[] = [];
    for (const line of content.split('\n')) {
        const match = /^##\s+(.+)$/.exec(line);
        if (match) headings.push({ text: match[1].trim(), slug: slugger.slug(match[1].trim()) });
    }
    return headings;
}

/**
 * A single post, pre-compiled for client-side rendering: `serialize()` runs
 * the MDX pipeline here (server-side) and returns a plain-JSON result that
 * `next-mdx-remote`'s client `<MDXRemote>` can hydrate directly, the post
 * view is a `SectionPanel` tab, not its own route, so the compile step can't
 * happen in a Server Component the way `next-mdx-remote/rsc` expects.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPost(slug);
    if (!post) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const mdxSource = await serialize(post.content, { mdxOptions: { rehypePlugins: [rehypeSlug] } });
    return NextResponse.json({
        slug: post.slug,
        title: post.title,
        date: post.date,
        excerpt: post.excerpt,
        headings: extractHeadings(post.content),
        mdxSource,
    });
}
