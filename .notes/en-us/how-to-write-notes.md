---
title: How to write notes for this site
date: 2026-08-05
lang: en
translation: how-to-write-notes
author: Cluyverth Pereira
status: public
category: Guides
notebook: Guides
tags: [obsidian, markdown, guide]
description: Everything a note can have, and how to write one in Obsidian or any markdown app.
---

This guide covers how to write notes for this site: where they live, every frontmatter field, and how to link notes together. It applies to Obsidian and to any other markdown app, because the notes are plain markdown files.

## Where notes live

Notes are plain markdown files in the vault. The site reads the ones marked `status: public`. You can write them in Obsidian, VS Code, Typora, or any editor that saves markdown.

## The frontmatter

Frontmatter is a YAML block at the top of the file, between `---` lines. It decides everything about the note.

### Required fields

- `title`: the note title
- `date`: the publication date, `YYYY-MM-DD`
- `status`: `public`, `draft` or `private`

### Optional fields

- `slug`: the URL, defaults to the file name
- `author`: defaults to Cluyverth Pereira
- `tags`: a list, e.g. `tags: [astro, guide]`
- `category`: groups notes by color in the graph
- `notebook`: groups notes into clusters, and a note can only have one
- `description`: one line shown on cards
- `project: true`: renders the note on the projects page
- `stack`: tech list for projects
- `image`: a cover URL for cards and the graph
- `lang`: `en` or `pt`, marks the note language
- `translation`: the slug of the note in the other language

## Statuses

- `public`: renders everywhere
- `draft`: visible in local dev only
- `private`: never renders anywhere

## Linking notes

Links are optional. A note can exist without linking to anything, and it can still be found through its back links (the notes that link to it, shown on the right side of the note page).

Use Obsidian wikilinks to connect notes:

- `[[rss-guide]]` links to another note
- `[[how-to-write-notes|writing guide]]` links with a custom label
- Links to private or missing notes render dimmed, never broken

## A complete example

```markdown
---
title: My first note
date: 2026-08-05
status: public
tags: [meta]
category: Guides
notebook: Guides
description: A short summary shown on the card.
---

The note body. Markdown works: **bold**, lists, headings.

See the [[rss-guide|RSS guide]].
```

## Checklist before publishing

1. Frontmatter has `title`, `date` and `status: public`
2. The `description` is written

That is it. See [[cluyverth-hub]] for the full pipeline behind this site.
