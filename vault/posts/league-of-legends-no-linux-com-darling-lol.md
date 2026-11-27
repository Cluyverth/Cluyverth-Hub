---
title: League Of Legends No Linux com Darling LoL
slug: league-of-legends-no-linux-com-darling-lol
category: Jogos
tags: [linux, league of legends, metal, vulkan, ia]
date: '2026-11-12'
summary: Uma tentativa de jogar no Linux virou um PR no darling-lol sobre dados que o jogo pedia ao Metal para desenhar a partida.
references:
  - https://github.com/lucannez64/darling-lol
  - https://github.com/lucannez64/darling-lol/pull/182
  - https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context#creating_the_square_plane
  - https://developer.apple.com/documentation/metal/mtlvertexattributedescriptor
  - https://developer.apple.com/documentation/metal/mtlfunction/vertexattributes
  - https://developer.apple.com/documentation/metal/building-a-shader-library-by-precompiling-source-files
  - https://docs.vulkan.org/refpages/latest/refpages/source/vkCmdBindVertexBuffers.html
  - https://support-leagueoflegends.riotgames.com/hc/en-us/articles/201752654-Minimum-and-Recommended-System-Requirements
  - https://support-leagueoflegends.riotgames.com/hc/pt-br/articles/225266848-Utiliza%C3%A7%C3%A3o-de-Programas-de-Terceiros
---

Eu queria jogar League of Legends no Linux e fui testar o [darling-lol](https://github.com/lucannez64/darling-lol), um projeto experimental para rodar a versão de macOS do jogo pelo Darling. No macOS, o jogo usa o Metal para pedir à placa de vídeo que desenhe. No Linux, a camada de compatibilidade traduz esses comandos para o Vulkan, outra interface para fazer esse pedido. O jogo também consulta informações pelo Metal, e uma dessas consultas voltava sem os dados que ele esperava.

## De Onde O Shader Tira Os Dados

Um **shader** é um programa que roda na GPU. Um *vertex shader* trabalha com os vértices, os pontos que formam a geometria. Ele pode calcular, por exemplo, onde cada ponta de um triângulo fica na tela. A posição é um **atributo** daquele vértice. Outro atributo pode ser a coordenada que diz que parte de uma textura corresponde àquele ponto.

Os valores podem ficar juntos num [vertex buffer](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context#creating_the_square_plane), uma região de memória que guarda os dados dos vértices pra GPU ler. No Metal, o [descritor de atributos](https://developer.apple.com/documentation/metal/mtlvertexattributedescriptor) diz em qual buffer está cada atributo, em que byte ele começa e em que formato foi gravado. Já o **índice do atributo** diz em qual entrada do shader aquele valor vai chegar.

<img src="/media/darling-vertices.svg" width="640" height="400" alt="Exemplo com dois vértices no mesmo buffer. A posição (1, 0) do primeiro vai para a entrada 0 do shader, e sua coordenada de textura (1, 1) vai para a entrada 3.">

Ao ler o vértice B, o shader recebe valores diferentes nas mesmas entradas usadas para o vértice A.

## O Que O Metal Precisava Responder

Quando o shader roda, ele lê os valores dos vértices. A **reflexão** responde a outra pergunta: quais entradas o shader compilado declara? No Metal, o jogo usa [`vertexAttributes`](https://developer.apple.com/documentation/metal/mtlfunction/vertexattributes) pra consultar essa lista, sem ler o conteúdo dos buffers. O Darling LoL ainda não devolvia esses dados.

Na [compilação](https://developer.apple.com/documentation/metal/building-a-shader-library-by-precompiling-source-files), o código do shader passa por uma representação intermediária chamada **AIR**. As entradas estavam nos metadados dela. Com o [PR #182](https://github.com/lucannez64/darling-lol/pull/182), que entrou no projeto, o Darling LoL passou a ler esses metadados pra responder à consulta. O índice vem do próprio atributo: a lista pode mudar de ordem ou pular números.

No exemplo, a textura está na posição `[0]` da lista, mas o shader espera esse dado na entrada `3`. Já a posição do vértice aparece em `[1]` e vai pra entrada `0`. Usar a ordem da lista no lugar do índice declarado mandaria os valores pras entradas erradas.

<img src="/media/darling-air.svg" width="440" height="419" alt="A consulta vertexAttributes lê os metadados do shader em AIR. O item 0 da lista descreve a textura na entrada 3; o item 1 descreve a posição na entrada 0.">

## Quando Faltava Um Buffer

O mesmo PR tratou do caso em que faltava um buffer que o desenho esperava ler. Passar uma referência vazia ao Vulkan podia ser inválido.

No Vulkan, [`vkCmdBindVertexBuffers`](https://docs.vulkan.org/refpages/latest/refpages/source/vkCmdBindVertexBuffers.html) liga cada buffer a um slot. Um slot pode alimentar vários atributos, como posição e textura. Se o buffer estiver ausente, o Vulkan só aceita uma referência vazia com `nullDescriptor` habilitado e deslocamento zero. Nesse caso, os dados que viriam da memória são tratados como zero.

O **vertex buffer** fornece dados de entrada dos vértices. O **framebuffer** fica na saída, onde a renderização grava a imagem. O patch trata o caso em que falta um buffer de entrada.

Imagine três slots: o `0` e o `2` apontam pra buffers, mas o `1` está vazio. Num dispositivo sem `nullDescriptor`, a camada confere duas coisas antes de ligar esse slot à reserva: se o endereço de leitura fica fixo entre vértices e se os bytes pedidos cabem no buffer. No exemplo, as três leituras começam no byte `0` e pegam os mesmos quatro zeros. Com um passo de quatro bytes por vértice, começariam em `0`, `4` e `8`. Esse avanço não é aceito nesse caminho de reserva, mesmo se todos os acessos couberem.

<img src="/media/darling-buffer-reserva.svg" width="352" height="424" alt="Array com buffers nos slots 0 e 2 e slot 1 vazio. Se o endereço fica fixo e a leitura cabe, o slot 1 aponta para a reserva: A, B e C começam no byte 0 e leem quatro zeros. Com passo de quatro bytes, os offsets seriam 0, 4 e 8, e a camada rejeita o desenho.">

## O Que Eu Testei

Testei a correção no meu PC com uma RTX 3060. Antes, o jogo ficava numa tela preta, um problema que muita gente também relatava na época. Depois do patch, abri o League of Legends de novo: a tela preta sumiu e consegui jogar normalmente.

## Por Que Parei De Tentar Jogar

Joguei por dois dias antes de levar o primeiro ban. Quando voltei, joguei por mais quatro dias e levei outro. Parei por aí pra não arriscar um banimento permanente.

League of Legends não tem [suporte oficial ao Linux](https://support-leagueoflegends.riotgames.com/hc/en-us/articles/201752654-Minimum-and-Recommended-System-Requirements). O Darling LoL é um projeto independente, sem vínculo com a Riot. Mesmo sem a intenção de ganhar vantagem, rodar o jogo por essa camada de compatibilidade pode fazer o anticheat tratar o software como não autorizado. A Riot prevê banimento permanente pelo uso de [programas de terceiros](https://support-leagueoflegends.riotgames.com/hc/pt-br/articles/225266848-Utiliza%C3%A7%C3%A3o-de-Programas-de-Terceiros) que violem suas regras. Não tenho como confirmar o que disparou os bans na minha conta.
