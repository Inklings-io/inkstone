<?php
session_start();
header( 'Content-Type: application/json');

require '../vendor/autoload.php';

$encoding = 'form';
try {
	$input_post_data = json_decode(file_get_contents('php://input'), true);
	$encoding = 'JSON';
} catch (Exception $e){
	$input_post_data = $_POST;
}


$me = getMe($input_post_data);
$bearer_string = getBearerString();
$micropub_endpoint = getMicropubEndpoint($me);

$request_url = $micropub_endpoint;
if(isset($_GET['q']) && !empty($_GET['q'])){
    $request_url = $request_url . (strpos($request_url, '?') === false ? '?' : '&') . 'q='.$_GET['q'];
}
$additional_headers = array();
if($_SERVER['CONTENT_TYPE']){
    $additional_headers[] = 'Content-Type:'. $_SERVER['CONTENT_TYPE'];
}
if($_SERVER['HTTP_ACCEPT']){
    $additional_headers[] = 'Accept:'. $_SERVER['HTTP_ACCEPT'];
}

$post_data = '';
if($encoding == 'form'){
	$post_data = http_build_query($input_post_data);
} else {
	$post_data = json_encode($input_post_data);
}

$response = standardPost($request_url, $bearer_string, $post_data, $additional_headers);

returnResponse($response);


