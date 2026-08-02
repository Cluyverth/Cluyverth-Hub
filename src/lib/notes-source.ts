/**
 * Disk-level access to the notes source directory.
 *
 * The source of truth is the gitignored `.notes/` directory (a clone of the
 * private notes repo, `NOTES_PATH` overrides it). Both the content loader and
 * the wikilink resolver read from here directly, so resolution is consistent
 * across note pages and the graph, without depending on collection state.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

export type NoteStatus = 'public' | 'draft' | 'private';

export interface NoteMeta {
  /** URL slug: frontmatter `slug` or the file basename. */
  slug: string;
  /** File name inside the notes dir (for reading the body). */
  fileName: string;
  title: string;
  status: NoteStatus;
  tags: string[];
  category?: string;
  notebook?: string;
  lang: 'en' | 'pt';
  translation?: string;
}

export const NOTES_DIR: string = process.env.NOTES_PATH ?? '.notes';

/** All notes on disk: `en-us/*.md` and `pt-br/*.md` are mirrored per note. */
export function readNoteFiles(): NoteMeta[] {
  const metas: NoteMeta[] = [];
  for (const subdir of ['en-us', 'pt-br']) {
    let files: string[];
    try {
      files = readdirSync(join(NOTES_DIR, subdir)).filter((f) => f.endsWith('.md'));
    } catch {
      continue;
    }
    for (const fileName of files) {
      const raw = readFileSync(join(NOTES_DIR, subdir, fileName), 'utf8');
      const data = matter(raw).data as Record<string, unknown>;
      const title = typeof data.title === 'string' ? data.title : fileName;
      const statusRaw = typeof data.status === 'string' ? data.status : 'private';
      const status: NoteStatus =
        statusRaw === 'public' || statusRaw === 'draft' ? statusRaw : 'private';
      const customSlug = typeof data.slug === 'string' && data.slug.trim() !== '' ? data.slug.trim() : undefined;
      const tags = Array.isArray(data.tags)
        ? data.tags.filter((tag): tag is string => typeof tag === 'string')
        : [];
      const category =
        typeof data.category === 'string' && data.category.trim() !== '' ? data.category.trim() : undefined;
      const notebook =
        typeof data.notebook === 'string' && data.notebook.trim() !== '' ? data.notebook.trim() : undefined;
      const lang: 'en' | 'pt' = data.lang === 'pt' ? 'pt' : 'en';
      const translation =
        typeof data.translation === 'string' && data.translation.trim() !== '' ? data.translation.trim() : undefined;
      metas.push({
        slug: customSlug ?? fileName.replace(/\.md$/i, ''),
        fileName: `${subdir}/${fileName}`,
        title,
        status,
        tags,
        category,
        notebook,
        lang,
        translation,
      });
    }
  }
  return metas;
}

/**
 * Normalize an Obsidian wikilink target so it can be matched against slugs:
 * strip `#section` and `.md`, take the basename, lowercase, fold spaces to
 * dashes. Returns `undefined` for empty input.
 */
export function normalizeTarget(target: string): string | undefined {
  const base = target.split('#')[0]!.split('/').pop()?.replace(/\.md$/i, '');
  if (!base) return undefined;
  const norm = base.trim().toLowerCase().replace(/[\s_]+/g, '-');
  return norm === '' ? undefined : norm;
}

/**
 * Map of normalized target -> slug per language for every public note on
 * disk. Portuguese notes are keyed by their `translation` slug (the English
 * one), so `[[rss-guide]]` written inside a PT note resolves to the PT file.
 */
export function publicSlugMaps(): { en: Map<string, string>; pt: Map<string, string> } {
  const en = new Map<string, string>();
  const pt = new Map<string, string>();
  for (const meta of readNoteFiles()) {
    if (meta.status !== 'public') continue;
    const key = meta.lang === 'pt' ? (meta.translation ?? meta.slug) : meta.slug;
    const normalized = normalizeTarget(key);
    if (!normalized) continue;
    const map = meta.lang === 'pt' ? pt : en;
    map.set(normalized, meta.slug);
    const raw = key.toLowerCase();
    if (raw !== normalized) map.set(raw, meta.slug);
  }
  return { en, pt };
}
