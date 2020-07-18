<?php
//Step one
header('HTTP/1.0 200 OK');
flush();
define('SANDBOX_MODE', true);
$pfHost = SANDBOX_MODE ? 'sandbox.payfast.co.za' : 'www.payfast.co.za';

//Security check one
// Posted variables from ITN
$pfData = $_POST;

// Construct variables 
foreach ($pfData as $key => $val) {
    if ($key != 'signature') {
        $pfParamString .= $key . '=' . urlencode($val) . '&';
    }
}

// Remove the last '&' from the parameter string
$pfParamString = substr($pfParamString, 0, -1);
$pfTempParamString = $pfParamString;
// Passphrase stored in website database
$passPhrase = '';

if (!empty($passPhrase)) {
    $pfTempParamString .= '&passphrase=' . urlencode($passPhrase);
}
$signature = md5($pfTempParamString);

//Security check two
if ($signature != $pfData['signature']) {
    die('Invalid Signature');
}
$validHosts = array(
    'www.payfast.co.za',
    'sandbox.payfast.co.za',
    'w1w.payfast.co.za',
    'w2w.payfast.co.za',
);

$validIps = array();

foreach ($validHosts as $pfHostname) {
    $ips = gethostbynamel($pfHostname);
    if ($ips !== false) {
        $validIps = array_merge($validIps, $ips);
    }
}

// Remove duplicates
$validIps = array_unique($validIps);

if (!in_array($_SERVER['REMOTE_ADDR'], $validIps)) {
    die('Source IP not Valid');
}

//Security check three
$cartTotal = 10; // This amount needs to be sourced from your application
if (abs(floatval($cartTotal) - floatval($pfData['amount_gross'])) > 0.01) {
    die('Amounts Mismatch');
}

//Security check four

// Variable initialization
$url = 'https://' . $pfHost . '/eng/query/validate';

// Create default cURL object
$ch = curl_init();

// Set cURL options - Use curl_setopt for greater PHP compatibility
// Base settings
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 1);

// Standard settings
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $pfParamString);

// Execute CURL
$response = curl_exec($ch);
curl_close($ch);

$lines = explode("\r\n", $response);
$verifyResult = trim($lines[0]);

if (strcasecmp($verifyResult, 'VALID') != 0) {
    die('Data not valid');
}
