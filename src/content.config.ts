import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const text = z.string().trim().min(1);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase, hyphen-separated slug.');

const posts = defineCollection({
  loader: glob({
    base: './vault/posts',
    pattern: '**/*.md',
    // Keep source IDs independent of the public slug so duplicates cannot overwrite each other.
    generateId: ({ entry }) => entry,
  }),
  schema: z.object({
    title: text,
    slug,
    category: text,
    tags: z.array(text),
    date: z.iso.date(),
    summary: text,
    standfirst: text.optional(),
    related: z.array(slug).default([]),
    references: z.array(z.object({ title: text, url: z.url({ protocol: /^https?$/ }) })).default([]),
  }),
});

export const collections = { posts };
