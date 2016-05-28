<?php
session_start();
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
if(!$auth_endponit){
    $auth_endpoint = DEFAULT_AUTH_ENDPOINT;
}

$state = rand();
$_SESSION['state'] = $state;

$data_array = array(
    'me' => $me,
    'redirect_uri' => CLIENT_URL.'/php/auth.php',
    'response_type' => 'id',
    'state' => $state,
    'client_id' => CLIENT_URL,
    'scope' => SCOPE,
    'response_type' => 'code');

$get_data = http_build_query($data_array);

$json['auth_endpoint'] = $auth_endpoint . (strpos($auth_endpoint, '?') === false ? '?' : '&').$get_data;

//$token_endpoint = IndieAuth\Client::discoverTokenEndpoint($me);
//if($token_endpoint){
    //$json['token_endpoint'] = $token_endpoint;
//} else {
    //$json['token_endpoint'] = DEFAULT_TOKEN_ENDPOINT;
//}

$micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($me);
if(!$micropub_endpoint){
    $json['success'] = false;
} else {
    $json['mp_endpoint'] = $micropub_endpoint;
}


echo json_encode($json);
