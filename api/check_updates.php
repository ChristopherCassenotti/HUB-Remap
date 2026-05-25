<?php
require_once "config.php";

$pdo->exec("
  CREATE TABLE IF NOT EXISTS sistema_updates (
    id INT PRIMARY KEY DEFAULT 1,
    tarefas_updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    supervisao_updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
");

$pdo->exec("INSERT IGNORE INTO sistema_updates (id) VALUES (1)");

$stmt = $pdo->query("
  SELECT tarefas_updated_at, supervisao_updated_at
  FROM sistema_updates
  WHERE id = 1
");

$row = $stmt->fetch();

responseJson([
  "success" => true,
  "tarefas_updated_at" => $row["tarefas_updated_at"] ?? null,
  "supervisao_updated_at" => $row["supervisao_updated_at"] ?? null
]);
?>
