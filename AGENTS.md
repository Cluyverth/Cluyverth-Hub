# Cluyverth Hub: working agreements

This file is the operating manual for this repository. It records the decisions, why they were made, and the rules that keep the project consistent. If a decision looks strange, the reasoning is documented here or in the [README](README.md).

## Writing rules (hard rules, apply everywhere)

- NEVER use em dashes (—). Use commas, colons or periods instead. Applies to site copy, GitHub issues and PRs, commit messages and chat.
- Inside short descriptions on the site, also avoid colons and semicolons. Prefer commas and periods.
- No emojis unless the user asks for them.
- Write good English. Translated parts must make sense in Brazilian Portuguese.
- Sign any PR or message inside a PR created by the assistant with `Ass.: Friday` at the end, so it is clear the assistant authored it even though it goes out under the user's GitHub profile.

## Identity

- Owner: Cluyverth Pereira. The name is Cluyverth Pereira, never "Cluyverth Odryin Pereira" and never with the Odryin alias on the site. Odryin exists only as social handles.
- Site name: Cluyverth Hub. Domain: cluyverth.com. Static, no backend. Public repo: Cluyverth/Cluyverth-Hub. Deployed via Coolify on a VPS.
- Voice: site copy is written in first person, as the owner speaking ("I write", "my vault"). Never describe the owner in third person in site copy.

## Why the architecture is this way

The site exists to publish writing, not to run software. Every architectural decision follows from that:

- **Static site, no backend.** The content is markdown and read-only, so a server adds cost and attack surface with zero benefit. Astro renders everything at build time, and only true interactive islands ship JavaScript (graph, vault search, TOC scrollspy, Mermaid).
- **One public repo, notes committed.** Publishing should be as simple as writing. The public notes are committed to this repo, so the build needs no second repo, no tokens and no build-time cloning. Privacy is enforced at the source: the vault's own `.gitignore` keeps private notes out of git entirely.
- **Status gate as defense in depth.** Only `status: public` renders, in every environment. If a non-public note somehow reached the repo, the gate still filters it.
- **Build-time wikilink resolution.** Obsidian links become real URLs at build time, and the same resolution feeds the graph, so pages and graph can never disagree.
- **Typed data files.** Links and icons are typed data, so the build fails on a broken shape instead of shipping a broken page.

## Notes architecture

- There is ONE repo, this one, and it is public. It contains the site code and the public notes. Private notes never enter it: the `.notes/.gitignore` ignores the `private/` folder inside `.notes/`, so anything placed there is never committed or pushed.
- Public notes are committed under `.notes/` (`en-us/*.{md,mdx}` and `pt-br/*.{md,mdx}` with mirrored filenames; the folder is the language). Writing a note means committing it like any other file, and pushing to `main` triggers the deploy.
- Frontmatter gate: only `status: public` renders in any environment, drafts additionally render in dev. Private notes never render.
- Frontmatter contract: `title` (required), `date` (required), `status` (public|draft|private, required), and optional `slug`, `author`, `tags` (defaults to empty), `category`, `notebook` (at most one per note, drives the vault filter pills), `description`, `project` (renders on /projects), `stack` (project tech stack), `repo` (project source URL, renders a source button on project pages), `live` (project live site URL, renders a live button on project pages), `image` (project cover URL), `lang` (en|pt), `translation` (slug of the counterpart note).
- Obsidian wikilinks (`[[note|alias]]`) are resolved at build time by `src/lib/obsidian-links.ts`, and the same resolution feeds the graph edges (`src/lib/graph-data.ts`). PT notes resolve to PT slugs via the translation pairing.
- MDX notes can import components.
- Mermaid diagrams in notes (` ```mermaid ` blocks) render client-side on note pages. Note: the markdown engine highlights code blocks with Shiki, so mermaid blocks are detected by their first line (the diagram kind) instead of a language class.

## GitHub flow

Hierarchy, from vision to concrete work:

1. **Feature issue**: stakeholder vision for the site. Labels: `feature`. Each feature is one branch.
2. **PBI issue** (product backlog item): a user story with acceptance criteria, referencing its parent feature, with the tasks as a checklist inside the issue. Labels: `pbi`, plus domain labels.

Tasks are checklist items inside the PBI issue, not separate issues. This keeps the tracker small (features + PBIs only) while preserving the three-level structure.

Workflow rules:

- One branch per feature, named `feat/<feature-slug>` (for example `feat/public-vault`). All PBIs and tasks of that feature are developed on that branch, in order, and checked off as they land.
- One PR per feature, opened from its branch to `main`. The user reviews and approves every PR. Squash merge to `main`.
- Conventional commits (commitlint enforced by simple-git-hooks).
- The issue hierarchy lives in the tracker. The branch name lives in the feature issue body, so the two never drift apart.

Why this shape: features give reviewable units, PBIs give acceptance criteria, tasks give small checkable steps. One branch per feature keeps each PR self-contained and the history on `main` linear.

## Engineering

- TypeScript strict everywhere. No `any`, no `@ts-ignore`, no type-skipping. `astro check` must pass with 0 errors and 0 warnings.
- Content-first design with the carcará palette: ink #131313, paper #faf9f5, terra #d96c3b, gold #eac148, slate #94a4b1. Class-based dark mode.
- Self-hosted Inter variable font across the whole site (display and body). No external font requests.
- Icons: lucide via astro-lucide. Brand icons are deprecated in lucide, so custom marks (GitHub, LinkedIn, YouTube, Twitch, Kick, X) are hand-built lucide-compatible tuples in `src/lib/brand-icons.ts`.
- Markdown content is styled with @tailwindcss/typography and sanitized with rehype-sanitize (raw HTML from notes is allowed but scripts and event handlers are stripped).
- The site is Astro 7 static with the Sätteri markdown engine, and markdown is customized via `markdown.processor: unified(...)` in astro.config.mjs.
