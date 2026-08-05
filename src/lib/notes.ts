/**
 * Collection-level helpers for note pages. The `status` gate lives here:
 * public notes render everywhere; drafts additionally render in dev so they
 * can be previewed before publishing; private notes never render.
 */

import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from './i18n';

export type NoteEntry = CollectionEntry<'notes'>;

export function noteSlug(entry: NoteEntry): string {
  const custom = entry.data.slug?.trim();
  if (custom) return custom;
  const id = entry.id;
  const basename = id.split('/').pop() ?? id;
  return basename.replace(/\.md$/i, '');
}

export function isVisible(entry: NoteEntry, dev: boolean): boolean {
  return entry.data.status === 'public' || (dev && entry.data.status === 'draft');
}

/** Visible notes for a locale, newest first. */
export async function getVisibleNotes(locale: Locale, dev: boolean): Promise<NoteEntry[]> {
  const all = await getCollection('notes');
  return all
    .filter((entry) => isVisible(entry, dev) && entry.data.lang === locale)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
