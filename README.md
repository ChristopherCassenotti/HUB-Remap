# HUB Remap

Sistema interno de gestão, produtividade e acompanhamento operacional da Remap Digital.

O **HUB Remap** centraliza tarefas, timers, registros retroativos, metas, pontuação, supervisão, desempenho da equipe, clientes e visualizações integradas do ClickUp em uma única interface web.

---

## Visão geral

O projeto foi estruturado em **PHP + MySQL + JavaScript Vanilla**, com separação entre:

- páginas PHP em `partials/`;
- estilos em `assets/css/`;
- scripts organizados por responsabilidade em `js/`;
- APIs PHP em `api/`;
- configurações sensíveis via `.env`.

A interface principal é montada pelo arquivo `index.php`, que importa as seções do sistema por meio de arquivos parciais PHP.

---

## Funcionalidades principais

### Autenticação

- Login por nome ou e-mail.
- Sessão local do usuário.
- Token de autenticação salvo no banco.
- Controle de acesso por cargo.

---

### Timer de trabalho

- Registro de tempo por cliente, tarefa e categoria.
- Suporte a múltiplas linhas de tarefa.
- Cálculo de duração.
- Integração com sistema de pontuação.
- Salvamento dos registros no banco de dados.

---

### Registro retroativo

- Lançamento manual de atividades já realizadas.
- Registro por horário ou duração.
- Seleção de tarefas e pontuações.
- Controle individual por colaborador.

---

### Tarefas e Kanban

- Quadro Kanban com colunas personalizadas.
- Criação, edição e conclusão de tarefas.
- Responsável, prioridade, prazo, cliente e descrição.
- Subtarefas, comentários, etiquetas e anexos.
- Salvamento direto no banco via API.

---

### Painel pessoal

- Área individual para acompanhamento de tarefas.
- Notas do dia.
- Atalhos úteis.
- Visualização integrada com ClickUp.
- Modo de exibição com calendário e ClickUp.

---

### Supervisão e desempenho

- Visão de desempenho por colaborador.
- Acompanhamento de horas, tarefas e pontos.
- Metas mensais por níveis.
- Descontos e pontuação líquida.
- Painel de supervisão por grupo.

---

### Clientes e equipe

- Cadastro e gestão de clientes.
- Cadastro e gestão de colaboradores.
- Controle de cargo, salário e horas mensais.
- Comparativos de tempo, custo e produtividade.

---

### Integração visual com ClickUp

O sistema carrega visualizações públicas do ClickUp por iframe, permitindo acompanhar fluxos como:

- Linha editorial;
- criação de artes;
- vídeos;
- aprovação interna;
- aprovação do cliente;
- programação;
- otimização de tráfego;
- agenda de gravações.

Observação: alguns erros no console relacionados a ClickUp, Segment, Datadog ou Google Tag Manager podem ser gerados pelo próprio iframe do ClickUp ou por bloqueadores do navegador. Eles não indicam, necessariamente, falha no HUB.

---

## Stack utilizada

### Frontend

- HTML5
- CSS3
- JavaScript Vanilla
- Chart.js
- Google Fonts

### Backend

- PHP
- APIs REST internas

### Banco de dados

- MySQL

### Organização

- Partials PHP
- Arquivos JS separados por responsabilidade
- Configuração via `.env`

---

## Estrutura do projeto

