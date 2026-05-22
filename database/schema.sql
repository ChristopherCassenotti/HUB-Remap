-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 22/05/2026 às 22:52
-- Versão do servidor: 11.8.6-MariaDB-log
-- Versão do PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `u244211971_timetracker`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `app_state`
--

CREATE TABLE `app_state` (
  `key_name` varchar(120) NOT NULL,
  `value_json` longtext DEFAULT NULL,
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nome` varchar(160) NOT NULL DEFAULT '',
  `valor` decimal(10,2) NOT NULL DEFAULT 0.00,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `horas_mensais` decimal(8,2) NOT NULL DEFAULT 0.00,
  `observacoes` text DEFAULT NULL,
  `plano` varchar(120) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `descontos_pontos`
--

CREATE TABLE `descontos_pontos` (
  `id` int(11) NOT NULL,
  `colaborador` varchar(120) NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `pontos` int(11) NOT NULL DEFAULT 0,
  `data_ref` date NOT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `metas`
--

CREATE TABLE `metas` (
  `id` int(11) NOT NULL,
  `colaborador` varchar(120) NOT NULL DEFAULT '',
  `mes` varchar(7) NOT NULL DEFAULT '',
  `meta_7` int(11) DEFAULT 0,
  `meta_14` int(11) DEFAULT 0,
  `meta_21` int(11) DEFAULT 0,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `pontos_tarefas`
--

CREATE TABLE `pontos_tarefas` (
  `id` int(11) NOT NULL,
  `colaborador` varchar(120) NOT NULL,
  `cliente` varchar(160) DEFAULT '',
  `tarefa` varchar(255) NOT NULL,
  `pontos` int(11) NOT NULL DEFAULT 0,
  `data_ref` date NOT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sistema_updates`
--

CREATE TABLE `sistema_updates` (
  `id` int(11) NOT NULL DEFAULT 1,
  `tarefas_updated_at` timestamp NULL DEFAULT current_timestamp(),
  `supervisao_updated_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tarefas`
--

CREATE TABLE `tarefas` (
  `id` int(11) NOT NULL,
  `titulo` text DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `responsavel` varchar(120) DEFAULT '',
  `delegado_por` varchar(120) DEFAULT '',
  `status` varchar(50) DEFAULT NULL,
  `prioridade` int(11) DEFAULT NULL,
  `tempo_total` int(11) DEFAULT 0,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `cliente` varchar(160) DEFAULT '',
  `prazo` date DEFAULT NULL,
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `uid_local` varchar(160) DEFAULT NULL,
  `coluna` varchar(80) DEFAULT 'col_1',
  `data_tarefa` date DEFAULT NULL,
  `recorrencia` varchar(30) DEFAULT '',
  `etiquetas_json` longtext DEFAULT NULL,
  `subtarefas_json` longtext DEFAULT NULL,
  `anexos_json` longtext DEFAULT NULL,
  `comentarios_json` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tarefas_colunas`
--

CREATE TABLE `tarefas_colunas` (
  `id` varchar(80) NOT NULL,
  `nome` varchar(120) NOT NULL,
  `emoji` varchar(20) DEFAULT '',
  `ordem` int(11) DEFAULT 0,
  `criado_em` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `timer`
--

CREATE TABLE `timer` (
  `id` int(11) NOT NULL,
  `tarefa_id` int(11) DEFAULT NULL,
  `uid_local` varchar(120) DEFAULT NULL,
  `usuario` varchar(150) DEFAULT NULL,
  `inicio` datetime DEFAULT NULL,
  `fim` datetime DEFAULT NULL,
  `duracao` int(11) DEFAULT NULL,
  `pausado_em` datetime DEFAULT NULL,
  `retomado_em` datetime DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'finalizado',
  `cliente` varchar(160) DEFAULT NULL,
  `tarefa` varchar(255) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `categoria` varchar(80) DEFAULT NULL,
  `cargo` varchar(120) DEFAULT NULL,
  `pontos` decimal(10,2) NOT NULL DEFAULT 0.00,
  `base_points` decimal(10,2) NOT NULL DEFAULT 0.00,
  `point_mode` varchar(30) NOT NULL DEFAULT 'fixed',
  `task_lines_json` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `timer_ativos`
--

CREATE TABLE `timer_ativos` (
  `id` int(11) NOT NULL,
  `uid_local` varchar(120) NOT NULL DEFAULT '',
  `usuario` varchar(150) NOT NULL DEFAULT '',
  `cliente` varchar(160) DEFAULT NULL,
  `tarefa` varchar(255) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `categoria` varchar(80) DEFAULT NULL,
  `cargo` varchar(120) DEFAULT NULL,
  `pontos` decimal(10,2) NOT NULL DEFAULT 0.00,
  `base_points` decimal(10,2) NOT NULL DEFAULT 0.00,
  `point_mode` varchar(30) NOT NULL DEFAULT 'fixed',
  `task_lines_json` text DEFAULT NULL,
  `segundos_acumulados` int(11) NOT NULL DEFAULT 0,
  `iniciado_em` datetime DEFAULT NULL,
  `rodando_desde` datetime DEFAULT NULL,
  `pausado_em` datetime DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'pausado',
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(160) NOT NULL DEFAULT '',
  `email` varchar(160) DEFAULT NULL,
  `senha` varchar(255) DEFAULT NULL,
  `cargo` varchar(120) DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `token` varchar(120) DEFAULT NULL,
  `salario` decimal(10,2) DEFAULT 0.00,
  `horas_mensais` int(11) DEFAULT 176
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `app_state`
--
ALTER TABLE `app_state`
  ADD PRIMARY KEY (`key_name`);

--
-- Índices de tabela `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `descontos_pontos`
--
ALTER TABLE `descontos_pontos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_colaborador` (`colaborador`),
  ADD KEY `idx_data_ref` (`data_ref`);

--
-- Índices de tabela `metas`
--
ALTER TABLE `metas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_colaborador_mes` (`colaborador`,`mes`);

--
-- Índices de tabela `pontos_tarefas`
--
ALTER TABLE `pontos_tarefas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_colaborador` (`colaborador`),
  ADD KEY `idx_data_ref` (`data_ref`);

--
-- Índices de tabela `sistema_updates`
--
ALTER TABLE `sistema_updates`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tarefas`
--
ALTER TABLE `tarefas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_uid_local` (`uid_local`),
  ADD KEY `idx_coluna` (`coluna`),
  ADD KEY `idx_status` (`status`);

--
-- Índices de tabela `tarefas_colunas`
--
ALTER TABLE `tarefas_colunas`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `timer`
--
ALTER TABLE `timer`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_timer_tarefa` (`tarefa_id`),
  ADD KEY `idx_timer_usuario` (`usuario`),
  ADD KEY `idx_timer_status` (`status`),
  ADD KEY `idx_timer_uid_local` (`uid_local`),
  ADD KEY `idx_timer_usuario_inicio` (`usuario`,`inicio`);

--
-- Índices de tabela `timer_ativos`
--
ALTER TABLE `timer_ativos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_uid_local` (`uid_local`),
  ADD KEY `idx_timer_ativos_usuario` (`usuario`),
  ADD KEY `idx_timer_ativos_status` (`status`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `descontos_pontos`
--
ALTER TABLE `descontos_pontos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `metas`
--
ALTER TABLE `metas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pontos_tarefas`
--
ALTER TABLE `pontos_tarefas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tarefas`
--
ALTER TABLE `tarefas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `timer`
--
ALTER TABLE `timer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `timer_ativos`
--
ALTER TABLE `timer_ativos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
