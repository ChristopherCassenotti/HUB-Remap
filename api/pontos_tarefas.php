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

$pdo->exec("CREATE TABLE IF NOT EXISTS pontos_tarefas (id INT AUTO_INCREMENT PRIMARY KEY, colaborador VARCHAR(120) NOT NULL, cliente VARCHAR(160) DEFAULT '', tarefa VARCHAR(255) NOT NULL, pontos INT NOT NULL DEFAULT 0, data_ref DATE NOT NULL, criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
$method=$_SERVER['REQUEST_METHOD'];
if($method==='GET'){
  $col=trim($_GET['colaborador'] ?? '');
  if($col){ $stmt=$pdo->prepare("SELECT * FROM pontos_tarefas WHERE colaborador=? ORDER BY data_ref DESC,id DESC"); $stmt->execute([$col]); }
  else { $stmt=$pdo->query("SELECT * FROM pontos_tarefas ORDER BY data_ref DESC,id DESC"); }
  responseJson(["success"=>true,"data"=>$stmt->fetchAll()]);
}
if($method==='POST'){
  $d=getJsonInput(); requiredFields($d,["colaborador","tarefa","pontos"]);
  $stmt=$pdo->prepare("INSERT INTO pontos_tarefas (colaborador,cliente,tarefa,pontos,data_ref) VALUES (?,?,?,?,?)");
  $stmt->execute([trim($d['colaborador']), trim($d['cliente'] ?? ''), trim($d['tarefa']), (int)$d['pontos'], $d['data'] ?? $d['data_ref'] ?? date('Y-m-d')]);
  remapBumpUpdate($pdo, "supervisao");
  responseJson(["success"=>true,"message"=>"Ponto salvo","id"=>(int)$pdo->lastInsertId()]);
}
if($method==='DELETE'){
  $id=(int)($_GET['id'] ?? 0); if(!$id) responseJson(["success"=>false,"message"=>"ID obrigatório"],400);
  $stmt=$pdo->prepare("DELETE FROM pontos_tarefas WHERE id=?"); $stmt->execute([$id]);
  remapBumpUpdate($pdo, "supervisao");
  responseJson(["success"=>true,"message"=>"Ponto removido"]);
}
responseJson(["success"=>false,"message"=>"Método não permitido"],405);
?>