import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { noteSlug } from '../../lib/notes';

/**
 * RSS feed of public Portuguese notes. The status gate applies here too:
 * drafts and private notes are never in the feed, in any environment.
 */
export const GET: APIRoute = async ({ site }) => {
  const all = await getCollection('notes');
  const publicNotes = all
    .filter((entry) => entry.data.status === 'public' && entry.data.lang === 'pt')
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: 'Cluyverth Hub: Acervo',
    description: 'Notas públicas do meu vault do Obsidian.',
    site: site ?? 'https://cluyverth.com',
    customData: '<language>pt-br</language>',
    items: publicNotes.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description ?? `Nota do vault, ${entry.data.title}`,
      pubDate: entry.data.date,
      link: `/pt/vault/${noteSlug(entry)}`,
      author: entry.data.author,
    })),
  });
};
