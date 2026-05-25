# HUB Remap

Sistema interno de gestão e produtividade desenvolvido para centralizar tarefas, metas, desempenho da equipa e integrações externas com o ClickUp, oferecendo sincronização em tempo real, visualização analítica e controlo operacional unificado.

---

# Visão Geral

O **HUB Remap** é um dashboard corporativo construído com uma arquitetura híbrida baseada em **Vanilla JavaScript**, **PHP** e **MySQL**, focado em desempenho, sincronização instantânea de dados e experiência fluida para equipas operacionais.

O sistema funciona como uma central inteligente de gestão, permitindo:

* Controle completo de tarefas e subtarefas
* Gestão de metas e pontuações
* Monitoramento de desempenho da equipa
* Integração visual com dashboards do ClickUp por links de compartilhamento (em breve intregração via API)
* Atualização automática em tempo real
* Persistência híbrida com sincronização contínua

---

# Funcionalidades Principais

## Sincronização em Tempo Real (API Bridge)

O estado da aplicação é mantido em memória e sincronizado continuamente com o backend através de APIs PHP.

### Características:

* Atualização instantânea entre frontend e banco de dados
* Persistência temporária utilizando `LocalStorage`
* Gestão segura de tokens e sessão
* Sincronização desacoplada da interface

---

## Gestão Completa de Tarefas

Sistema avançado para controle do ciclo de vida das tarefas.

### Recursos disponíveis:

* Subtarefas
* Comentários
* Anexos
* Responsáveis
* Etiquetas
* Prioridades
* Recorrências
* Estados personalizados

Os modais são totalmente dinâmicos e construídos em JavaScript puro, garantindo alta performance e flexibilidade.

---

## Integração com ClickUp

Integração visual com dashboards e linhas editoriais do ClickUp através de iframes otimizados.

### Recursos:

* Embeds responsivos
* Compatibilidade com Dark Mode
* Filtros visuais automáticos
* Navegação integrada ao HUB

---

## Auto-Update Inteligente

O sistema monitora alterações no banco de dados em segundo plano utilizando polling inteligente.

### Diferenciais:

* Atualização automática da interface
* Pausa temporária durante digitação
* Suspensão automática com modais abertos
* Melhor experiência de utilização
* Redução de conflitos de estado

---

## Métricas e Visualização de Dados

Integração com **Chart.js** para exibição de métricas em tempo real.

### Indicadores:

* Desempenho da equipa
* Metas atingidas
* Evolução operacional
* Pontuações
* Estatísticas gerais

---

# Arquitetura do Projeto

```plaintext
├── api/
│   ├── check_updates.php      # Verificação de alterações em segundo plano
│   ├── full_state.php         # Sincronização global do sistema
│   ├── state.php              # Estados voláteis individuais
│   └── sync.php               # Persistência direta das tarefas
│
├── js/
│   ├── api-bridge.js          # Ponte principal de sincronização
│   ├── clickup-views.js       # Configuração de embeds e iframes
│   ├── modal-actions.js       # Gestão de ações dos modais
│   ├── db-bridge.js           # Comunicação completa com MySQL
│   ├── task-db-save.js        # Salvamento direto de tarefas
│   └── auto-update.js         # Polling inteligente
│
├── index.html                 # Interface principal
├── remap.png                  # Ícone/Favicon do sistema
└── .gitignore                 # Arquivos ignorados no Git
```

---

# Stack Tecnológica

## Frontend

* HTML5
* CSS3
* Vanilla JavaScript (ES6+)
* CSS Variables (Custom Properties)

## Backend

* PHP (REST API)

## Banco de Dados

* MySQL

## Bibliotecas

* Chart.js (via CDN)

---

# Fluxo de Funcionamento

```plaintext
Frontend (JS)
      ↓
API Bridge
      ↓
PHP REST API
      ↓
MySQL Database
      ↑
Auto Update / Polling
```

---

# Objetivos do Projeto

O HUB Remap foi desenvolvido para:

* Centralizar operações internas
* Melhorar produtividade da equipa
* Reduzir retrabalho operacional
* Automatizar sincronização de estados
* Facilitar acompanhamento de metas
* Integrar visualmente ferramentas externas

---

# Persistência e Performance

A arquitetura foi desenhada para priorizar:

* Baixa latência
* Atualizações instantâneas
* Persistência segura
* Redução de recarregamentos
* Experiência fluida em tempo real

---

# Futuras Implementações

* Sistema de notificações em tempo real
* WebSockets para sincronização instantânea
* Permissões e níveis de acesso
* Logs de atividade
* Dashboard analítico avançado
* Integração com APIs externas adicionais

---

# Desenvolvimento

Projeto desenvolvido com foco em:

* Escalabilidade
* Organização modular
* Performance
* Manutenibilidade
* Arquitetura desacoplada
