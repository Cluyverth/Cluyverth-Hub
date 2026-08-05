/**
 * Remark plugin resolving Obsidian wikilinks (`[[target|alias]]`) into real
 * site links at build time. Resolution runs against the public notes on disk
 * (see `notes-source.ts`); unresolved targets render as a dimmed
 * `<span class="unresolved">` and never become dead links.
 */

import type { Plugin } from 'unified';
import type { Parent, Root, Text, Link, Html } from 'mdast';
import { readFileSync } from 'node:fs';
import matter from 'gray-matter';
import { normalizeTarget, publicSlugMaps } from './notes-source';
import { localePrefix } from './i18n';

const WIKILINK_RE = /!?\[\[([^\[\]]+?)\]\]/g;

/** Language of the note currently being rendered, from its frontmatter. */
function fileLang(filePath: string | undefined): 'en' | 'pt' {
  try {
    const raw = readFileSync(filePath ?? '', 'utf8');
    return matter(raw).data.lang === 'pt' ? 'pt' : 'en';
  } catch {
    return 'en';
  }
}

/** Readable fallback label for a raw target (`folder/My-Note.md#sec` -> `My Note`). */
function prettyTarget(target: string): string {
  return target
    .split('#')[0]!
    .split('/')
    .pop()!
    .replace(/\.md$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Split one text node into text/link/html segments around every wikilink. */
function transformText(node: Text, prefix: string, slugMap: Map<string, string>): Array<Text | Link | Html> {
  const out: Array<Text | Link | Html> = [];
  let last = 0;
  for (const match of node.value.matchAll(WIKILINK_RE)) {
    const index = match.index ?? 0;
    if (index > last) out.push({ type: 'text', value: node.value.slice(last, index) });
    const [targetRaw, aliasRaw] = match[1]!.split('|');
    const target = (targetRaw ?? '').trim();
    const alias = (aliasRaw ?? '').trim();
    const normalized = normalizeTarget(target);
    const slug = normalized ? slugMap.get(normalized) : undefined;
    const label = alias !== '' ? alias : prettyTarget(target);
    if (slug) {
      out.push({
        type: 'link',
        url: `${prefix}/vault/${slug}`,
        children: [{ type: 'text', value: label }],
      });
    } else {
      out.push({ type: 'html', value: `<span class="unresolved">${escapeHtml(label)}</span>` });
    }
    last = index + match[0].length;
  }
  if (last < node.value.length) out.push({ type: 'text', value: node.value.slice(last) });
  return out;
}

function walk(node: Parent, prefix: string, slugMap: Map<string, string>): void {
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as Text | Parent;
    if (child.type === 'text') {
      const replacement = transformText(child as Text, prefix, slugMap);
      if (replacement.length !== 1 || replacement[0] !== child) {
        children.splice(i, 1, ...replacement);
        i += replacement.length - 1;
      }
    } else if ('children' in child) {
      walk(child, prefix, slugMap);
    }
  }
}

export const remarkObsidianLinks: Plugin<[], Root> = () => (tree, file) => {
  const lang = fileLang(file.path);
  const maps = publicSlugMaps();
  walk(tree, localePrefix(lang), lang === 'pt' ? maps.pt : maps.en);
};
