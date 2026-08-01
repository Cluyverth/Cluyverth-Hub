// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import { remarkObsidianLinks } from './src/lib/obsidian-links';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

/**
 * Raw HTML from notes is allowed (Obsidian notes can contain it) but always
 * sanitized: scripts, event handlers and dangerous URLs are stripped, while
 * `class` attributes are kept for styling hooks like `.unresolved`.
 */
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...(defaultSchema.attributes ?? {}),
    '*': [...((defaultSchema.attributes ?? {})['*'] ?? []), 'className'],
  },
};

// https://astro.build/config
export default defineConfig({
  site: 'https://cluyverth.com',
  output: 'static',
  integrations: [mdx()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt'],
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkObsidianLinks],
      rehypePlugins: [rehypeRaw, [rehypeSanitize, sanitizeSchema]],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
