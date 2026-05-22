<?php
require_once "config.php";
responseJson([
  "success" => true,
  "message" => "API conectada com sucesso.",
  "time" => date("Y-m-d H:i:s")
]);
?>