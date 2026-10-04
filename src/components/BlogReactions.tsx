"use client";

import { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useCHTEAUSDK } from '../sdk/CHTEAUSDK';
import { getVisitorFingerprint } from '../lib/fingerprint';

type Vote = 'up' | 'down';

interface Reactions {
    up: number;
    down: number;
    myVote: Vote | null;
}

/** Thumbs up/down on a blog post — one vote per visitor fingerprint, no sign-in required. */
export default function BlogReactions({ slug }: { slug: string }) {
    const sdk = useCHTEAUSDK();
    const [reactions, setReactions] = useState<Reactions | null>(null);
    const [voting, setVoting] = useState(false);

    useEffect(() => {
        const fingerprint = getVisitorFingerprint();
        fetch(`/api/blog/reactions?slug=${encodeURIComponent(slug)}&fingerprint=${encodeURIComponent(fingerprint)}`)
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((data) => setReactions(data))
            .catch(() => setReactions({ up: 0, down: 0, myVote: null }));
    }, [slug]);

    const vote = async (choice: Vote) => {
        if (voting) return;
        setVoting(true);
        try {
            const res = await fetch('/api/blog/reactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, vote: choice, fingerprint: getVisitorFingerprint() }),
            });
            if (res.ok) setReactions(await res.json());
        } catch {
            // Best-effort — leave the previous counts showing on failure.
        } finally {
            setVoting(false);
        }
    };

    if (!reactions) return null;

    return (
        <div className="flex items-center gap-3" id="blog-reactions">
            <span className="text-xs text-on-surface-variant mr-1">{sdk.t('blog_reactions_prompt')}</span>
            <button
                type="button"
                onClick={() => vote('up')}
                disabled={voting}
                aria-pressed={reactions.myVote === 'up'}
                aria-label={sdk.t('blog_reactions_up')}
                id="blog-reaction-up"
                className={`glass-chip flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer disabled:cursor-not-allowed ${
                    reactions.myVote === 'up' ? 'border-primary/60 text-primary' : 'text-on-surface-variant hover:text-primary'
                }`}
            >
                <ThumbsUp size={13} />
                {reactions.up}
            </button>
            <button
                type="button"
                onClick={() => vote('down')}
                disabled={voting}
                aria-pressed={reactions.myVote === 'down'}
                aria-label={sdk.t('blog_reactions_down')}
                id="blog-reaction-down"
                className={`glass-chip flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer disabled:cursor-not-allowed ${
                    reactions.myVote === 'down' ? 'border-primary/60 text-primary' : 'text-on-surface-variant hover:text-primary'
                }`}
            >
                <ThumbsDown size={13} />
                {reactions.down}
            </button>
        </div>
    );
}