```bash
├── index.php
├── remap.png
├── .env
│
├── assets/
│   └── css/
│       └── hub.css
│
├── partials/
│   ├── layout/
│   │   ├── head.php
│   │   ├── app-open.php
│   │   ├── sidebar.php
│   │   ├── main-open.php
│   │   ├── main-close.php
│   │   ├── app-close.php
│   │   ├── scripts.php
│   │   └── footer.php
│   │
│   ├── sections/
│   │   └── login.php
│   │
│   ├── pages/
│   │   ├── timer.php
│   │   ├── registro-retroativo.php
│   │   ├── meu-trabalho.php
│   │   ├── dashboard-diretor.php
│   │   ├── clientes-diretor.php
│   │   ├── clientes-colaborador.php
│   │   ├── equipe-diretor.php
│   │   ├── pontuacao-metas.php
│   │   ├── supervisao.php
│   │   ├── painel-pessoal.php
│   │   ├── tarefas-kanban.php
│   │   └── desempenho.php
│   │
│   └── components/
│       └── modals.php
│
├── js/
│   ├── core/
│   │   ├── api-bridge.js
│   │   ├── config-state.js
│   │   └── utils.js
│   │
│   ├── modules/
│   │   ├── points-system.js
│   │   ├── seed.js
│   │   ├── auth.js
│   │   ├── navigation.js
│   │   ├── timer.js
│   │   ├── retroactive.js
│   │   ├── supervision-panel.js
│   │   ├── tasks-kanban.js
│   │   └── export.js
│   │
│   ├── integrations/
│   │   ├── db-bridge.js
│   │   ├── task-direct-save.js
│   │   └── auto-update.js
│   │
│   ├── compatibility/
│   │   └── modal-actions.js
│   │
│   └── init.js
│
└── api/
    ├── config.php
    ├── env.php
    ├── login.php
    ├── logout.php
    ├── state.php
    ├── full_state.php
    ├── sync.php
    ├── check_updates.php
    ├── tarefas.php
    ├── timer.php
    ├── usuarios.php
    ├── clientes.php
    ├── colunas.php
    ├── metas.php
    ├── pontos_tarefas.php
    ├── descontos.php
    └── ping.php
```

---

## Como o `index.php` funciona

O arquivo `index.php` monta a aplicação usando `require` para importar cada parte do layout.

Fluxo principal:

```php
require __DIR__ . '/partials/layout/head.php';
require __DIR__ . '/partials/sections/login.php';

require __DIR__ . '/partials/layout/app-open.php';
require __DIR__ . '/partials/layout/sidebar.php';
require __DIR__ . '/partials/layout/main-open.php';

require __DIR__ . '/partials/pages/timer.php';
require __DIR__ . '/partials/pages/registro-retroativo.php';
require __DIR__ . '/partials/pages/meu-trabalho.php';
require __DIR__ . '/partials/pages/dashboard-diretor.php';
require __DIR__ . '/partials/pages/clientes-diretor.php';
require __DIR__ . '/partials/pages/clientes-colaborador.php';
require __DIR__ . '/partials/pages/equipe-diretor.php';
require __DIR__ . '/partials/pages/pontuacao-metas.php';
require __DIR__ . '/partials/pages/supervisao.php';
require __DIR__ . '/partials/pages/painel-pessoal.php';
require __DIR__ . '/partials/pages/tarefas-kanban.php';
require __DIR__ . '/partials/pages/desempenho.php';

require __DIR__ . '/partials/layout/main-close.php';
require __DIR__ . '/partials/layout/app-close.php';

require __DIR__ . '/partials/components/modals.php';
require __DIR__ . '/partials/layout/scripts.php';
require __DIR__ . '/partials/layout/footer.php';
```

---

## Ordem dos scripts

A ordem dos scripts é importante porque o sistema ainda utiliza funções e variáveis globais.

Arquivo responsável:

```bash
partials/layout/scripts.php
```

Ordem atual recomendada:

```html
<script src="js/core/api-bridge.js?v=4" defer></script>
<script src="js/core/config-state.js?v=4" defer></script>
<script src="js/core/utils.js?v=4" defer></script>

<script src="js/modules/points-system.js?v=4" defer></script>
<script src="js/modules/seed.js?v=4" defer></script>
<script src="js/modules/auth.js?v=4" defer></script>
<script src="js/modules/navigation.js?v=4" defer></script>
<script src="js/modules/timer.js?v=4" defer></script>
<script src="js/modules/retroactive.js?v=4" defer></script>
<script src="js/modules/supervision-panel.js?v=4" defer></script>
<script src="js/modules/tasks-kanban.js?v=4" defer></script>
<script src="js/modules/export.js?v=4" defer></script>

<script src="js/integrations/db-bridge.js?v=4" defer></script>
<script src="js/integrations/task-direct-save.js?v=4" defer></script>
<script src="js/integrations/auto-update.js?v=4" defer></script>

<script src="js/compatibility/modal-actions.js?v=4" defer></script>

<script src="js/init.js?v=4" defer></script>
```

Importante:

