/**
 * Reading stats for a note body: word count and estimated reading time.
 * Markdown syntax is stripped roughly before counting (code blocks, images,
 * link targets, heading markers); wikilink aliases keep their text.
 */

export interface ReadingStats {
  words: number;
  minutes: number;
}

const WORDS_PER_MINUTE = 200;

export function readingStats(markdown: string): ReadingStats {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, ' ');
  const text = withoutCode
    .replace(/^\s{0,3}#{1,6}\s.*$/gm, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>~|]/g, ' ')
    .replace(/[\[\]()<>]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return { words, minutes: Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)) };
}
