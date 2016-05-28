<?php
session_start();
header( 'Content-Type: application/json');

require '../vendor/autoload.php';

$json = array( 'success' => true);

if(!isset($_POST['me']) || !isset($_POST['token'])){
    $json['success'] = false;
    $json['error'] = 'URL or token seems to be missing';
    echo json_encode($json);
    exit();
}
$me = normalizeUrl($_POST['me']);
$token = $_POST['token'];

unset($_POST['me']);
unset($_POST['token']);


$post_data_array = $_POST;

if (!isset($post_data_array['h']) || empty($post_data_array['h'])) {
    $post_data_array['h'] = 'entry';
}

if (isset($post_data_array['mp-type']) && $post_data_array['mp-type'] == 'article') {
    $post_data_array['content']  = html_entity_decode($post_data_array['content']);
}

$syn_to_hack = '';
if (isset($post_data_array['syndicate-to'])) {
    $syn_to_hack = 'syndicate-to=' . urlencode(implode(',', $post_data_array['syndicate-to'])) . '&';
}

$post_data = $syn_to_hack . http_build_query($post_data_array);


$micropub_endpoint = $_SESSION['micropub_' . $me];
if (!$micropub_endpoint) {
    $micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($me);
    $_SESSION['micropub_' . $me] = $micropub_endpoint;
}

$ch = curl_init($micropub_endpoint);

if (!$ch) {
    //$this->log->write('error with curl_init');
    $json['success'] = false;
    $json['error'] = 'Failure posting to your micropub endpoint.';
    echo json_encode($json);
    //TODO else add some error message
    exit();
}

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $token));
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);

/////////////////////////////////////////////////
//TODO: once my hosting provider fixes its issue i can remove this
//curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
/////////////////////////////////////////////////

$response = curl_exec($ch);
$result = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if (in_array($result, array(200,201,204,301,302))) {
    if (in_array($result, array(201,301,302))) {
        $target_url = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
        $json['url'] = $target_url;
    }
} else {
    $json['error'] = 'Micropub Endpoint returned code ' . $result . '.';
    $json['success'] = false;
}

echo json_encode($json);
