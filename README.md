# Cluyverth Hub

Site pessoal de Cluyverth Pereira, com três capítulos: Início, Caderno e Projetos. O Caderno publica artigos em Markdown e oferece um feed RSS em `/rss.xml`.

## Stack

| Camada | Ferramentas |
| --- | --- |
| Páginas e build | Astro 7.1, com geração estática em `dist/` |
| Interação | TypeScript 5.9 em modo estrito e APIs nativas do navegador |
| Conteúdo | Markdown com frontmatter YAML, Astro Content Collections, Zod, Unified e Shiki |
| Interface | HTML semântico, CSS nativo, Space Grotesk em WOFF2 local e ícones Lucide em SVG |
| Desenvolvimento | npm, Node.js 22.12+ e Docker Compose; Docker e CI usam Node 24 |

Não há React, Tailwind, banco de dados, autenticação ou servidor de aplicação. O build entrega HTML pronto; o JavaScript fica nas interações que precisam dele. Bibliotecas de componentes e animação usadas como referência visual não são dependências.

## Arquitetura

| Caminho | Responsabilidade |
| --- | --- |
| `src/pages/` | Rotas, artigos gerados e endpoints estáticos de busca e RSS |
| `src/layouts/Base.astro` | Cabeçalho, busca, menu, rodapé e metadados comuns |
| `src/components/` | Ícones, metadados dos posts e links de projetos |
| `src/content.config.ts`, `src/lib/posts.ts` | Validação, ordenação dos posts, métricas e estrutura do sumário |
| `vault/posts/`, `src/data/projects.ts` | Conteúdo editorial e catálogo de projetos, respectivamente |
| `src/scripts/`, `src/styles/`, `public/` | Interação no navegador, aparência e arquivos públicos |

- **Início:** retrato em WebP com prioridade de download e dimensões declaradas para reservar espaço. Imagens têm skeleton enquanto carregam; o `alt` permanece no HTML.
- **Caderno:** posts em ordem decrescente de data, agrupados por ano e mês. A numeração volta a `01` a cada ano e continua entre meses e em **Mostrar mais**, que revela itens já renderizados. No artigo, o sumário acompanha a seção visível conforme a leitura.
- **Projetos:** a ordem em `src/data/projects.ts` define a numeração e o primeiro destaque no desktop. A mesma prévia aparece à direita no desktop e dentro do item aberto no celular. O fragmento da URL, como `/projetos/#oficio-template`, permite abrir um projeto direto na galeria.
- **Busca:** `/busca.json` é gerado no build com os posts e baixado só na primeira consulta. Sem prefixo, busca por título, tags, categoria, resumo e texto do post, ignorando diferenças de acento e caixa. `#` busca só nas tags, `!` só nas categorias. Campo vazio mostra instruções; se a requisição estiver pendente, aparece um skeleton. Conforme o Caderno crescer, monitore o tamanho do índice: ele inclui o corpo dos posts.
- **Tema e navegação:** o tema começa escuro e a preferência é salva em `localStorage`. Em navegadores compatíveis, View Transitions fazem o fade de página de 200 ms, sem misturar cabeçalhos e rodapés, e a onda circular de 420 ms na troca de tema. Com movimento reduzido, a troca é imediata.
- **RSS:** `/rss.xml` sai da mesma coleção de posts. O feed é anunciado no HTML para autodetecção e fica acessível no rodapé que acompanha a rolagem.

### Convenções de código

- Renderize conteúdo e links no Astro; use TypeScript para comportamento no navegador. Links navegam, botões executam ações, e atributos como `hidden`, `aria-current`, `aria-expanded` e `data-*` registram estados no próprio DOM.
- Tipos estritos para props, catálogo e formato compartilhado do índice de busca; Zod valida os dados de entrada dos posts no build.
- Variáveis CSS centralizam cores, espaçamento e movimento. Links de texto compartilham o sublinhado animado; ações destacadas seguem **Ver projetos**; ícones isolados destacam pela cor e a marca fica estática.

## Desenvolvimento

Com Docker e Docker Compose, na raiz deste checkout:

```sh
docker compose -f compose.dev.yaml up --build
```

Abra <http://127.0.0.1:4322/>. Alterações em `src/`, `public/` e `vault/posts/` entram sem rebuild da imagem. Use `Ctrl+C` para parar o servidor.

Sem Docker, use Node.js 22.12+ (CI: Node 24) e npm:

```sh
npm ci
npm run dev
npm run check
npm run build
```

## Publicação com Docker

Na VPS, `docker compose up --build -d` gera e inicia a imagem `cluyverth-hub:1.0.0`. O build produz o `dist/`; o contêiner final roda Nginx sem root e serve apenas os arquivos estáticos, sem Node, código-fonte ou volumes de desenvolvimento.

O site fica em `127.0.0.1:8080` por padrão. Se a porta já estiver ocupada, use `HUB_PORT=8081 docker compose up -d`. Um proxy no host deve encaminhar `cluyverth.com` para essa porta. Se o proxy também rodar em Docker, ligue os dois serviços a uma rede compartilhada e aponte o proxy para `hub:8080`; não use o `localhost` de dentro do contêiner do proxy. TLS e roteamento por domínio ficam a cargo do proxy.

## Publicar no Caderno

Crie um `.md` em `vault/posts/`. O repositório e o conteúdo dessa pasta são públicos: não coloque drafts privados, credenciais ou dados sensíveis no Git.

```yaml
---
title: Uma nota sobre interfaces
slug: uma-nota-sobre-interfaces
category: Tecnologia
tags: [web, acessibilidade]
date: '2026-11-25'
summary: O que aprendi ao revisar a navegação por teclado.
---
```

Use uma única categoria, um slug único e quantas tags precisar (`[]` para nenhuma). Comece as seções em `##`: o título já ocupa `h1`. Contagem de palavras e tempo estimado a 200 palavras/min são derivados do Markdown. O Caderno agrupa por ano e mês; o sumário vem dos títulos do artigo. Os 50 posts de teste ficam só no protótipo.

