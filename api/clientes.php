<?php
require_once "config.php";

function remapTryExec($pdo, $sql) {
  try { $pdo->exec($sql); } catch (Exception $e) {}
}

function ensureClientesSchema($pdo) {
  remapTryExec($pdo, "CREATE TABLE IF NOT EXISTS clientes (id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(160) NOT NULL, valor DECIMAL(10,2) DEFAULT 0, horas_mensais DECIMAL(8,2) DEFAULT 0, observacoes TEXT NULL, plano VARCHAR(120) DEFAULT '', criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
  remapTryExec($pdo, "ALTER TABLE clientes ADD COLUMN horas_mensais DECIMAL(8,2) DEFAULT 0");
  remapTryExec($pdo, "ALTER TABLE clientes ADD COLUMN observacoes TEXT NULL");
  remapTryExec($pdo, "ALTER TABLE clientes ADD COLUMN plano VARCHAR(120) DEFAULT ''");
}

function normalizeClientRow($r) {
  return [
    "id" => "cl" . str_pad((string)$r["id"], 3, "0", STR_PAD_LEFT),
    "dbId" => (int)$r["id"],
    "name" => $r["nome"],
    "value" => (string)(float)($r["valor"] ?? 0),
    "hours" => (string)(float)($r["horas_mensais"] ?? 0),
    "notes" => $r["observacoes"] ?? ""
  ];
}

ensureClientesSchema($pdo);
$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
  $stmt = $pdo->query("SELECT id, nome, valor, horas_mensais, observacoes FROM clientes ORDER BY nome ASC");
  $rows = [];
  foreach ($stmt->fetchAll() as $r) $rows[] = normalizeClientRow($r);
  responseJson(["success" => true, "data" => $rows]);
}

if ($method === "POST") {
  $data = getJsonInput();
  requiredFields($data, ["nome"]);

  $stmt = $pdo->prepare("INSERT INTO clientes (nome, valor, horas_mensais, observacoes, plano) VALUES (?, ?, ?, ?, ?)");
  $stmt->execute([
    trim($data["nome"]),
    (float)($data["valor"] ?? $data["value"] ?? 0),
    max(0, (float)($data["horas_mensais"] ?? $data["hours"] ?? 0)),
    trim($data["observacoes"] ?? $data["notes"] ?? ""),
    trim($data["plano"] ?? "")
  ]);

  responseJson(["success" => true, "message" => "Cliente criado.", "id" => (int)$pdo->lastInsertId()]);
}

if ($method === "PUT") {
  $data = getJsonInput();
  requiredFields($data, ["id", "nome"]);

  $id = (int)$data["id"];
  if (!$id && preg_match('/^cl0*([0-9]+)$/', (string)$data["id"], $m)) $id = (int)$m[1];
  if (!$id) responseJson(["success" => false, "message" => "ID inválido."], 400);

  $stmt = $pdo->prepare("UPDATE clientes SET nome = ?, valor = ?, horas_mensais = ?, observacoes = ?, plano = ? WHERE id = ?");
  $stmt->execute([
    trim($data["nome"]),
    (float)($data["valor"] ?? $data["value"] ?? 0),
    max(0, (float)($data["horas_mensais"] ?? $data["hours"] ?? 0)),
    trim($data["observacoes"] ?? $data["notes"] ?? ""),
    trim($data["plano"] ?? ""),
    $id
  ]);

  responseJson(["success" => true, "message" => "Cliente atualizado."]);
}

if ($method === "DELETE") {
  $rawId = $_GET["id"] ?? 0;
  $id = (int)$rawId;
  if (!$id && preg_match('/^cl0*([0-9]+)$/', (string)$rawId, $m)) $id = (int)$m[1];
  if (!$id) responseJson(["success" => false, "message" => "ID obrigatório."], 400);

  $stmt = $pdo->prepare("DELETE FROM clientes WHERE id = ?");
  $stmt->execute([$id]);

  responseJson(["success" => true, "message" => "Cliente removido."]);
}

responseJson(["success" => false, "message" => "Método não permitido."], 405);
?>
