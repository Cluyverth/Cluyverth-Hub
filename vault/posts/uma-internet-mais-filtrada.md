---
title: Uma Internet Mais Filtrada
slug: uma-internet-mais-filtrada
category: Tecnologia
tags: [rss, leitura, curadoria, ia]
date: '2026-11-24'
summary: Use RSS para reunir notícias, podcasts e novidades de projetos. Compare leitores, organize seus feeds e conheça bibliotecas pra criar seu próprio leitor.
related: [como-assinar-o-feed-rss-do-cluyverth-hub]
references:
  - https://www.inoreader.com/pricing
  - https://github.com/yang991178/fluent-reader
  - https://github.com/spacecowboy/Feeder
  - https://github.com/spacecowboy/Feeder/discussions/127
  - https://miniflux.app/
  - https://miniflux.app/hosting.html
  - https://github.com/kurtmckee/feedparser
  - https://github.com/rbren/rss-parser
---

Você sabia que dá pra acompanhar o que te interessa na internet sem passar por páginas cheias de propaganda, rolar uma timeline infinita ou ver recomendações que você nem pediu? Se a fonte publica um feed RSS, dá pra seguir as novidades direto num leitor de RSS.

## 1. Como Funciona

Um feed é uma lista de novidades que o site publica num formato que o leitor entende. Você cola o endereço do feed no aplicativo, e ele passa a consultá-lo de tempos em tempos. Se sair um item entre duas consultas, ele só aparece no leitor quando o aplicativo buscar a lista de novo. Algumas fontes incluem o texto inteiro. Outras trazem só um resumo e um link.

<img src="/media/rss-ciclo-de-consulta.svg" width="352" height="270" alt="Horários ilustrativos: às 9h o leitor RSS consulta o feed e não vê novidade. Às 9h05 a fonte publica um item. Às 9h10, na próxima consulta, o item aparece no leitor.">

## 2. Escolha Onde Ler

- **Inoreader** funciona no navegador e no celular e exige conta. O [plano grátis](https://www.inoreader.com/pricing) dá pra seguir feeds públicos. Se quiser filtros automáticos e regras pra organizar os itens, o plano Pro acrescenta esses recursos.
- **Fluent Reader** é um aplicativo de código aberto com [licença BSD](https://github.com/yang991178/fluent-reader/blob/master/LICENSE). O [download](https://github.com/yang991178/fluent-reader/releases) é grátis pra Windows, macOS e Linux. No modo local, não exige conta, servidor nem assinatura. Pra sincronizar entre dispositivos, você pode conectar um serviço compatível, que pode cobrar à parte.
- **[Feeder](https://github.com/spacecowboy/Feeder)** é grátis e de código aberto (GPLv3) pra Android. Consulta os feeds sem conta, assinatura ou servidor seu. Dá pra ler offline o que o app já baixou. A [sincronização](https://github.com/spacecowboy/Feeder/discussions/127) é opcional e mantém os feeds e as marcações de leitura em dia entre aparelhos Android, sem serviços de terceiros.
- **[Miniflux](https://miniflux.app/)** é um leitor web de código aberto (Apache 2.0). Você pode instalar num servidor próprio com PostgreSQL sem pagar pelo software. Nesse caso, atualizações e backups ficam por sua conta. Se preferir não cuidar disso, a [hospedagem oficial](https://miniflux.app/hosting.html) é paga.
- **Seu próprio leitor:** além desses apps, dá pra usar IA pra criar um leitor do seu jeito. Já existem bibliotecas que leem os feeds, como [feedparser](https://github.com/kurtmckee/feedparser) pra Python e [rss-parser](https://github.com/rbren/rss-parser) pra JavaScript.

Pra trocar de leitor, use **Exportar OPML** no aplicativo atual e salve o arquivo com suas assinaturas. No novo leitor, procure **Importar OPML** e selecione o arquivo. A lista de feeds vai junto, mas preservar as pastas depende dos dois leitores. Favoritos e itens já lidos normalmente ficam no aplicativo de origem.

## 3. Adicione Os Primeiros Feeds

1. Escolha duas ou três fontes que você já costuma abrir. Se quiser acompanhar os lançamentos de uma ferramenta, procure o feed de versões. O [feed do Astro](https://github.com/withastro/astro/releases.atom), por exemplo, traz as versões novas da ferramenta que uso pra gerar este site.
2. Procure por **RSS**, **Feed** ou **Atom** no rodapé, na seção de notícias ou na página de ajuda. RSS e Atom são dois formatos usados pra publicar feeds. Você adiciona os dois do mesmo jeito. Se não achar o link, cole o endereço da página no leitor. Alguns aplicativos conseguem descobrir o feed por ali. Se houver mais de um resultado, confira qual corresponde ao assunto que você quer.
3. No leitor, procure **Adicionar feed**, **Adicionar fonte** ou **Inscrever-se**. Cole o endereço e confirme. Se o link abrir no navegador como texto com marcações do tipo `<title>`, você está vendo o XML do feed. Essas marcações indicam ao leitor onde estão os dados de cada item. Copie só o endereço da barra do navegador.
4. Compare os primeiros itens com o que saiu na fonte. Se um feed de podcast listar os episódios sem tocar o áudio, use o mesmo endereço num aplicativo de podcasts que aceite feeds por URL.

Pra testar com o feed deste site, veja como [assinar o Caderno](/caderno/como-assinar-o-feed-rss-do-cluyverth-hub/).

## 4. Filtre Pelo Que Você Abre

Dá pra separar em duas pastas no início: **Pra Ler**, com reportagens e textos mais longos, e **Pra Acompanhar**, com lançamentos e avisos. Deixe as notificações desligadas por alguns dias. Se algum aviso realmente precisa chegar na hora, veja se o leitor permite ativá-las só pra aquela fonte.

Depois de uma semana, repare no que você passa direto. Se só abre as matérias de ciência de um jornal, troque o feed geral pelo da editoria, quando houver. Se as notas de versão chegam todas juntas e você só quer as de um pacote, filtre pelo nome dele no título. Às vezes é mais fácil remover uma fonte inteira do que criar uma regra pra cada assunto que você pula.
