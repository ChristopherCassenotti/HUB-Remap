<?php
require_once "config.php";

function try_exec($pdo, $sql) {
  try { $pdo->exec($sql); } catch (Exception $e) {}
}

function ensure_schema($pdo) {
  try_exec($pdo, "
    CREATE TABLE IF NOT EXISTS app_state (
      key_name VARCHAR(120) NOT NULL PRIMARY KEY,
      value_json LONGTEXT NULL,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");

  try_exec($pdo, "
    CREATE TABLE IF NOT EXISTS sistema_updates (
      id INT PRIMARY KEY DEFAULT 1,
      tarefas_updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      supervisao_updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");
  try_exec($pdo, "INSERT IGNORE INTO sistema_updates (id) VALUES (1)");

  try_exec($pdo, "
    CREATE TABLE IF NOT EXISTS tarefas_colunas (
      id VARCHAR(80) NOT NULL PRIMARY KEY,
      nome VARCHAR(120) NOT NULL,
      emoji VARCHAR(20) DEFAULT '',
      ordem INT NOT NULL DEFAULT 0,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");
  try_exec($pdo, "ALTER TABLE tarefas_colunas ADD COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  try_exec($pdo, "ALTER TABLE tarefas_colunas MODIFY COLUMN id VARCHAR(80) NOT NULL");
  try_exec($pdo, "ALTER TABLE tarefas_colunas MODIFY COLUMN emoji VARCHAR(20) DEFAULT ''");

  try_exec($pdo, "
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

  try_exec($pdo, "
    CREATE TABLE IF NOT EXISTS metas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      colaborador VARCHAR(120) NOT NULL,
      mes VARCHAR(7) NOT NULL,
      meta_7 INT NOT NULL DEFAULT 0,
      meta_14 INT NOT NULL DEFAULT 0,
      meta_21 INT NOT NULL DEFAULT 0,
      criado_em TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_colaborador_mes (colaborador, mes)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");

  try_exec($pdo, "ALTER TABLE usuarios ADD COLUMN salario DECIMAL(10,2) DEFAULT 0");
  try_exec($pdo, "ALTER TABLE usuarios ADD COLUMN horas_mensais INT DEFAULT 176");

  try_exec($pdo, "CREATE TABLE IF NOT EXISTS clientes (id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(160) NOT NULL, valor DECIMAL(10,2) DEFAULT 0, horas_mensais DECIMAL(8,2) DEFAULT 0, observacoes TEXT NULL, plano VARCHAR(120) DEFAULT '', criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
  try_exec($pdo, "ALTER TABLE clientes ADD COLUMN horas_mensais DECIMAL(8,2) DEFAULT 0");
  try_exec($pdo, "ALTER TABLE clientes ADD COLUMN observacoes TEXT NULL");
  try_exec($pdo, "ALTER TABLE clientes ADD COLUMN plano VARCHAR(120) DEFAULT ''");

  try_exec($pdo, "ALTER TABLE tarefas ADD COLUMN cliente VARCHAR(160) DEFAULT ''");
  try_exec($pdo, "ALTER TABLE tarefas ADD COLUMN prazo DATE NULL");
  try_exec($pdo, "ALTER TABLE tarefas ADD COLUMN atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
  try_exec($pdo, "ALTER TABLE tarefas ADD COLUMN uid_local VARCHAR(160) NULL");
  try_exec($pdo, "ALTER TABLE tarefas ADD COLUMN coluna VARCHAR(80) DEFAULT 'col_1'");
  try_exec($pdo, "ALTER TABLE tarefas MODIFY COLUMN coluna VARCHAR(80) DEFAULT 'col_1'");
  try_exec($pdo, "ALTER TABLE tarefas ADD COLUMN tempo_total INT NOT NULL DEFAULT 0");
  try_exec($pdo, "ALTER TABLE tarefas ADD COLUMN data_tarefa DATE NULL");
  try_exec($pdo, "ALTER TABLE tarefas ADD COLUMN recorrencia VARCHAR(30) DEFAULT ''");
  try_exec($pdo, "ALTER TABLE tarefas ADD COLUMN etiquetas_json LONGTEXT NULL");
  try_exec($pdo, "ALTER TABLE tarefas ADD COLUMN subtarefas_json LONGTEXT NULL");
  try_exec($pdo, "ALTER TABLE tarefas ADD COLUMN anexos_json LONGTEXT NULL");
  try_exec($pdo, "ALTER TABLE tarefas ADD COLUMN comentarios_json LONGTEXT NULL");
  try_exec($pdo, "ALTER TABLE tarefas ADD INDEX idx_uid_local (uid_local)");
  try_exec($pdo, "ALTER TABLE tarefas ADD INDEX idx_coluna (coluna)");
  try_exec($pdo, "ALTER TABLE tarefas ADD INDEX idx_status (status)");

  try_exec($pdo, "
    CREATE TABLE IF NOT EXISTS descontos_pontos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      colaborador VARCHAR(120) NOT NULL,
      motivo VARCHAR(255) NOT NULL,
      pontos INT NOT NULL DEFAULT 0,
      data_ref DATE NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_colaborador (colaborador),
      INDEX idx_data_ref (data_ref)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");

  try_exec($pdo, "
    CREATE TABLE IF NOT EXISTS pontos_tarefas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      colaborador VARCHAR(120) NOT NULL,
      cliente VARCHAR(160) DEFAULT '',
      tarefa VARCHAR(255) NOT NULL,
      pontos INT NOT NULL DEFAULT 0,
      data_ref DATE NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_colaborador (colaborador),
      INDEX idx_data_ref (data_ref)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");
}

function bump_update($pdo, $type) {
  if ($type === "tarefas") {
    $pdo->exec("UPDATE sistema_updates SET tarefas_updated_at = NOW() WHERE id = 1");
  }
  if ($type === "supervisao") {
    $pdo->exec("UPDATE sistema_updates SET supervisao_updated_at = NOW() WHERE id = 1");
  }
}

function get_state($pdo, $key, $fallback = null) {
  $stmt = $pdo->prepare("SELECT value_json FROM app_state WHERE key_name = ? LIMIT 1");
  $stmt->execute([$key]);
  $row = $stmt->fetch();
  if ($row && $row["value_json"] !== null && $row["value_json"] !== "") return $row["value_json"];
  return $fallback;
}

function remapCanPersistAppState($key) {
  $key = (string)$key;
  return (strpos($key, "tt_painel_") === 0)
    || in_array($key, [
      "tt_supervisors_v1",
      "tt_entries_v2",
      "tt_taskpoints_v1",
      "tt_tarefas_v1"
    ], true);
}


function remap_decode_json_array($value) {
  if ($value === null || $value === '') return [];
  $arr = json_decode($value, true);
  return is_array($arr) ? $arr : [];
}

function remap_encode_json_array($value) {
  return json_encode(is_array($value) ? array_values($value) : [], JSON_UNESCAPED_UNICODE);
}

function set_state($pdo, $key, $value) {
  if (!remapCanPersistAppState($key)) return;

  $stmt = $pdo->prepare("
    INSERT INTO app_state (key_name, value_json)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE value_json = VALUES(value_json)
  ");
  $stmt->execute([$key, $value]);
}

function collabs($pdo) {
  $stmt = $pdo->query("SELECT id, nome, email, cargo, salario, horas_mensais FROM usuarios ORDER BY nome ASC");
  $out = [];
  foreach ($stmt->fetchAll() as $r) {
    $out[] = [
      "id" => "u" . str_pad((string)$r["id"], 3, "0", STR_PAD_LEFT),
      "dbId" => (int)$r["id"],
      "name" => $r["nome"],
      "email" => $r["email"],
      "role" => $r["cargo"] ?: "Colaborador",
      "salary" => (string)(float)($r["salario"] ?? 0),
      "monthHours" => (string)(int)($r["horas_mensais"] ?? 176)
    ];
  }
  return $out;
}

function clients($pdo) {
  try_exec($pdo, "ALTER TABLE clientes ADD COLUMN horas_mensais DECIMAL(8,2) DEFAULT 0");
  try_exec($pdo, "ALTER TABLE clientes ADD COLUMN observacoes TEXT NULL");
  try_exec($pdo, "ALTER TABLE clientes ADD COLUMN plano VARCHAR(120) DEFAULT ''");
  $stmt = $pdo->query("SELECT id, nome, valor, horas_mensais, observacoes FROM clientes ORDER BY nome ASC");
  $out = [];
  foreach ($stmt->fetchAll() as $r) {
    $out[] = [
      "id" => "cl" . str_pad((string)$r["id"], 3, "0", STR_PAD_LEFT),
      "dbId" => (int)$r["id"],
      "name" => $r["nome"],
      "value" => (string)(float)($r["valor"] ?? 0),
      "hours" => (string)(float)($r["horas_mensais"] ?? 0),
      "notes" => $r["observacoes"] ?? ""
    ];
  }
  return $out;
}

function metas($pdo) {
  $stmt = $pdo->query("SELECT colaborador, mes, meta_7, meta_14, meta_21 FROM metas ORDER BY colaborador ASC, mes DESC");
  $out = [];
  foreach ($stmt->fetchAll() as $r) {
    if (!isset($out[$r["colaborador"]])) $out[$r["colaborador"]] = [];
    $out[$r["colaborador"]][$r["mes"]] = [
      "m1" => (int)$r["meta_7"],
      "m2" => (int)$r["meta_14"],
      "m3" => (int)$r["meta_21"]
    ];
  }
  return $out;
}

function descontos($pdo) {
  $stmt = $pdo->query("SELECT id, colaborador, motivo, pontos, data_ref FROM descontos_pontos ORDER BY data_ref DESC, id DESC");
  $out = [];
  foreach ($stmt->fetchAll() as $r) {
    $out[] = [
      "id" => "dc" . $r["id"],
      "dbId" => (int)$r["id"],
      "collab" => $r["colaborador"],
      "colaborador" => $r["colaborador"],
      "name" => $r["colaborador"],
      "reason" => $r["motivo"],
      "motivo" => $r["motivo"],
      "points" => (int)$r["pontos"],
      "pontos" => (int)$r["pontos"],
      "date" => $r["data_ref"],
      "data" => $r["data_ref"]
    ];
  }
  return $out;
}


function sync_metas_config($pdo, $json) {
  $obj = json_decode($json, true);
  if (!is_array($obj)) return;
  try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("INSERT INTO metas (colaborador, mes, meta_7, meta_14, meta_21) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE meta_7 = VALUES(meta_7), meta_14 = VALUES(meta_14), meta_21 = VALUES(meta_21)");
    foreach ($obj as $colab => $months) {
      $colab = trim((string)$colab);
      if ($colab === '' || !is_array($months)) continue;
      foreach ($months as $mes => $m) {
        $mes = trim((string)$mes);
        if ($mes === '' || !is_array($m)) continue;
        $stmt->execute([$colab, $mes, (int)($m['m1'] ?? 0), (int)($m['m2'] ?? 0), (int)($m['m3'] ?? 0)]);
      }
    }
    $pdo->commit();
  } catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    throw $e;
  }
}

function sync_descontos_config($pdo, $json) {
  $arr = json_decode($json, true);
  if (!is_array($arr)) return;
  try {
    $pdo->beginTransaction();
    $pdo->exec("DELETE FROM descontos_pontos");
    $stmt = $pdo->prepare("INSERT INTO descontos_pontos (colaborador, motivo, pontos, data_ref) VALUES (?, ?, ?, ?)");
    foreach ($arr as $d) {
      if (!is_array($d)) continue;
      $collab = trim($d['collab'] ?? $d['name'] ?? $d['colaborador'] ?? '');
      $motivo = trim($d['motivo'] ?? $d['reason'] ?? '');
      if ($collab === '' || $motivo === '') continue;
      $date = $d['date'] ?? $d['data'] ?? date('Y-m-d');
      $ts = strtotime($date);
      $dataRef = $ts ? date('Y-m-d', $ts) : date('Y-m-d');
      $stmt->execute([$collab, $motivo, (int)($d['points'] ?? $d['pontos'] ?? 0), $dataRef]);
    }
    $pdo->commit();
  } catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    throw $e;
  }
}

function pontos($pdo) {
  $stmt = $pdo->query("SELECT id, colaborador, cliente, tarefa, pontos, data_ref FROM pontos_tarefas ORDER BY data_ref DESC, id DESC");
  $out = [];
  foreach ($stmt->fetchAll() as $r) {
    $out[] = [
      "id" => "pt" . $r["id"],
      "dbId" => (int)$r["id"],
      "collab" => $r["colaborador"],
      "colaborador" => $r["colaborador"],
      "client" => $r["cliente"],
      "cliente" => $r["cliente"],
      "task" => $r["tarefa"],
      "tarefa" => $r["tarefa"],
      "points" => (int)$r["pontos"],
      "pontos" => (int)$r["pontos"],
      "date" => $r["data_ref"],
      "data" => $r["data_ref"]
    ];
  }
  return $out;
}

function default_tarefa_cols() {
  return [
    ["id" => "col_1", "name" => "Sempre precisa fazer", "emoji" => "🔁"],
    ["id" => "col_2", "name" => "Social Media", "emoji" => "💬"],
    ["id" => "col_3", "name" => "Design", "emoji" => "🎨"],
    ["id" => "col_4", "name" => "Vídeos", "emoji" => "🎬"]
  ];
}

function build_tarefa_cols($pdo) {
  $stmt = $pdo->query("SELECT id, nome, emoji FROM tarefas_colunas ORDER BY ordem ASC, id ASC");
  $cols = [];
  foreach ($stmt->fetchAll() as $r) {
    $cols[] = [
      "id" => $r["id"],
      "name" => $r["nome"],
      "emoji" => $r["emoji"] ?: ""
    ];
  }
  return count($cols) ? $cols : default_tarefa_cols();
}

function task_db_id($t) {
  $dbId = (int)($t["dbId"] ?? 0);
  if (!$dbId && !empty($t["id"]) && preg_match('/^dbtask_(\d+)$/', (string)$t["id"], $m)) {
    $dbId = (int)$m[1];
  }
  return $dbId;
}

function task_is_done($t) {
  $status = strtolower(trim((string)($t["status"] ?? $t["estado"] ?? "")));
  return !empty($t["done"]) || in_array($status, ["finalizado", "concluido", "concluida"], true);
}

function remap_task_key($t) {
  $uid = trim((string)($t["localUid"] ?? $t["uid_local"] ?? ""));
  if ($uid === "" && !empty($t["id"]) && !preg_match('/^dbtask_\d+$/', (string)$t["id"])) {
    $uid = (string)$t["id"];
  }
  if ($uid !== "") return "uid:" . $uid;

  $dbId = task_db_id($t);
  if ($dbId > 0) return "db:" . $dbId;

  return "tmp:" . md5(json_encode($t));
}

function dedupe_tarefas_data($data) {
  if (!is_array($data)) return ["cols" => default_tarefa_cols(), "tasks" => []];
  if (!isset($data["cols"]) || !is_array($data["cols"]) || !count($data["cols"])) $data["cols"] = default_tarefa_cols();
  if (!isset($data["tasks"]) || !is_array($data["tasks"])) $data["tasks"] = [];

  $deduped = [];
  foreach ($data["tasks"] as $task) {
    if (!is_array($task)) continue;
    $key = remap_task_key($task);
    if (!isset($deduped[$key]) || (!empty($task["dbId"]) && empty($deduped[$key]["dbId"]))) {
      $deduped[$key] = $task;
    }
  }
  $data["tasks"] = array_values($deduped);
  return $data;
}

function build_tarefas_from_table($pdo) {
  $stmt = $pdo->query("SELECT * FROM tarefas WHERE status NOT IN ('finalizado', 'concluido', 'concluida') OR status IS NULL ORDER BY criado_em DESC, id DESC");
  $tasks = [];
  foreach ($stmt->fetchAll() as $r) {
    $tasks[] = [
      "id" => "dbtask_" . $r["id"],
      "dbId" => (int)$r["id"],
      "colId" => $r["coluna"] ?: "col_1",
      "title" => $r["titulo"] ?: "Sem título",
      "desc" => $r["descricao"] ?: "",
      "client" => $r["cliente"] ?? "",
      "assignee" => $r["responsavel"] ?: "",
      "date" => $r["data_tarefa"] ?? ($r["prazo"] ?? ""),
      "deadline" => $r["prazo"] ?? "",
      "priority" => (int)($r["prioridade"] ?: 4),
      "recurrence" => $r["recorrencia"] ?? "",
      "labels" => remap_decode_json_array($r["etiquetas_json"] ?? null),
      "subtasks" => remap_decode_json_array($r["subtarefas_json"] ?? null),
      "attachments" => remap_decode_json_array($r["anexos_json"] ?? null),
      "comments" => remap_decode_json_array($r["comentarios_json"] ?? null),
      "done" => false,
      "status" => $r["status"] ?: "pendente",
      "createdBy" => $r["delegado_por"] ?: "",
      "createdAt" => $r["criado_em"] ?? date("c"),
      "localUid" => $r["uid_local"] ?? "",
      "uid_local" => $r["uid_local"] ?? ""
    ];
  }
  return ["cols" => build_tarefa_cols($pdo), "tasks" => $tasks];
}

function merge_task_extras($savedTask, $dbTask) {
  if (!is_array($savedTask)) return $dbTask;
  $merged = array_merge($savedTask, $dbTask);
  foreach (["labels", "subtasks", "attachments", "comments"] as $field) {
    if (isset($savedTask[$field]) && is_array($savedTask[$field]) && count($savedTask[$field])) {
      $merged[$field] = $savedTask[$field];
    }
  }
  return $merged;
}

function tarefas_payload($pdo) {
  $tableData = build_tarefas_from_table($pdo);
  $tableCols = $tableData["cols"] ?? default_tarefa_cols();
  $activeDbIds = [];
  $savedByKey = [];
  $merged = [];

  $saved = get_state($pdo, "tt_tarefas_v1", null);
  $savedData = $saved ? json_decode($saved, true) : null;
  if (is_array($savedData) && isset($savedData["tasks"]) && is_array($savedData["tasks"])) {
    foreach ($savedData["tasks"] as $task) {
      if (!is_array($task)) continue;
      $savedByKey[remap_task_key($task)] = $task;
    }
  }

  foreach ($tableData["tasks"] as $dbTask) {
    $activeDbIds[(int)$dbTask["dbId"]] = true;
    $key = remap_task_key($dbTask);
    $merged[$key] = merge_task_extras($savedByKey[$key] ?? null, $dbTask);
  }

  // Mantém apenas tarefas locais ainda sem id de banco, evitando ressuscitar tarefas antigas concluídas.
  foreach ($savedByKey as $key => $savedTask) {
    $dbId = task_db_id($savedTask);
    if ($dbId > 0) continue;
    if (task_is_done($savedTask)) continue;
    if (!isset($merged[$key])) $merged[$key] = $savedTask;
  }

  return dedupe_tarefas_data(["cols" => $tableCols, "tasks" => array_values($merged)]);
}

function upsert_cols($pdo, $cols) {
  if (!is_array($cols)) return;
  $stmt = $pdo->prepare("
    INSERT INTO tarefas_colunas (id, nome, emoji, ordem)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE nome = VALUES(nome), emoji = VALUES(emoji), ordem = VALUES(ordem)
  ");
  $ordem = 0;
  foreach ($cols as $c) {
    if (!is_array($c)) continue;
    $id = trim((string)($c["id"] ?? ""));
    $nome = trim((string)($c["name"] ?? $c["nome"] ?? ""));
    if ($id === "" || $nome === "") continue;
    $stmt->execute([$id, $nome, $c["emoji"] ?? "", $ordem++]);
  }
}

function sync_tarefas_table($pdo, $json) {
  $data = json_decode($json, true);
  if (!is_array($data) || !isset($data["tasks"]) || !is_array($data["tasks"])) return $json;

  $cols = (isset($data["cols"]) && is_array($data["cols"]) && count($data["cols"])) ? $data["cols"] : default_tarefa_cols();

  $normalizedIncoming = [];

  try {
    $pdo->beginTransaction();
    upsert_cols($pdo, $cols);

    $update = $pdo->prepare("
      UPDATE tarefas SET
        titulo = ?, descricao = ?, cliente = ?, responsavel = ?, delegado_por = ?,
        status = ?, prioridade = ?, prazo = ?, tempo_total = ?, uid_local = COALESCE(uid_local, ?), coluna = ?,
        recorrencia = ?, etiquetas_json = ?, subtarefas_json = ?, anexos_json = ?, comentarios_json = ?, data_tarefa = ?
      WHERE id = ?
    ");

    $insert = $pdo->prepare("
      INSERT INTO tarefas
      (titulo, descricao, cliente, responsavel, delegado_por, status, prioridade, prazo, tempo_total, criado_em, uid_local, coluna, recorrencia, etiquetas_json, subtarefas_json, anexos_json, comentarios_json, data_tarefa)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $findByUid = $pdo->prepare("SELECT id FROM tarefas WHERE uid_local = ? LIMIT 1");
    $checkById = $pdo->prepare("SELECT id FROM tarefas WHERE id = ? LIMIT 1");
    $findDuplicate = $pdo->prepare("
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

    foreach ($data["tasks"] as $t) {
      if (!is_array($t)) continue;
      $title = trim($t["title"] ?? $t["titulo"] ?? "");
      if ($title === "") continue;

      $dateTask = $t["date"] ?? $t["data_tarefa"] ?? null;
      if ($dateTask === "") $dateTask = null;
      $date = $t["deadline"] ?? $t["prazo"] ?? $dateTask;
      if ($date === "") $date = null;

      $createdAt = $t["createdAt"] ?? null;
      if (!$createdAt) {
        $createdAt = date("Y-m-d H:i:s");
      } else {
        $ts = strtotime($createdAt);
        $createdAt = $ts ? date("Y-m-d H:i:s", $ts) : date("Y-m-d H:i:s");
      }

      $dbId = task_db_id($t);
      $uidLocal = trim((string)($t["localUid"] ?? $t["uid_local"] ?? ""));
      if ($uidLocal === "" && !empty($t["id"]) && !preg_match('/^dbtask_\d+$/', (string)$t["id"])) {
        $uidLocal = (string)$t["id"];
      }

      if (!$dbId && $uidLocal !== "") {
        $findByUid->execute([$uidLocal]);
        $found = $findByUid->fetch();
        if ($found) $dbId = (int)$found["id"];
      }

      $incomingStatus = strtolower(trim((string)($t["status"] ?? $t["estado"] ?? "")));
      $status = task_is_done($t) ? "concluido" : ($incomingStatus ?: "pendente");
      if (in_array($status, ["finalizado", "concluida"], true)) $status = "concluido";

      $colId = trim((string)($t["colId"] ?? $t["coluna"] ?? "col_1"));
      if ($colId === "") $colId = "col_1";

      $recurrence = trim((string)($t["recurrence"] ?? $t["recorrencia"] ?? ""));
      $labelsJson = remap_encode_json_array($t["labels"] ?? []);
      $subtasksJson = remap_encode_json_array($t["subtasks"] ?? []);
      $attachmentsJson = remap_encode_json_array($t["attachments"] ?? []);
      $commentsJson = remap_encode_json_array($t["comments"] ?? []);

      $params = [
        $title,
        trim($t["desc"] ?? $t["descricao"] ?? ""),
        trim($t["client"] ?? $t["cliente"] ?? ""),
        trim($t["assignee"] ?? $t["responsavel"] ?? ""),
        trim($t["createdBy"] ?? $t["delegado_por"] ?? ""),
        $status,
        (int)($t["priority"] ?? $t["prioridade"] ?? 4),
        $date,
        (int)($t["tempo_total"] ?? 0)
      ];

      if ($dbId > 0) {
        $checkById->execute([$dbId]);
        if ($checkById->fetch()) {
          $update->execute(array_merge($params, [$uidLocal ?: null, $colId, $recurrence, $labelsJson, $subtasksJson, $attachmentsJson, $commentsJson, $dateTask, $dbId]));
        } else {
          $findDuplicate->execute([$params[0], $params[1], $params[2], $params[3], $params[4], $params[7]]);
          $duplicate = $findDuplicate->fetch();
          if ($duplicate) {
            $dbId = (int)$duplicate["id"];
            $update->execute(array_merge($params, [$uidLocal ?: null, $colId, $recurrence, $labelsJson, $subtasksJson, $attachmentsJson, $commentsJson, $dateTask, $dbId]));
          } else {
            $insert->execute(array_merge($params, [$createdAt, $uidLocal ?: null, $colId, $recurrence, $labelsJson, $subtasksJson, $attachmentsJson, $commentsJson, $dateTask]));
            $dbId = (int)$pdo->lastInsertId();
          }
        }
      } else {
        $findDuplicate->execute([$params[0], $params[1], $params[2], $params[3], $params[4], $params[7]]);
        $duplicate = $findDuplicate->fetch();
        if ($duplicate) {
          $dbId = (int)$duplicate["id"];
          $update->execute(array_merge($params, [$uidLocal ?: null, $colId, $recurrence, $labelsJson, $subtasksJson, $attachmentsJson, $commentsJson, $dateTask, $dbId]));
        } else {
          $insert->execute(array_merge($params, [$createdAt, $uidLocal ?: null, $colId, $recurrence, $labelsJson, $subtasksJson, $attachmentsJson, $commentsJson, $dateTask]));
          $dbId = (int)$pdo->lastInsertId();
        }
      }

      $t["dbId"] = $dbId;
      $t["id"] = "dbtask_" . $dbId;
      $t["colId"] = $colId;
      $t["status"] = $status;
      $t["done"] = in_array($status, ["finalizado", "concluido", "concluida"], true);
      if ($uidLocal !== "") {
        $t["localUid"] = $uidLocal;
        $t["uid_local"] = $uidLocal;
      }
      $normalizedIncoming[] = $t;
    }

    $pdo->commit();
  } catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    responseJson(["success" => false, "message" => "Erro ao sincronizar tarefas.", "error" => $e->getMessage()], 500);
  }

  $merged = [];

  $saved = get_state($pdo, "tt_tarefas_v1", null);
  $savedData = $saved ? json_decode($saved, true) : null;
  if (is_array($savedData) && isset($savedData["tasks"]) && is_array($savedData["tasks"])) {
    foreach ($savedData["tasks"] as $oldTask) {
      if (!is_array($oldTask)) continue;
      if (task_is_done($oldTask)) continue;
      $merged[remap_task_key($oldTask)] = $oldTask;
    }
  }

  foreach ($normalizedIncoming as $newTask) {
    $merged[remap_task_key($newTask)] = $newTask;
  }

  $fromDb = build_tarefas_from_table($pdo);
  foreach ($fromDb["tasks"] as $dbTask) {
    $key = remap_task_key($dbTask);
    $merged[$key] = merge_task_extras($merged[$key] ?? null, $dbTask);
  }

  return json_encode(dedupe_tarefas_data(["cols" => build_tarefa_cols($pdo), "tasks" => array_values($merged)]), JSON_UNESCAPED_UNICODE);
}


function remap_sync_table_exists($pdo, $table) {
  try {
    $stmt = $pdo->prepare("SHOW TABLES LIKE ?");
    $stmt->execute([$table]);
    return (bool)$stmt->fetchColumn();
  } catch (Exception $e) { return false; }
}

function remap_sync_column_exists($pdo, $table, $column) {
  try {
    $stmt = $pdo->prepare("SHOW COLUMNS FROM `$table` LIKE ?");
    $stmt->execute([$column]);
    return (bool)$stmt->fetchColumn();
  } catch (Exception $e) { return false; }
}

function remap_sync_lower($value) {
  $value = trim((string)$value);
  if (function_exists('mb_strtolower')) return mb_strtolower($value, 'UTF-8');
  return strtolower($value);
}

function remap_sync_user_lookup($pdo) {
  $lookup = ["exact" => [], "first" => []];
  try {
    if (!remap_sync_table_exists($pdo, "usuarios")) return $lookup;
    $stmt = $pdo->query("SELECT nome, cargo FROM usuarios ORDER BY nome ASC");
    foreach ($stmt->fetchAll() as $u) {
      $name = trim((string)($u["nome"] ?? ""));
      if ($name === "") continue;
      $role = trim((string)($u["cargo"] ?? ""));
      $lower = remap_sync_lower($name);
      $lookup["exact"][$lower] = ["name" => $name, "role" => $role];
      $first = remap_sync_lower(explode(" ", $name)[0] ?? "");
      if ($first !== "" && !isset($lookup["first"][$first])) $lookup["first"][$first] = ["name" => $name, "role" => $role];
    }
  } catch (Exception $e) {}
  return $lookup;
}

function remap_sync_resolve_user($rawName, $rawRole, $lookup) {
  $name = trim((string)$rawName);
  $role = trim((string)$rawRole);
  $lower = remap_sync_lower($name);
  if ($lower !== "" && isset($lookup["exact"][$lower])) return ["name" => $lookup["exact"][$lower]["name"], "role" => $lookup["exact"][$lower]["role"] ?: $role];
  $first = remap_sync_lower(explode(" ", $name)[0] ?? "");
  if ($first !== "" && isset($lookup["first"][$first])) return ["name" => $lookup["first"][$first]["name"], "role" => $lookup["first"][$first]["role"] ?: $role];
  return ["name" => $name, "role" => $role];
}

function remap_sync_date_br($value) {
  $ts = strtotime((string)$value);
  return $ts ? date("d/m/Y", $ts) : "";
}

function remap_sync_entries_from_timer($pdo) {
  if (!remap_sync_table_exists($pdo, "timer")) return [];

  $hasTaskLines = remap_sync_column_exists($pdo, "timer", "task_lines_json");
  $hasBasePoints = remap_sync_column_exists($pdo, "timer", "base_points");
  $hasPointMode = remap_sync_column_exists($pdo, "timer", "point_mode");
  $taskLinesSelect = $hasTaskLines ? "task_lines_json" : "NULL AS task_lines_json";
  $basePointsSelect = $hasBasePoints ? "base_points" : "pontos AS base_points";
  $pointModeSelect = $hasPointMode ? "point_mode" : "'fixed' AS point_mode";
  $lookup = remap_sync_user_lookup($pdo);

  try {
    $stmt = $pdo->query("\n      SELECT id, tarefa_id, uid_local, usuario, cliente, tarefa, descricao, categoria, cargo, pontos, $basePointsSelect, $pointModeSelect, $taskLinesSelect, inicio, fim, duracao, status\n      FROM timer\n      WHERE (status = 'finalizado' OR status IS NULL OR status = '')\n        AND inicio IS NOT NULL\n        AND fim IS NOT NULL\n      ORDER BY inicio DESC, id DESC\n      LIMIT 5000\n    ");
  } catch (Exception $e) { return []; }

  $entries = [];
  foreach ($stmt->fetchAll() as $r) {
    $user = remap_sync_resolve_user($r["usuario"] ?? "", $r["cargo"] ?? "", $lookup);
    $taskLines = [];
    if (!empty($r["task_lines_json"])) {
      $decoded = json_decode($r["task_lines_json"], true);
      if (is_array($decoded)) $taskLines = $decoded;
    }
    $entries[] = [
      "id" => $r["uid_local"] ?: ("timer_" . $r["id"]),
      "dbId" => (int)$r["id"],
      "timerId" => (int)$r["id"],
      "taskId" => $r["tarefa_id"] ? (int)$r["tarefa_id"] : null,
      "client" => $r["cliente"] ?? "",
      "task" => $r["tarefa"] ?? "",
      "taskDesc" => $r["descricao"] ?? "",
      "taskPoints" => (float)($r["pontos"] ?? 0),
      "baseTaskPoints" => (float)($r["base_points"] ?? $r["pontos"] ?? 0),
      "pointMode" => $r["point_mode"] ?? "fixed",
      "taskLines" => $taskLines,
      "category" => $r["categoria"] ?? "",
      "user" => $user["name"],
      "role" => $user["role"],
      "start" => date("c", strtotime($r["inicio"])),
      "end" => date("c", strtotime($r["fim"])),
      "date" => remap_sync_date_br($r["inicio"]),
      "durationSeconds" => max(0, (int)($r["duracao"] ?? 0)),
      "source" => (strpos((string)($r["uid_local"] ?? ""), "retro_") === 0) ? "retroativo" : "timer_db",
      "isRetroativo" => (strpos((string)($r["uid_local"] ?? ""), "retro_") === 0)
    ];
  }
  return $entries;
}

function remap_sync_merge_entries($savedEntries, $timerEntries) {
  $merged = [];
  foreach ([$savedEntries, $timerEntries] as $list) {
    if (!is_array($list)) continue;
    foreach ($list as $entry) {
      if (!is_array($entry)) continue;
      $id = trim((string)($entry["id"] ?? $entry["uid_local"] ?? ""));
      $dbId = trim((string)($entry["dbId"] ?? $entry["timerId"] ?? ""));
      $key = $id !== "" ? "id_" . $id : ($dbId !== "" ? "db_" . $dbId : "row_" . count($merged));
      $merged[$key] = $entry;
    }
  }
  return array_values($merged);
}

function payload($pdo) {
  $tp = json_decode(get_state($pdo, "tt_taskpoints_v1", "[]"), true);
  if (!is_array($tp)) $tp = [];

  $savedEntries = json_decode(get_state($pdo, "tt_entries_v2", "[]"), true);
  if (!is_array($savedEntries)) $savedEntries = [];
  $timerEntries = remap_sync_entries_from_timer($pdo);
  $entries = remap_sync_merge_entries($savedEntries, $timerEntries);

  return [
    "collabs" => collabs($pdo),
    "clients" => clients($pdo),
    "metas" => metas($pdo),
    "descontos" => descontos($pdo),
    "pontos" => pontos($pdo),
    "taskPoints" => $tp,
    "entries" => $entries,
    "tarefas" => tarefas_payload($pdo)
  ];
}

ensure_schema($pdo);

if ($_SERVER["REQUEST_METHOD"] === "GET") {
  responseJson(["success" => true, "data" => payload($pdo)]);
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $data = getJsonInput();
  $key = $data["key"] ?? "";
  $value = $data["value"] ?? null;

  if (!$key) {
    responseJson(["success" => false, "message" => "Chave ausente"], 400);
  }

  if ($value === null) {
    set_state($pdo, $key, null);
    if ($key === "tt_tarefas_v1") bump_update($pdo, "tarefas");
    else bump_update($pdo, "supervisao");
    responseJson(["success" => true, "data" => payload($pdo)]);
  }

  if ($key === "tt_tarefas_v1") {
    $normalizedValue = sync_tarefas_table($pdo, $value);
    set_state($pdo, $key, $normalizedValue ?: $value);
    bump_update($pdo, "tarefas");
    responseJson(["success" => true, "message" => "Tarefas sincronizadas no banco.", "data" => payload($pdo)]);
  }

  if ($key === "tt_metas_v2") {
    sync_metas_config($pdo, $value);
    bump_update($pdo, "supervisao");
    responseJson(["success" => true, "data" => payload($pdo)]);
  }

  if ($key === "tt_descontos_v1") {
    sync_descontos_config($pdo, $value);
    bump_update($pdo, "supervisao");
    responseJson(["success" => true, "data" => payload($pdo)]);
  }

  if (in_array($key, ["tt_entries_v2", "tt_taskpoints_v1"], true)) {
    set_state($pdo, $key, $value);
    bump_update($pdo, "supervisao");
    responseJson(["success" => true, "data" => payload($pdo)]);
  }

  set_state($pdo, $key, $value);
  responseJson(["success" => true, "data" => payload($pdo)]);
}

responseJson(["success" => false, "message" => "Método não permitido"], 405);
?>
