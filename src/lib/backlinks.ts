/**
 * Build-time backlinks: which public notes link to a given note, in the same
 * language. This lets readers navigate to a note even when the note itself
 * links nothing.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NOTES_DIR, normalizeTarget, publicSlugMaps, readNoteFiles } from './notes-source';
import { localePrefix, type Locale } from './i18n';

export interface Backlink {
  slug: string;
  title: string;
  /** Locale-prefixed URL. */
  href: string;
}

const WIKILINK_RE = /!?\[\[([^\[\]]+?)\]\]/g;

export function getBacklinks(slug: string, locale: Locale): Backlink[] {
  const maps = publicSlugMaps();
  const slugByNormalized = locale === 'pt' ? maps.pt : maps.en;
  const prefix = localePrefix(locale);
  const result: Backlink[] = [];
  for (const meta of readNoteFiles()) {
    if (meta.status !== 'public' || meta.lang !== locale || meta.slug === slug) continue;
    const body = readFileSync(join(NOTES_DIR, meta.fileName), 'utf8');
    for (const match of body.matchAll(WIKILINK_RE)) {
      const target = match[1]!.split('|')[0]!.trim();
      const normalized = normalizeTarget(target);
      if (normalized && slugByNormalized.get(normalized) === slug) {
        result.push({ slug: meta.slug, title: meta.title, href: `${prefix}/vault/${meta.slug}` });
        break;
      }
    }
  }
  return result.sort((a, b) => a.title.localeCompare(b.title));
}
