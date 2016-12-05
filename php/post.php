<?php
session_start();
header( 'Content-Type: application/json');

require '../vendor/autoload.php';

//TODO put this in configs?
$media_types = ['photo', 'video', 'audio'];


if(!isset($_POST['mp-me'])){
    header('HTTP/1.1 400 Invalid Request');
    exit();
}
//this should be the only difference if we are sending to our local copy and not the live user micropub endpoint dierectly
// so its important that we unset mp-me when we forward the request
$me = normalizeUrl($_POST['mp-me']);
unset($_POST['mp-me']);

if ( 
    (!isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']) || empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) 
    && !isset($headers['Authorization'])
    && (!isset($_SERVER['HTTP_AUTHORIZATION']) || empty($_SERVER['HTTP_AUTHORIZATION'])) 
) {
    header('HTTP/1.1 400 Invalid Request');
    //header('HTTP/1.1 401 Unauthorized');
    exit();
}

// NOTE: we use $bearer_string not $token here as this still include the "Bearer " part, we would just be adding it back anyway
$bearer_string = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
if (!$bearer_string) {
    $bearer_string = $headers['Authorization'];
}
$bearer_string = $_SERVER['HTTP_AUTHORIZATION'];
if (!$bearer_string) {
    $bearer_string = $headers['Authorization'];
}



$micropub_endpoint = $_SESSION['micropub_' . $me];
if (!$micropub_endpoint) {
    $micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($me);
    $_SESSION['micropub_' . $me] = $micropub_endpoint;
}

$has_media_set = false;
foreach($media_types as $media_type){
    if(isset($_POST[$media_type])){
        $has_media_set = true;
    }
}

if( $has_media_set ) {

    //get config
    $request_url = $micropub_endpoint;
    $request_url = $request_url . (strpos($request_url, '?') === false ? '?' : '&') . 'q=config';

    $ch = curl_init($request_url);

    if (!$ch) {
        header('HTTP/1.1 500 Server Error');
        exit();
    }

    //$post_data = http_build_query($_POST);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    //curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: ' . $bearer_string));
    //curl_setopt($ch, CURLOPT_HEADER, true);
    //curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);

    $response = curl_exec($ch);

    //should use header length
    //$header_text = substr($response, 0, strpos($response, "\r\n\r\n"));
    //$body_text = substr($response, strlen($header_text));

    $config = json_decode($response, true);

    foreach($media_types as $media_type){
        if(isset($_POST[$media_type])){
            $media_data = $_POST[$media_type];

            if(!isset($config['media-endpoint'])){
                if(is_array($media_data)){
                    $_POST[$media_type] = array();
                    foreach($media_data as $media_object){
                        $decoded_object = json_decode($media_object, true);
                        $_POST[$media_type][] = $decoded_object['src'];

                    }

                } else { //not at array
                    $decoded_object = json_decode($media_data, true);
                    $_POST[$media_type][] = $decoded_object['src'];
                }

            } else { //we have a media endpoint

                if(is_array($media_data)){
                    $media_urls = array();
                    foreach($media_data as $media_object){
                        $media_object = json_decode($media_object, true);
                        $media_loc = uploadToMediaEndpoint($config['media-endpoint'],$bearer_string,  $media_object);
                        if($media_loc){
                            $media_urls[] = $media_loc;
                        }
                        
                    }
                } else {
                    $media_data = json_decode($media_data, true);
                    $media_urls = uploadToMediaEndpoint($config['media-endpoint'],$bearer_string,  $media_data);
                }

                $_POST[$media_type] = $media_urls; 
            }
        }

        //TODO create objects on media-endpoint

    } //end foreach media type 
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
//$result = curl_getinfo($ch, CURLINFO_HTTP_CODE);


//$headers = array();

//should use header length
$header_text = substr($response, 0, strpos($response, "\r\n\r\n"));
$body_text = substr($response, strlen($header_text));

foreach (explode("\r\n", $header_text) as $i => $line){

    if(
        preg_match('/^content-type:/i', $line)
        || preg_match('/^http\//i', $line)
        || preg_match('/^location/i', $line)
        || preg_match('/^content-length/i', $line)
    ){
        header($line);
    }

    /*
    if ($i === 0)
        $headers['http_code'] = $line;
    else
    {
        list ($key, $value) = explode(': ', $line);

        $headers[$key] = $value;
    }
     */
}
echo $body_text;

