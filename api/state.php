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


/*
  state.php — Pontuação / Metas / Descontos / Desempenho conectados ao banco.
  Mantém o HTML visual original usando as mesmas chaves localStorage:
  - tt_collabs_v2     -> tabela usuarios
  - tt_clients_v2     -> tabela clientes
  - tt_metas_v2       -> tabela metas
  - tt_taskpoints_v1  -> tabela pontos_tarefas
  - tt_descontos_v1   -> tabela descontos_pontos
  - tt_entries_v2     -> app_state
  - tt_tarefas_v1     -> tabela tarefas + app_state
*/

function ensureAppStateTable($pdo) {
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS app_state (
      key_name VARCHAR(120) NOT NULL PRIMARY KEY,
      value_json LONGTEXT NULL,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");
}

function tryExec($pdo, $sql) {
  try { $pdo->exec($sql); } catch (Exception $e) {}
}

function ensureTables($pdo) {
  ensureAppStateTable($pdo);

  tryExec($pdo, "
    CREATE TABLE IF NOT EXISTS tarefas_colunas (
      id VARCHAR(80) NOT NULL PRIMARY KEY,
      nome VARCHAR(120) NOT NULL,
      emoji VARCHAR(20) DEFAULT '',
      ordem INT NOT NULL DEFAULT 0,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");
  tryExec($pdo, "ALTER TABLE tarefas_colunas ADD COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  tryExec($pdo, "ALTER TABLE tarefas_colunas MODIFY COLUMN id VARCHAR(80) NOT NULL");
  tryExec($pdo, "ALTER TABLE tarefas_colunas MODIFY COLUMN emoji VARCHAR(20) DEFAULT ''");

  tryExec($pdo, "
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

  tryExec($pdo, "ALTER TABLE tarefas ADD COLUMN cliente VARCHAR(160) DEFAULT ''");
  tryExec($pdo, "ALTER TABLE tarefas ADD COLUMN prazo DATE NULL");
  tryExec($pdo, "ALTER TABLE tarefas ADD COLUMN atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
  tryExec($pdo, "ALTER TABLE tarefas ADD COLUMN uid_local VARCHAR(160) NULL");
  tryExec($pdo, "ALTER TABLE tarefas ADD COLUMN coluna VARCHAR(80) DEFAULT 'col_1'");
  tryExec($pdo, "ALTER TABLE tarefas MODIFY COLUMN coluna VARCHAR(80) DEFAULT 'col_1'");
  tryExec($pdo, "ALTER TABLE tarefas ADD COLUMN tempo_total INT NOT NULL DEFAULT 0");
  tryExec($pdo, "ALTER TABLE tarefas ADD COLUMN data_tarefa DATE NULL");
  tryExec($pdo, "ALTER TABLE tarefas ADD COLUMN recorrencia VARCHAR(30) DEFAULT ''");
  tryExec($pdo, "ALTER TABLE tarefas ADD COLUMN etiquetas_json LONGTEXT NULL");
  tryExec($pdo, "ALTER TABLE tarefas ADD COLUMN subtarefas_json LONGTEXT NULL");
  tryExec($pdo, "ALTER TABLE tarefas ADD COLUMN anexos_json LONGTEXT NULL");
  tryExec($pdo, "ALTER TABLE tarefas ADD COLUMN comentarios_json LONGTEXT NULL");
  tryExec($pdo, "ALTER TABLE tarefas ADD INDEX idx_uid_local (uid_local)");
  tryExec($pdo, "ALTER TABLE tarefas ADD INDEX idx_coluna (coluna)");
  tryExec($pdo, "ALTER TABLE tarefas ADD INDEX idx_status (status)");

  tryExec($pdo, "
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

  tryExec($pdo, "ALTER TABLE usuarios ADD COLUMN salario DECIMAL(10,2) DEFAULT 0");
  tryExec($pdo, "ALTER TABLE usuarios ADD COLUMN horas_mensais INT DEFAULT 176");

  tryExec($pdo, "CREATE TABLE IF NOT EXISTS clientes (id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(160) NOT NULL, valor DECIMAL(10,2) DEFAULT 0, horas_mensais DECIMAL(8,2) DEFAULT 0, observacoes TEXT NULL, plano VARCHAR(120) DEFAULT '', criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
  tryExec($pdo, "ALTER TABLE clientes ADD COLUMN horas_mensais DECIMAL(8,2) DEFAULT 0");
  tryExec($pdo, "ALTER TABLE clientes ADD COLUMN observacoes TEXT NULL");
  tryExec($pdo, "ALTER TABLE clientes ADD COLUMN plano VARCHAR(120) DEFAULT ''");

  $pdo->exec("
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

  $pdo->exec("
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
}


function remap_decode_json_array($value) {
  if ($value === null || $value === '') return [];
  $arr = json_decode($value, true);
  return is_array($arr) ? $arr : [];
}

function getState($pdo, $key) {
  $stmt = $pdo->prepare("SELECT value_json FROM app_state WHERE key_name = ? LIMIT 1");
  $stmt->execute([$key]);
  $row = $stmt->fetch();
  return $row ? $row["value_json"] : null;
}

function remapCanPersistAppState($key) {
  $key = (string)$key;
  return (strpos($key, "tt_painel_") === 0)
    || in_array($key, ["tt_supervisors_v1", "tt_entries_v2", "tt_taskpoints_v1", "tt_tarefas_v1"], true);
}

function setState($pdo, $key, $value) {
  if (!remapCanPersistAppState($key)) return;

  $stmt = $pdo->prepare("
    INSERT INTO app_state (key_name, value_json)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE value_json = VALUES(value_json)
  ");
  $stmt->execute([$key, $value]);
}

function buildClients($pdo) {
  tryExec($pdo, "ALTER TABLE clientes ADD COLUMN horas_mensais DECIMAL(8,2) DEFAULT 0");
  tryExec($pdo, "ALTER TABLE clientes ADD COLUMN observacoes TEXT NULL");
  tryExec($pdo, "ALTER TABLE clientes ADD COLUMN plano VARCHAR(120) DEFAULT ''");
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

function buildCollabs($pdo) {
  $stmt = $pdo->query("SELECT id, nome, cargo, salario, horas_mensais FROM usuarios ORDER BY nome ASC");
  $out = [];
  foreach ($stmt->fetchAll() as $r) {
    $out[] = [
      "id" => "u" . str_pad((string)$r["id"], 3, "0", STR_PAD_LEFT),
      "name" => $r["nome"],
      "role" => $r["cargo"] ?: "Colaborador",
      "salary" => (string)(float)($r["salario"] ?? 0),
      "monthHours" => (string)(int)($r["horas_mensais"] ?? 176)
    ];
  }
  return $out;
}

function buildMetas($pdo) {
  $stmt = $pdo->query("SELECT colaborador, mes, meta_7, meta_14, meta_21 FROM metas");
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

function buildTaskPoints($pdo) {
  $stmt = $pdo->query("SELECT * FROM pontos_tarefas ORDER BY data_ref DESC, id DESC");
  $out = [];
  foreach ($stmt->fetchAll() as $r) {
    $out[] = [
      "id" => "pt" . $r["id"],
      "dbId" => (int)$r["id"],
      "collab" => $r["colaborador"],
      "name" => $r["colaborador"],
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

function buildDescontos($pdo) {
  $stmt = $pdo->query("SELECT * FROM descontos_pontos ORDER BY data_ref DESC, id DESC");
  $out = [];
  foreach ($stmt->fetchAll() as $r) {
    $out[] = [
      "id" => "dc" . $r["id"],
      "dbId" => (int)$r["id"],
      "collab" => $r["colaborador"],
      "name" => $r["colaborador"],
      "colaborador" => $r["colaborador"],
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


function remapTableExists($pdo, $table) {
  try {
    $stmt = $pdo->prepare("SHOW TABLES LIKE ?");
    $stmt->execute([$table]);
    return (bool)$stmt->fetch();
  } catch (Exception $e) { return false; }
}

function remapColumnExistsState($pdo, $table, $column) {
  try {
    $stmt = $pdo->prepare("SHOW COLUMNS FROM `$table` LIKE ?");
    $stmt->execute([$column]);
    return (bool)$stmt->fetch();
  } catch (Exception $e) { return false; }
}


function remapLowerText($value) {
  $value = (string)$value;
  return function_exists("mb_strtolower") ? mb_strtolower($value, "UTF-8") : strtolower($value);
}

function remapBuildUserLookup($pdo) {
  $lookup = ["exact" => [], "first" => []];
  try {
    $stmt = $pdo->query("SELECT nome, cargo FROM usuarios ORDER BY nome ASC");
    foreach ($stmt->fetchAll() as $u) {
      $name = trim((string)($u["nome"] ?? ""));
      if ($name === "") continue;
      $role = trim((string)($u["cargo"] ?? ""));
      $lower = remapLowerText($name);
      $lookup["exact"][$lower] = ["name" => $name, "role" => $role];
      $first = remapLowerText(explode(" ", $name)[0]);
      if ($first !== "" && !isset($lookup["first"][$first])) $lookup["first"][$first] = ["name" => $name, "role" => $role];
    }
  } catch (Exception $e) {}
  return $lookup;
}

function remapResolveUserNameRole($rawName, $rawRole, $lookup) {
  $name = trim((string)$rawName);
  $role = trim((string)$rawRole);
  $lower = remapLowerText($name);
  if ($lower !== "" && isset($lookup["exact"][$lower])) {
    return ["name" => $lookup["exact"][$lower]["name"], "role" => $lookup["exact"][$lower]["role"] ?: $role];
  }
  $first = remapLowerText(explode(" ", $name)[0] ?? "");
  if ($first !== "" && isset($lookup["first"][$first])) {
    return ["name" => $lookup["first"][$first]["name"], "role" => $lookup["first"][$first]["role"] ?: $role];
  }
  return ["name" => $name, "role" => $role];
}

function remapFormatDateBr($value) {
  $ts = strtotime((string)$value);
  return $ts ? date("d/m/Y", $ts) : "";
}

function remapBuildEntriesFromTimer($pdo) {
  if (!remapTableExists($pdo, "timer")) return [];

  $hasTaskLines = remapColumnExistsState($pdo, "timer", "task_lines_json");
  $hasBasePoints = remapColumnExistsState($pdo, "timer", "base_points");
  $hasPointMode = remapColumnExistsState($pdo, "timer", "point_mode");
  $taskLinesSelect = $hasTaskLines ? "task_lines_json" : "NULL AS task_lines_json";
  $basePointsSelect = $hasBasePoints ? "base_points" : "pontos AS base_points";
  $pointModeSelect = $hasPointMode ? "point_mode" : "'fixed' AS point_mode";
  $lookup = remapBuildUserLookup($pdo);

  $stmt = $pdo->query("\n    SELECT id, tarefa_id, uid_local, usuario, cliente, tarefa, descricao, categoria, cargo, pontos, $basePointsSelect, $pointModeSelect, $taskLinesSelect, inicio, fim, duracao, status\n    FROM timer\n    WHERE (status = 'finalizado' OR status IS NULL OR status = '')\n      AND inicio IS NOT NULL\n      AND fim IS NOT NULL\n    ORDER BY inicio DESC, id DESC\n    LIMIT 5000\n  ");

  $entries = [];
  foreach ($stmt->fetchAll() as $r) {
    $user = remapResolveUserNameRole($r["usuario"] ?? "", $r["cargo"] ?? "", $lookup);
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
      "date" => remapFormatDateBr($r["inicio"]),
      "durationSeconds" => max(0, (int)($r["duracao"] ?? 0)),
      "source" => (strpos((string)($r["uid_local"] ?? ""), "retro_") === 0) ? "retroativo" : "timer_db",
      "isRetroativo" => (strpos((string)($r["uid_local"] ?? ""), "retro_") === 0)
    ];
  }
  return $entries;
}

function buildCols($pdo) {
  $stmt = $pdo->query("SELECT id, nome, emoji FROM tarefas_colunas ORDER BY ordem ASC, id ASC");
  $cols = [];

  foreach ($stmt->fetchAll() as $r) {
    $cols[] = [
      "id" => $r["id"],
      "name" => $r["nome"],
      "emoji" => $r["emoji"] ?: ""
    ];
  }

  if (count($cols) > 0) return $cols;

  return [
    ["id" => "col_1", "name" => "Sempre precisa fazer", "emoji" => "🔁"],
    ["id" => "col_2", "name" => "Social Media", "emoji" => "💬"],
    ["id" => "col_3", "name" => "Design", "emoji" => "🎨"],
    ["id" => "col_4", "name" => "Vídeos", "emoji" => "🎬"]
  ];
}

function taskIsDone($t) {
  $status = strtolower(trim((string)($t["status"] ?? $t["estado"] ?? "")));
  return !empty($t["done"]) || in_array($status, ["finalizado", "concluido", "concluida"], true);
}

function buildTarefas($pdo) {
  $saved = getState($pdo, "tt_tarefas_v1");
  $savedData = $saved ? json_decode($saved, true) : null;
  $savedByDb = [];
  $localOnly = [];

  if (is_array($savedData) && isset($savedData["tasks"]) && is_array($savedData["tasks"])) {
    foreach ($savedData["tasks"] as $t) {
      if (!is_array($t)) continue;
      $dbId = (int)($t["dbId"] ?? 0);
      if (!$dbId && !empty($t["id"]) && preg_match('/^dbtask_(\d+)$/', (string)$t["id"], $m)) $dbId = (int)$m[1];
      if ($dbId) $savedByDb[$dbId] = $t;
      else if (!taskIsDone($t)) $localOnly[] = $t;
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
      "recurrence" => $base["recurrence"] ?? "",
      "labels" => $base["labels"] ?? [],
      "subtasks" => $base["subtasks"] ?? [],
      "attachments" => $base["attachments"] ?? [],
      "comments" => $base["comments"] ?? [],
      "done" => false,
      "status" => $r["status"] ?: "pendente",
      "createdBy" => $r["delegado_por"] ?: "",
      "createdAt" => $r["criado_em"] ?? date("c"),
      "localUid" => $r["uid_local"] ?? ($base["localUid"] ?? ""),
      "uid_local" => $r["uid_local"] ?? ($base["uid_local"] ?? "")
    ]);
    $tasks[] = $task;
  }

  foreach ($localOnly as $t) $tasks[] = $t;
  return ["cols" => buildCols($pdo), "tasks" => $tasks];
}

function syncClientsTable($pdo, $json) {
  $arr = json_decode($json, true);
  if (!is_array($arr)) return;

  tryExec($pdo, "ALTER TABLE clientes ADD COLUMN horas_mensais DECIMAL(8,2) DEFAULT 0");
  tryExec($pdo, "ALTER TABLE clientes ADD COLUMN observacoes TEXT NULL");
  tryExec($pdo, "ALTER TABLE clientes ADD COLUMN plano VARCHAR(120) DEFAULT ''");

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

function syncCollabsTable($pdo, $json) {
  $arr = json_decode($json, true);
  if (!is_array($arr)) return;

  foreach ($arr as $c) {
    $name = trim($c["name"] ?? "");
    if ($name === "") continue;
    $role = trim($c["role"] ?? "Colaborador");
    $salary = (float)($c["salary"] ?? 0);
    $hours = (int)($c["monthHours"] ?? 176);
    if ($hours <= 0) $hours = 176;

    $rawId = (string)($c["id"] ?? "");
    $numericId = null;
    if (preg_match('/^u0*([0-9]+)$/', $rawId, $m)) $numericId = (int)$m[1];

    if ($numericId) {
      $stmt = $pdo->prepare("UPDATE usuarios SET nome=?, cargo=?, salario=?, horas_mensais=? WHERE id=?");
      $stmt->execute([$name, $role, $salary, $hours, $numericId]);
      if ($stmt->rowCount() > 0) continue;
    }

    $first = explode(" ", $name)[0] ?? $name;
    $emailGuess = strtolower(iconv("UTF-8", "ASCII//TRANSLIT", $first));
    $emailGuess = preg_replace('/[^a-z0-9]/', '', $emailGuess) . "@remapdigital.com";

    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE nome = ? OR email = ? LIMIT 1");
    $stmt->execute([$name, $emailGuess]);
    $existing = $stmt->fetch();

    if ($existing) {
      $stmt = $pdo->prepare("UPDATE usuarios SET nome=?, cargo=?, salario=?, horas_mensais=? WHERE id=?");
      $stmt->execute([$name, $role, $salary, $hours, $existing["id"]]);
    } else {
      $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha, cargo, salario, horas_mensais) VALUES (?, ?, '123456', ?, ?, ?)");
      $stmt->execute([$name, $emailGuess, $role, $salary, $hours]);
    }
  }
}

function syncMetasTable($pdo, $json) {
  $obj = json_decode($json, true);
  if (!is_array($obj)) return;
  $pdo->beginTransaction();
  $pdo->exec("DELETE FROM metas");
  $stmt = $pdo->prepare("INSERT INTO metas (colaborador, mes, meta_7, meta_14, meta_21) VALUES (?, ?, ?, ?, ?)");
  foreach ($obj as $colab => $months) {
    if (!is_array($months)) continue;
    foreach ($months as $mes => $m) {
      $stmt->execute([$colab, $mes, (int)($m["m1"] ?? 0), (int)($m["m2"] ?? 0), (int)($m["m3"] ?? 0)]);
    }
  }
  $pdo->commit();
}

function syncTaskPointsTable($pdo, $json) {
  $arr = json_decode($json, true);
  if (!is_array($arr)) return;
  $pdo->beginTransaction();
  $pdo->exec("DELETE FROM pontos_tarefas");
  $stmt = $pdo->prepare("INSERT INTO pontos_tarefas (colaborador, cliente, tarefa, pontos, data_ref) VALUES (?, ?, ?, ?, ?)");
  foreach ($arr as $p) {
    $collab = trim($p["collab"] ?? $p["name"] ?? $p["colaborador"] ?? "");
    $task = trim($p["task"] ?? $p["tarefa"] ?? "");
    if ($collab === "" || $task === "") continue;
    $date = $p["date"] ?? $p["data"] ?? date("Y-m-d");
    $stmt->execute([
      $collab,
      $p["client"] ?? $p["cliente"] ?? "",
      $task,
      (int)($p["points"] ?? $p["pontos"] ?? 0),
      $date ?: date("Y-m-d")
    ]);
  }
  $pdo->commit();
}

function syncDescontosTable($pdo, $json) {
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
    $stmt->execute([
      $collab,
      $reason,
      (int)($d["points"] ?? $d["pontos"] ?? 0),
      $date ?: date("Y-m-d")
    ]);
  }
  $pdo->commit();
}

function syncTarefasTable($pdo, $json) {
  setState($pdo, "tt_tarefas_v1", $json);
}

ensureTables($pdo);

if ($_SERVER["REQUEST_METHOD"] === "GET") {
  $keys = [
    "tt_clients_v2",
    "tt_collabs_v2",
    "tt_tarefas_v1",
    "tt_metas_v2",
    "tt_entries_v2",
    "tt_taskpoints_v1",
    "tt_descontos_v1",
    "tt_supervisors_v1"
  ];

  $data = [];

  foreach ($keys as $key) {
    if ($key === "tt_clients_v2") { $data[$key] = json_encode(buildClients($pdo), JSON_UNESCAPED_UNICODE); continue; }
    if ($key === "tt_collabs_v2") { $data[$key] = json_encode(buildCollabs($pdo), JSON_UNESCAPED_UNICODE); continue; }
    if ($key === "tt_metas_v2") { $data[$key] = json_encode(buildMetas($pdo), JSON_UNESCAPED_UNICODE); continue; }
    if ($key === "tt_taskpoints_v1") { $data[$key] = getState($pdo, "tt_taskpoints_v1") ?: "[]"; continue; }
    if ($key === "tt_descontos_v1") { $data[$key] = json_encode(buildDescontos($pdo), JSON_UNESCAPED_UNICODE); continue; }
    if ($key === "tt_entries_v2") { $data[$key] = json_encode(remapBuildEntriesFromTimer($pdo), JSON_UNESCAPED_UNICODE); continue; }
    if ($key === "tt_tarefas_v1") { $data[$key] = json_encode(buildTarefas($pdo), JSON_UNESCAPED_UNICODE); continue; }

    $saved = getState($pdo, $key);
    $data[$key] = ($saved !== null && $saved !== "") ? $saved : null;
  }

  responseJson(["success" => true, "data" => $data]);
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $input = getJsonInput();
  $key = $input["key"] ?? "";
  $value = $input["value"] ?? null;

  if (!$key || strpos($key, "tt_") !== 0) {
    responseJson(["success" => false, "message" => "Chave inválida."], 400);
  }

  if ($value === null) {
    setState($pdo, $key, null);
    remapBumpUpdate($pdo, "tarefas");
  remapBumpUpdate($pdo, "supervisao");
  responseJson(["success" => true]);
  }

  setState($pdo, $key, $value);

  if ($key === "tt_clients_v2") syncClientsTable($pdo, $value);
  if ($key === "tt_collabs_v2") syncCollabsTable($pdo, $value);
  if ($key === "tt_metas_v2") syncMetasTable($pdo, $value);
  // tt_taskpoints_v1 é a configuração de pontos por cargo; não deve apagar/reescrever a tabela pontos_tarefas.
  if ($key === "tt_descontos_v1") syncDescontosTable($pdo, $value);
  if ($key === "tt_tarefas_v1") syncTarefasTable($pdo, $value);

  remapBumpUpdate($pdo, "tarefas");
  remapBumpUpdate($pdo, "supervisao");
  responseJson(["success" => true]);
}

responseJson(["success" => false, "message" => "Método não permitido."], 405);
?>
