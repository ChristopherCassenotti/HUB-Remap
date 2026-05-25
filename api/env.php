<?php

function loadEnvFile($path) {
  if (!file_exists($path)) {
    return;
  }

  $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

  foreach ($lines as $line) {
    $line = trim($line);

    if ($line === '' || strpos($line, '#') === 0) {
      continue;
    }

    if (strpos($line, '=') === false) {
      continue;
    }

    list($key, $value) = explode('=', $line, 2);

    $key = trim($key);
    $value = trim($value);
    $value = trim($value, "\"'");

    $_ENV[$key] = $value;
    putenv($key . '=' . $value);
  }
}

function envValue($key, $default = null) {
  $value = $_ENV[$key] ?? getenv($key);

  if ($value === false || $value === null || $value === '') {
    return $default;
  }

  if ($value === 'true') return true;
  if ($value === 'false') return false;

  return $value;
}