- `api-bridge.js` deve carregar primeiro.
- `config-state.js` deve carregar antes dos módulos.
- `modal-actions.js` deve ficar perto do final, pois expõe funções usadas em `onclick`.
- `init.js` deve ser o último, pois inicializa o sistema.

---

## Configuração do ambiente

O projeto usa `.env` na raiz para armazenar dados sensíveis do banco.

Exemplo de `.env`:

```env
APP_ENV=production
APP_DEBUG=false

DB_HOST=localhost
DB_NAME=nome_do_banco
DB_USER=usuario_do_banco
DB_PASS=senha_do_banco
DB_CHARSET=utf8mb4
```

O arquivo `api/config.php` carrega o `.env` usando:

```php
require_once __DIR__ . '/env.php';

loadEnvFile(__DIR__ . '/../.env');
```

Ou seja, o `.env` esperado fica na raiz do projeto, um nível acima da pasta `api/`.

---

## Segurança

Nunca envie o arquivo `.env` real para o GitHub.

Recomenda-se criar um `.env.example` com este conteúdo:

```env
APP_ENV=production
APP_DEBUG=false

DB_HOST=localhost
DB_NAME=
DB_USER=
DB_PASS=
DB_CHARSET=utf8mb4
```

Também é recomendado adicionar ao `.gitignore`:

```gitignore
.env
api/.env
```

Se o `.env` ficar dentro de uma pasta pública, proteja com `.htaccess`:

```apache
<Files ".env">
  Require all denied
</Files>
```

Também é recomendado remover arquivos `.env` duplicados. Neste projeto, o `api/config.php` carrega o `.env` da raiz. Portanto, um `api/.env` só deve existir se houver alguma lógica específica usando esse arquivo.

---

## Requisitos

- PHP com suporte a PDO.
- MySQL.
- Servidor web com suporte a PHP.
- Navegador moderno.
- Banco de dados configurado corretamente.
- Arquivo `.env` preenchido na raiz do projeto.

---

## Instalação

1. Envie os arquivos para o servidor.

2. Crie o arquivo `.env` na raiz.

3. Configure as credenciais do banco no `.env`.

4. Importe ou mantenha o banco MySQL utilizado pelo sistema.

5. Garanta que `api/config.php` esteja carregando corretamente o `.env`.

6. Acesse:

```bash
https://seudominio.com/
```

ou, em ambiente de teste:

```bash
https://seudominio.com/hub_teste/
```

---

## Testes recomendados após subir

Após publicar uma nova versão, teste:

- login;
- abertura das páginas pelo menu;
- timer;
- registro retroativo;
- criação e edição de tarefas;
- Kanban;
- salvamento no banco;
- painel pessoal;
- supervisão;
- desempenho;
- clientes;
- equipe;
- metas e pontuação.

Também verifique no console se ainda existem erros do próprio HUB, como:

```bash
_store is not defined
login is not defined
renderKanban is not defined
404 em arquivos js/
500 em api/check_updates.php
```

Erros relacionados a ClickUp, Segment, Datadog ou Google Tag Manager podem aparecer por causa do iframe ou bloqueadores do navegador.

---

## Deploy seguro

Antes de subir para produção:

1. Faça backup completo da pasta atual.
2. Faça backup do banco de dados.
3. Não substitua o `.env` de produção pelo `.env` de teste.
4. Não suba senhas reais para o GitHub.
5. Teste primeiro em uma pasta separada, como `/hub_teste`.
6. Só depois substitua o ambiente principal.

---

## Observações importantes

- O sistema usa MySQL como fonte principal de dados.
- Algumas partes ainda dependem de funções globais no JavaScript.
- Por isso, a ordem dos scripts deve ser preservada.
- O arquivo `modal-actions.js` existe para manter compatibilidade com eventos inline do HTML.
- A atualização automática é feita por `auto-update.js` consultando `api/check_updates.php`.
- O salvamento direto de tarefas é feito por `task-direct-save.js`.

---

## Status do projeto

Projeto interno em desenvolvimento e evolução contínua.

---

## Desenvolvimento

Desenvolvido pela **Remap Digital** para uso interno de gestão operacional, produtividade e acompanhamento de equipe.
