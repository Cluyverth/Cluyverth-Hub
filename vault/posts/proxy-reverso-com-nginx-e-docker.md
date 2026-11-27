---
title: Proxy Reverso com Nginx e Docker
slug: proxy-reverso-com-nginx-e-docker
category: Tecnologia
tags: [nginx, docker, proxy reverso, tls, firewall]
date: '2026-11-20'
summary: 'Da requisição HTTP ao firewall do VPS: como publico dois sites nas mesmas portas com Nginx, TLS e Docker.'
references:
  - https://github.com/Cluyverth/DockGate
  - https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview
  - https://nginx.org/en/docs/http/request_processing.html
  - https://nginx.org/en/docs/http/configuring_https_servers.html
  - https://nginx.org/en/docs/http/ngx_http_proxy_module.html
  - https://letsencrypt.org/docs/challenge-types/
  - https://docs.docker.com/compose/how-tos/networking/
  - https://docs.docker.com/engine/network/port-publishing/
  - https://docs.docker.com/engine/network/packet-filtering-firewalls/#docker-and-ufw
  - https://documentation.ubuntu.com/server/how-to/security/firewalls/
  - https://wiki.nftables.org/wiki-nftables/index.php/Netfilter_hooks
  - https://eff-certbot.readthedocs.io/en/stable/using.html#manual
---

