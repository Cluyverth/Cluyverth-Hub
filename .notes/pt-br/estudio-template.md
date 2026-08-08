---
title: Estudio Template
date: 2026-08-08
status: public
lang: pt
translation: estudio-template
project: true
stack: [Astro, Tailwind CSS, Bun]
category: Projects
tags: [astro, web, template, portfolio, gallery]
image: /images/estudio-template.webp
repo: https://github.com/Cluyverth/Estudio-Template
live: https://estudio.cluyverth.com
description: "Template de portfólio cinematográfico para profissionais que vivem do próprio trabalho, com galeria em lightbox, tema escuro e conversão discreta pelo WhatsApp."
---

**Um site que expõe o seu trabalho, em vez de só empurrar o WhatsApp.** Template de portfólio para profissionais que vivem do próprio talento: fotógrafos, designers, arquitetos, maquiadores, chefs, marcenarias e qualquer negócio que venda serviço com assinatura. Feito para ser entregue a clientes reais, com conteúdo editável em Markdown e dados centralizados em um único arquivo.

<div class="badges">

[![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Bun](https://img.shields.io/badge/Bun-1.3-F9F1E1?logo=bun&logoColor=white)](https://bun.sh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Cluyverth/Estudio-Template/blob/main/LICENSE)

</div>

## O que é

Enquanto o [[oficio-template|Ofício]] converte direto para o WhatsApp, o **Estúdio** foi desenhado para **expor primeiro, converter depois**: uma experiência de galeria, com tema escuro cinematográfico, tipografia editorial, galeria em masonry com lightbox em tela cheia e animações sutis que valorizam o trabalho.

- **Para o cliente:** um portfólio chique que faz o visitante *sentir* a qualidade do trabalho antes de qualquer conversa, com WhatsApp elegante quando a conversa for acontecer.
- **Para o dev:** o mesmo codebase limpo e 100% estático do Ofício: sem banco, sem backend, ~6 KB de JavaScript no navegador. Deploy em qualquer lugar.

## Screenshots

| Home | Galeria |
| --- | --- |
| ![Home](/images/estudio-screenshot-home.webp) | ![Galeria](/images/estudio-screenshot-galeria.webp) |

## O que o site entrega

- **Experiência de galeria**: hero em tela cheia com zoom lento (Ken Burns) e parallax sutil; galeria em masonry com reveal em cascata; lightbox cinematográfico com navegação por teclado (←/→/Esc), swipe no mobile e fade entre fotos.
- **Animações com classe**: reveals ao rolar, film-strip de fotos em movimento lento, contadores de estatísticas, navbar transparente → sólida com blur. Tudo em transform/opacity (GPU), ~6 KB de JS vanilla, e 100% desligado com `prefers-reduced-motion`.
- **WhatsApp na medida certa**: botão no header, no CTA final e flutuante. Sem botão de conversão em cima de cada foto: a arte é a conversão.
- **Galeria completa com filtros**: página com filtro por categoria (casamento, ensaio, retrato, evento), várias fotos por ensaio e lightbox compartilhado.
- **Especialidades**: cards com foto, ícone e texto, editáveis em Markdown.
- **Depoimentos com curadoria**: a home mostra apenas as melhores avaliações (flag `featured`), com nota média do Google.
- **Política de privacidade em conformidade com a LGPD**, incluindo o direito de imagem (essencial para fotógrafos) e a autorização de divulgação revogável.
- **SEO estruturado**: JSON-LD com `ProfessionalService` (configurável), `aggregateRating`, `Review` e `FAQPage`, sitemap automático, Open Graph.
- **Performance**: site 100% estático, imagens otimizadas pelo Astro, fontes self-hosted (sem request a terceiros, sem cookies de rastreamento).

## Stack

| Camada | Escolha | Por quê |
| --- | --- | --- |
| Framework | **Astro 7** | Gera HTML estático com ~0 JS; content collections validam o conteúdo |
| Estilo | **Tailwind CSS 4** | Design system rápido e consistente via tokens CSS |
| Runtime | **Bun** | Instalação e build muito mais rápidos que npm |
| Fontes | **Cormorant Garamond + Inter** | Self-hosted via @fontsource; serifa editorial elegante + sans limpa |
| SEO | **@astrojs/sitemap** | sitemap.xml gerado no build |

## Como rodar

```sh
bun install
bun run dev       # desenvolvimento em http://localhost:4321
bun run build     # gera o site estático em dist/
bun run preview   # serve o build localmente
```

## Personalização para um cliente (~30 minutos)

Tudo que muda de negócio para negócio está em 2 lugares:

1. **`src/config/site.ts`**: nome, tagline, WhatsApp, endereço, horário, Instagram, cores da marca, estatísticas, textos, citação e FAQ. Um único arquivo.
2. **`src/content/`**: conteúdo em Markdown:
   - `gallery/`: ensaios/trabalhos (várias fotos por ensaio, categoria, tags, ano, local);
   - `specialties/`: especialidades (título, ícone, foto, descrição);
   - `reviews/`: avaliações (`featured: true` define o que aparece na home).

A ordem das seções da home é definida em `src/pages/index.astro`.

> O exemplo de conteúdo é de um estúdio de fotografia, mas o template não é só para fotógrafos: a marca, os textos e as coleções servem para qualquer profissional que venda serviço com portfólio.

## Estrutura

```
src/
├── config/site.ts              ← dados do cliente (o que muda)
├── content.config.ts           ← schemas das collections (validação)
├── content/                    ← galeria, especialidades e avaliações (md + fotos)
├── lib/                        ← helpers (WhatsApp, formatação)
├── components/
│   ├── ui/                     ← Icon, Stars, SectionHeading, WhatsAppButton
│   ├── sections/               ← Hero, FilmStrip, Galeria, Especialidades,
│   │                             Sobre, Depoimentos, Faq, Cta
│   ├── Lightbox.astro          ← lightbox em tela cheia (compartilhado)
│   ├── Navbar.astro
│   ├── Footer.astro
│   ├── FloatingWhatsApp.astro  ← botão fixo do WhatsApp
│   └── BackToTop.astro         ← botão voltar ao topo
├── layouts/Base.astro          ← head SEO + JSON-LD + motor de animações
└── pages/                      ← index (home), galeria, privacidade e 404
```

## Deploy

### Coolify (VPS própria)

O repositório inclui um [`Dockerfile`](https://github.com/Cluyverth/Estudio-Template/blob/main/Dockerfile) multi-stage: ele fixa a versão do Bun (1.3.14, a mesma do lockfile), roda o build do Astro e serve o resultado com Nginx.

**Passo a passo (deploy público via Coolify):**

1. **Create New Resource** → **Public Repository** → cole a URL do repositório.
2. **Build Pack: Dockerfile**: o Coolify detecta o `Dockerfile` na raiz sozinho.
3. **Domain**: defina o domínio (ex.: `estudio.cluyverth.com`) e clique em **Deploy**. O SSL via Let's Encrypt é emitido automaticamente.

A imagem final roda apenas o Nginx servindo o `dist/` (arquivos estáticos).

### Outros provedores

- **Netlify**: build `bun run build`, publish directory `dist`
- **Vercel**: framework preset Astro, output `dist`
- **Cloudflare Pages**: build `bun run build`, output `dist`

## LGPD

Política de privacidade pronta em `src/pages/privacidade.astro`: o site não coleta dados automaticamente (sem formulários, sem cookies de rastreamento), as conversas acontecem no WhatsApp do cliente, e fotos/depoimentos são publicados somente com consentimento, com direito de revogação do uso de imagem.

## Créditos

Fotos de exemplo do [Unsplash](https://unsplash.com) (licença livre para uso comercial). Substitua pelas fotos reais dos trabalhos do cliente, com autorização de uso de imagem.

## Licença

[MIT](https://github.com/Cluyverth/Estudio-Template/blob/main/LICENSE) © 2026 Cluyverth Pereira
