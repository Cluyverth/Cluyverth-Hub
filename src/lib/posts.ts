import type { MarkdownHeading } from '@astrojs/markdown-remark';
import { getCollection, type CollectionEntry } from 'astro:content';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const wordsPerMinute = 200;

type PostEntry = CollectionEntry<'posts'>;
type RelatedPost = Pick<PostEntry['data'], 'slug' | 'title'>;
export type Post = Pick<PostEntry['data'], 'slug' | 'title' | 'summary' | 'category' | 'tags' | 'date'> & {
  entry: PostEntry;
  wordCount: number;
  readMinutes: number;
  related: RelatedPost[];
};

export function formatPostDate(date: string): string {
  return dateFormatter.format(new Date(date));
}

function countWords(html: string): number {
  // Count rendered prose (including headings and captions), not code, hrefs or image alt text.
  const prose = html
    .replace(/<!--[\s\S]*?-->|<(pre|code|script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<(?:[^>"']|"[^"]*"|'[^']*')*>|&(?:#\d+|#x[\da-f]+|[a-z][a-z\d]*);/gi, ' ')
    .normalize('NFC');
  return prose.match(/[\p{L}\p{N}]+(?:['’‑-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

export async function getPosts(): Promise<Post[]> {
  const entries = await getCollection('posts');
  const slugs = new Map<string, PostEntry>();

  for (const entry of entries) {
    const { slug } = entry.data;
    const previous = slugs.get(slug);
    if (previous) throw new Error(`Duplicate post slug "${slug}": ${previous.id} and ${entry.id}`);
    slugs.set(slug, entry);
  }

  return entries.map((entry) => {
    const { slug, title, summary, category, tags, date } = entry.data;
    const related = entry.data.related.map((slug) => {
      const target = slugs.get(slug);
      if (!target) throw new Error(`${entry.id}: unknown related post "${slug}"`);
      return { slug, title: target.data.title };
    });
    if (!entry.rendered) throw new Error(`${entry.id}: Markdown was not rendered`);
    const wordCount = countWords(entry.rendered.html);
    const readMinutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    return { slug, title, summary, category, tags, date, entry, wordCount, readMinutes, related };
  }).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export type OutlineItem = MarkdownHeading & { children: OutlineItem[] };

export function getHeadingOutline(headings: MarkdownHeading[]): OutlineItem[] {
  const outline: OutlineItem[] = [];
  const parents: OutlineItem[] = [];

  for (const heading of headings) {
    if (heading.depth < 2) continue;
    let parent = parents.at(-1);
    while (parent && parent.depth >= heading.depth) {
      parents.pop();
      parent = parents.at(-1);
    }
    const item: OutlineItem = { ...heading, children: [] };
    (parent?.children ?? outline).push(item);
    parents.push(item);
  }

  return outline;
}
