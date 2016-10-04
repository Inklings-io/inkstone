<?php

$micropub_endpoint = 'http://127.0.0.1/';
$_POST = ['test' => 1];

$ch = curl_init($micropub_endpoint);

if (!$ch) {
    header('HTTP/1.1 500 Server Error');
    exit();
}

$post_data = http_build_query($_POST);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);

$response = curl_exec($ch);

$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);

$header = substr($response, 0, $header_size);
$body = substr($response, $header_size);


$headers = explode("\n", $header);

foreach($headers as $header_line){
    if(!empty($header_line)){
        header($header_line);
    }
}


echo $body;
