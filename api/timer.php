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

  if ($type === "tarefas") {
    $pdo->exec("UPDATE sistema_updates SET tarefas_updated_at = NOW() WHERE id = 1");
  }

  if ($type === "supervisao") {
    $pdo->exec("UPDATE sistema_updates SET supervisao_updated_at = NOW() WHERE id = 1");
  }
}

function remapColumnExists($pdo, $table, $column) {
  $stmt = $pdo->prepare("SHOW COLUMNS FROM `$table` LIKE ?");
  $stmt->execute([$column]);
  return (bool)$stmt->fetch();
}

function remapColumnTypeContains($pdo, $table, $column, $needle) {
  $stmt = $pdo->prepare("SHOW COLUMNS FROM `$table` LIKE ?");
  $stmt->execute([$column]);
  $row = $stmt->fetch();
  if (!$row || empty($row["Type"])) return false;
  return stripos((string)$row["Type"], (string)$needle) !== false;
}

function remapModifyColumnIfTypeNotContains($pdo, $table, $column, $needle, $definition) {
  if (remapColumnExists($pdo, $table, $column) && !remapColumnTypeContains($pdo, $table, $column, $needle)) {
    $pdo->exec("ALTER TABLE `$table` MODIFY COLUMN $definition");
  }
}

function remapIndexExists($pdo, $table, $index) {
  $stmt = $pdo->prepare("SHOW INDEX FROM `$table` WHERE Key_name = ?");
  $stmt->execute([$index]);
  return (bool)$stmt->fetch();
}

function remapAddColumnIfMissing($pdo, $table, $column, $definition) {
  if (!remapColumnExists($pdo, $table, $column)) {
    $pdo->exec("ALTER TABLE `$table` ADD COLUMN $definition");
  }
}

function remapAddIndexIfMissing($pdo, $table, $indexName, $definition, $unique = false) {
  if (!remapIndexExists($pdo, $table, $indexName)) {
    $type = $unique ? "ADD UNIQUE INDEX" : "ADD INDEX";
    $pdo->exec("ALTER TABLE `$table` $type `$indexName` $definition");
  }
}

