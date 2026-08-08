import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: '.notes' }),
  schema: z.object({
    title: z.string().min(1),
    /** URL slug; defaults to the note's filename. */
    slug: z.string().optional(),
    date: z.coerce.date(),
    author: z.string().default('Cluyverth Pereira'),
    /** The publication gate: only `public` renders on the site. */
    status: z.enum(['public', 'draft', 'private']),
    tags: z.array(z.string()).default([]),
    /** Optional grouping label shown with a folder icon. */
    category: z.string().optional(),
    /** Notebook this note belongs to (a note has at most one). */
    notebook: z.string().optional(),
    /** Note language: en is the default, pt notes render under /pt. */
    lang: z.enum(['en', 'pt']).default('en'),
    /** Slug of the translated counterpart note. */
    translation: z.string().optional(),
    /** Notes render in the vault; `project: true` notes render on /projects. */
    project: z.boolean().default(false),
    /** Project tech stack, shown as the project's tags. */
    stack: z.array(z.string()).default([]),
    /** Project repository URL (renders a source button on project pages). */
    repo: z.string().url().optional(),
    /** Project live site URL (renders a live button on project pages). */
    live: z.string().url().optional(),
    /** Project cover image URL (optional). */
    image: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { notes };
