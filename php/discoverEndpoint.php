<?php
header( 'Content-Type: application/json');

require '../vendor/autoload.php';

$json = array( 'success' => true);

if(!isset($_POST['me'])){
    $json['success'] = false;
    echo json_encode($json);
    //TODO else add some error message
    exit();
}
$me = normalizeUrl($_POST['me']);

$auth_endpoint = IndieAuth\Client::discoverAuthorizationEndpoint($me);
if($auth_endponit){
    $json['auth_endpoint'] = $auth_endpoint;
} else {
    $json['auth_endpoint'] = DEFAULT_AUTH_ENDPOINT;
}

$token_endpoint = IndieAuth\Client::discoverTokenEndpoint($me);
if($token_endpoint){
    $json['token_endpoint'] = $token_endpoint;
} else {
    $json['token_endpoint'] = DEFAULT_TOKEN_ENDPOINT;
}

$micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($me);
if(!$micropub_endpoint){
    $json['success'] = false;
} else {
    $json['mp_endpoint'] = $micropub_endpoint;
}


echo json_encode($json);
