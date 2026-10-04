import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export interface BlogPostMeta {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
}

export interface BlogPost extends BlogPostMeta {
    content: string;
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

function readSlugs(): string[] {
    if (!fs.existsSync(BLOG_DIR)) return [];
    return fs
        .readdirSync(BLOG_DIR)
        .filter((file) => file.endsWith('.mdx'))
        .map((file) => file.replace(/\.mdx$/, ''));
}

/** Every post's frontmatter, newest first. Reads `content/blog/*.mdx` — drop a new file in to publish one. */
export function getAllPosts(): BlogPostMeta[] {
    return readSlugs()
        .map((slug) => {
            const raw = fs.readFileSync(path.join(BLOG_DIR, `${slug}.mdx`), 'utf8');
            const { data } = matter(raw);
            return {
                slug,
                title: data.title ?? slug,
                date: data.date ?? '',
                excerpt: data.excerpt ?? '',
            };
        })
        .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** A single post's full MDX content + metadata, or `null` if the slug doesn't exist. */
export function getPost(slug: string): BlogPost | null {
    const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(raw);
    return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? '',
        excerpt: data.excerpt ?? '',
        content,
    };
}
