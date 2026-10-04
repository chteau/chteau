import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth';
import { addStar, hashOwner, hasAlreadySubmitted, listPublicStars } from '../../../lib/stars';
import { containsProfanity } from '../../../lib/profanity';
import { resolveAvatarUrl, robloxUserIdFromUrl } from '../../../lib/avatars';
import { robloxVerificationCode, checkRobloxBio } from '../../../lib/robloxVerify';

const MESSAGE_LIMIT = 140;
// Must carry a numeric user ID (the modern roblox.com/users/<id>/profile format) — that ID is what the avatar lookup and bio check need.
const ROBLOX_URL_RE = /^https:\/\/(www\.)?roblox\.com\/users\/\d+(\/.*)?$/i;

/** Best-effort client IP — Netlify's own header first, standard forwarded-for as a fallback. */
function clientIp(request: Request): string {
    return (
        request.headers.get('x-nf-client-connection-ip') ??
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        'unknown'
    );
}

/** Public list of every visitor-submitted star. */
export async function GET() {
    const stars = await listPublicStars();
    return NextResponse.json({ stars });
}

/**
 * Submits a new visitor star — one per visitor, enforced two ways: IP +
 * client fingerprint (a soft per-browser deterrent) and, more robustly, one
 * star per verified GitHub/Roblox identity (so clearing the fingerprint or
 * switching browsers doesn't let the same account submit twice). Message
 * required and profanity-checked. To guard against impersonation, neither
 * profile link is taken at face value: a GitHub link is only attached when
 * the request carries a signed-in GitHub session (so it's always the
 * submitter's own account, never free-typed), and a Roblox link is only
 * attached once its bio contains this visitor's verification code (see
 * /api/stars/roblox-code). At least one of the two is required.
 */
export async function POST(request: Request) {
    let body: { robloxUrl?: string; message?: string; fingerprint?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const message = (body.message ?? '').trim();
    const fingerprint = (body.fingerprint ?? '').trim();
    const robloxUrl = body.robloxUrl?.trim() || undefined;

    if (!fingerprint) {
        return NextResponse.json({ error: 'Missing visitor fingerprint.' }, { status: 400 });
    }
    if (!message || message.length > MESSAGE_LIMIT) {
        return NextResponse.json({ error: `Message must be 1-${MESSAGE_LIMIT} characters.` }, { status: 422 });
    }
    if (robloxUrl && !ROBLOX_URL_RE.test(robloxUrl)) {
        return NextResponse.json({ error: 'Roblox link must be a valid roblox.com/users/<id> profile URL.' }, { status: 422 });
    }
    if (containsProfanity(message)) {
        return NextResponse.json({ error: 'That message was flagged by the content filter — please rephrase.' }, { status: 422 });
    }

    const session = await getServerSession(authOptions);
    const githubUrl = session?.user?.login ? `https://github.com/${session.user.login}` : undefined;

    if (!githubUrl && !robloxUrl) {
        return NextResponse.json({ error: 'Sign in with GitHub, or provide a Roblox profile link.' }, { status: 422 });
    }

    let robloxVerifiedBadge = false;

    if (robloxUrl) {
        const userId = robloxUserIdFromUrl(robloxUrl)!;
        const expectedCode = robloxVerificationCode(fingerprint, userId);
        const { bioVerified, hasVerifiedBadge } = await checkRobloxBio(userId, expectedCode);
        if (!bioVerified) {
            return NextResponse.json(
                {
                    error: `We couldn't find the verification code (${expectedCode}) in your Roblox bio yet. Add it under your profile's "About" section, save, and try again.`,
                },
                { status: 422 }
            );
        }
        robloxVerifiedBadge = hasVerifiedBadge;
    }

    const ownerHash = hashOwner(clientIp(request), fingerprint);
    if (await hasAlreadySubmitted(ownerHash, githubUrl, robloxUrl)) {
        return NextResponse.json({ error: 'You have already added a star to this galaxy.' }, { status: 409 });
    }

    const avatarUrl = await resolveAvatarUrl(githubUrl, robloxUrl);

    try {
        const star = await addStar({ githubUrl, robloxUrl, avatarUrl, verified: robloxVerifiedBadge, message, ownerHash });
        return NextResponse.json({ star }, { status: 201 });
    } catch (err) {
        console.error('[stars] Failed to persist a new star:', err);
        return NextResponse.json({ error: 'Storage is unavailable right now — please try again shortly.' }, { status: 503 });
    }
}
