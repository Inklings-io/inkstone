<?php
session_start();
header( 'Content-Type: application/json');

require '../vendor/autoload.php';

$encoding = 'form';
try {
	$input_post_data = json_decode(file_get_contents('php://input'), true);
    if(!empty($input_post_data)){
        $encoding = 'JSON';
    } else {
        $input_post_data = $_POST;
    }
} catch (Exception $e){
	$input_post_data = $_POST;
}


$me = $input_post_data['mp-me'];
$bearer_string = getBearerString();
$micropub_endpoint = getMicropubEndpoint($me);

$request_url = $micropub_endpoint;

if(isset($_GET) && !empty($_GET)){
    $request_url = $request_url . (strpos($request_url, '?') === false ? '?' : '&') . http_build_query($_GET);
}

$additional_headers = array();
if($_SERVER['CONTENT_TYPE']){
    $additional_headers[] = 'Content-Type:'. $_SERVER['CONTENT_TYPE'];
}
if($_SERVER['HTTP_ACCEPT']){
    $additional_headers[] = 'Accept:'. $_SERVER['HTTP_ACCEPT'];
}

$response = standardPost($request_url, $bearer_string, null, $additional_headers);

returnResponse($response);


