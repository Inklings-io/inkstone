<?php
header( 'Content-Type: application/json');

require '../vendor/autoload.php';

$json = array( 'success' => true);

//TODO update this to mimic current 
if(!isset($_POST['me'])){
    header('HTTP/1.1 400 Invalid Request');
    exit();
}
$me = normalizeUrl($_POST['me']);


$micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($me);

$ch = curl_init($micropub_endpoint . (strpos($micropub_endpoint, '?') === false ? '?' : '&') . 'q=syndicate-to');

if (!$ch) {
    //$this->log->write('error with curl_init');
}

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
if(isset($_POST['token'])){
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $_POST['token'], 'Accept: application/json'));
} else {
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept: application/json'));
}

$response = curl_exec($ch);

//TODO check for return code from curl and return same

echo json_encode($response);