Montei o [DockGate](https://github.com/Cluyverth/DockGate) enquanto aprendia a usar Docker e Nginx. Eu queria hospedar dois sites no mesmo servidor, com um domínio pra cada um. Quando alguém abrisse o endereço do blog, o servidor precisava entregar o blog, mesmo que os dois domínios apontassem pro mesmo IP. Este guia reúne o que aprendi montando esse cenário.

## Como Funcionam HTTP E HTTPS

O [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview) é o protocolo que define como o navegador e o servidor trocam pedidos e respostas. Ao abrir a página inicial de um blog, o navegador envia uma **requisição HTTP** com o nome do site e o caminho da página. Se o servidor conseguir atender ao pedido, pode responder com `200 OK` e o HTML que o navegador vai exibir.

Com HTTP sem criptografia, alguém com acesso ao tráfego pode ler ou alterar essas mensagens. Ao usar **HTTPS**, o navegador primeiro estabelece uma conexão com **TLS**, o protocolo que protege a comunicação. Durante essa etapa, ele usa o certificado do servidor pra conferir a identidade do site. Depois da negociação, as mensagens HTTP passam pela conexão criptografada.

## O Caminho Da Requisição

Quando você acessa `https://app.example.com`, o navegador consulta um servidor DNS pra descobrir qual IP está associado ao domínio `app.example.com`. No exemplo, o DNS devolve o endereço público de um VPS, o servidor virtual onde os dois sites vão ficar.

Com o endereço em mãos, o navegador se conecta à porta 443, a porta padrão do HTTPS, e inicia a negociação TLS. O Nginx apresenta o certificado. O navegador confere se ele é válido pra `app.example.com` e se a cadeia de certificados leva a uma autoridade confiável. Só depois o navegador envia a requisição HTTP.

A requisição informa o domínio do site e a página solicitada. O Nginx também consegue identificar o IP de origem pela conexão que recebeu. Se houver outro proxy ou uma CDN na frente, o endereço observado pode ser o do intermediário.

O Nginx usa o domínio informado na requisição pra escolher a configuração do site. Um pedido pra `app.example.com` vai pro contêiner `app`. Um pedido pra `blog.example.com` vai pro contêiner `blog`. Quando o contêiner devolve a página, o Nginx envia a resposta ao navegador pela conexão HTTPS.

<img src="/media/dockgate-fluxo.svg" width="336" height="380" alt="O navegador consulta o DNS e recebe o IP do VPS. Em outra conexão, troca a requisição e a resposta com o Nginx por HTTPS. O Nginx conversa com o contêiner do site pela rede Docker." />

Quando o navegador começa por HTTP, ele usa a porta 80. A configuração deste guia faz o Nginx responder com o endereço HTTPS da mesma página. Ao seguir o redirecionamento, o navegador abre uma nova conexão na porta 443.

## Aponte Os Dois Domínios Pro VPS

No painel de DNS, crie um registro `A` pra cada domínio e coloque o IPv4 público do VPS nos dois. Use `app.example.com` e `blog.example.com` como referência e substitua esses nomes por domínios que você controla. Se os dois estiverem na zona `example.com`, o painel pode pedir apenas `app` e `blog`.

Pra publicar um endereço IPv6, use um registro `AAAA`. Só adicione esse registro depois de confirmar que o VPS recebe conexões web por IPv6. Se já existir um `AAAA` de outro servidor, corrija ou remova o registro. Parte dos visitantes pode continuar chegando pelo IPv6 antigo mesmo com o `A` correto.

Rode `dig +short app.example.com A` e `dig +short blog.example.com A` com os seus domínios. Os dois comandos devem retornar o IPv4 público do VPS. Se você acabou de fazer a troca, um servidor DNS que guardou o resultado anterior pode continuar devolvendo o IP antigo até a cópia expirar.

## Emita E Renove Os Certificados TLS

A conexão passa pela mesma porta 443 nos dois casos. Antes de enviar a requisição HTTP, o navegador informa o domínio no [SNI](https://nginx.org/en/docs/http/configuring_https_servers.html), um campo da negociação TLS. É assim que o Nginx sabe se deve mostrar o certificado do app ou o do blog.

Pra emitir os certificados, use uma autoridade como o Let's Encrypt e um cliente ACME como o Certbot. O ACME é o protocolo usado pra comprovar o controle do domínio e solicitar o certificado. Neste exemplo vou usar [DNS-01](https://letsencrypt.org/docs/challenge-types/#dns-01): o cliente pede um registro `TXT` temporário e a autoridade consulta o DNS pra confirmar que você conseguiu criá-lo. Como a verificação acontece no DNS, o Nginx pode estar desligado durante a emissão. Se automatizar pela API do provedor, use uma credencial restrita aos registros necessários.

Emita um certificado pra cada domínio. Um único certificado poderia cobrir os dois, mas os pares separados deixam visível qual arquivo cada bloco usa. `fullchain.pem` contém o certificado do site e os intermediários que ajudam o navegador a verificar a cadeia. `privkey.pem` contém a chave privada usada pelo Nginx. Guarde os pares em `/srv/dockgate-certs/app/` e `/srv/dockgate-certs/blog/`, fora do repositório e do contexto de build. Se o cliente fornecer links simbólicos, monte também os arquivos pros quais eles apontam ou coloque cópias deles nessas pastas.

Restrinja o acesso às chaves e monte a pasta de certificados somente pra leitura. Se criou o TXT à mão no [modo manual](https://eff-certbot.readthedocs.io/en/stable/using.html#manual) do Certbot, repita a validação antes de o certificado vencer. Pra renovar sem intervenção, use um plugin DNS compatível com o provedor. Depois de renovar, atualize as cópias, se houver, e recarregue o Nginx.

Se preferir **HTTP-01**, a autoridade precisa abrir um arquivo de validação em `/.well-known/acme-challenge/` na porta 80. Suba primeiro só a configuração HTTP e sirva esse caminho a partir da pasta onde o cliente ACME escreve o desafio. Adicione os blocos HTTPS depois da emissão. Pra renovar pelo mesmo método, mantenha a rota do desafio fora do redirecionamento do `location /`.

## Onde Entra O Proxy Reverso

Um **proxy reverso** recebe pedidos em nome de um ou mais serviços. Neste exemplo, o navegador conversa com o Nginx. Pra buscar a página, o Nginx abre uma segunda conexão com o serviço que hospeda o site. Depois devolve a resposta na primeira conexão. Na documentação do Nginx, esse serviço de destino é chamado de **upstream**.

O TLS da conexão pública termina no Nginx. Daí até o site, o proxy usa HTTP na rede Docker do mesmo VPS. Se esse segundo trecho passar por uma rede que você não controla, use [TLS no upstream](https://docs.nginx.com/nginx/admin-guide/security-controls/securing-http-traffic-upstream/) e configure o Nginx pra validar o certificado do serviço.

## O Que É O Nginx

O Nginx é um servidor web e também pode funcionar como proxy reverso. O exemplo usa três contêineres com a mesma imagem do Nginx: um recebe as conexões públicas e funciona como proxy, e os outros dois servem o HTML de cada site. Usei páginas estáticas pra ficar fácil confirmar qual serviço respondeu. Se trocar uma página por uma aplicação, ajuste o destino no proxy pra apontar pro nome e pra porta em que a aplicação escuta.

## Como O Nginx Organiza A Configuração

O Nginx começa lendo `nginx.conf`. As chaves agrupam as regras conforme o lugar em que elas se aplicam. `worker_processes`, por exemplo, vale pro processo todo. `worker_connections` fica em `events` e limita as conexões por worker, contando também as que ele abre com as aplicações.

As regras da web ficam dentro de `http`. Ali entram os blocos `server`, que definem as portas e os domínios atendidos. Dentro de um `server`, um bloco `location` define o que acontece com um caminho da URL. Você pode encaminhar todos os pedidos de um domínio pra aplicação ou tratar um caminho específico no próprio Nginx.

A imagem oficial do Nginx traz uma diretiva `include` dentro de `http`. Ela carrega os arquivos com extensão `.conf` em `/etc/nginx/conf.d/`. Por isso a configuração abaixo começa diretamente em `server`. O `http` que envolve esses blocos já existe no arquivo principal.

## Monte Os Blocos Para Os Dois Sites

Crie uma pasta pro proxy. Dentro dela, salve a configuração em `http.d/sites.conf` e troque os domínios nas linhas `server_name`. O arquivo tem cinco blocos: dois pra conexões sem um domínio reconhecido, um pra redirecionar os domínios em HTTP e um bloco HTTPS pra cada site.

```nginx
server {
    listen 80 default_server;
    return 404;
}

server {
    listen 443 ssl default_server;
    ssl_reject_handshake on;
    return 404;
}

server {
    listen 80;
    server_name app.example.com blog.example.com;

    location / {
        return 308 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name app.example.com;
    ssl_certificate /etc/nginx/certs/app/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/app/privkey.pem;

    location / {
        proxy_pass http://app:80;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}

server {
    listen 443 ssl;
    server_name blog.example.com;
    ssl_certificate /etc/nginx/certs/blog/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/blog/privkey.pem;

    location / {
        proxy_pass http://blog:80;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}
```

## O Que Cada Bloco Faz

<img src="/media/dockgate-vhosts.svg" width="336" height="354" alt="Na porta 80, app e blog redirecionam pra HTTPS; outros domínios recebem 404. Na 443, app.example.com vai pra app:80 e blog.example.com vai pra blog:80. SNI ausente ou desconhecido faz o Nginx recusar o TLS. Se o TLS já foi aceito, mas o Host não é reconhecido, o Nginx responde 404." />

Na porta 80, `listen 80 default_server` indica qual bloco deve responder quando o domínio da requisição não corresponde aos nomes configurados. Esse bloco devolve `404` sem chamar nenhum dos sites. Quando o nome é reconhecido, o bloco com os dois domínios em `server_name` responde com `308`. Esse código instrui o navegador a repetir o pedido no endereço HTTPS sem trocar o método. `$host` coloca o domínio nessa URL e `$request_uri` preserva o caminho e os parâmetros. Um pedido a `http://blog.example.com/?ano=2026`, por exemplo, continua no blog e mantém `?ano=2026`.

Na porta 443, a escolha começa pela negociação TLS. Se o navegador não informar um nome reconhecido no SNI, a negociação cai no bloco `default_server` e `ssl_reject_handshake on` recusa a conexão. O `return 404` desse bloco serve pra quando o TLS já foi negociado com um nome conhecido, mas a mensagem HTTP seleciona o bloco padrão por trazer um domínio que o servidor não atende.

Os dois blocos HTTPS seguem a mesma estrutura. `listen 443 ssl` habilita TLS, `server_name` identifica o site, e `ssl_certificate` e `ssl_certificate_key` apontam pro par de arquivos daquele domínio. Dentro de cada bloco, `location /` abrange os caminhos do site. O `proxy_pass` do app encaminha pra `app:80` e o do blog pra `blog:80`. Como não há um caminho depois da porta no `proxy_pass`, o Nginx repassa o caminho original.

Quando o Nginx abre a conexão interna, o site vê o proxy como origem. Use [`proxy_set_header`](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_set_header) pra enviar os dados da visita de que ele precisa:

- `Host $host` mantém o nome público do site. A aplicação pode usá-lo pra montar links.
- `X-Forwarded-Proto $scheme` informa que a visita chegou por HTTPS, embora a conexão do proxy com o site use HTTP.
- `X-Forwarded-For $remote_addr` passa o IP que se conectou ao Nginx. O proxy usa o endereço observado na conexão e substitui qualquer valor que o visitante tenha enviado nesse cabeçalho. Se colocar uma CDN na frente, configure de quais intermediários o proxy aceita o IP original antes de usá-lo em logs ou regras de acesso.

## O Que É Docker

Uma **imagem** do Docker contém o programa e os arquivos necessários pra executá-lo. Um **contêiner** é um ambiente criado a partir dessa imagem. Posso iniciar três contêineres a partir da mesma imagem do Nginx e fornecer arquivos diferentes pra cada um. O proxy recebe `sites.conf`, e os sites recebem seus respectivos arquivos HTML.

O **Docker Compose** lê `compose.yaml` pra saber quais contêineres iniciar, quais arquivos disponibilizar neles e a quais redes conectá-los. Vou usar dois arquivos: um na pasta do proxy e outro na pasta dos sites. Os dois projetos usam a mesma rede pra que o Nginx consiga encontrar os sites.

## Por Que A Rede Docker Faz Parte Disso

Quando lê `proxy_pass http://app:80`, o Nginx precisa transformar `app` num IP. Na [rede Docker](https://docs.docker.com/compose/how-tos/networking/) que os dois projetos compartilham, o nome do serviço já serve pra encontrar o endereço do contêiner. `app` e `blog` têm IPs internos diferentes: cada um pode escutar na sua porta 80 sem ocupar a porta 80 pública do VPS. Já `localhost` dentro do proxy apontaria pro próprio proxy.

A rede interna permite que os contêineres se encontrem. Pra tornar uma porta acessível pelo endereço do VPS, o Compose usa [`ports`](https://docs.docker.com/engine/network/port-publishing/). Neste exemplo só o proxy tem esse ajuste. Se o app precisar de um banco, coloque os dois numa segunda rede sem ligar o banco à rede do proxy. O app fica nas duas redes porque precisa receber pedidos do Nginx e consultar o banco.

<img src="/media/dockgate-redes.svg" width="336" height="342" alt="Exemplo com banco: Nginx e app compartilham a rede dockgate_proxy. App e db compartilham outra rede, onde o proxy não participa." />

### Crie A Rede E Os Dois Sites

No VPS, crie uma rede compartilhada pros projetos Compose:

```sh
docker network create dockgate_proxy
```

Em um diretório `sites/`, crie `app/index.html` com `<h1>Site App</h1>` e `blog/index.html` com `<h1>Site Blog</h1>`. Salve este `compose.yaml` na raiz de `sites/`:

```yaml
services:
  app:
    image: nginx:stable-alpine
    volumes:
      - ./app:/usr/share/nginx/html:ro
    networks:
      - proxy

  blog:
    image: nginx:stable-alpine
    volumes:
      - ./blog:/usr/share/nginx/html:ro
    networks:
      - proxy

networks:
  proxy:
    external: true
    name: dockgate_proxy
```

Por padrão, essa imagem serve os arquivos de `/usr/share/nginx/html` na porta 80 do contêiner. `volumes` disponibiliza ali a pasta de cada site, e `:ro` impede que o contêiner altere os arquivos. Na configuração de rede, `external: true` indica que o Compose deve usar uma rede já criada. `name` especifica qual rede é essa.

Se você trocar uma das páginas estáticas por uma aplicação que escuta na porta 8080, atualize o `proxy_pass` pra usar essa porta. A aplicação precisa escutar na interface de rede do contêiner. Em IPv4, `0.0.0.0:8080` permite conexões pelas interfaces disponíveis. Se o programa escutar apenas em `127.0.0.1`, a porta fica acessível só de dentro do próprio contêiner.

### Ligue O Proxy À Mesma Rede

Na pasta do proxy, ao lado de `http.d/`, salve este `compose.yaml`:

```yaml
services:
  nginx:
    image: nginx:stable-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./http.d:/etc/nginx/conf.d:ro
      - "${DOCKGATE_CERTS:?Defina DOCKGATE_CERTS}:/etc/nginx/certs:ro"
    networks:
      - proxy

networks:
  proxy:
    external: true
    name: dockgate_proxy
```

Em `443:443`, o primeiro número indica a porta do VPS e o segundo indica a porta do contêiner. Com `80:80` e `443:443`, o Docker encaminha as conexões nas duas portas pro Nginx.

A montagem de `http.d/` faz o Nginx ler nossos arquivos no lugar da configuração de exemplo da imagem. No `.env`, ao lado do `compose.yaml` do proxy, defina `DOCKGATE_CERTS=/srv/dockgate-certs` ou use o caminho absoluto da pasta que você preparou. O `:?` faz o Compose interromper a execução se a variável estiver vazia ou ausente.

Se compartilhar a rede com outros projetos, use nomes distintos pros serviços. Se dois contêineres responderem por `app`, o nome pode apontar pro site errado.

## Firewall: O Que Eu Deixo Acessível

O firewall do provedor filtra conexões antes de elas chegarem ao VPS. Uma regra que permita TCP na porta 443 atende os dois sites. O Nginx vai ler o domínio depois que receber a conexão e escolher a aplicação. Libere as portas abaixo e bloqueie o tráfego de entrada que você não usa.

| Entrada | Quem Precisa Acessar |
| --- | --- |
| TCP 80 | Qualquer visitante, pro redirecionamento. Também serve pra validação se você optar por HTTP-01. |
| TCP 443 | Qualquer visitante, pro HTTPS dos dois sites. |
| TCP 22, ou a porta do seu SSH | Só o IP ou a rede de administração, se possível. |
| Portas de apps e bancos | Sem regra pública. Esses serviços ficam na rede Docker. |

Revise as regras de IPv4 e IPv6. Mesmo sem um registro `AAAA`, o VPS pode ter um IPv6 público. Antes de restringir o SSH, confira a porta que ele usa e garanta acesso ao console do provedor. Mantenha a sessão atual aberta enquanto testa uma nova. Use chaves pra entrar por SSH e mantenha o sistema e as imagens atualizados.

### UFW No Ubuntu

Num VPS com Ubuntu, o [UFW](https://documentation.ubuntu.com/server/how-to/security/firewalls/) permite configurar regras do firewall do Linux pelo terminal. Estes comandos bloqueiam conexões de entrada por padrão e liberam web e SSH. Antes de rodar, troque `198.51.100.10` pelo IP público de onde você administra o servidor e `22` pela porta real do SSH. Confira também se já existem permissões mais amplas, porque mudar a política padrão não apaga regras antigas.

```sh
sudo ufw default deny incoming
sudo ufw allow from 198.51.100.10 to any port 22 proto tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

O Docker pode mudar o destino do pacote antes que ele passe pelas regras de entrada do UFW. Por isso, [Docker e UFW](https://docs.docker.com/engine/network/packet-filtering-firewalls/#docker-and-ufw) exigem um cuidado: bloquear uma porta só no UFW não garante que ela fique inacessível se o Docker a publicou. Neste exemplo, só o proxy publica portas. Mantenha as regras do provedor e confira o acesso a partir de outra rede.

### Onde Entra O nftables

O **nftables** é um mecanismo de filtragem do Linux. Você pode inspecionar as regras com `sudo nft list ruleset`. Elas aparecem em tabelas, organizadas em cadeias que podem ser ligadas a diferentes pontos do caminho de um pacote. Os [pontos do Netfilter](https://wiki.nftables.org/wiki-nftables/index.php/Netfilter_hooks) mais úteis pra entender este exemplo são `input`, `forward` e `output`.

Uma conexão ao serviço SSH do VPS costuma passar por `input`, porque o processo que atende fica no próprio host. Uma conexão à porta que o Docker publicou pode passar por `forward`, porque o VPS encaminha o pacote ao contêiner. Já uma requisição feita pelo próprio VPS sai por `output`. Esse teste local pode funcionar mesmo quando a conexão de um visitante é bloqueada.

No exemplo da porta 443 publicada, o Docker faz **DNAT**: troca o destino original do pacote (o VPS) pelo endereço interno do Nginx. O destino depois dessa troca é o que explica a diferença entre os dois caminhos no diagrama.

<img src="/media/dockgate-caminho-do-pacote.svg" width="352" height="345" alt="Um pacote SSH destinado ao VPS passa por input e chega a um processo do host. Na porta HTTPS publicada, o Docker troca o destino pelo endereço do contêiner, e o pacote segue por forward até o Nginx.">

Se você administra as regras do host direto no nftables, confira por qual cadeia passa o tráfego antes de editar. Nas regras de entrada, preserve as conexões já estabelecidas, o tráfego local e as mensagens ICMP necessárias, especialmente se usar IPv6. Restrinja o SSH à origem de administração.

Pra limitar o tráfego que chega nas portas publicadas, confira qual backend o Docker usa. Com iptables, use a cadeia [`DOCKER-USER`](https://docs.docker.com/engine/network/firewall-iptables/). Com o backend [`nftables`](https://docs.docker.com/engine/network/firewall-nftables/), crie as regras numa tabela sua. Ver regras no comando `nft` não basta pra identificar o backend, pois `iptables-nft` também pode criá-las. Preserve as regras que o Docker usa pra encaminhar o tráfego.

## Suba E Confira Os Dois Sites

Na pasta `sites/`, rode `docker compose up -d` primeiro. O proxy precisa que os nomes `app` e `blog` já estejam disponíveis na rede quando carregar a configuração.

Na pasta do proxy, rode `docker compose run --rm --no-deps nginx nginx -t`. O [`nginx -t`](https://nginx.org/en/docs/switches.html) confere a sintaxe e tenta abrir os arquivos configurados, incluindo os certificados. Se passar, rode `docker compose up -d`.

De outra rede, substitua os domínios nos comandos abaixo e teste os dois sites. Os pedidos HTTP devem devolver `308` e indicar o endereço HTTPS no cabeçalho `Location`. Os pedidos HTTPS devem validar o certificado e mostrar `200`, com um título diferente em cada página. Se publicou `AAAA`, repita com `curl -6` numa máquina com acesso IPv6.

```sh
curl -sS -D - -o /dev/null http://app.example.com/
curl -sS -D - -o /dev/null http://blog.example.com/
curl -i https://app.example.com/
curl -i https://blog.example.com/
```

No VPS, rode `docker ps --format 'table {{.Names}}\t{{.Ports}}'`. Só o proxy deve mostrar mapeamentos como `0.0.0.0:80->80/tcp`. Se as linhas dos sites mostrarem apenas `80/tcp`, a porta está declarada na imagem e não foi publicada no VPS. Se alguma porta privada já esteve aberta, confirme de outra rede que ela não responde mais.

Se um pedido falhar, a resposta ajuda a localizar o problema:

- **Sem conexão:** confira o IP retornado pelo DNS, as regras do provedor e as portas publicadas pelo proxy.
- **Erro de certificado:** confira se o arquivo carregado cobre o domínio acessado, se está válido e se contém a cadeia intermediária.
- **`502 Bad Gateway`:** o Nginx recebeu o pedido, mas não conseguiu obter uma resposta válida do site. Confira o nome na rede Docker, a porta do serviço e se o processo está escutando. Nesta configuração, se recriar um contêiner e o IP dele mudar, recarregue o Nginx pra resolver o nome de novo.
- **`504 Gateway Timeout`:** o Nginx atingiu o limite de espera na comunicação com o serviço. Veja nos logs se o pedido chegou à aplicação antes de alterar os tempos de espera.

Depois de editar os blocos ou renovar os certificados, rode `docker compose exec nginx nginx -t`. Se passar, aplique a mudança com `docker compose exec nginx nginx -s reload` e repita os testes HTTPS pros dois domínios.
