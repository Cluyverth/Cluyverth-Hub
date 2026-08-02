---
title: Como usar o RSS do site
date: 2026-08-05
author: Cluyverth Pereira
status: public
lang: pt
translation: rss-guide
category: Guides
notebook: Guides
tags: [rss, guide]
description: Assine o vault com qualquer leitor de RSS, sem precisar de conta.
---

O site publica um feed RSS com cada nota pública, então você pode acompanhar o vault de qualquer leitor de RSS sem conta.

## A URL do feed

```
https://cluyverth.com/pt/rss.xml
```

Também existe um botão de RSS no rodapé de todas as páginas.

## Como assinar

1. Copie a URL do feed.
2. Abra o seu leitor de RSS.
3. Adicione a URL como um novo feed.
4. Novas notas públicas aparecem automaticamente.

## Aplicativos para ler feeds

Qualquer leitor de RSS funciona. Algumas boas opções:

- **NetNewsWire** (macOS, iOS): gratuito, rápido, sem conta
- **Feedly** (web, mobile): simples e muito usado
- **Reeder** (plataformas Apple): leitor refinado
- **Readwise Reader** (web, mobile): fila de leitura com destaques
- **Miniflux** (self-hosted): mínimo e rápido
- **News** (Android): já vem em muitos aparelhos Android

## O que aparece no feed

Apenas notas com `status: public`. Rascunhos e notas privadas nunca são publicados, nem aqui, nem no site. O feed é gerado no build, então ele atualiza sempre que o site faz deploy.

Veja o [[cluyverth-hub]] para entender como o site funciona, ou o [[how-to-write-notes]] para saber o que faz uma nota aparecer.
