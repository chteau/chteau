// Assets
import studioDemoImg from './images/studio-demo.png';
import prevPortfolioImg from './images/portfolio.png';
import heimdallPreviewImg from './images/heimdall.png';
import robloxSupabasePreviewImg from './images/roblox-supabase.png';
import fragmentPreviewImg from './images/fragment.png';

/**
 * A single project entry displayed in the Projects explorer.
 */
export interface Project {
    /** Unique stable identifier used as React key and URL slug. */
    id: string;
    /** Human-readable project name shown in the card and inspector. */
    title: string;
    /** Short description rendered in the inspector panel. */
    description: string;
    /** Taxonomy tags used for sidebar filtering. */
    tags: string[];
    /**
     * Preview image shown in the card thumbnail and inspector.
     * Pass `null` to render a "No Preview" placeholder instead.
     */
    thumbnail: string | null;
    /** Live URL — external (`https://…`) or a local static demo path (`/demos/…`). */
    appUrl?: string;
    /** GitHub repository URL opened by the GitHub action button. */
    githubUrl?: string;
    /**
     * When `true`, `appUrl` is treated as a root-relative path and the value of
     * `NEXT_PUBLIC_BASE_PATH` is prepended at runtime. Set this for any demo
     * hosted inside `/public/demos/` so GitHub Pages project-site deployments
     * resolve the correct sub-path automatically.
     */
    isLocalDemo?: boolean;
}

/**
 * Resolves the final navigable URL for a project's "Open App" action.
 *
 * For local demos (`isLocalDemo: true`) the function prepends
 * `NEXT_PUBLIC_BASE_PATH` (empty string by default) so that the link stays
 * correct when the portfolio is deployed to a GitHub Pages project sub-path
 * (e.g. `user.github.io/repo-name/`).
 *
 * @param project - The project whose app URL should be resolved.
 * @returns The fully resolved URL string, or `undefined` if no `appUrl` is set.
 */
export function resolveAppUrl(project: Project): string | undefined {
    if (!project.appUrl) return undefined;
    if (project.isLocalDemo) {
        const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
        return base + project.appUrl;
    }
    return project.appUrl;
}

/**
 * Master list of projects shown in the Projects explorer.
 *
 * To add a new project:
 *   1. Drop a thumbnail image into `src/apps/explorer/images/`.
 *   2. Import it here and set `thumbnail` to `yourImg.src`.
 *   3. For a demo hosted in `public/demos/`, set `isLocalDemo: true` and
 *      point `appUrl` at the explicit `index.html` path (not the directory)
 *      so Next.js can serve it as a static file.
 */
export const PROJECTS: Project[] = [
    // Websites
    {
        id: 'studio-demo',
        title: 'Game Studio Website Demo',
        description: 'A simple landing page for a Roblox game studio, built with React and Vite.',
        tags: ['Website', 'React', 'Vite', '3D', 'Three.js'],
        thumbnail: studioDemoImg.src,
        appUrl: '/demos/studio-demo/index.html',
        isLocalDemo: true,
    },
    {
        id: 'portfolio',
        title: 'Previous Portfolio',
        description: 'My previous portfolio made with Next.js and Tailwind CSS.',
        tags: ['Website', 'Next.js', 'React', 'TypeScript'],
        thumbnail: prevPortfolioImg.src,
        appUrl: 'https://cheeteau.vercel.app/',
    },

    // Featured projects
    {
        id: 'heimdall',
        title: 'Heimdall',
        description: 'A gatekeeping and self-hostable discord bot project I used to work on. Supports natively spam and phishing links detection as well as a cross-server verification process (background checks, etc).',
        tags: ['Discord Bot', 'TypeScript', 'Deno', 'SQLite3', 'Discord.js'],
        thumbnail: heimdallPreviewImg.src,
        githubUrl: 'https://github.com/chteau/heimdall',
    },
    {
        id: 'roblox-supabase',
        title: 'Roblox Supabase Client',
        description: 'A comprehensive, type-safe Supabase client for Roblox Luau, providing full access to PostgREST API, Storage, and Edge Functions. Built specifically for Roblox\'s server-side environment with Rojo workflow compatibility.',
        tags: ['Roblox', 'Luau', 'PostgeSQL', 'Supabase'],
        thumbnail: robloxSupabasePreviewImg.src,
        appUrl: 'https://roblox-supabase.vercel.app/docs',
        githubUrl: 'https://github.com/chteau/Roblox-Supabase',
    },
    {
        id: 'fragment',
        title: 'Fragment',
        description: 'Fragment is a simple module I made to manage Roblox\'s imperative UI instance system inspired by React. It currently supports state management, effects, declarative rendering, globals stores which allow you to build reactive user interfaces whilst still using default Roblox\'s UI components.',
        tags: ['Roblox', 'Luau'],
        thumbnail: fragmentPreviewImg.src,
        appUrl: 'https://github.com/chteau/Fragment',
        githubUrl: 'https://github.com/chteau/fragment',
    }
];
