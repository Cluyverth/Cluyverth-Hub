---
title: Oficio Template
date: 2026-08-08
status: public
lang: en
translation: oficio-template
project: true
stack: [Astro, Tailwind CSS, Bun]
category: Projects
tags: [astro, web, template, static-site]
image: /images/oficio-template.webp
repo: https://github.com/Cluyverth/oficio-template
live: https://oficio.cluyverth.com
description: "A ready-to-deliver static site template for service businesses, with WhatsApp conversion, project gallery and LGPD-ready privacy."
---

**A professional website for people who live off their own work.** A complete site template for service providers: cabinetmakers, plumbers, electricians, renovations, any business that sells service. Built to be handed to real clients, with content editable in Markdown and data centralized in a single file.

<div class="badges">

[![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Bun](https://img.shields.io/badge/Bun-1.3-F9F1E1?logo=bun&logoColor=white)](https://bun.sh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Cluyverth/oficio-template/blob/main/LICENSE)

</div>

## What it is

A static site product built to solve a real problem: small service businesses need a professional online presence, but have no time (or budget) for a custom site from scratch. This template delivers it in a package anyone can adapt in minutes.

- **For the client:** a fast, beautiful site focused on conversion, with a WhatsApp button everywhere, Google reviews and a project gallery.
- **For the developer:** a clean, documented, 100% static codebase, no database, no backend, almost no JavaScript in the browser. Deploy anywhere.

## Screenshots

| Home | Projects |
| --- | --- |
| ![Home](/images/oficio-screenshot-home.webp) | ![Projects](/images/oficio-screenshot-projetos.webp) |

## What the site delivers

- **Direct WhatsApp conversion** — a floating button, plus buttons in the header, hero and every service and project, with a message pre-filled by context ("Hello! I want a quote for custom kitchens."). No forms, no backend, no cost.
- **Project page with gallery and lightbox** — one card per project, multiple photos per project, photo navigation and a quote CTA inside the lightbox.
- **Curated Google reviews** — the home page shows only the best reviews (a `featured` flag), with the photo of the project they mention.
- **About section with a map** — Google Maps embedded from the address in the config; the pin follows the client's address automatically.
- **LGPD-compliant privacy policy** — a ready page, including data subject rights and image handling.
- **Structured SEO** — JSON-LD with `LocalBusiness`, `aggregateRating`, `Review` and `FAQPage` for Google rich results, automatic sitemap, Open Graph.
- **Performance** — 100% static site, ~0 JavaScript in the browser, images optimized by Astro and self-hosted fonts (no third-party requests, no tracking cookies).

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Astro 7** | Generates static HTML with ~0 JS; content collections validate the content |
| Styling | **Tailwind CSS 4** | Fast, consistent design system via CSS tokens |
| Runtime | **Bun** | Much faster install and build than npm |
| Fonts | **Lora + Plus Jakarta Sans** | Self-hosted via @fontsource; handcrafted, readable look with no external dependency |
| SEO | **@astrojs/sitemap** | sitemap.xml generated at build |

## How to run

```sh
bun install
bun run dev       # development at http://localhost:4321
bun run build     # generates the static site in dist/
bun run preview   # serves the build locally
```

## Customizing for a client (~30 minutes)

Everything that changes from business to business lives in 2 places:

1. **`src/config/site.ts`** — name, tagline, WhatsApp, address, hours, Instagram, brand colors, texts, stats and FAQ. One single file.
2. **`src/content/`** — content in Markdown:
   - `services/` — services (title, icon, photo, description);
   - `portfolio/` — projects (multiple photos per project, tags, year);
   - `reviews/` — Google reviews (`featured: true` decides what appears on the home page).

The order of the home sections is defined in `src/pages/index.astro`.

## Structure

```
src/
├── config/site.ts              ← client data (what changes)
├── content.config.ts           ← collection schemas (validation)
├── content/                    ← services, projects and reviews (md + photos)
├── lib/                        ← helpers (WhatsApp, formatting)
├── components/
│   ├── ui/                     ← Icon, Stars, WhatsAppButton, SectionHeading
│   ├── sections/               ← Hero, Services, Reviews, About, FAQ, CTA
│   ├── Navbar.astro
│   ├── Footer.astro
│   ├── FloatingWhatsApp.astro  ← fixed WhatsApp button
│   └── BackToTop.astro         ← back to top button
├── layouts/Base.astro          ← SEO head + JSON-LD + client colors
└── pages/                      ← index (home), projects, privacy and 404
```

## Deploy

### Coolify (own VPS)

The repository includes a [`nixpacks.toml`](https://github.com/Cluyverth/oficio-template/blob/main/nixpacks.toml) that pins the build. On Coolify: **Create New Resource → Public Repository** → Build Pack **Nixpacks** → check **Is it a static site?** → **Publish Directory** `/dist`. The site is served with Nginx and rebuilds on every push.

### Other providers

- **Netlify** — build `bun run build`, publish directory `dist`
- **Vercel** — Astro framework preset, output `dist`
- **Cloudflare Pages** — build `bun run build`, output `dist`

## Privacy under the LGPD

Ready privacy policy in `src/pages/privacidade.astro`: the site collects no data automatically (no forms, no tracking cookies), conversations happen on the client's WhatsApp, and photos and testimonials are published only with consent.

## Credits

Sample photos from [Unsplash](https://unsplash.com) (free for commercial use). Replace them with the client's real work photos, with image rights permission.

## License

[MIT](https://github.com/Cluyverth/oficio-template/blob/main/LICENSE) © 2026 Cluyverth Pereira
