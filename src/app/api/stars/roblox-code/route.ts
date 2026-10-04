import { NextResponse } from 'next/server';
import { robloxUserIdFromUrl } from '../../../../lib/avatars';
import { robloxVerificationCode } from '../../../../lib/robloxVerify';

const ROBLOX_URL_RE = /^https:\/\/(www\.)?roblox\.com\/users\/\d+(\/.*)?$/i;

/**
 * Returns the per-visitor code to paste into a Roblox bio, ahead of actually
 * submitting a star — lets the UI show it before the real check happens at
 * POST /api/stars time.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const robloxUrl = searchParams.get('robloxUrl')?.trim() ?? '';
    const fingerprint = searchParams.get('fingerprint')?.trim() ?? '';

    if (!fingerprint) {
        return NextResponse.json({ error: 'Missing visitor fingerprint.' }, { status: 400 });
    }
    if (!ROBLOX_URL_RE.test(robloxUrl)) {
        return NextResponse.json({ error: 'Roblox link must be a valid roblox.com/users/<id> profile URL.' }, { status: 422 });
    }

    const userId = robloxUserIdFromUrl(robloxUrl);
    if (!userId) {
        return NextResponse.json({ error: 'Could not read a user ID from that Roblox URL.' }, { status: 422 });
    }

    return NextResponse.json({ code: robloxVerificationCode(fingerprint, userId) });
}
