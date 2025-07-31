<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $uploadDir = 'uploads/';
  if (!is_dir($uploadDir)) mkdir($uploadDir);

  $file = $_FILES['video'];
  $name = basename($file['name']);
  $path = $uploadDir . $name;

  if (move_uploaded_file($file['tmp_name'], $path)) {
    header("Location: index.html?file=" . urlencode($name));
    exit;
  } else {
    echo "Erro ao enviar o vídeo.";
  }
}
?>
