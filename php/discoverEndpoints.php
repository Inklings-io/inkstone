<?php
session_start();
header( 'Content-Type: application/json');

require '../vendor/autoload.php';

$json = array( 'success' => true);

if(!isset($_POST['me'])){
    $json['success'] = false;
    $json['error'] = 'please enter your url';
    echo json_encode($json);
    exit();
}
$me = normalizeUrl($_POST['me']);

$auth_endpoint = IndieAuth\Client::discoverAuthorizationEndpoint($me);
if(!$auth_endpoint){
    $json['success'] = false;
    $json['error'] = 'You do not seem to have a IndieAuth Endpoint.';
}

$json['auth_endpoint'] = $auth_endpoint ;

$micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($me);
if(!$micropub_endpoint){
    $json['success'] = false;
    $json['error'] = 'You do not seem to have a Micropub Endpoint.';
} else {
    $json['mp_endpoint'] = $micropub_endpoint;
}

echo json_encode($json);
