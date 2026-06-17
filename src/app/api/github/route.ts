import { NextResponse } from 'next/server';

/**
 * Base headers attached to every GitHub REST API request.
 * If GITHUB_TOKEN is set in the environment, an Authorization header is
 * included to raise the rate limit from 60 to 5 000 requests per hour and
 * to unlock GraphQL access for the contribution calendar endpoint.
 */
const BASE_HEADERS: HeadersInit = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(process.env.GITHUB_TOKEN
        ? { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
};

/** Shared Cache-Control header applied to every successful response. */
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' };

/**
 * Proxies GitHub API requests from the client, adding optional authentication
 * and server-side cache headers. Supported `type` query values:
 *
 * - `profile`       — user object + public organizations
 * - `repos`         — public repositories sorted by last push
 * - `starred`       — repositories starred by the user
 * - `contributions` — contribution calendar via GraphQL (requires GITHUB_TOKEN)
 * - `readme`        — raw Markdown of the user's profile README
 *
 * Required query params: `type`, `username`.
 * Optional: `year` (defaults to current year, used by `contributions`).
 *
 * @param request - Incoming Next.js GET request
 * @returns JSON response with the requested GitHub data, or an error object
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type     = searchParams.get('type');
    const username = searchParams.get('username');
    const year     = searchParams.get('year') ?? new Date().getFullYear().toString();

    if (!username) {
        return NextResponse.json({ error: 'Missing username' }, { status: 400 });
    }

    try {
        switch (type) {

            /** User profile object and organization list. */
            case 'profile': {
                const [profileRes, orgsRes] = await Promise.all([
                    fetch(`https://api.github.com/users/${username}`, { headers: BASE_HEADERS }),
                    fetch(`https://api.github.com/users/${username}/orgs`, { headers: BASE_HEADERS }),
                ]);
                if (!profileRes.ok) {
                    return NextResponse.json({ error: 'User not found' }, { status: profileRes.status });
                }
                const [profile, orgs] = await Promise.all([
                    profileRes.json(),
                    orgsRes.ok ? orgsRes.json() : Promise.resolve([]),
                ]);
                return NextResponse.json({ profile, orgs }, { headers: CACHE_HEADERS });
            }

            /** Public repositories sorted by last push date. */
            case 'repos': {
                const res = await fetch(
                    `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed&type=public`,
                    { headers: BASE_HEADERS }
                );
                const repos = res.ok ? await res.json() : [];
                return NextResponse.json({ repos }, { headers: CACHE_HEADERS });
            }

            /** Repositories starred by the user. */
            case 'starred': {
                const res = await fetch(
                    `https://api.github.com/users/${username}/starred?per_page=100`,
                    { headers: BASE_HEADERS }
                );
                const starred = res.ok ? await res.json() : [];
                return NextResponse.json({ starred }, { headers: CACHE_HEADERS });
            }

            /**
             * Contribution calendar for the given year via the GitHub GraphQL API.
             * Returns `{ weeks: [], total: 0, hasToken: false }` when GITHUB_TOKEN
             * is absent, allowing the UI to degrade gracefully.
             */
            case 'contributions': {
                if (!process.env.GITHUB_TOKEN) {
                    return NextResponse.json({ weeks: [], total: 0, hasToken: false }, { headers: CACHE_HEADERS });
                }
                const from = `${year}-01-01T00:00:00Z`;
                const to   = `${year}-12-31T23:59:59Z`;
                const query = `
                    query($login: String!, $from: DateTime!, $to: DateTime!) {
                        user(login: $login) {
                            contributionsCollection(from: $from, to: $to) {
                                contributionCalendar {
                                    totalContributions
                                    weeks {
                                        contributionDays {
                                            contributionCount
                                            date
                                            weekday
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const res = await fetch('https://api.github.com/graphql', {
                    method: 'POST',
                    headers: { ...BASE_HEADERS, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query, variables: { login: username, from, to } }),
                });
                const json = await res.json();
                const cal  = json.data?.user?.contributionsCollection?.contributionCalendar;
                return NextResponse.json(
                    { weeks: cal?.weeks ?? [], total: cal?.totalContributions ?? 0, hasToken: true },
                    { headers: CACHE_HEADERS }
                );
            }

            /**
             * Raw Markdown content of the user's profile README.
             * Attempts `main` then `master` branch; returns `{ readme: null }`
             * when neither exists.
             */
            case 'readme': {
                for (const branch of ['main', 'master']) {
                    const res = await fetch(
                        `https://raw.githubusercontent.com/${username}/${username}/${branch}/README.md`
                    );
                    if (res.ok) {
                        return NextResponse.json({ readme: await res.text() }, { headers: CACHE_HEADERS });
                    }
                }
                return NextResponse.json({ readme: null }, { headers: CACHE_HEADERS });
            }

            default:
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ error: 'GitHub API error' }, { status: 500 });
    }
}
