<?php
session_start();
header( 'Content-Type: application/json');

require '../vendor/autoload.php';

$me = getMe();
$bearer_string = getBearerString();
$micropub_endpoint = getMicropubEndpoint($me);

$request_url = $micropub_endpoint;
if(isset($_GET['q']) && !empty($_GET['q'])){
    $request_url = $request_url . (strpos($request_url, '?') === false ? '?' : '&') . 'q='.$_GET['q'];
}

$post_data = http_build_query($_POST);
$response = standardPost($request_url, $bearer_string, $post_data);

returnResponse($response);


