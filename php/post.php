<?php
session_start();
header( 'Content-Type: application/json');

require '../vendor/autoload.php';

//TODO put this in configs?
$media_types = ['photo', 'video', 'audio'];

$encoding = 'form';
try {
	$input_post_data = json_decode(file_get_contents('php://input'), true);
    if(empty($input_post_data)){
        $input_post_data = $_POST;
    } else {
        $encoding = 'JSON';
    }
} catch (Exception $e){
	$input_post_data = $_POST;
}


$me = $input_post_data['mp-me'];
unset($input_post_data['mp-me']);
$bearer_string = getBearerString();
$micropub_endpoint = getMicropubEndpoint($me);

debug_log($micropub_endpoint);
$has_media_set = false;
foreach($media_types as $media_type){
    if(isset($input_post_data[$media_type])){
        $has_media_set = true;
    }
}

$post_array = $input_post_data;
if( $has_media_set ) {

    //get config
    $request_url = $micropub_endpoint;
    $request_url = $request_url . (strpos($request_url, '?') === false ? '?' : '&') . 'q=config';

    $response = standardPost($request_url, $bearer_string);
    $config = json_decode($response['body'], true);

    //TODO we need a way to determine if the given item was just a URL or JSON
    foreach($media_types as $media_type){
        if(isset($post_array[$media_type])){
            $media_data = $post_array[$media_type];

            if(!isset($config['media-endpoint'])){
                if(is_array($media_data)){
                    $post_array[$media_type] = array();
                    foreach($media_data as $media_object){
                        $post_array[$media_type][] = json_decode($media_object, true);

                    }

                } else { //not at array
                    $post_array[$media_type] = json_decode($media_data, true);
                }

                //TODO: send form-encoded media

            } else { //we have a media endpoint

                if(is_array($media_data)){
                    $media_urls = array();
                    foreach($media_data as $media_object){
                        if(!is_array($media_object)){
                            $media_object = json_decode($media_object, true);
                        }
                        //debug_log($media_object['src']);
                        $media_loc = uploadToMediaEndpoint($config['media-endpoint'],$bearer_string,  $media_object, $encoding == 'JSON');
                        if($media_loc){
                            $media_urls[] = $media_loc;
                        }
                        
                    }
                    //if(sizeof($media_urls) == 1){
                        //$post_array[$media_type] = $media_urls[0]; 
                    //} else {
                        $post_array[$media_type] = $media_urls; 
                    //}

                } else {
                    $media_data = json_decode($media_data, true);
                    $post_array[$media_type] = uploadToMediaEndpoint($config['media-endpoint'],$bearer_string,  $media_data, $encoding == 'JSON');
                }

            }
        }

    } //end foreach media type 
}

$post_data = '';
$additional_headers = array();
if($encoding == 'form'){
    //debug_log('form');
    //debug_log($post_array);
	$post_data = http_build_query($post_array);
    $post_data = preg_replace('/%5B[0-9]+%5D/simU', '[]', $post_data);
    //debug_log($post_data);
    $additional_headers[] = 'Content-Type: application/x-www-form-urlencoded';
} else {
    //debug_log(print_r($post_array,true));
	$post_data = json_encode(transform_json_post($post_array));
    //debug_log($post_data);
    $additional_headers[] = 'Content-Type: application/json';
}

$response = standardPost($micropub_endpoint, $bearer_string, $post_data, $additional_headers);
returnResponse($response);

