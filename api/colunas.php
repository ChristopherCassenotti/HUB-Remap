<?php
require_once "config.php";

function try_exec_colunas($pdo, $sql) { try { $pdo->exec($sql); } catch (Exception $e) {} }
function ensure_colunas_schema($pdo) {
  try_exec_colunas($pdo, "
    CREATE TABLE IF NOT EXISTS sistema_updates (
      id INT PRIMARY KEY DEFAULT 1,
      tarefas_updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      supervisao_updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");
  try_exec_colunas($pdo, "INSERT IGNORE INTO sistema_updates (id) VALUES (1)");
  try_exec_colunas($pdo, "
    CREATE TABLE IF NOT EXISTS tarefas_colunas (
      id VARCHAR(80) NOT NULL PRIMARY KEY,
      nome VARCHAR(120) NOT NULL,
      emoji VARCHAR(20) DEFAULT '',
      ordem INT NOT NULL DEFAULT 0,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");
  try_exec_colunas($pdo, "ALTER TABLE tarefas_colunas ADD COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  try_exec_colunas($pdo, "ALTER TABLE tarefas_colunas MODIFY COLUMN id VARCHAR(80) NOT NULL");
  try_exec_colunas($pdo, "ALTER TABLE tarefas_colunas MODIFY COLUMN emoji VARCHAR(20) DEFAULT ''");
  try_exec_colunas($pdo, "ALTER TABLE tarefas MODIFY COLUMN coluna VARCHAR(80) DEFAULT 'col_1'");
}
function bump_colunas($pdo) {
  try_exec_colunas($pdo, "UPDATE sistema_updates SET tarefas_updated_at = NOW() WHERE id = 1");
}

ensure_colunas_schema($pdo);
$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
  $stmt = $pdo->query("SELECT id, nome, emoji, ordem FROM tarefas_colunas ORDER BY ordem ASC, id ASC");
  responseJson(["success" => true, "data" => $stmt->fetchAll()]);
}

if ($method === "POST" || $method === "PUT") {
  $data = getJsonInput();

  $id = trim((string)($data["id"] ?? ("col_" . time())));
  $nome = trim($data["name"] ?? $data["nome"] ?? "");
  $emoji = $data["emoji"] ?? "";
  $ordem = (int)($data["ordem"] ?? 0);

  if ($id === "" || $nome === "") {
    responseJson(["success" => false, "message" => "ID e nome da coluna são obrigatórios."], 400);
  }

  $stmt = $pdo->prepare("
    INSERT INTO tarefas_colunas (id, nome, emoji, ordem)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      nome = VALUES(nome),
      emoji = VALUES(emoji),
      ordem = VALUES(ordem)
  ");
  $stmt->execute([$id, $nome, $emoji, $ordem]);
  bump_colunas($pdo);

  responseJson(["success" => true, "id" => $id]);
}

if ($method === "DELETE") {
  $id = trim((string)($_GET["id"] ?? ""));
  if ($id === "") responseJson(["success" => false, "message" => "ID obrigatório."], 400);

  $stmt = $pdo->prepare("DELETE FROM tarefas_colunas WHERE id = ?");
  $stmt->execute([$id]);
  $move = $pdo->prepare("UPDATE tarefas SET status = 'concluido' WHERE coluna = ? AND (status NOT IN ('finalizado', 'concluido', 'concluida') OR status IS NULL)");
  try { $move->execute([$id]); } catch (Exception $e) {}
  bump_colunas($pdo);

  responseJson(["success" => true, "message" => "Coluna removida."]);
}

responseJson(["success" => false, "message" => "Método não permitido."], 405);
?>
