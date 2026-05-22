<?php
require_once "config.php";

function try_exec($pdo, $sql) { try { $pdo->exec($sql); } catch (Exception $e) {} }

function remapEnsureUpdatesTable($pdo) {
  try_exec($pdo, "
    CREATE TABLE IF NOT EXISTS sistema_updates (
      id INT PRIMARY KEY DEFAULT 1,
      tarefas_updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      supervisao_updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");
  try_exec($pdo, "INSERT IGNORE INTO sistema_updates (id) VALUES (1)");
}

function remapBumpUpdate($pdo, $type) {
  remapEnsureUpdatesTable($pdo);
  if ($type === 'tarefas') $pdo->exec("UPDATE sistema_updates SET tarefas_updated_at = NOW() WHERE id = 1");
  if ($type === 'supervisao') $pdo->exec("UPDATE sistema_updates SET supervisao_updated_at = NOW() WHERE id = 1");
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

  remapEnsureUpdatesTable($pdo);
}


function remap_decode_json_array($value) {
  if ($value === null || $value === '') return [];
  $arr = json_decode($value, true);
  return is_array($arr) ? $arr : [];
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
  return strpos($key, "tt_painel_") === 0
    || in_array($key, ["tt_supervisors_v1", "tt_entries_v2", "tt_taskpoints_v1", "tt_tarefas_v1"], true);
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

function first_email($name) {
  $first = explode(" ", trim($name))[0] ?? trim($name);
  $ascii = iconv("UTF-8", "ASCII//TRANSLIT", $first);
  $slug = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $ascii));
  if ($slug === "") $slug = "usuario";
  return $slug . "@remapdigital.com";
}

function build_collabs($pdo) {
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

function sync_collabs($pdo, $json) {
  $arr = json_decode($json, true);
  if (!is_array($arr)) return;
  foreach ($arr as $c) {
    $name = trim($c["name"] ?? "");
    if ($name === "") continue;
    $role = trim($c["role"] ?? "Colaborador");
    $salary = (float)($c["salary"] ?? 0);
    $hours = (int)($c["monthHours"] ?? 176);
    if ($hours <= 0) $hours = 176;
    $email = trim($c["email"] ?? "") ?: first_email($name);
    $dbId = isset($c["dbId"]) ? (int)$c["dbId"] : 0;
    if (!$dbId && isset($c["id"]) && preg_match('/^u0*([0-9]+)$/', (string)$c["id"], $m)) $dbId = (int)$m[1];

    if ($dbId) {
      $stmt = $pdo->prepare("UPDATE usuarios SET nome=?, email=?, cargo=?, salario=?, horas_mensais=? WHERE id=?");
      $stmt->execute([$name, $email, $role, $salary, $hours, $dbId]);
      if ($stmt->rowCount() > 0) continue;
    }

    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? OR nome = ? LIMIT 1");
    $stmt->execute([$email, $name]);
    $exists = $stmt->fetch();
    if ($exists) {
      $stmt = $pdo->prepare("UPDATE usuarios SET nome=?, email=?, cargo=?, salario=?, horas_mensais=? WHERE id=?");
      $stmt->execute([$name, $email, $role, $salary, $hours, $exists["id"]]);
    } else {
      $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha, cargo, salario, horas_mensais) VALUES (?, ?, '123456', ?, ?, ?)");
      $stmt->execute([$name, $email, $role, $salary, $hours]);
    }
  }
}

function build_clients($pdo) {
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

function sync_clients($pdo, $json) {
  $arr = json_decode($json, true);
  if (!is_array($arr)) return;

  try_exec($pdo, "ALTER TABLE clientes ADD COLUMN horas_mensais DECIMAL(8,2) DEFAULT 0");
  try_exec($pdo, "ALTER TABLE clientes ADD COLUMN observacoes TEXT NULL");
  try_exec($pdo, "ALTER TABLE clientes ADD COLUMN plano VARCHAR(120) DEFAULT ''");

  $keptIds = [];
  $pdo->beginTransaction();
  foreach ($arr as $c) {
    $name = trim($c["name"] ?? "");
    if ($name === "") continue;

    $value = (float)($c["value"] ?? 0);
    $hours = (float)($c["hours"] ?? $c["horas_mensais"] ?? 0);
    if ($hours < 0) $hours = 0;
    $notes = trim($c["notes"] ?? $c["observacoes"] ?? "");

    $dbId = isset($c["dbId"]) ? (int)$c["dbId"] : 0;
    if (!$dbId && isset($c["id"]) && preg_match('/^cl0*([0-9]+)$/', (string)$c["id"], $m)) $dbId = (int)$m[1];

    if ($dbId) {
      $stmt = $pdo->prepare("SELECT id FROM clientes WHERE id=? LIMIT 1");
      $stmt->execute([$dbId]);
      $existsById = $stmt->fetch();
      if ($existsById) {
        $stmt = $pdo->prepare("UPDATE clientes SET nome=?, valor=?, horas_mensais=?, observacoes=? WHERE id=?");
        $stmt->execute([$name, $value, $hours, $notes, $dbId]);
        $keptIds[] = $dbId;
        continue;
      }
    }

    $stmt = $pdo->prepare("SELECT id FROM clientes WHERE nome=? LIMIT 1");
    $stmt->execute([$name]);
    $ex = $stmt->fetch();

    if ($ex) {
      $stmt = $pdo->prepare("UPDATE clientes SET nome=?, valor=?, horas_mensais=?, observacoes=? WHERE id=?");
      $stmt->execute([$name, $value, $hours, $notes, $ex["id"]]);
      $keptIds[] = (int)$ex["id"];
    } else {
      $stmt = $pdo->prepare("INSERT INTO clientes (nome, valor, horas_mensais, observacoes) VALUES (?, ?, ?, ?)");
      $stmt->execute([$name, $value, $hours, $notes]);
      $keptIds[] = (int)$pdo->lastInsertId();
    }
  }

  if (count($keptIds) > 0) {
    $placeholders = implode(',', array_fill(0, count($keptIds), '?'));
    $stmt = $pdo->prepare("DELETE FROM clientes WHERE id NOT IN ($placeholders)");
    $stmt->execute($keptIds);
  }
  $pdo->commit();
}

function build_metas($pdo) {
  $stmt = $pdo->query("SELECT colaborador, mes, meta_7, meta_14, meta_21 FROM metas ORDER BY colaborador ASC, mes DESC");
  $out = [];
  foreach ($stmt->fetchAll() as $r) {
    if (!isset($out[$r["colaborador"]])) $out[$r["colaborador"]] = [];
    $out[$r["colaborador"]][$r["mes"]] = ["m1" => (int)$r["meta_7"], "m2" => (int)$r["meta_14"], "m3" => (int)$r["meta_21"]];
  }
  return $out;
}

function sync_metas($pdo, $json) {
  $obj = json_decode($json, true);
  if (!is_array($obj)) return;
  $pdo->beginTransaction();
  $pdo->exec("DELETE FROM metas");
  $stmt = $pdo->prepare("INSERT INTO metas (colaborador, mes, meta_7, meta_14, meta_21) VALUES (?, ?, ?, ?, ?)");
  foreach ($obj as $colab => $months) {
    if (!is_array($months)) continue;
    foreach ($months as $mes => $m) {
      if (!$mes) continue;
      $stmt->execute([$colab, $mes, (int)($m["m1"] ?? 0), (int)($m["m2"] ?? 0), (int)($m["m3"] ?? 0)]);
    }
  }
  $pdo->commit();
}

function build_pontos($pdo) {
  $stmt = $pdo->query("SELECT * FROM pontos_tarefas ORDER BY data_ref DESC, id DESC");
  $out = [];
  foreach ($stmt->fetchAll() as $r) {
    $out[] = [
      "id" => "pt" . $r["id"], "dbId" => (int)$r["id"],
      "collab" => $r["colaborador"], "name" => $r["colaborador"], "colaborador" => $r["colaborador"],
      "client" => $r["cliente"], "cliente" => $r["cliente"],
      "task" => $r["tarefa"], "tarefa" => $r["tarefa"],
      "points" => (int)$r["pontos"], "pontos" => (int)$r["pontos"],
      "date" => $r["data_ref"], "data" => $r["data_ref"]
    ];
  }
  return $out;
}

function build_descontos($pdo) {
  $stmt = $pdo->query("SELECT * FROM descontos_pontos ORDER BY data_ref DESC, id DESC");
  $out = [];
  foreach ($stmt->fetchAll() as $r) {
    $out[] = [
      "id" => "dc" . $r["id"], "dbId" => (int)$r["id"],
      "collab" => $r["colaborador"], "name" => $r["colaborador"], "colaborador" => $r["colaborador"],
      "reason" => $r["motivo"], "motivo" => $r["motivo"],
      "points" => (int)$r["pontos"], "pontos" => (int)$r["pontos"],
      "date" => $r["data_ref"], "data" => $r["data_ref"]
    ];
  }
  return $out;
}

function sync_descontos($pdo, $json) {
  $arr = json_decode($json, true);
  if (!is_array($arr)) return;
  $pdo->beginTransaction();
  $pdo->exec("DELETE FROM descontos_pontos");
  $stmt = $pdo->prepare("INSERT INTO descontos_pontos (colaborador, motivo, pontos, data_ref) VALUES (?, ?, ?, ?)");
  foreach ($arr as $d) {
    $collab = trim($d["collab"] ?? $d["name"] ?? $d["colaborador"] ?? "");
    $reason = trim($d["reason"] ?? $d["motivo"] ?? "");
    if ($collab === "" || $reason === "") continue;
    $date = $d["date"] ?? $d["data"] ?? date("Y-m-d");
    $stmt->execute([$collab, $reason, (int)($d["points"] ?? $d["pontos"] ?? 0), $date ?: date("Y-m-d")]);
  }
  $pdo->commit();
}


function remap_table_exists_full($pdo, $table) {
  try {
    $stmt = $pdo->prepare("SHOW TABLES LIKE ?");
    $stmt->execute([$table]);
    return (bool)$stmt->fetch();
  } catch (Exception $e) { return false; }
}

function remap_column_exists_full($pdo, $table, $column) {
  try {
    $stmt = $pdo->prepare("SHOW COLUMNS FROM `$table` LIKE ?");
    $stmt->execute([$column]);
    return (bool)$stmt->fetch();
  } catch (Exception $e) { return false; }
}


function remap_lower_text_full($value) {
  $value = (string)$value;
  return function_exists("mb_strtolower") ? mb_strtolower($value, "UTF-8") : strtolower($value);
}

function remap_user_lookup_full($pdo) {
  $lookup = ["exact" => [], "first" => []];
  try {
    $stmt = $pdo->query("SELECT nome, cargo FROM usuarios ORDER BY nome ASC");
    foreach ($stmt->fetchAll() as $u) {
      $name = trim((string)($u["nome"] ?? ""));
      if ($name === "") continue;
      $role = trim((string)($u["cargo"] ?? ""));
      $lower = remap_lower_text_full($name);
      $lookup["exact"][$lower] = ["name" => $name, "role" => $role];
      $first = remap_lower_text_full(explode(" ", $name)[0]);
      if ($first !== "" && !isset($lookup["first"][$first])) $lookup["first"][$first] = ["name" => $name, "role" => $role];
    }
  } catch (Exception $e) {}
  return $lookup;
}

function remap_resolve_user_full($rawName, $rawRole, $lookup) {
  $name = trim((string)$rawName);
  $role = trim((string)$rawRole);
  $lower = remap_lower_text_full($name);
  if ($lower !== "" && isset($lookup["exact"][$lower])) return ["name" => $lookup["exact"][$lower]["name"], "role" => $lookup["exact"][$lower]["role"] ?: $role];
  $first = remap_lower_text_full(explode(" ", $name)[0] ?? "");
  if ($first !== "" && isset($lookup["first"][$first])) return ["name" => $lookup["first"][$first]["name"], "role" => $lookup["first"][$first]["role"] ?: $role];
  return ["name" => $name, "role" => $role];
}

function remap_date_br_full($value) {
  $ts = strtotime((string)$value);
  return $ts ? date("d/m/Y", $ts) : "";
}

function build_entries_from_timer($pdo) {
  if (!remap_table_exists_full($pdo, "timer")) return [];
  $hasTaskLines = remap_column_exists_full($pdo, "timer", "task_lines_json");
  $hasBasePoints = remap_column_exists_full($pdo, "timer", "base_points");
  $hasPointMode = remap_column_exists_full($pdo, "timer", "point_mode");
  $taskLinesSelect = $hasTaskLines ? "task_lines_json" : "NULL AS task_lines_json";
  $basePointsSelect = $hasBasePoints ? "base_points" : "pontos AS base_points";
  $pointModeSelect = $hasPointMode ? "point_mode" : "'fixed' AS point_mode";
  $lookup = remap_user_lookup_full($pdo);

  $stmt = $pdo->query("\n    SELECT id, tarefa_id, uid_local, usuario, cliente, tarefa, descricao, categoria, cargo, pontos, $basePointsSelect, $pointModeSelect, $taskLinesSelect, inicio, fim, duracao, status\n    FROM timer\n    WHERE (status = 'finalizado' OR status IS NULL OR status = '')\n      AND inicio IS NOT NULL\n      AND fim IS NOT NULL\n    ORDER BY inicio DESC, id DESC\n    LIMIT 5000\n  ");

  $entries = [];
  foreach ($stmt->fetchAll() as $r) {
    $user = remap_resolve_user_full($r["usuario"] ?? "", $r["cargo"] ?? "", $lookup);
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
      "date" => remap_date_br_full($r["inicio"]),
      "durationSeconds" => max(0, (int)($r["duracao"] ?? 0)),
      "source" => (strpos((string)($r["uid_local"] ?? ""), "retro_") === 0) ? "retroativo" : "timer_db",
      "isRetroativo" => (strpos((string)($r["uid_local"] ?? ""), "retro_") === 0)
    ];
  }
  return $entries;
}

function default_cols() {
  return [
    ["id" => "col_1", "name" => "Sempre precisa fazer", "emoji" => "🔁"],
    ["id" => "col_2", "name" => "Social Media", "emoji" => "💬"],
    ["id" => "col_3", "name" => "Design", "emoji" => "🎨"],
    ["id" => "col_4", "name" => "Vídeos", "emoji" => "🎬"]
  ];
}

function build_cols($pdo) {
  $stmt = $pdo->query("SELECT id, nome, emoji FROM tarefas_colunas ORDER BY ordem ASC, id ASC");
  $cols = [];
  foreach ($stmt->fetchAll() as $r) $cols[] = ["id" => $r["id"], "name" => $r["nome"], "emoji" => $r["emoji"] ?: ""];
  return count($cols) ? $cols : default_cols();
}

function task_is_done($t) {
  $status = strtolower(trim((string)($t["status"] ?? $t["estado"] ?? "")));
  return !empty($t["done"]) || in_array($status, ["finalizado", "concluido", "concluida"], true);
}

function build_tarefas($pdo) {
  $saved = get_state($pdo, "tt_tarefas_v1", null);
  $savedData = $saved ? json_decode($saved, true) : null;
  $savedByDb = [];
  $localOnly = [];
  if (is_array($savedData) && isset($savedData["tasks"]) && is_array($savedData["tasks"])) {
    foreach ($savedData["tasks"] as $t) {
      if (!is_array($t)) continue;
      $dbId = (int)($t["dbId"] ?? 0);
      if (!$dbId && !empty($t["id"]) && preg_match('/^dbtask_(\d+)$/', (string)$t["id"], $m)) $dbId = (int)$m[1];
      if ($dbId) $savedByDb[$dbId] = $t;
      else if (!task_is_done($t)) $localOnly[] = $t;
    }
  }

  $stmt = $pdo->query("SELECT * FROM tarefas WHERE status NOT IN ('finalizado', 'concluido', 'concluida') OR status IS NULL ORDER BY id DESC");
  $tasks = [];
  foreach ($stmt->fetchAll() as $r) {
    $base = $savedByDb[(int)$r["id"]] ?? [];
    foreach (["labels" => "etiquetas_json", "subtasks" => "subtarefas_json", "attachments" => "anexos_json", "comments" => "comentarios_json"] as $frontField => $dbField) {
      if (!isset($base[$frontField]) || !is_array($base[$frontField]) || !count($base[$frontField])) {
        $base[$frontField] = remap_decode_json_array($r[$dbField] ?? null);
      }
    }
    if (empty($base["recurrence"])) $base["recurrence"] = $r["recorrencia"] ?? "";
    $task = array_merge($base, [
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
      "done" => false,
      "status" => $r["status"] ?: "pendente",
      "createdBy" => $r["delegado_por"] ?: "",
      "createdAt" => $r["criado_em"] ?? date("c"),
      "localUid" => $r["uid_local"] ?? ($base["localUid"] ?? ""),
      "uid_local" => $r["uid_local"] ?? ($base["uid_local"] ?? "")
    ]);
    foreach (["labels", "subtasks", "attachments", "comments"] as $field) {
      if (isset($base[$field]) && is_array($base[$field]) && count($base[$field])) $task[$field] = $base[$field];
      else if (!isset($task[$field])) $task[$field] = [];
    }
    if (!isset($task["recurrence"])) $task["recurrence"] = "";
    $tasks[] = $task;
  }

  foreach ($localOnly as $t) $tasks[] = $t;
  return ["cols" => build_cols($pdo), "tasks" => $tasks];
}

function build_payload($pdo) {
  $taskConfig = json_decode(get_state($pdo, "tt_taskpoints_v1", "[]"), true);
  if (!is_array($taskConfig)) $taskConfig = [];
  // As tarefas registradas da supervisão/desempenho vêm da tabela timer.
  // Isso evita dados antigos do app_state/localStorage aparecendo na tela.
  $entries = build_entries_from_timer($pdo);

  return [
    "collabs" => build_collabs($pdo),
    "clients" => build_clients($pdo),
    "metas" => build_metas($pdo),
    "taskpoints" => $taskConfig,
    "taskPoints" => $taskConfig,
    "pontos" => build_pontos($pdo),
    "descontos" => build_descontos($pdo),
    "entries" => $entries,
    "tarefas" => build_tarefas($pdo),
    "taskpoints_table" => build_pontos($pdo),
    "descontos_table" => build_descontos($pdo)
  ];
}

ensure_schema($pdo);

if ($_SERVER["REQUEST_METHOD"] === "GET") {
  responseJson(["success" => true, "data" => build_payload($pdo)]);
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $input = getJsonInput();
  $key = $input["key"] ?? "";
  $value = $input["value"] ?? null;

  if (!$key || strpos($key, "tt_") !== 0) responseJson(["success" => false, "message" => "Chave inválida."], 400);

  if ($value === null) {
    set_state($pdo, $key, null);
    remapBumpUpdate($pdo, $key === "tt_tarefas_v1" ? "tarefas" : "supervisao");
    responseJson(["success" => true, "data" => build_payload($pdo)]);
  }

  if ($key === "tt_collabs_v2") sync_collabs($pdo, $value);
  if ($key === "tt_clients_v2") sync_clients($pdo, $value);
  if ($key === "tt_metas_v2") sync_metas($pdo, $value);
  if ($key === "tt_descontos_v1") sync_descontos($pdo, $value);
  if (in_array($key, ["tt_entries_v2", "tt_taskpoints_v1", "tt_tarefas_v1"], true)) set_state($pdo, $key, $value);

  remapBumpUpdate($pdo, $key === "tt_tarefas_v1" ? "tarefas" : "supervisao");
  responseJson(["success" => true, "data" => build_payload($pdo)]);
}

responseJson(["success" => false, "message" => "Método não permitido."], 405);
?>
