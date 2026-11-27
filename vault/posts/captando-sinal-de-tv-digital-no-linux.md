---
title: Captando Sinal de TV Digital no Linux
slug: captando-sinal-de-tv-digital-no-linux
category: Tecnologia
tags: [linux, hardware, drivers, c, ia]
date: '2026-11-16'
summary: Achei um receptor USB antigo em casa e usei IA para desenvolver o driver que leva a TV digital da antena até o VLC no Linux.
references:
  - https://github.com/Cluyverth/h868-linux-driver
  - https://github.com/Cluyverth/h868-linux-driver/blob/HEAD/README.pt-BR.md
  - https://docs.kernel.org/userspace-api/media/dvb/dvbapi.html
  - https://github.com/dkms-project/dkms
  - https://wiki.videolan.org/Documentation:Modules/dtv/Linux_options
---

Achei um AVerTV antigo na bagunça de casa e quis ver se ainda dava pra assistir TV aberta com ele. Era um **AVerMedia AVerTV Hybrid Volar HD PRO H868**, daqueles receptores que você conecta na USB e usa com uma antena. O Linux via o aparelho na USB, mas o VLC não tinha um receptor de TV pra abrir.

Usei IA como apoio pra escrever o [driver h868](https://github.com/Cluyverth/h868-linux-driver) em C. Ele roda no kernel e encaixa o aparelho no suporte a TV digital que o Linux já oferece. Assim, o VLC pode usar o receptor sem precisar de nenhuma alteração no player.

## O Que A Porta USB Já Sabia

O primeiro passo pra investigar um aparelho desses é conectar o receptor e rodar:

```sh
lsusb -d 07ca:0868
```

`07ca` identifica o fabricante e `0868` identifica o produto. Se o comando mostrar uma linha com esse par, o Linux conseguiu ler a identificação do aparelho. Se não mostrar nada, rode `lsusb` sem o filtro e compare a lista com e sem o aparelho conectado. Dá pra descobrir se ele apareceu com outro ID ou se vale começar pela porta USB.

Mesmo com o ID certo, pode haver diferenças por dentro. `lsusb -v -d 07ca:0868` mostra o [`bcdDevice`](https://github.com/Cluyverth/h868-linux-driver/blob/HEAD/README.pt-BR.md#hardware-e-compatibilidade), que indica a revisão informada pelo aparelho. Se o valor for `0.00`, o módulo pode aparecer no `lsmod`, mas não inicializa o receptor: essa revisão usa um protocolo antigo ainda não validado.

## Da Antena Ao VLC

No meu teste, a emissora transmitia em **ISDB-T**, um padrão de TV digital terrestre. O canal ocupava **6 MHz**. No computador, o VLC usa a [API DVB](https://docs.kernel.org/userspace-api/media/dvb/dvbapi.html) do Linux pra pedir a sintonia e receber os dados que vieram da antena.

<img src="/media/h868-caminho-do-sinal.svg" width="352" height="556" alt="Caminho da recepção: antena, sintonizador, demodulador e ponte USB. No computador, o driver h868 entrega o fluxo ao subsistema DVB e o VLC o lê pela API DVB.">

Da antena chegam ondas de rádio de várias frequências. O sintonizador seleciona a faixa do canal pedido. No H868 ele é um **TDA18271**, e eu pude reaproveitar o driver que já vinha no Linux. O demodulador recupera os dados digitais que a emissora codificou no sinal. A recepção funcionou sem que eu confirmasse o modelo exato desse chip.

A ponte USB leva os pacotes pro computador. No sentido contrário, recebe comandos do driver e dá acesso aos chips do receptor. O arquivo [`h868_usb.c`](https://github.com/Cluyverth/h868-linux-driver/blob/HEAD/kernel/h868_usb.c) cuida dessa comunicação. O driver acessa os chips por I²C, uma ligação interna usada pra mandar configurações e ler o estado dos componentes.

No computador, o módulo `h868` registra um adaptador em `/dev/dvb/adapterN/`. O arquivo `frontend0` é o ponto de controle da sintonia e da leitura do estado do sinal. Já `dvr0` é por onde o aplicativo pode ler os pacotes com áudio e vídeo. O VLC pede a frequência pelo frontend, o driver configura o receptor e o fluxo volta pela interface que o player já conhece.

<img src="/media/h868-sintonia-leitura.svg" width="352" height="256" alt="O pedido de sintonia sai do VLC e chega ao H868 por frontend0. No sentido inverso, o VLC lê os pacotes de áudio e vídeo do receptor por dvr0.">

## Onde Usei IA

A IA me ajudou a acompanhar o código em C, entender as chamadas do kernel e dividir o trabalho em testes menores. Uma sugestão sobre a ordem de inicialização dos chips, por exemplo, ainda precisava fazer sentido no código de referência e ser conferida no aparelho. Um valor escrito num registrador pode mudar o comportamento de um chip, mesmo que o módulo compile sem erro.

Os [testes](https://github.com/Cluyverth/h868-linux-driver/blob/HEAD/README.pt-BR.md#c%C3%B3digo-fonte) do repositório rodam sem o receptor. Eles conferem as contas de intensidade e qualidade do sinal e a leitura dos parâmetros da transmissão. Pra confirmar a sintonia e ver se o vídeo chega, ainda é preciso ligar a antena e testar no aparelho.

## Como Conferir Se O Driver Funcionou

Se você tiver o mesmo receptor, salve o que estiver fazendo antes de testar. **O driver é experimental e uma falha no módulo pode travar o sistema.**

Pra [instalar o módulo](https://github.com/Cluyverth/h868-linux-driver/blob/HEAD/README.pt-BR.md#instala%C3%A7%C3%A3o-com-dkms), o repositório usa [DKMS](https://github.com/dkms-project/dkms). Ele compila e instala o módulo pra versão do kernel em uso. Em distribuições configuradas pra isso, também tenta recompilar o módulo quando o kernel é atualizado. Pra compilar, ele precisa das ferramentas de compilação e dos *headers* da versão e da variante exatas do kernel. Esses arquivos também precisam incluir `drivers/media/tuners/tda18271.h`, usado pelo código do sintonizador. Com Secure Boot, o sistema pode exigir uma assinatura feita com uma chave que ele reconheça.

Depois de instalar e conectar o receptor, confira estas etapas:

1. Rode `lsmod | grep -w h868` pra ver se o módulo foi carregado. Se ele estiver instalado e não carregar sozinho, o README orienta carregá-lo com `sudo modprobe h868`.
2. Rode `ls -R /dev/dvb` e procure o `frontend0` do adaptador. O `h868` pode estar carregado sem ter conseguido inicializar o receptor. Se já houver outro receptor ligado, compare a lista antes e depois de conectar o H868 pra saber qual `adapterN` apareceu.
3. Ligue a antena e procure a frequência do canal físico da emissora, não o número que aparece na TV. O [VLC](https://wiki.videolan.org/Documentation:Modules/dtv/Linux_options) recebe essa frequência em Hz: `473 MHz` vira `473000000`. Use também o número da pasta que apareceu. Por exemplo, `adapter1` vira `--dvb-adapter=1`. No comando abaixo, troque a frequência e o adaptador pelos seus. A largura do canal (`--dvb-bandwidth`) continua em MHz:

   ```sh
   vlc isdb-t:// --dvb-adapter=0 --dvb-frequency=473000000 --dvb-bandwidth=6
   ```

O `frontend0` aparecer confirma que o Linux expôs o receptor aos aplicativos. Na sintonia, o aparelho pode indicar que encontrou sinal antes de conseguir se sincronizar com a transmissão. É essa sincronização que aparece como *lock*. Quando o VLC toca imagem e som, dá pra confirmar também que os pacotes chegaram e puderam ser reproduzidos. Se o adaptador apareceu mas o VLC não abriu o dispositivo, confira também a permissão do seu usuário pra acessar `/dev/dvb/`.

<img src="/media/h868-estagios-de-teste.svg" width="352" height="416" alt="Cada etapa confirma algo diferente: lsmod mostra o módulo carregado, frontend0 indica o adaptador registrado, lock confirma a sincronização, e imagem e som no VLC confirmam a reprodução. Passar numa etapa não garante a próxima.">

## Até Onde O Teste Foi

A recepção foi verificada com **um H868 `07ca:0868`**, uma antena externa e o kernel `7.3.3-1-cachyos`. Outros aparelhos, kernels e distribuições ainda precisam de teste. Entrada analógica, rádio e controle remoto ficaram fora da validação. As leituras de intensidade e qualidade são experimentais e relativas, sem calibração em dBm ou dB.

Feche o VLC antes de tirar o receptor da USB. Se um programa mantiver os arquivos de `/dev/dvb/` abertos, o kernel pode demorar a liberar o adaptador anterior. Se isso acontecer várias vezes, podem acabar os números disponíveis pra novos adaptadores. O README lista essa e outras [limitações](https://github.com/Cluyverth/h868-linux-driver/blob/HEAD/README.pt-BR.md#funcionalidades-e-limita%C3%A7%C3%B5es).
