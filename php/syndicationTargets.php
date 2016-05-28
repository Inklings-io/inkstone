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




$syn_arr = $_SESSION['syndication_' . $me];
if (!$syn_arr) {
    $micropub_endpoint = $_SESSION['micropub_' . $me];
    if (!$micropub_endpoint) {
        $micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($me);
        $_SESSION['micropub_' . $me] = $micropub_endpoint;
    }

    $ch = curl_init($micropub_endpoint . (strpos($micropub_endpoint, '?') === false ? '?' : '&') . 'q=syndicate-to');

    if (!$ch) {
        //$this->log->write('error with curl_init');
    }

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    if(isset($_POST['token'])){
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $_POST['token']));
    }


    /////////////////////////////////////////////////
    //TODO: once my hosting provider fixes its issue i can remove this
    //curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    /////////////////////////////////////////////////

    $response = curl_exec($ch);
    parse_str($response, $syn_arr);
    $_SESSION['syndication_' . $me] = $syn_arr;
}
if (!isset($syn_arr['syndicate-to'])) {
    $json['success'] = false;
    echo json_encode($json);
    //TODO else add some error message
    exit();
}

$json['targets'] = $syn_arr['syndicate-to'];

echo json_encode($json);