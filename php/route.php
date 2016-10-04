<?php
session_start();
header( 'Content-Type: application/json');

require '../vendor/autoload.php';

$json = array( 'success' => true);

if(!isset($_POST['mp-me'])){
    header('HTTP/1.1 400 Invalid Request');
    exit();
}
//this should be the only difference if we are sending to our local copy and not the live user micropub endpoint dierectly
// so its important that we unset mp-me when we forward the request
$me = normalizeUrl($_POST['mp-me']);
unset($_POST['mp-me']);

if ( (!isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']) || empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) && !isset($headers['Authorization'])) {
    header('HTTP/1.1 400 Invalid Request');
    //header('HTTP/1.1 401 Unauthorized');
    exit();
}

// NOTE: we use $bearer_string not $token here as this still include the "Bearer " part, we would just be adding it back anyway
$bearer_string = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
if (!$bearer_string) {
    $bearer_string = $headers['Authorization'];
}



$micropub_endpoint = $_SESSION['micropub_' . $me];
if (!$micropub_endpoint) {
    $micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($me);
    $_SESSION['micropub_' . $me] = $micropub_endpoint;
}

$ch = curl_init($micropub_endpoint);

if (!$ch) {
    header('HTTP/1.1 500 Server Error');
    exit();
}

$post_data = http_build_query($_POST);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: ' . $bearer_string));
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);

$response = curl_exec($ch);
//TODO just return the result directly
$result = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (in_array($result, array(200,201,204,301,302))) {
    if (in_array($result, array(201,301,302))) {


		$headers = array();

		$header_text = substr($response, 0, strpos($response, "\r\n\r\n"));

		foreach (explode("\r\n", $header_text) as $i => $line){
			if ($i === 0)
				$headers['http_code'] = $line;
			else
			{
				list ($key, $value) = explode(': ', $line);

				$headers[$key] = $value;
			}
		}

        //$target_url = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
        $json['url'] = $headers['Location'];
    }
} else {
    $json['error'] = 'Micropub Endpoint returned code ' . $result . '.';
    $json['success'] = false;
}

echo json_encode($json);
