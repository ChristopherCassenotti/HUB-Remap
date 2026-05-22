<?php
require_once "config.php";

$user = getAuthUser($pdo);

if ($user) {
  $stmt = $pdo->prepare("UPDATE usuarios SET token = NULL WHERE id = ?");
  $stmt->execute([$user["id"]]);
}

responseJson(["success" => true, "message" => "Logout realizado."]);
?>