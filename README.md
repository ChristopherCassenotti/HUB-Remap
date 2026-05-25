# HUB Remap

Sistema interno de gestão e produtividade desenvolvido para centralizar tarefas, metas, desempenho da equipe e integrações visuais com o ClickUp.

O projeto foi criado para apoiar a operação interna da Remap, reunindo em um único ambiente o controle de tarefas, acompanhamento de produtividade, visualização de indicadores e sincronização de dados com backend em PHP e MySQL.

---

## Visão geral

O **HUB Remap** é um dashboard corporativo desenvolvido com **HTML, CSS, JavaScript, PHP e MySQL**, com foco em organização operacional, performance e atualização contínua dos dados.

A plataforma funciona como uma central de gestão para equipes, permitindo acompanhar atividades, metas, pontuações, clientes, tarefas e visualizações externas do ClickUp de forma prática e integrada.

---

## Funcionalidades principais

### Gestão de tarefas

O sistema permite controlar tarefas e subtarefas com recursos como:

- Responsáveis
- Prioridades
- Etiquetas
- Comentários
- Anexos
- Subtarefas
- Status personalizados
- Recorrências
- Organização por colunas

Os modais e ações da interface são construídos em JavaScript puro, garantindo flexibilidade e boa performance.

---

### Sincronização com backend

A aplicação utiliza APIs em PHP para salvar, buscar e atualizar os dados no banco MySQL.

Entre os recursos de sincronização estão:

- Salvamento de tarefas
- Atualização de estados da aplicação
- Consulta de alterações no banco
- Persistência de clientes, metas, colunas, pontos e descontos
- Comunicação entre frontend e backend por endpoints REST

---

### Atualização automática

O HUB conta com uma rotina de atualização em segundo plano, usando polling inteligente para manter a interface sincronizada com o banco de dados.

O sistema foi pensado para reduzir conflitos durante o uso, evitando atualizações em momentos sensíveis, como:

- Durante digitação
- Com modais abertos
- Durante interações importantes do usuário

---

### Integração visual com ClickUp

O projeto possui suporte para visualizações públicas do ClickUp por meio de iframes e links de compartilhamento.

Essa integração permite centralizar dentro do HUB visualizações como:

- Linha editorial
- Criação
- Aprovação interna
- Copy
- Aprovação do cliente
- Programação
- Otimização de tráfego
- Agenda de gravações

A integração via API do ClickUp está prevista como evolução futura.

---

### Métricas e indicadores

O sistema também foi planejado para exibir dados operacionais e de produtividade, como:

- Desempenho da equipe
- Metas atingidas
- Pontuações
- Estatísticas gerais
- Evolução operacional
- Comparativos por cliente e colaborador

---

## Stack utilizada

### Frontend

- HTML5
- CSS3
- JavaScript Vanilla
- CSS Variables

### Backend

- PHP
- APIs REST

### Banco de dados

- MySQL

### Bibliotecas

- Chart.js

---

## Estrutura do projeto

```bash
├── api/
│   ├── check_updates.php
│   ├── clientes.php
│   ├── colunas.php
│   ├── config.php
│   ├── descontos.php
│   ├── full_state.php
│   ├── login.php
│   ├── logout.php
│   ├── metas.php
│   ├── ping.php
│   ├── pontos_tarefas.php
│   ├── state.php
│   ├── sync.php
│   ├── tarefas.php
│   ├── timer.php
│   └── usuarios.php
│
├── database/
│   └── arquivos SQL do projeto
│
├── api-bridge.js
├── auto-update.js
├── clickup-views.js
├── db-bridge.js
├── direct-save.js
├── index.html
├── modal-actions.js
├── remap.png
├── .gitignore
└── README.md
```

---

## Fluxo de funcionamento

```bash
Frontend
   ↓
JavaScript Bridge
   ↓
API PHP
   ↓
Banco MySQL
   ↑
Auto Update / Polling
```

---

## Objetivos do projeto

O HUB Remap foi desenvolvido para:

- Centralizar operações internas
- Organizar tarefas e fluxos da equipe
- Acompanhar metas e produtividade
- Reduzir retrabalho operacional
- Facilitar a visualização de dados
- Integrar ferramentas externas em um só ambiente
- Melhorar o controle da operação em tempo real

---

## Requisitos

Para executar o projeto, é necessário ter:

- Servidor com suporte a PHP
- Banco de dados MySQL
- Navegador moderno
- Configuração correta do arquivo `api/config.php`
- Importação das tabelas SQL disponíveis na pasta `database/`

---

## Como executar

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
```

2. Envie os arquivos para um servidor com suporte a PHP.

3. Importe o banco de dados MySQL usando os arquivos da pasta `database/`.

4. Configure as credenciais de conexão no arquivo:

```bash
api/config.php
```

5. Acesse o sistema pelo navegador:

```bash
https://seudominio.com.br/
```

---

## Segurança

Este projeto utiliza APIs internas e conexão com banco de dados. Por isso, recomenda-se:

- Não versionar arquivos com senhas reais
- Manter `api/config.php` protegido
- Utilizar variáveis de ambiente quando possível
- Restringir acesso ao sistema por autenticação
- Evitar exposição pública de endpoints sensíveis

---

## Futuras implementações

- Sistema de notificações em tempo real
- WebSockets para sincronização instantânea
- Permissões avançadas por nível de acesso
- Logs de atividade
- Dashboard analítico avançado
- Integração com API do ClickUp
- Melhorias no controle de tarefas e produtividade

---

## Status do projeto

Projeto em desenvolvimento e evolução contínua.

---

## Desenvolvimento

Desenvolvido pela **Remap Digital** com foco em performance, organização modular, escalabilidade e controle operacional interno.
