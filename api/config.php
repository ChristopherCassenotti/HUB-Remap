<?php
$db_host = "#";
$db_name = "#";
$db_user = "#";
$db_pass = "#";

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  http_response_code(200);
  exit;
}

try {
  $pdo = new PDO(
    "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
    $db_user,
    $db_pass,
    [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]
  );
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "message" => "Erro ao conectar no banco.",
    "error" => $e->getMessage()
  ]);
  exit;
}

function getJsonInput() {
  $raw = file_get_contents("php://input");
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function responseJson($data, $code = 200) {
  http_response_code($code);
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

function requiredFields($data, $fields) {
  foreach ($fields as $field) {
    if (!isset($data[$field]) || trim((string)$data[$field]) === "") {
      responseJson([
        "success" => false,
        "message" => "Campo obrigatório ausente: " . $field
      ], 400);
    }
  }
}

function makeToken() {
  return bin2hex(random_bytes(32));
}

function getBearerToken() {
  $headers = getallheaders();

  if (isset($headers["Authorization"])) {
    $auth = $headers["Authorization"];
  } elseif (isset($headers["authorization"])) {
    $auth = $headers["authorization"];
  } else {
    return null;
  }

  if (preg_match('/Bearer\s(\S+)/', $auth, $matches)) {
    return $matches[1];
  }

  return null;
}

function getAuthUser($pdo) {
  $token = getBearerToken();
  if (!$token) return null;

  $stmt = $pdo->prepare("SELECT id, nome, email, cargo FROM usuarios WHERE token = ? LIMIT 1");
  $stmt->execute([$token]);
  return $stmt->fetch();
}
?>