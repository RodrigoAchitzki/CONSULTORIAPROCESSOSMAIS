<?php
// Registrar no banco de dados ou arquivo de log
$log = [
    'date' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'],
    'user_agent' => $_SERVER['HTTP_USER_AGENT']
];

file_put_contents('downloads.log', json_encode($log)."\n", FILE_APPEND);

// Resposta para o frontend
header('Content-Type: application/json');
echo json_encode(['status' => 'success']);
?>