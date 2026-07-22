<?php
declare(strict_types=1);

// All website forms are delivered here, as requested.
$recipient = 'gayle@gmail.com';
$allowedRedirects = [
    'index.html?submitted=1',
    'about.html?submitted=1',
    'coaching.html?submitted=1',
    'books.html?submitted=1',
    'speaking.html?submitted=1',
    'speaking.html?submitted=1#booking-form',
    'contact.html?submitted=1',
    'cart.html?submitted=1',
    'checkout.html?submitted=1'
];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: contact.html');
    exit;
}

// Honeypot: bots often fill hidden fields.
if (!empty($_POST['website'] ?? '')) {
    http_response_code(204);
    exit;
}

$formType = trim((string)($_POST['form_type'] ?? 'GGM Coaching website enquiry'));
$redirect = trim((string)($_POST['redirect'] ?? 'contact.html?submitted=1'));
if (!in_array($redirect, $allowedRedirects, true)) {
    $redirect = 'contact.html?submitted=1';
}

$fields = [];
$replyTo = '';
foreach ($_POST as $key => $value) {
    if (in_array($key, ['website', 'form_type', 'redirect'], true)) {
        continue;
    }
    $label = preg_replace('/[^a-zA-Z0-9 _&+\-]/', '', (string)$key) ?: 'Field';
    $clean = is_array($value) ? implode(', ', array_map('strval', $value)) : trim((string)$value);
    $clean = str_replace(["\r\n", "\r"], "\n", $clean);
    $fields[] = $label . ":\n" . $clean;
    if (strtolower($label) === 'email' && filter_var($clean, FILTER_VALIDATE_EMAIL)) {
        $replyTo = $clean;
    }
}

$subject = preg_replace('/[\r\n]+/', ' ', $formType);
$body = "A new enquiry was submitted through Drgail.co.za.\n\n" . implode("\n\n", $fields);
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: GGM Coaching Website <no-reply@drgail.co.za>'
];
if ($replyTo !== '') {
    $headers[] = 'Reply-To: ' . $replyTo;
}

$sent = @mail($recipient, $subject, $body, implode("\r\n", $headers));
$status = $sent ? 'sent' : 'failed';
$fragment = '';
if (str_contains($redirect, '#')) {
    [$redirect, $fragmentPart] = explode('#', $redirect, 2);
    $fragment = '#' . $fragmentPart;
}
$separator = str_contains($redirect, '?') ? '&' : '?';
header('Location: ' . $redirect . $separator . 'status=' . $status . $fragment);
exit;