function remapEnsureTimerTable($pdo) {
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS timer (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tarefa_id INT NULL,
      uid_local VARCHAR(120) NULL,
      usuario VARCHAR(150) NOT NULL,
      cliente VARCHAR(160) NULL,
      tarefa VARCHAR(255) NULL,
      descricao TEXT NULL,
      categoria VARCHAR(80) NULL,
      cargo VARCHAR(120) NULL,
      pontos DECIMAL(10,2) NOT NULL DEFAULT 0,
      base_points DECIMAL(10,2) NOT NULL DEFAULT 0,
      point_mode VARCHAR(30) NOT NULL DEFAULT 'fixed',
      task_lines_json TEXT NULL,
      inicio DATETIME NOT NULL,
      fim DATETIME NULL,
      duracao INT NOT NULL DEFAULT 0,
      pausado_em DATETIME NULL,
      retomado_em DATETIME NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'finalizado'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");

  remapAddColumnIfMissing($pdo, "timer", "tarefa_id", "tarefa_id INT NULL AFTER id");
  remapAddColumnIfMissing($pdo, "timer", "uid_local", "uid_local VARCHAR(120) NULL AFTER tarefa_id");
  remapAddColumnIfMissing($pdo, "timer", "usuario", "usuario VARCHAR(150) NOT NULL DEFAULT '' AFTER uid_local");
  remapAddColumnIfMissing($pdo, "timer", "cliente", "cliente VARCHAR(160) NULL AFTER usuario");
  remapAddColumnIfMissing($pdo, "timer", "tarefa", "tarefa VARCHAR(255) NULL AFTER cliente");
  remapAddColumnIfMissing($pdo, "timer", "descricao", "descricao TEXT NULL AFTER tarefa");
  remapAddColumnIfMissing($pdo, "timer", "categoria", "categoria VARCHAR(80) NULL AFTER descricao");
  remapAddColumnIfMissing($pdo, "timer", "cargo", "cargo VARCHAR(120) NULL AFTER categoria");
  remapAddColumnIfMissing($pdo, "timer", "pontos", "pontos DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER cargo");
  remapModifyColumnIfTypeNotContains($pdo, "timer", "pontos", "decimal", "pontos DECIMAL(10,2) NOT NULL DEFAULT 0");
  remapAddColumnIfMissing($pdo, "timer", "base_points", "base_points DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER pontos");
  remapAddColumnIfMissing($pdo, "timer", "point_mode", "point_mode VARCHAR(30) NOT NULL DEFAULT 'fixed' AFTER base_points");
  remapAddColumnIfMissing($pdo, "timer", "task_lines_json", "task_lines_json TEXT NULL AFTER point_mode");
  remapAddColumnIfMissing($pdo, "timer", "inicio", "inicio DATETIME NULL AFTER task_lines_json");
  remapAddColumnIfMissing($pdo, "timer", "fim", "fim DATETIME NULL AFTER inicio");
  remapAddColumnIfMissing($pdo, "timer", "duracao", "duracao INT NOT NULL DEFAULT 0 AFTER fim");
  remapAddColumnIfMissing($pdo, "timer", "pausado_em", "pausado_em DATETIME NULL AFTER duracao");
  remapAddColumnIfMissing($pdo, "timer", "retomado_em", "retomado_em DATETIME NULL AFTER pausado_em");
  remapAddColumnIfMissing($pdo, "timer", "status", "status VARCHAR(30) NOT NULL DEFAULT 'finalizado' AFTER retomado_em");

  remapAddIndexIfMissing($pdo, "timer", "idx_timer_uid_local", "(uid_local)");
  remapAddIndexIfMissing($pdo, "timer", "idx_timer_usuario_inicio", "(usuario, inicio)");
}

function remapEnsureActiveTimerTable($pdo) {
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS timer_ativos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uid_local VARCHAR(120) NOT NULL,
      usuario VARCHAR(150) NOT NULL,
      cliente VARCHAR(160) NULL,
      tarefa VARCHAR(255) NULL,
      descricao TEXT NULL,
      categoria VARCHAR(80) NULL,
      cargo VARCHAR(120) NULL,
      pontos DECIMAL(10,2) NOT NULL DEFAULT 0,
      base_points DECIMAL(10,2) NOT NULL DEFAULT 0,
      point_mode VARCHAR(30) NOT NULL DEFAULT 'fixed',
      task_lines_json TEXT NULL,
      segundos_acumulados INT NOT NULL DEFAULT 0,
      iniciado_em DATETIME NULL,
      rodando_desde DATETIME NULL,
      pausado_em DATETIME NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'pausado',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_uid_local (uid_local),
      INDEX idx_timer_ativos_usuario (usuario),
      INDEX idx_timer_ativos_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");

  remapAddColumnIfMissing($pdo, "timer_ativos", "uid_local", "uid_local VARCHAR(120) NOT NULL AFTER id");
  remapAddColumnIfMissing($pdo, "timer_ativos", "usuario", "usuario VARCHAR(150) NOT NULL DEFAULT '' AFTER uid_local");
  remapAddColumnIfMissing($pdo, "timer_ativos", "cliente", "cliente VARCHAR(160) NULL AFTER usuario");
  remapAddColumnIfMissing($pdo, "timer_ativos", "tarefa", "tarefa VARCHAR(255) NULL AFTER cliente");
  remapAddColumnIfMissing($pdo, "timer_ativos", "descricao", "descricao TEXT NULL AFTER tarefa");
  remapAddColumnIfMissing($pdo, "timer_ativos", "categoria", "categoria VARCHAR(80) NULL AFTER descricao");
  remapAddColumnIfMissing($pdo, "timer_ativos", "cargo", "cargo VARCHAR(120) NULL AFTER categoria");
  remapAddColumnIfMissing($pdo, "timer_ativos", "pontos", "pontos DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER cargo");
  remapModifyColumnIfTypeNotContains($pdo, "timer_ativos", "pontos", "decimal", "pontos DECIMAL(10,2) NOT NULL DEFAULT 0");
  remapAddColumnIfMissing($pdo, "timer_ativos", "base_points", "base_points DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER pontos");
  remapAddColumnIfMissing($pdo, "timer_ativos", "point_mode", "point_mode VARCHAR(30) NOT NULL DEFAULT 'fixed' AFTER base_points");
  remapAddColumnIfMissing($pdo, "timer_ativos", "task_lines_json", "task_lines_json TEXT NULL AFTER point_mode");
  remapAddColumnIfMissing($pdo, "timer_ativos", "segundos_acumulados", "segundos_acumulados INT NOT NULL DEFAULT 0 AFTER task_lines_json");
  remapAddColumnIfMissing($pdo, "timer_ativos", "iniciado_em", "iniciado_em DATETIME NULL AFTER segundos_acumulados");
  remapAddColumnIfMissing($pdo, "timer_ativos", "rodando_desde", "rodando_desde DATETIME NULL AFTER iniciado_em");
  remapAddColumnIfMissing($pdo, "timer_ativos", "pausado_em", "pausado_em DATETIME NULL AFTER rodando_desde");
  remapAddColumnIfMissing($pdo, "timer_ativos", "status", "status VARCHAR(30) NOT NULL DEFAULT 'pausado' AFTER pausado_em");
  remapAddColumnIfMissing($pdo, "timer_ativos", "criado_em", "criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER status");
  remapAddColumnIfMissing($pdo, "timer_ativos", "atualizado_em", "atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER criado_em");

  remapAddIndexIfMissing($pdo, "timer_ativos", "uniq_uid_local", "(uid_local)", true);
  remapAddIndexIfMissing($pdo, "timer_ativos", "idx_timer_ativos_usuario", "(usuario)");
  remapAddIndexIfMissing($pdo, "timer_ativos", "idx_timer_ativos_status", "(status)");
}

function remapSafeDateTime($value) {
  $timestamp = strtotime((string)$value);
  if (!$timestamp) return date("Y-m-d H:i:s");
  return date("Y-m-d H:i:s", $timestamp);
}

function remapPauseRunningActiveTimers($pdo, $usuario, $exceptUid = null) {
  $sql = "
    UPDATE timer_ativos
    SET segundos_acumulados = segundos_acumulados + CASE
          WHEN status = 'rodando' AND rodando_desde IS NOT NULL THEN TIMESTAMPDIFF(SECOND, rodando_desde, NOW())
          ELSE 0
        END,
        status = 'pausado',
        pausado_em = NOW(),
        rodando_desde = NULL
    WHERE usuario = ? AND status = 'rodando'
  ";
  $params = [$usuario];

  if ($exceptUid !== null && $exceptUid !== "") {
    $sql .= " AND uid_local <> ?";
    $params[] = $exceptUid;
  }

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
}

function remapJsonTaskLines($data) {
  $lines = $data["task_lines"] ?? [];
  if (!is_array($lines)) $lines = [];
  return json_encode($lines, JSON_UNESCAPED_UNICODE);
}

function remapNormalizePointMode($mode) {
  return $mode === "time_30m" ? "time_30m" : "fixed";
}

function remapCalculateTimerPoints($basePoints, $pointMode, $durationSeconds) {
  $base = max(0, (float)$basePoints);
  if (remapNormalizePointMode($pointMode) !== "time_30m") return $base;

  $completedBlocks = floor(max(0, (int)$durationSeconds) / 1800);
  $total = $base + ($completedBlocks * ($base * 0.5));
  return round($total, 1);
}

function remapInsertFinalTimer($pdo, $timer, $duracaoFinal, $fim) {
  $stmt = $pdo->prepare("
    INSERT INTO timer
      (tarefa_id, uid_local, usuario, cliente, tarefa, descricao, categoria, cargo, pontos, base_points, point_mode, task_lines_json, inicio, fim, duracao, status)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'finalizado')
  ");

  $stmt->execute([
    null,
    $timer["uid_local"],
    $timer["usuario"],
    $timer["cliente"] ?? "",
    $timer["tarefa"] ?? "",
    $timer["descricao"] ?? "",
    $timer["categoria"] ?? "",
    $timer["cargo"] ?? "",
    (float)($timer["pontos"] ?? 0),
    (float)($timer["base_points"] ?? $timer["pontos"] ?? 0),
    remapNormalizePointMode($timer["point_mode"] ?? "fixed"),
    $timer["task_lines_json"] ?? null,
    $timer["iniciado_em"] ?: date("Y-m-d H:i:s"),
    $fim,
    $duracaoFinal
  ]);

  return (int)$pdo->lastInsertId();
}

$method = $_SERVER["REQUEST_METHOD"];

try {
  remapEnsureTimerTable($pdo);
  remapEnsureActiveTimerTable($pdo);

  if ($method === "GET") {
    $action = $_GET["action"] ?? "";

    if ($action === "active") {
      $usuario = trim((string)($_GET["usuario"] ?? ""));
      if ($usuario === "") {
        responseJson(["success" => false, "message" => "Usuário obrigatório."], 400);
      }

      $stmt = $pdo->prepare("
        SELECT *,
          (segundos_acumulados + CASE
            WHEN status = 'rodando' AND rodando_desde IS NOT NULL THEN TIMESTAMPDIFF(SECOND, rodando_desde, NOW())
            ELSE 0
          END) AS segundos_atuais
        FROM timer_ativos
        WHERE usuario = ?
        ORDER BY atualizado_em DESC, id DESC
      ");
      $stmt->execute([$usuario]);
      responseJson(["success" => true, "data" => $stmt->fetchAll()]);
    }

    $tarefaId = (int)($_GET["tarefa_id"] ?? 0);

    if ($tarefaId) {
      $stmt = $pdo->prepare("SELECT * FROM timer WHERE tarefa_id = ? ORDER BY id DESC");
      $stmt->execute([$tarefaId]);
    } else {
      $stmt = $pdo->query("SELECT * FROM timer ORDER BY id DESC");
    }

    responseJson(["success" => true, "data" => $stmt->fetchAll()]);
  }

  if ($method === "POST") {
    $data = getJsonInput();
    $action = $data["action"] ?? "";

    if ($action === "log") {
      requiredFields($data, ["usuario", "inicio", "fim", "duracao"]);

      $tarefaId = isset($data["tarefa_id"]) && $data["tarefa_id"] !== null && $data["tarefa_id"] !== "" ? (int)$data["tarefa_id"] : null;
      $uidLocal = isset($data["uid_local"]) && $data["uid_local"] !== "" ? (string)$data["uid_local"] : null;
      $usuario = trim((string)$data["usuario"]);
      $inicio = remapSafeDateTime($data["inicio"]);
      $fim = remapSafeDateTime($data["fim"]);
      $duracao = max(0, (int)$data["duracao"]);
      $status = $data["status"] ?? "finalizado";

      $cliente = trim((string)($data["cliente"] ?? ""));
      $tarefa = trim((string)($data["tarefa"] ?? ""));
      $descricao = trim((string)($data["descricao"] ?? ""));
      $categoria = trim((string)($data["categoria"] ?? ""));
      $cargo = trim((string)($data["cargo"] ?? ""));
      $pontos = (float)($data["pontos"] ?? 0);
      $basePoints = (float)($data["pontos_base"] ?? $data["base_points"] ?? $pontos);
      $pointMode = remapNormalizePointMode($data["modo_pontos"] ?? $data["point_mode"] ?? "fixed");
      $taskLinesJson = remapJsonTaskLines($data);

      $stmt = $pdo->prepare("
        INSERT INTO timer
          (tarefa_id, uid_local, usuario, cliente, tarefa, descricao, categoria, cargo, pontos, base_points, point_mode, task_lines_json, inicio, fim, duracao, status)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ");

      $stmt->execute([$tarefaId, $uidLocal, $usuario, $cliente, $tarefa, $descricao, $categoria, $cargo, $pontos, $basePoints, $pointMode, $taskLinesJson, $inicio, $fim, $duracao, $status]);
      $timerId = (int)$pdo->lastInsertId();

      if ($tarefaId) {
        $stmt = $pdo->prepare("UPDATE tarefas SET tempo_total = COALESCE(tempo_total, 0) + ? WHERE id = ?");
        $stmt->execute([$duracao, $tarefaId]);
      }

      try { remapBumpUpdate($pdo, "supervisao"); } catch (Throwable $e) {}
      responseJson(["success" => true, "message" => "Timer registrado.", "id" => $timerId]);
    }

    if ($action === "active_start") {
      requiredFields($data, ["uid_local", "usuario"]);

      $uidLocal = trim((string)$data["uid_local"]);
      $usuario = trim((string)$data["usuario"]);
      $inicio = remapSafeDateTime($data["iniciado_em"] ?? date("Y-m-d H:i:s"));
      $taskLinesJson = remapJsonTaskLines($data);

      remapPauseRunningActiveTimers($pdo, $usuario, $uidLocal);

      $stmt = $pdo->prepare("
        INSERT INTO timer_ativos
          (uid_local, usuario, cliente, tarefa, descricao, categoria, cargo, pontos, base_points, point_mode, task_lines_json, segundos_acumulados, iniciado_em, rodando_desde, pausado_em, status)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NULL, 'rodando')
        ON DUPLICATE KEY UPDATE
          usuario = VALUES(usuario),
          cliente = VALUES(cliente),
          tarefa = VALUES(tarefa),
          descricao = VALUES(descricao),
          categoria = VALUES(categoria),
          cargo = VALUES(cargo),
          pontos = VALUES(pontos),
          base_points = VALUES(base_points),
          point_mode = VALUES(point_mode),
          task_lines_json = VALUES(task_lines_json),
          segundos_acumulados = VALUES(segundos_acumulados),
          iniciado_em = VALUES(iniciado_em),
          rodando_desde = NOW(),
          pausado_em = NULL,
          status = 'rodando'
      ");

      $stmt->execute([
        $uidLocal,
        $usuario,
        trim((string)($data["cliente"] ?? "")),
        trim((string)($data["tarefa"] ?? "")),
        trim((string)($data["descricao"] ?? "")),
        trim((string)($data["categoria"] ?? "")),
        trim((string)($data["cargo"] ?? "")),
        (float)($data["pontos"] ?? 0),
        (float)($data["pontos_base"] ?? $data["base_points"] ?? $data["pontos"] ?? 0),
        remapNormalizePointMode($data["modo_pontos"] ?? $data["point_mode"] ?? "fixed"),
        $taskLinesJson,
        max(0, (int)($data["segundos_acumulados"] ?? 0)),
        $inicio
      ]);

      $stmt = $pdo->prepare("SELECT id FROM timer_ativos WHERE uid_local = ? LIMIT 1");
      $stmt->execute([$uidLocal]);
      $row = $stmt->fetch();

      responseJson(["success" => true, "message" => "Timer ativo iniciado.", "id" => (int)($row["id"] ?? 0)]);
    }

    if ($action === "active_update") {
      requiredFields($data, ["uid_local", "usuario"]);

      $uidLocal = trim((string)$data["uid_local"]);
      $usuario = trim((string)$data["usuario"]);
      $taskLinesJson = remapJsonTaskLines($data);

      $stmt = $pdo->prepare("
        UPDATE timer_ativos
        SET cliente = ?,
            tarefa = ?,
            descricao = ?,
            categoria = ?,
            cargo = ?,
            pontos = ?,
            base_points = ?,
            point_mode = ?,
            task_lines_json = ?
        WHERE uid_local = ? AND usuario = ?
      ");

      $stmt->execute([
        trim((string)($data["cliente"] ?? "")),
        trim((string)($data["tarefa"] ?? "")),
        trim((string)($data["descricao"] ?? "")),
        trim((string)($data["categoria"] ?? "")),
        trim((string)($data["cargo"] ?? "")),
        (float)($data["pontos"] ?? 0),
        (float)($data["pontos_base"] ?? $data["base_points"] ?? $data["pontos"] ?? 0),
        remapNormalizePointMode($data["modo_pontos"] ?? $data["point_mode"] ?? "fixed"),
        $taskLinesJson,
        $uidLocal,
        $usuario
      ]);

      responseJson(["success" => true, "message" => "Timer ativo atualizado."]);
    }

    if ($action === "active_pause") {
      requiredFields($data, ["uid_local", "usuario"]);
      $stmt = $pdo->prepare("
        UPDATE timer_ativos
        SET segundos_acumulados = segundos_acumulados + CASE
              WHEN status = 'rodando' AND rodando_desde IS NOT NULL THEN TIMESTAMPDIFF(SECOND, rodando_desde, NOW())
              ELSE 0
            END,
            status = 'pausado',
            pausado_em = NOW(),
            rodando_desde = NULL
        WHERE uid_local = ? AND usuario = ?
      ");
      $stmt->execute([trim((string)$data["uid_local"]), trim((string)$data["usuario"])]);
      responseJson(["success" => true, "message" => "Timer pausado."]);
    }

    if ($action === "active_resume") {
      requiredFields($data, ["uid_local", "usuario"]);
      $uidLocal = trim((string)$data["uid_local"]);
      $usuario = trim((string)$data["usuario"]);

      remapPauseRunningActiveTimers($pdo, $usuario, $uidLocal);

      $stmt = $pdo->prepare("
        UPDATE timer_ativos
        SET status = 'rodando', rodando_desde = NOW(), pausado_em = NULL
        WHERE uid_local = ? AND usuario = ?
      ");
      $stmt->execute([$uidLocal, $usuario]);
      responseJson(["success" => true, "message" => "Timer retomado."]);
    }

    if ($action === "active_cancel") {
      requiredFields($data, ["uid_local", "usuario"]);
      $stmt = $pdo->prepare("DELETE FROM timer_ativos WHERE uid_local = ? AND usuario = ?");
      $stmt->execute([trim((string)$data["uid_local"]), trim((string)$data["usuario"])]);
      responseJson(["success" => true, "message" => "Timer cancelado."]);
    }

    if ($action === "active_finish") {
      requiredFields($data, ["uid_local", "usuario"]);
      $uidLocal = trim((string)$data["uid_local"]);
      $usuario = trim((string)$data["usuario"]);

      $pdo->beginTransaction();

      $stmt = $pdo->prepare("SELECT * FROM timer_ativos WHERE uid_local = ? AND usuario = ? LIMIT 1 FOR UPDATE");
      $stmt->execute([$uidLocal, $usuario]);
      $timer = $stmt->fetch();

      if (!$timer) {
        $pdo->rollBack();
        responseJson(["success" => false, "message" => "Timer ativo não encontrado."], 404);
      }

      $duracaoExtra = 0;
      if ($timer["status"] === "rodando" && !empty($timer["rodando_desde"])) {
        $stmt2 = $pdo->prepare("SELECT TIMESTAMPDIFF(SECOND, ?, NOW()) AS diff");
        $stmt2->execute([$timer["rodando_desde"]]);
        $duracaoExtra = max(0, (int)($stmt2->fetch()["diff"] ?? 0));
      }

      $duracaoFinal = max(1, (int)$timer["segundos_acumulados"] + $duracaoExtra);
      $fim = date("Y-m-d H:i:s");

      $basePoints = (float)($data["pontos_base"] ?? $data["base_points"] ?? $timer["base_points"] ?? $timer["pontos"] ?? 0);
      $pointMode = remapNormalizePointMode($data["modo_pontos"] ?? $data["point_mode"] ?? $timer["point_mode"] ?? "fixed");
      $timer["base_points"] = $basePoints;
      $timer["point_mode"] = $pointMode;
      $timer["pontos"] = remapCalculateTimerPoints($basePoints, $pointMode, $duracaoFinal);

      $timerId = remapInsertFinalTimer($pdo, $timer, $duracaoFinal, $fim);

      $stmt = $pdo->prepare("DELETE FROM timer_ativos WHERE uid_local = ? AND usuario = ?");
      $stmt->execute([$uidLocal, $usuario]);

      $pdo->commit();

      try { remapBumpUpdate($pdo, "supervisao"); } catch (Throwable $e) {}
      responseJson([
        "success" => true,
        "message" => "Timer finalizado.",
        "id" => $timerId,
        "duracao" => $duracaoFinal,
        "pontos" => (float)$timer["pontos"],
        "inicio" => $timer["iniciado_em"],
        "fim" => $fim
      ]);
    }

    if ($action === "start") {
      requiredFields($data, ["usuario"]);
      $tarefaId = isset($data["tarefa_id"]) && $data["tarefa_id"] !== null && $data["tarefa_id"] !== "" ? (int)$data["tarefa_id"] : null;
      $uidLocal = isset($data["uid_local"]) && $data["uid_local"] !== "" ? (string)$data["uid_local"] : null;
      $usuario = trim((string)$data["usuario"]);

      $stmt = $pdo->prepare("UPDATE timer SET status = 'pausado', pausado_em = NOW() WHERE usuario = ? AND status = 'rodando'");
      $stmt->execute([$usuario]);

      $stmt = $pdo->prepare("INSERT INTO timer (tarefa_id, uid_local, usuario, inicio, status, duracao) VALUES (?, ?, ?, NOW(), 'rodando', 0)");
      $stmt->execute([$tarefaId, $uidLocal, $usuario]);

      responseJson(["success" => true, "message" => "Timer iniciado.", "id" => (int)$pdo->lastInsertId()]);
    }

    if ($action === "pause") {
      requiredFields($data, ["timer_id"]);
      $stmt = $pdo->prepare("
        UPDATE timer
        SET status = 'pausado', pausado_em = NOW(), duracao = duracao + TIMESTAMPDIFF(SECOND, COALESCE(retomado_em, inicio), NOW())
        WHERE id = ? AND status = 'rodando'
      ");
      $stmt->execute([(int)$data["timer_id"]]);
      responseJson(["success" => true, "message" => "Timer pausado."]);
    }

    if ($action === "resume") {
      requiredFields($data, ["timer_id"]);
      $stmt = $pdo->prepare("UPDATE timer SET status = 'rodando', retomado_em = NOW() WHERE id = ? AND status = 'pausado'");
      $stmt->execute([(int)$data["timer_id"]]);
      responseJson(["success" => true, "message" => "Timer retomado."]);
    }

    if ($action === "stop") {
      requiredFields($data, ["timer_id"]);
      $stmt = $pdo->prepare("SELECT * FROM timer WHERE id = ? LIMIT 1");
      $stmt->execute([(int)$data["timer_id"]]);
      $timer = $stmt->fetch();

      if (!$timer) responseJson(["success" => false, "message" => "Timer não encontrado."], 404);

      $duracaoExtra = 0;
      if ($timer["status"] === "rodando") {
        $inicioCalculo = $timer["retomado_em"] ?: $timer["inicio"];
        $stmt2 = $pdo->prepare("SELECT TIMESTAMPDIFF(SECOND, ?, NOW()) AS diff");
        $stmt2->execute([$inicioCalculo]);
        $duracaoExtra = (int)$stmt2->fetch()["diff"];
      }

      $duracaoFinal = (int)$timer["duracao"] + $duracaoExtra;
      $stmt = $pdo->prepare("UPDATE timer SET status = 'finalizado', fim = NOW(), duracao = ? WHERE id = ?");
      $stmt->execute([$duracaoFinal, (int)$data["timer_id"]]);

      if (!empty($timer["tarefa_id"])) {
        $stmt = $pdo->prepare("UPDATE tarefas SET tempo_total = COALESCE(tempo_total, 0) + ? WHERE id = ?");
        $stmt->execute([$duracaoFinal, (int)$timer["tarefa_id"]]);
      }

      try { remapBumpUpdate($pdo, "supervisao"); } catch (Throwable $e) {}
      responseJson(["success" => true, "message" => "Timer finalizado.", "duracao" => $duracaoFinal]);
    }

    if ($action === "delete_by_uid") {
      requiredFields($data, ["uid_local"]);
      $uidLocal = trim($data["uid_local"]);

      $stmt = $pdo->prepare("DELETE FROM timer WHERE uid_local = ?");
      $stmt->execute([$uidLocal]);

      try { remapBumpUpdate($pdo, "supervisao"); } catch (Throwable $e) {}
      responseJson(["success" => true, "message" => "Registro excluído com sucesso."]);
    }

    responseJson(["success" => false, "message" => "Ação inválida."], 400);
  }

  responseJson(["success" => false, "message" => "Método não permitido."], 405);
} catch (Throwable $e) {
  if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
    $pdo->rollBack();
  }

  responseJson([
    "success" => false,
    "message" => "Erro no timer.php",
    "error" => $e->getMessage()
  ], 500);
}
?>
