/**
 * Build-time graph extraction.
 *
 * Nodes: public notes (round dots), one dot per tag (amber, sized by how many
 * notes carry it) and one dot per category (purple squares). Edges: resolved
 * wikilinks between notes, note to tag links and note to category links.
 * Isolated notes (no wikilinks, tags or category) are dropped unless nothing
 * is connected at all.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NOTES_DIR, normalizeTarget, publicSlugMaps, readNoteFiles } from './notes-source';

export type GraphNodeKind = 'note' | 'tag' | 'category' | 'notebook';

export interface GraphNode {
  /** Unique id: note slug, `tag:<name>` or `cat:<name>`. */
  slug: string;
  /** Display label. */
  title: string;
  kind: GraphNodeKind;
  /** Dot radius (or half-size for category squares) in the layout. */
  size: number;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const NOTE_RADIUS = 6;

const WIKILINK_RE = /!?\[\[([^\[\]]+?)\]\]/g;

export function buildGraph(): GraphData {
  const metas = readNoteFiles().filter((n) => n.status === 'public' && n.lang === 'en');
  const slugByNormalized = publicSlugMaps().en;
  const links: GraphLink[] = [];
  const seen = new Set<string>();
  const addLink = (source: string, target: string): void => {
    const key = `${source}\u0000${target}`;
    if (seen.has(key)) return;
    seen.add(key);
    links.push({ source, target });
  };

  // Tags that collide with a category name are skipped: the category dot
  // already represents that concept.
  const categoryNames = new Set(
    metas
      .map((m) => m.category?.toLowerCase())
      .filter((c): c is string => c !== undefined),
  );
  const isCategoryLike = (tag: string): boolean => categoryNames.has(tag.toLowerCase());

  for (const meta of metas) {
    const body = readFileSync(join(NOTES_DIR, meta.fileName), 'utf8');
    for (const match of body.matchAll(WIKILINK_RE)) {
      const target = match[1]!.split('|')[0]!.trim();
      const normalized = normalizeTarget(target);
      const resolved = normalized ? slugByNormalized.get(normalized) : undefined;
      if (!resolved || resolved === meta.slug) continue;
      addLink(meta.slug, resolved);
    }
    for (const tag of meta.tags) {
      if (isCategoryLike(tag)) continue;
      addLink(meta.slug, `tag:${tag}`);
    }
    if (meta.category) addLink(meta.slug, `cat:${meta.category}`);
    if (meta.notebook) addLink(meta.slug, `nb:${meta.notebook}`);
  }

  // Only connected nodes appear; fall back to everything if nothing links.
  const connected = new Set<string>();
  for (const link of links) {
    connected.add(link.source);
    connected.add(link.target);
  }
  const visible = connected.size > 0 ? metas.filter((m) => connected.has(m.slug)) : metas;

  const tagCounts = new Map<string, number>();
  for (const meta of metas) {
    for (const tag of meta.tags) {
      if (categoryNames.has(tag.toLowerCase())) continue;
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const categorySet = new Set<string>();
  const categoryCounts = new Map<string, number>();
  for (const meta of metas) {
    if (!meta.category) continue;
    categorySet.add(meta.category);
    categoryCounts.set(meta.category, (categoryCounts.get(meta.category) ?? 0) + 1);
  }
  const notebookSet = new Set<string>();
  const notebookCounts = new Map<string, number>();
  for (const meta of metas) {
    if (!meta.notebook) continue;
    notebookSet.add(meta.notebook);
    notebookCounts.set(meta.notebook, (notebookCounts.get(meta.notebook) ?? 0) + 1);
  }

  const nodes: GraphNode[] = [];
  for (const meta of visible) {
    nodes.push({ slug: meta.slug, title: meta.title, kind: 'note', size: NOTE_RADIUS });
  }
  for (const [tag, count] of tagCounts) {
    // Tag dots grow with the number of notes carrying them.
    nodes.push({ slug: `tag:${tag}`, title: `#${tag}`, kind: 'tag', size: Math.min(5 + count * 2.5, 16) });
  }
  for (const category of categorySet) {
    const count = categoryCounts.get(category) ?? 1;
    // Category squares grow with the number of notes in the category.
    nodes.push({ slug: `cat:${category}`, title: category, kind: 'category', size: Math.min(6 + count * 2.5, 17) });
  }
  for (const notebook of notebookSet) {
    const count = notebookCounts.get(notebook) ?? 1;
    // Notebook diamonds grow with the number of notes inside them.
    nodes.push({ slug: `nb:${notebook}`, title: notebook, kind: 'notebook', size: Math.min(6 + count * 2.5, 17) });
  }

  return { nodes, links };
}
