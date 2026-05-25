<?php
require_once "config.php";

function remapEnsureUpdatesTable($pdo) {
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS sistema_updates (
      id INT PRIMARY KEY DEFAULT 1,
      tarefas_updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      supervisao_updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");
  $pdo->exec("INSERT IGNORE INTO sistema_updates (id) VALUES (1)");
}

function remapBumpUpdate($pdo, $type) {
  remapEnsureUpdatesTable($pdo);
  if ($type === 'tarefas') {
    $pdo->exec("UPDATE sistema_updates SET tarefas_updated_at = NOW() WHERE id = 1");
  }
  if ($type === 'supervisao') {
    $pdo->exec("UPDATE sistema_updates SET supervisao_updated_at = NOW() WHERE id = 1");
  }
}

$pdo->exec("CREATE TABLE IF NOT EXISTS metas (id INT AUTO_INCREMENT PRIMARY KEY, colaborador VARCHAR(120) NOT NULL, mes VARCHAR(7) NOT NULL, meta_7 INT NOT NULL DEFAULT 0, meta_14 INT NOT NULL DEFAULT 0, meta_21 INT NOT NULL DEFAULT 0, criado_em TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, atualizado_em TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE KEY unique_colaborador_mes (colaborador, mes)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

$method = $_SERVER["REQUEST_METHOD"];
if ($method === "GET") {
  $colaborador = trim($_GET["colaborador"] ?? "");
  if ($colaborador !== "") { $stmt = $pdo->prepare("SELECT * FROM metas WHERE colaborador = ? ORDER BY mes DESC"); $stmt->execute([$colaborador]); }
  else { $stmt = $pdo->query("SELECT * FROM metas ORDER BY mes DESC, colaborador ASC"); }
  responseJson(["success" => true, "data" => $stmt->fetchAll()]);
}
if ($method === "POST") {
  $data = getJsonInput(); requiredFields($data, ["colaborador", "mes"]);
  $m1 = (int)($data["meta_7"] ?? $data["m1"] ?? 0);
  $m2 = (int)($data["meta_14"] ?? $data["m2"] ?? 0);
  $m3 = (int)($data["meta_21"] ?? $data["m3"] ?? 0);
  $stmt = $pdo->prepare("INSERT INTO metas (colaborador, mes, meta_7, meta_14, meta_21) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE meta_7 = VALUES(meta_7), meta_14 = VALUES(meta_14), meta_21 = VALUES(meta_21)");
  $stmt->execute([trim($data["colaborador"]), trim($data["mes"]), $m1, $m2, $m3]);
  remapBumpUpdate($pdo, "supervisao");
  responseJson(["success" => true, "message" => "Meta salva."]);
}
responseJson(["success" => false, "message" => "Método não permitido."], 405);
?>