<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once "config.php";

$data = getJsonInput();

$email = trim($data["email"] ?? "");
$senha = trim($data["senha"] ?? "");
$nome = trim($data["nome"] ?? "");

if ($email === "" && $nome === "") {
  responseJson(["success" => false, "message" => "Informe e-mail ou nome."], 400);
}

if ($senha === "") {
  responseJson(["success" => false, "message" => "Informe a senha."], 400);
}

if ($email !== "") {
  $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ? LIMIT 1");
  $stmt->execute([$email]);
} else {
  $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE nome = ? LIMIT 1");
  $stmt->execute([$nome]);
}

$user = $stmt->fetch();

if (!$user) {
  responseJson(["success" => false, "message" => "Usuário não encontrado."], 401);
}

$ok = false;

if (!empty($user["senha"])) {
  if (password_verify($senha, $user["senha"])) {
    $ok = true;
  } elseif ($user["senha"] === $senha) {
    $ok = true;
  }
}

if (!$ok) {
  responseJson(["success" => false, "message" => "Senha incorreta."], 401);
}

$token = makeToken();
$stmt = $pdo->prepare("UPDATE usuarios SET token = ? WHERE id = ?");
$stmt->execute([$token, $user["id"]]);

responseJson([
  "success" => true,
  "message" => "Login realizado com sucesso.",
  "token" => $token,
  "user" => [
    "id" => (int)$user["id"],
    "nome" => $user["nome"],
    "email" => $user["email"],
    "cargo" => $user["cargo"]
  ]
]);
?>