import type { APIRoute } from 'astro';
import { getPosts } from '../lib/posts';
import type { SearchEntry } from '../scripts/search-entry';

export const GET: APIRoute = async () => {
  const entries: SearchEntry[] = (await getPosts()).map((post) => ({
    title: post.title,
    href: `/caderno/${post.slug}/`,
    category: post.category,
    tags: post.tags,
    text: `${post.summary} ${post.entry.body ?? ''}`,
  }));
  return new Response(JSON.stringify(entries), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
