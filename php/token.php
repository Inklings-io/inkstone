<?php
session_start();
header( 'Content-Type: application/json');

require '../vendor/autoload.php';

function getToken($me, $code, $redir, $client_id, $state = null)
{
    //look up user's token provider
    $token_endpoint = IndieAuth\Client::discoverTokenEndpoint($me);


    $post_array = array(
        'grant_type'    => 'authorization_code',
        'code'          => $code,
        'redirect_uri'  => $redir,
        'client_id'     => $client_id,
        'me'            => $me
    );
    if ($state) {
        $post_array['state'] = $state;
    }

    $post_data = http_build_query($post_array);

    $ch = curl_init($token_endpoint);

    if (!$ch) {
        //$this->log->write('error with curl_init');
    }

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);

    $response = curl_exec($ch);

    $results = array();
    parse_str($response, $results);

    return $results;
}


$json = array( 'success' => true);

if( !isset($_POST['me']) || !isset($_POST['code']) || !isset($_POST['client_id']) || !isset($_POST['state']) || !isset($_POST['redirect_uri'])) {
    $json['success'] = false;
    $json['error'] = 'Error with auth API in this app: some required data is missing';
} else {
    $me = normalizeUrl($_POST['me']);
    $code = $_POST['code'];
    $state = $_POST['state'];
    $client_id = $_POST['client_id'];
    $redir_url = $_POST['redirect_uri'];

    $token_results = getToken($me, $code, $redir_url, $client_id, $state);
    if (!$token_results || empty($token_results)) {
        $json['success'] = false;
        $json['error'] = 'Error getting Token';
    } else {
        $json['token'] = $token_results['access_token'];
        $json['scope'] = $token_results['scope'];
    }
}

echo json_encode($json);
