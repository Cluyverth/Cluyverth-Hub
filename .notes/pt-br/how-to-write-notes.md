---
title: Como escrever notas para este site
date: 2026-08-05
author: Cluyverth Pereira
status: public
lang: pt
translation: how-to-write-notes
category: Guides
notebook: Guides
tags: [obsidian, markdown, guide]
description: Tudo o que uma nota pode ter, e como escrever uma no Obsidian ou em qualquer app de markdown.
---

Este guia cobre como escrever notas para este site: onde elas vivem, todos os campos de frontmatter e como conectar notas entre si. Vale para o Obsidian e para qualquer outro app de markdown, porque as notas são arquivos markdown puros.

## Onde as notas vivem

As notas são arquivos markdown simples no vault. O site lê as marcadas com `status: public`. Você pode escrevê-las no Obsidian, VS Code, Typora ou em qualquer editor que salve markdown.

## O frontmatter

Frontmatter é um bloco YAML no topo do arquivo, entre linhas `---`. Ele decide tudo sobre a nota.

### Campos obrigatórios

- `title`: o título da nota
- `date`: a data de publicação, `AAAA-MM-DD`
- `status`: `public`, `draft` ou `private`

### Campos opcionais

- `slug`: a URL, usa o nome do arquivo por padrão
- `author`: o padrão é Cluyverth Pereira
- `tags`: uma lista, ex.: `tags: [astro, guia]`
- `category`: agrupa notas por cor no grafo
- `notebook`: agrupa notas em clusters, e uma nota só pode ter um
- `description`: uma linha exibida nos cards
- `project: true`: renderiza a nota na página de projetos
- `stack`: lista de tecnologias para projetos
- `repo`: a URL do repositório do projeto, renderiza um botão de código-fonte nas páginas de projeto
- `live`: a URL do site ao vivo do projeto, renderiza um botão de acesso nas páginas de projeto
- `image`: uma URL de capa para cards e grafo
- `lang`: `en` ou `pt`, para versões traduzidas
- `translation`: o slug da nota na outra língua

## Status

- `public`: renderiza em qualquer lugar
- `draft`: visível apenas em dev
- `private`: nunca é renderizado em lugar nenhum

## Conectando notas

Links são opcionais. Uma nota pode existir sem linkar nada e ainda assim ser encontrada pelos links de retorno (as notas que linkam para ela, exibidos no lado direito da página).

Use wikilinks do Obsidian para conectar notas:

- `[[rss-guide]]` linka para outra nota
- `[[how-to-write-notes|guia de escrita]]` linka com um rótulo personalizado
- Links para notas privadas ou inexistentes aparecem esmaecidos, nunca quebrados

## Um exemplo completo

```markdown
---
title: Minha primeira nota
date: 2026-08-05
status: public
tags: [meta]
category: Guides
notebook: Guides
description: Um resumo curto exibido no card.
---

O corpo da nota. Markdown funciona: **negrito**, listas, títulos.

Veja o [[rss-guide|guia de RSS]].
```

## Checklist antes de publicar

1. O frontmatter tem `title`, `date` e `status: public`
2. A `description` está escrita

Só isso. Veja o [[cluyverth-hub]] para o pipeline completo por trás deste site.
