"use client";

import { useEffect, useState } from 'react';
import { MDXRemote, type MDXRemoteSerializeResult } from 'next-mdx-remote';
import { ArrowLeft, Newspaper } from 'lucide-react';
import { useCHTEAUSDK } from '../../sdk/CHTEAUSDK';
import BlogComments from '../BlogComments';
import type { BlogPostMeta } from '../../lib/blog';

const PROSE_CLASS =
    "text-sm text-on-surface-variant leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-on-primary-container [&_h1]:border-b [&_h1]:border-outline/30 [&_h1]:pb-2 [&_h1]:mt-8 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-on-primary-container [&_h2]:border-b [&_h2]:border-outline/20 [&_h2]:pb-1 [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-on-primary-container [&_h3]:mt-4 [&_h3]:mb-1 [&_p]:my-3 [&_a]:text-primary [&_a]:hover:underline [&_strong]:text-on-surface [&_strong]:font-bold [&_code]:bg-surface-container [&_code]:px-1 [&_code]:text-on-primary-container [&_code]:font-mono [&_code]:text-xs [&_pre]:bg-surface-container [&_pre]:border [&_pre]:border-outline/20 [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:my-1 [&_hr]:border-outline/20 [&_hr]:my-4 [&_img]:max-w-full [&_blockquote]:border-l-2 [&_blockquote]:border-outline/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:opacity-80";

interface PostDetail {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    headings: { text: string; slug: string }[];
    mdxSource: MDXRemoteSerializeResult;
}

// Module-level session cache — survives re-mounts (closing/reopening the panel), resets on full page reload.
let _posts: BlogPostMeta[] | null = null;

/**
 * The blog, as a `SectionPanel` tab like every other section — list view by
 * default, switching to a post's content (fetched + MDX-compiled via
 * `/api/blog/posts/[slug]`) when one is picked, with a "back to posts"
 * control taking it back to the list rather than navigating anywhere.
 */
export default function BlogSection() {
    const sdk = useCHTEAUSDK();
    const [posts, setPosts] = useState<BlogPostMeta[] | null>(_posts);
    const [loading, setLoading] = useState(!_posts);
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
    const [post, setPost] = useState<PostDetail | null>(null);
    const [postLoading, setPostLoading] = useState(false);

    useEffect(() => {
        if (_posts) return;
        fetch('/api/blog/posts')
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((data) => {
                _posts = Array.isArray(data.posts) ? data.posts : [];
                setPosts(_posts);
            })
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedSlug) {
            setPost(null);
            return;
        }
        let alive = true;
        setPostLoading(true);
        fetch(`/api/blog/posts/${selectedSlug}`)
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((data) => {
                if (alive) setPost(data);
            })
            .catch(() => {})
            .finally(() => {
                if (alive) setPostLoading(false);
            });
        return () => {
            alive = false;
        };
    }, [selectedSlug]);

    if (selectedSlug) {
        return (
            <div>
                <button
                    onClick={() => setSelectedSlug(null)}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors cursor-pointer mb-6"
                    id="blog-back-to-list"
                >
                    <ArrowLeft size={13} />
                    {sdk.t('blog_title')}
                </button>

                {postLoading || !post ? (
                    <div className="flex items-center justify-center h-40">
                        <span className="text-xs text-on-surface-variant uppercase tracking-widest animate-pulse">…</span>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-[1fr_200px] gap-10">
                        <div className="max-w-3xl">
                            <h1 className="font-display text-2xl sm:text-3xl font-medium text-white" style={{ letterSpacing: '0.02em' }}>
                                {post.title}
                            </h1>
                            {post.date && <p className="text-xs text-on-surface-variant mt-2 uppercase tracking-wide">{post.date}</p>}

                            <div className={`${PROSE_CLASS} mt-8`}>
                                <MDXRemote {...post.mdxSource} />
                            </div>

                            <div className="mt-14 pt-8 border-t border-outline/20">
                                <BlogComments slug={post.slug} />
                            </div>
                        </div>

                        {post.headings.length > 0 && (
                            <aside className="hidden lg:block h-fit sticky top-0">
                                <h3 className="text-[10px] font-bold text-on-primary-container tracking-widest uppercase mb-3">
                                    {sdk.t('blog_toc_title')}
                                </h3>
                                <ul className="space-y-2 border-l border-outline/20">
                                    {post.headings.map((h) => (
                                        <li key={h.slug}>
                                            <a
                                                href={`#${h.slug}`}
                                                className="block pl-3 -ml-px border-l border-transparent hover:border-primary text-xs text-on-surface-variant hover:text-primary transition-colors leading-snug"
                                            >
                                                {h.text}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </aside>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-40">
                <span className="text-xs text-on-surface-variant uppercase tracking-widest animate-pulse">…</span>
            </div>
        );
    }

    if (!posts || posts.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Newspaper size={40} className="text-on-surface-variant" />
                    <p className="text-sm text-on-surface-variant">{sdk.t('blog_empty')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {posts.map((p) => (
                <button
                    key={p.slug}
                    onClick={() => setSelectedSlug(p.slug)}
                    className="glass-panel text-left p-5 hover:border-primary/60 transition-colors cursor-pointer"
                    id={`blog-post-link-${p.slug}`}
                >
                    <h2 className="text-lg font-bold text-on-surface">{p.title}</h2>
                    {p.date && <p className="text-xs text-on-surface-variant mt-1">{p.date}</p>}
                    {p.excerpt && <p className="text-sm text-on-surface-variant mt-2">{p.excerpt}</p>}
                </button>
            ))}
        </div>
    );
}
