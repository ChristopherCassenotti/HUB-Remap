<?php
require_once "config.php";

function try_exec_tarefas($pdo, $sql) { try { $pdo->exec($sql); } catch (Exception $e) {} }

function remapEnsureUpdatesTable($pdo) {
  try_exec_tarefas($pdo, "
    CREATE TABLE IF NOT EXISTS sistema_updates (
      id INT PRIMARY KEY DEFAULT 1,
      tarefas_updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      supervisao_updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");
  try_exec_tarefas($pdo, "INSERT IGNORE INTO sistema_updates (id) VALUES (1)");
}

function remapBumpUpdate($pdo, $type) {
  remapEnsureUpdatesTable($pdo);
  if ($type === 'tarefas') $pdo->exec("UPDATE sistema_updates SET tarefas_updated_at = NOW() WHERE id = 1");
  if ($type === 'supervisao') $pdo->exec("UPDATE sistema_updates SET supervisao_updated_at = NOW() WHERE id = 1");
}

function ensure_tarefas_schema($pdo) {
  try_exec_tarefas($pdo, "
    CREATE TABLE IF NOT EXISTS tarefas_colunas (
      id VARCHAR(80) NOT NULL PRIMARY KEY,
      nome VARCHAR(120) NOT NULL,
      emoji VARCHAR(20) DEFAULT '',
      ordem INT NOT NULL DEFAULT 0,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");
  try_exec_tarefas($pdo, "ALTER TABLE tarefas_colunas ADD COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  try_exec_tarefas($pdo, "ALTER TABLE tarefas_colunas MODIFY COLUMN id VARCHAR(80) NOT NULL");
  try_exec_tarefas($pdo, "ALTER TABLE tarefas_colunas MODIFY COLUMN emoji VARCHAR(20) DEFAULT ''");
  try_exec_tarefas($pdo, "
    CREATE TABLE IF NOT EXISTS tarefas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL,
      descricao TEXT NULL,
      cliente VARCHAR(160) DEFAULT '',
      responsavel VARCHAR(120) DEFAULT '',
      delegado_por VARCHAR(120) DEFAULT '',
      status VARCHAR(30) NOT NULL DEFAULT 'pendente',
      prioridade INT NOT NULL DEFAULT 4,
      prazo DATE NULL,
      tempo_total INT NOT NULL DEFAULT 0,
      uid_local VARCHAR(160) NULL,
      coluna VARCHAR(80) DEFAULT 'col_1',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_uid_local (uid_local),
      INDEX idx_coluna (coluna)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");
  try_exec_tarefas($pdo, "ALTER TABLE tarefas ADD COLUMN cliente VARCHAR(160) DEFAULT ''");
  try_exec_tarefas($pdo, "ALTER TABLE tarefas ADD COLUMN prazo DATE NULL");
  try_exec_tarefas($pdo, "ALTER TABLE tarefas ADD COLUMN atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
  try_exec_tarefas($pdo, "ALTER TABLE tarefas ADD COLUMN uid_local VARCHAR(160) NULL");
  try_exec_tarefas($pdo, "ALTER TABLE tarefas ADD COLUMN coluna VARCHAR(80) DEFAULT 'col_1'");
  try_exec_tarefas($pdo, "ALTER TABLE tarefas MODIFY COLUMN coluna VARCHAR(80) DEFAULT 'col_1'");
  try_exec_tarefas($pdo, "ALTER TABLE tarefas ADD COLUMN tempo_total INT NOT NULL DEFAULT 0");
  try_exec_tarefas($pdo, "ALTER TABLE tarefas ADD COLUMN data_tarefa DATE NULL");
  try_exec_tarefas($pdo, "ALTER TABLE tarefas ADD COLUMN recorrencia VARCHAR(30) DEFAULT ''");
  try_exec_tarefas($pdo, "ALTER TABLE tarefas ADD COLUMN etiquetas_json LONGTEXT NULL");
  try_exec_tarefas($pdo, "ALTER TABLE tarefas ADD COLUMN subtarefas_json LONGTEXT NULL");
  try_exec_tarefas($pdo, "ALTER TABLE tarefas ADD COLUMN anexos_json LONGTEXT NULL");
  try_exec_tarefas($pdo, "ALTER TABLE tarefas ADD COLUMN comentarios_json LONGTEXT NULL");
  try_exec_tarefas($pdo, "ALTER TABLE tarefas ADD INDEX idx_uid_local (uid_local)");
  try_exec_tarefas($pdo, "ALTER TABLE tarefas ADD INDEX idx_coluna (coluna)");
  try_exec_tarefas($pdo, "ALTER TABLE tarefas ADD INDEX idx_status (status)");
  remapEnsureUpdatesTable($pdo);
}

ensure_tarefas_schema($pdo);
$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
  $where = [];
  $params = [];

  if (!empty($_GET["responsavel"])) { $where[] = "responsavel = ?"; $params[] = $_GET["responsavel"]; }
  if (!empty($_GET["delegado_por"])) { $where[] = "delegado_por = ?"; $params[] = $_GET["delegado_por"]; }
  if (!empty($_GET["status"])) { $where[] = "status = ?"; $params[] = $_GET["status"]; }

  $sql = "SELECT * FROM tarefas";
  if ($where) $sql .= " WHERE " . implode(" AND ", $where);
  $sql .= " ORDER BY criado_em DESC, id DESC";

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);

  responseJson(["success" => true, "data" => $stmt->fetchAll()]);
}

if ($method === "POST") {
  $data = getJsonInput();
  requiredFields($data, ["titulo"]);

  $titulo = trim($data["titulo"]);
  $descricao = trim($data["descricao"] ?? "");
  $cliente = trim($data["cliente"] ?? "");
  $responsavel = trim($data["responsavel"] ?? "");
  $delegadoPor = trim($data["delegado_por"] ?? "");
  $status = trim($data["status"] ?? "pendente");
  if (in_array(strtolower($status), ["finalizado", "concluida"], true)) $status = "concluido";
  $prioridade = (int)($data["prioridade"] ?? 4);
  $prazo = !empty($data["prazo"]) ? $data["prazo"] : null;
  $tempoTotal = (int)($data["tempo_total"] ?? 0);
  $uidLocal = trim((string)($data["uid_local"] ?? $data["localUid"] ?? ""));
  $coluna = trim((string)($data["coluna"] ?? $data["colId"] ?? "col_1"));
  if ($coluna === "") $coluna = "col_1";

  if ($uidLocal !== "") {
    $stmt = $pdo->prepare("SELECT id FROM tarefas WHERE uid_local = ? LIMIT 1");
    $stmt->execute([$uidLocal]);
    $existingUid = $stmt->fetch();
    if ($existingUid) {
      responseJson(["success" => true, "message" => "Tarefa já existe para este UID.", "id" => (int)$existingUid["id"], "duplicada" => true]);
    }
  }

  $dup = $pdo->prepare("
    SELECT id FROM tarefas
    WHERE titulo = ?
      AND descricao = ?
      AND cliente = ?
      AND responsavel = ?
      AND delegado_por = ?
      AND COALESCE(prazo, '') = COALESCE(?, '')
      AND (status NOT IN ('finalizado', 'concluido', 'concluida') OR status IS NULL)
    LIMIT 1
  ");
  $dup->execute([$titulo, $descricao, $cliente, $responsavel, $delegadoPor, $prazo]);
  $existing = $dup->fetch();

  if ($existing) {
    responseJson(["success" => true, "message" => "Tarefa igual já existe. Nenhuma nova tarefa foi criada.", "id" => (int)$existing["id"], "duplicada" => true]);
  }

  $stmt = $pdo->prepare("
    INSERT INTO tarefas
    (titulo, descricao, cliente, responsavel, delegado_por, status, prioridade, prazo, tempo_total, uid_local, coluna)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ");

  $stmt->execute([$titulo, $descricao, $cliente, $responsavel, $delegadoPor, $status, $prioridade, $prazo, $tempoTotal, $uidLocal ?: null, $coluna]);

  remapBumpUpdate($pdo, "tarefas");
  responseJson(["success" => true, "message" => "Tarefa criada.", "id" => (int)$pdo->lastInsertId()]);
}

if ($method === "PUT") {
  $data = getJsonInput();
  requiredFields($data, ["id"]);

  $id = (int)$data["id"];
  $allowed = ["titulo", "descricao", "cliente", "responsavel", "delegado_por", "status", "prioridade", "prazo", "tempo_total", "uid_local", "coluna", "data_tarefa", "recorrencia", "etiquetas_json", "subtarefas_json", "anexos_json", "comentarios_json"];
  $fields = [];
  $params = [];

  foreach ($allowed as $field) {
    if (array_key_exists($field, $data)) {
      $val = $data[$field];
      if ($field === "status" && in_array(strtolower((string)$val), ["finalizado", "concluida"], true)) $val = "concluido";
      $fields[] = "$field = ?";
      $params[] = $val;
    }
  }

  if (!$fields) responseJson(["success" => false, "message" => "Nada para atualizar."], 400);

  $params[] = $id;
  $stmt = $pdo->prepare("UPDATE tarefas SET " . implode(", ", $fields) . " WHERE id = ?");
  $stmt->execute($params);

  remapBumpUpdate($pdo, "tarefas");
  responseJson(["success" => true, "message" => "Tarefa atualizada."]);
}

if ($method === "DELETE") {
  $id = (int)($_GET["id"] ?? 0);
  if (!$id) responseJson(["success" => false, "message" => "ID obrigatório."], 400);

  $stmt = $pdo->prepare("UPDATE tarefas SET status = 'concluido' WHERE id = ?");
  $stmt->execute([$id]);

  remapBumpUpdate($pdo, "tarefas");
  responseJson(["success" => true, "message" => "Tarefa marcada como concluída."]);
}

responseJson(["success" => false, "message" => "Método não permitido."], 405);
?>
