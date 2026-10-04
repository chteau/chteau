"use client";

import { useEffect, useState, type FormEvent } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Github } from 'lucide-react';
import { useCHTEAUSDK } from '../sdk/CHTEAUSDK';
import { formatReadableDate } from '../lib/date';

interface Comment {
    id: string;
    authorLogin: string;
    authorName: string;
    authorAvatar: string;
    body: string;
    createdAt: string;
}

const COMMENT_LIMIT = 1000;

/** The comment thread under a blog post — sign in with GitHub, post, read. */
export default function BlogComments({ slug }: { slug: string }) {
    const sdk = useCHTEAUSDK();
    const { data: session, status } = useSession();
    const [comments, setComments] = useState<Comment[]>([]);
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((data) => setComments(Array.isArray(data.comments) ? data.comments : []))
            .catch(() => {});
    }, [slug]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, body: text }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Something went wrong.');
                return;
            }

            setComments((prev) => [...prev, data.comment]);
            setText('');
        } catch {
            setError('Network error — please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                {sdk.t('comments_title')}
                {comments.length > 0 && ` (${comments.length})`}
            </h2>

            {status === 'authenticated' && session?.user ? (
                <form onSubmit={handleSubmit} className="mb-6 space-y-2">
                    <textarea
                        required
                        maxLength={COMMENT_LIMIT}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={3}
                        placeholder={sdk.t('comments_placeholder')}
                        className="w-full glass-chip px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary/60 resize-none"
                        id="comment-input"
                    />
                    {error && <p className="text-xs text-red-400">{error}</p>}
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={submitting || !text.trim()}
                            className="bg-primary/90 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-5 text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer"
                            id="comment-submit"
                        >
                            {submitting ? sdk.t('comments_submitting') : sdk.t('comments_submit')}
                        </button>
                        <button
                            type="button"
                            onClick={() => signOut()}
                            className="text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            id="comment-signout"
                        >
                            {sdk.t('comments_signout')}
                        </button>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => signIn('github')}
                    className="glass-chip flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wide text-on-surface hover:border-primary/60 transition-colors cursor-pointer mb-6"
                    id="comment-signin"
                >
                    <Github size={14} />
                    {sdk.t('comments_signin')}
                </button>
            )}

            {comments.length === 0 ? (
                <p className="text-xs text-on-surface-variant/70">{sdk.t('comments_empty')}</p>
            ) : (
                <div className="space-y-4">
                    {comments.map((c) => (
                        <div key={c.id} className="flex gap-3" id={`comment-${c.id}`}>
                            {c.authorAvatar && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={c.authorAvatar} alt={c.authorName} className="w-8 h-8 shrink-0" />
                            )}
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <a
                                        href={`https://github.com/${c.authorLogin}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-bold text-on-surface hover:text-primary transition-colors"
                                    >
                                        {c.authorName}
                                    </a>
                                    <span className="text-[10px] text-on-surface-variant/60">
                                        {formatReadableDate(c.createdAt)}
                                    </span>
                                </div>
                                <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">{c.body}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
