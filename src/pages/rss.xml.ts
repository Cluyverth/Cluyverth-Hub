import type { APIRoute } from 'astro';
import { getPosts } from '../lib/posts';

const entities: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
};
const escapeXml = (text: string) => text.replace(/[&<>"']/g, (character) => entities[character]);

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('Configure site in Astro to generate absolute RSS links.');

  const notebook = escapeXml(new URL('/caderno/', site).href);
  const feed = escapeXml(new URL('/rss.xml', site).href);
  const posts = await getPosts();
  const items = posts.map(({ title, slug, date, summary, category }) => {
    const url = escapeXml(new URL(`/caderno/${slug}/`, site).href);
    return `<item>
  <title>${escapeXml(title)}</title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  <pubDate>${new Date(date).toUTCString()}</pubDate>
  <description>${escapeXml(summary)}</description>
  <category>${escapeXml(category)}</category>
</item>`;
  }).join('\n');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Caderno de Cluyverth Pereira</title>
  <link>${notebook}</link>
  <description>Notas sobre tecnologia, jogos, história, escrita e cotidiano.</description>
  <language>pt-BR</language>
  <atom:link href="${feed}" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
