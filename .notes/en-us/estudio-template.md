---
title: Estudio Template
date: 2026-08-08
status: public
lang: en
translation: estudio-template
project: true
stack: [Astro, Tailwind CSS, Bun]
category: Projects
tags: [astro, web, template, portfolio, gallery]
image: /images/estudio-template.webp
repo: https://github.com/Cluyverth/Estudio-Template
live: https://estudio.cluyverth.com
description: "A cinematic portfolio template for professionals who live off their own work, with a lightbox gallery, dark theme and discreet WhatsApp conversion."
---

**A site that shows off your work, instead of just pushing WhatsApp.** A portfolio template for professionals who live off their own talent: photographers, designers, architects, makeup artists, chefs, cabinetmakers and any business that sells signature work. Built to be handed to real clients, with content editable in Markdown and data centralized in a single file.

<div class="badges">

[![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Bun](https://img.shields.io/badge/Bun-1.3-F9F1E1?logo=bun&logoColor=white)](https://bun.sh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Cluyverth/Estudio-Template/blob/main/LICENSE)

</div>

## What it is

While the [[oficio-template|Oficio]] converts straight to WhatsApp, the **Estúdio** was designed to **show first, convert later**: a gallery experience, with a cinematic dark theme, editorial typography, masonry gallery with fullscreen lightbox and subtle animations that elevate the work.

- **For the client:** a classy portfolio that makes visitors *feel* the quality of the work before any conversation, with an elegant WhatsApp button when the conversation is meant to happen.
- **For the dev:** the same clean, 100% static codebase as Oficio: no database, no backend, ~6 KB of JavaScript in the browser. Deploy anywhere.

## Screenshots

| Home | Gallery |
| --- | --- |
| ![Home](/images/estudio-screenshot-home.webp) | ![Gallery](/images/estudio-screenshot-galeria.webp) |

## What the site delivers

- **Gallery experience**: fullscreen hero with slow zoom (Ken Burns) and subtle parallax; masonry gallery with cascading reveal; cinematic lightbox with keyboard navigation (←/→/Esc), swipe on mobile and fade between photos.
- **Classy animations**: scroll reveals, a slow-moving film strip of photos, stat counters, transparent → solid navbar with blur. All transform/opacity (GPU), ~6 KB of vanilla JS, fully disabled with `prefers-reduced-motion`.
- **WhatsApp in the right measure**: button in the header, in the final CTA and floating. No conversion button on top of every photo: the art is the conversion.
- **Full gallery with filters**: page with category filter (wedding, shoot, portrait, event), multiple photos per shoot and a shared lightbox.
- **Specialties**: cards with photo, icon and text, editable in Markdown.
- **Curated testimonials**: the home page shows only the best reviews (a `featured` flag), with the average Google rating.
- **LGPD-compliant privacy policy**, including image rights (essential for photographers) and revocable disclosure authorization.
- **Structured SEO**: JSON-LD with `ProfessionalService` (configurable), `aggregateRating`, `Review` and `FAQPage`, automatic sitemap, Open Graph.
- **Performance**: 100% static site, images optimized by Astro, self-hosted fonts (no third-party requests, no tracking cookies).

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Astro 7** | Generates static HTML with ~0 JS; content collections validate the content |
| Styling | **Tailwind CSS 4** | Fast, consistent design system via CSS tokens |
| Runtime | **Bun** | Much faster install and build than npm |
| Fonts | **Cormorant Garamond + Inter** | Self-hosted via @fontsource; elegant editorial serif + clean sans |
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

1. **`src/config/site.ts`**: name, tagline, WhatsApp, address, hours, Instagram, brand colors, stats, texts, quote and FAQ. One single file.
2. **`src/content/`**: content in Markdown:
   - `gallery/`: shoots/work (multiple photos per shoot, category, tags, year, location);
   - `specialties/`: specialties (title, icon, photo, description);
   - `reviews/`: reviews (`featured: true` decides what appears on the home page).

The order of the home sections is defined in `src/pages/index.astro`.

> The sample content is from a photography studio, but the template is not only for photographers: the brand, texts and collections work for any professional who sells portfolio-driven work.

## Structure

```
src/
├── config/site.ts              ← client data (what changes)
├── content.config.ts           ← collection schemas (validation)
├── content/                    ← gallery, specialties and reviews (md + photos)
├── lib/                        ← helpers (WhatsApp, formatting)
├── components/
│   ├── ui/                     ← Icon, Stars, SectionHeading, WhatsAppButton
│   ├── sections/               ← Hero, FilmStrip, Gallery, Specialties,
│   │                             About, Reviews, Faq, Cta
│   ├── Lightbox.astro          ← fullscreen lightbox (shared)
│   ├── Navbar.astro
│   ├── Footer.astro
│   ├── FloatingWhatsApp.astro  ← fixed WhatsApp button
│   └── BackToTop.astro         ← back to top button
├── layouts/Base.astro          ← SEO head + JSON-LD + animation engine
└── pages/                      ← index (home), gallery, privacy and 404
```

## Deploy

### Coolify (own VPS)

The repository includes a multi-stage [`Dockerfile`](https://github.com/Cluyverth/Estudio-Template/blob/main/Dockerfile) that pins the Bun version (1.3.14, the same as the lockfile), runs the Astro build and serves the result with Nginx.

**Step by step (public deploy via Coolify):**

1. **Create New Resource** → **Public Repository** → paste the repository URL.
2. **Build Pack: Dockerfile**: Coolify detects the `Dockerfile` in the root by itself.
3. **Domain**: set the domain (e.g. `estudio.cluyverth.com`) and click **Deploy**. SSL via Let's Encrypt is issued automatically.

The final image runs only Nginx serving the `dist/` (static files).

### Other providers

- **Netlify**: build `bun run build`, publish directory `dist`
- **Vercel**: Astro framework preset, output `dist`
- **Cloudflare Pages**: build `bun run build`, output `dist`

## Privacy under the LGPD

Ready privacy policy in `src/pages/privacidade.astro`: the site collects no data automatically (no forms, no tracking cookies), conversations happen on the client's WhatsApp, and photos and testimonials are published only with consent, with revocable image-use authorization.

## Credits

Sample photos from [Unsplash](https://unsplash.com) (free for commercial use). Replace them with the client's real work photos, with image rights permission.

## License

[MIT](https://github.com/Cluyverth/Estudio-Template/blob/main/LICENSE) © 2026 Cluyverth Pereira
