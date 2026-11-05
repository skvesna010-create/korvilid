<?php
// Обработчик заявок Корвилид.
// 1) Укажите почту, на которую должны приходить заявки.
$TO = 'hello@korvilid.ru';   // ← замените на свою почту
// 2) Заявки также сохраняются в файл leads/leads.csv (папка закрыта от просмотра через .htaccess).

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['ok'=>false,'error'=>'method']); exit; }
if (!empty($_POST['website'])) { echo json_encode(['ok'=>true]); exit; } // ловушка для ботов

function clean($v, $len) { return mb_substr(trim(strip_tags((string)$v)), 0, $len); }

$name    = clean($_POST['name'] ?? '', 80);
$phone   = clean($_POST['phone'] ?? '', 30);
$site    = clean($_POST['site'] ?? '', 200);
$service = clean($_POST['service'] ?? '', 60);
$comment = clean($_POST['comment'] ?? '', 1000);
$consent = !empty($_POST['consent']);

if ($name === '' || strlen(preg_replace('/\D/', '', $phone)) < 10 || !$consent) {
  echo json_encode(['ok'=>false,'error'=>'validation']); exit;
}

$date = date('Y-m-d H:i:s');
$ip   = $_SERVER['REMOTE_ADDR'] ?? '';

// Сохранение в CSV (фиксируем и факт согласия — пригодится для 152-ФЗ)
$dir = __DIR__ . '/leads';
if (!is_dir($dir)) { mkdir($dir, 0750, true); }
if (!file_exists($dir . '/.htaccess')) { file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n"); }
$fp = fopen($dir . '/leads.csv', 'a');
if ($fp) {
  fputcsv($fp, [$date, $name, $phone, $site, $service, $comment, 'согласие: да', $ip], ';');
  fclose($fp);
}

// Письмо
$subject = '=?UTF-8?B?' . base64_encode('Новая заявка с korvilid.ru: ' . $service) . '?=';
$body = "Дата: $date\nИмя: $name\nТелефон: $phone\nСайт/Авито: $site\nУслуга: $service\nКомментарий: $comment\nСогласие на обработку ПДн: да\n";
$headers = "From: Korvilid <noreply@korvilid.ru>\r\nContent-Type: text/plain; charset=utf-8\r\n";
$sent = @mail($TO, $subject, $body, $headers);

echo json_encode(['ok' => true, 'mail' => (bool)$sent]);
