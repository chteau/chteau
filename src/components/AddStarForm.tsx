"use client";

import { useEffect, useState, type FormEvent } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { X, Github, Copy, Check } from 'lucide-react';
import { useCHTEAUSDK } from '../sdk/CHTEAUSDK';
import { getVisitorFingerprint } from '../lib/fingerprint';
import { saveStarDraft, takeStarDraft } from '../lib/starDraft';

const MESSAGE_LIMIT = 140;
const ROBLOX_URL_RE = /^https:\/\/(www\.)?roblox\.com\/users\/\d+(\/.*)?$/i;

/**
 * The "add a star" submission panel — a short message (required) plus at
 * least one of a verified GitHub or Roblox profile, so every star can carry
 * a real profile picture without letting visitors claim someone else's:
 * GitHub is only attached when actually signed in (no free-typed URL), and
 * Roblox requires pasting a one-time code into the profile's bio before
 * submitting proves the visitor controls it. On success it fires a
 * `visitor-star-added` window event so `VisitorStars` (inside the Canvas,
 * out of reach of plain props) knows to refetch.
 */
export default function AddStarForm({ onClose }: { onClose: () => void }) {
    const sdk = useCHTEAUSDK();
    const { data: session, status } = useSession();
    const [robloxUrl, setRobloxUrl] = useState('');
    const [message, setMessage] = useState('');
    const [robloxCode, setRobloxCode] = useState<string | null>(null);
    const [codeCopied, setCodeCopied] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    // Restores a draft left behind by a GitHub sign-in redirect, once.
    useEffect(() => {
        const draft = takeStarDraft();
        if (draft) {
            setMessage(draft.message);
            setRobloxUrl(draft.robloxUrl);
        }
    }, []);

    // Fetches this visitor's bio-verification code whenever the Roblox URL looks valid.
    useEffect(() => {
        const url = robloxUrl.trim();
        if (!ROBLOX_URL_RE.test(url)) {
            setRobloxCode(null);
            return;
        }
        const timer = setTimeout(() => {
            const fingerprint = getVisitorFingerprint();
            fetch(`/api/stars/roblox-code?robloxUrl=${encodeURIComponent(url)}&fingerprint=${encodeURIComponent(fingerprint)}`)
                .then((r) => (r.ok ? r.json() : Promise.reject()))
                .then((data) => setRobloxCode(data.code ?? null))
                .catch(() => setRobloxCode(null));
        }, 500);
        return () => clearTimeout(timer);
    }, [robloxUrl]);

    const handleCopyCode = () => {
        if (!robloxCode) return;
        navigator.clipboard
            .writeText(robloxCode)
            .then(() => {
                setCodeCopied(true);
                setTimeout(() => setCodeCopied(false), 1500);
            })
            .catch(() => {});
    };

    const handleSignIn = () => {
        saveStarDraft({ message, robloxUrl });
        signIn('github', { callbackUrl: window.location.href });
    };

    const githubLinked = status === 'authenticated' && !!session?.user?.login;
    const robloxValid = ROBLOX_URL_RE.test(robloxUrl.trim());

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/stars', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    robloxUrl: robloxUrl.trim() || undefined,
                    message,
                    fingerprint: getVisitorFingerprint(),
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Something went wrong.');
                return;
            }

            setDone(true);
            window.dispatchEvent(new CustomEvent('visitor-star-added'));
        } catch {
            setError('Network error — please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in" id="add-star-overlay">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} id="add-star-backdrop" />

            <div className="glass-panel relative w-full sm:max-w-md flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-outline/20 shrink-0">
                    <span className="text-sm font-bold uppercase tracking-wider text-on-surface">{sdk.t('star_form_title')}</span>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 glass-chip flex items-center justify-center text-on-surface-variant hover:text-white hover:border-primary/60 transition-colors cursor-pointer"
                        title={sdk.t('star_form_close')}
                        id="add-star-close"
                    >
                        <X size={15} />
                    </button>
                </div>

                <div className="p-5">
                    {done ? (
                        <div className="text-center py-6">
                            <p className="text-sm text-on-surface">{sdk.t('star_form_success')}</p>
                            <button
                                onClick={onClose}
                                className="mt-4 bg-primary/90 hover:bg-primary text-white py-2 px-5 text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer"
                            >
                                {sdk.t('star_form_close')}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-wide text-on-surface-variant mb-1.5">
                                    {sdk.t('star_form_github')}
                                </label>
                                {githubLinked ? (
                                    <div className="w-full glass-chip flex items-center gap-2 px-3 py-2 text-sm text-on-surface">
                                        {session?.user?.image && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={session.user.image} alt="" width={18} height={18} className="shrink-0" />
                                        )}
                                        <span>
                                            {sdk.t('star_form_github_signedin')} <strong>@{session?.user?.login}</strong>
                                        </span>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSignIn}
                                        className="w-full glass-chip flex items-center justify-center gap-2 px-3 py-2 text-sm text-on-surface hover:border-primary/60 transition-colors cursor-pointer"
                                        id="add-star-github-signin"
                                    >
                                        <Github size={14} />
                                        {sdk.t('star_form_github_signin')}
                                    </button>
                                )}
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-wide text-on-surface-variant mb-1.5">
                                    {sdk.t('star_form_roblox')}
                                </label>
                                <input
                                    type="url"
                                    value={robloxUrl}
                                    onChange={(e) => setRobloxUrl(e.target.value)}
                                    placeholder="https://www.roblox.com/users/..."
                                    className="w-full glass-chip px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary/60"
                                    id="add-star-roblox"
                                />
                                {robloxValid && robloxCode && (
                                    <div className="mt-1.5">
                                        <p className="text-[10px] text-on-surface-variant/80 leading-relaxed">
                                            {sdk.t('star_form_roblox_code_hint')}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="glass-chip px-2.5 py-1 text-xs text-primary font-bold tracking-wide">
                                                {robloxCode}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleCopyCode}
                                                className="w-7 h-7 glass-chip flex items-center justify-center text-on-surface-variant hover:text-white hover:border-primary/60 transition-colors cursor-pointer shrink-0"
                                                title={sdk.t('star_form_roblox_code_copy')}
                                                id="add-star-roblox-copy"
                                            >
                                                {codeCopied ? <Check size={12} /> : <Copy size={12} />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-[10px] text-on-surface-variant/70 -mt-2">{sdk.t('star_form_links_hint')}</p>

                            <div>
                                <label className="flex items-center justify-between text-[10px] uppercase tracking-wide text-on-surface-variant mb-1.5">
                                    <span>{sdk.t('star_form_message')}</span>
                                    <span>{message.length}/{MESSAGE_LIMIT}</span>
                                </label>
                                <textarea
                                    required
                                    maxLength={MESSAGE_LIMIT}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={3}
                                    placeholder={sdk.t('star_form_placeholder')}
                                    className="w-full glass-chip px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary/60 resize-none"
                                    id="add-star-message"
                                />
                            </div>

                            {error && <p className="text-xs text-red-400">{error}</p>}

                            <button
                                type="submit"
                                disabled={submitting || !message.trim() || (!githubLinked && !robloxValid)}
                                className="w-full bg-primary/90 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer"
                                id="add-star-submit"
                            >
                                {submitting ? sdk.t('star_form_submitting') : sdk.t('star_form_submit')}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
