<?php

function confirmAuth($me, $code, $redir, $state = null)
{

    $client_id = CLIENT_URL;

    //look up user's auth provider
    $auth_endpoint = IndieAuth\Client::discoverAuthorizationEndpoint($me);

    $post_array = array(
        'code'          => $code,
        'redirect_uri'  => $redir,
        'client_id'     => $client_id
    );
    if ($state) {
        $post_array['state'] = $state;
    }

    $post_data = http_build_query($post_array);

    $ch = curl_init($auth_endpoint);

    if (!$ch) {
        //$this->log->write('error with curl_init');
    }

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);

    $response = curl_exec($ch);

    $results = array();
    parse_str($response, $results);
    //$this->log->write('endpoint_response: '.$response);
    //$this->log->write(print_r($results, true));

    $results['me'] = normalizeUrl($results['me']);

    $trimmed_me = trim($me, '/');
    //echo '1: ' .$trimmed_me;
    $trimmed_result_me = trim($results['me'], '/');
    //echo '2: '.$trimmed_result_me;

    if ($state) {
        return ($trimmed_result_me == $trimmed_me && $state == $_SESSION['state']);
    } else {
        return $trimmed_result_me == $trimmed_me ;
    }

}


function getToken($me, $code, $redir, $state = null)
{

    $client_id = CLIENT_URL;

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

    //$this->log->write(print_r($results, true));

    return $results;
}


function normalizeUrl($url)
{
    $url = trim($url);
    if (strpos($url, 'http') !== 0) {
        $url = 'http://' . $url;
    }
    return $url;
}
