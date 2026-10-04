import type { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

/**
 * GitHub-only sign-in for blog comments. JWT sessions — no database/adapter
 * needed since a comment just denormalizes the GitHub username/avatar at
 * post time. Requires `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` and
 * `AUTH_SECRET` to be set (see a GitHub OAuth App at
 * github.com/settings/developers, callback URL `<site>/api/auth/callback/github`).
 */
export const authOptions: NextAuthOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.AUTH_GITHUB_ID ?? '',
            clientSecret: process.env.AUTH_GITHUB_SECRET ?? '',
        }),
    ],
    session: { strategy: 'jwt' },
    callbacks: {
        async jwt({ token, profile }) {
            if (profile && 'login' in profile) {
                token.login = (profile as { login?: string }).login;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.login = token.login;
            }
            return session;
        },
    },
};
