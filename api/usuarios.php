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

try { $pdo->exec("ALTER TABLE usuarios ADD COLUMN salario DECIMAL(10,2) DEFAULT 0"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE usuarios ADD COLUMN horas_mensais INT DEFAULT 176"); } catch (Exception $e) {}
function emailPrimeiroNome($nome) {
  $first = explode(' ', trim($nome))[0] ?: 'usuario';
  $slug = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', iconv('UTF-8','ASCII//TRANSLIT',$first)));
  if (!$slug) $slug = 'usuario';
  return $slug . '@remapdigital.com';
}
$method = $_SERVER["REQUEST_METHOD"];
if ($method === "GET") {
  $stmt = $pdo->query("SELECT id, nome, email, cargo, salario, horas_mensais, criado_em FROM usuarios ORDER BY nome ASC");
  responseJson(["success" => true, "data" => $stmt->fetchAll()]);
}
if ($method === "POST") {
  $data = getJsonInput(); requiredFields($data, ["nome"]);
  $nome = trim($data["nome"]);
  $email = trim($data["email"] ?? '') ?: emailPrimeiroNome($nome);
  $senha = trim($data["senha"] ?? '123456');
  $cargo = trim($data["cargo"] ?? "Colaborador");
  $salario = (float)($data["salario"] ?? 0);
  $horas = (int)($data["horas_mensais"] ?? $data["monthHours"] ?? 176);
  $stmt = $pdo->prepare("INSERT INTO usuarios (nome,email,senha,cargo,salario,horas_mensais) VALUES (?,?,?,?,?,?)");
  $stmt->execute([$nome,$email,$senha,$cargo,$salario,$horas]);
  responseJson(["success"=>true,"message"=>"Usuário criado.","id"=>(int)$pdo->lastInsertId()]);
}
if ($method === "PUT") {
  $data = getJsonInput(); requiredFields($data, ["id"]);
  $id = (int)$data["id"];
  $fields=[]; $params=[];
  foreach (["nome","email","cargo"] as $field) if (array_key_exists($field,$data)) { $fields[]="$field=?"; $params[]=trim((string)$data[$field]); }
  if (array_key_exists("salario",$data)) { $fields[]="salario=?"; $params[]=(float)$data["salario"]; }
  if (array_key_exists("horas_mensais",$data)) { $fields[]="horas_mensais=?"; $params[]=(int)$data["horas_mensais"]; }
  if (isset($data["senha"]) && trim($data["senha"]) !== "") { $fields[]="senha=?"; $params[]=trim($data["senha"]); }
  if (!$fields) responseJson(["success"=>false,"message"=>"Nada para atualizar."],400);
  $params[]=$id;
  $stmt=$pdo->prepare("UPDATE usuarios SET ".implode(', ',$fields)." WHERE id=?"); $stmt->execute($params);
  responseJson(["success"=>true,"message"=>"Usuário atualizado."]);
}
if ($method === "DELETE") {
  $id=(int)($_GET["id"] ?? 0); if(!$id) responseJson(["success"=>false,"message"=>"ID obrigatório."],400);
  $stmt=$pdo->prepare("DELETE FROM usuarios WHERE id=?"); $stmt->execute([$id]);
  responseJson(["success"=>true,"message"=>"Usuário removido."]);
}
responseJson(["success"=>false,"message"=>"Método não permitido."],405);
?>