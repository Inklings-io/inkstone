<?php
session_start();
header( 'Content-Type: application/json');

require '../vendor/autoload.php';

//TODO put this in configs?
$media_types = ['photo', 'video', 'audio'];

$me = getMe();
$bearer_string = getBearerString();
$micropub_endpoint = getMicropubEndpoint($me);



$has_media_set = false;
foreach($media_types as $media_type){
    if(isset($_POST[$media_type])){
        $has_media_set = true;
    }
}

$post_array = $_POST;
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
                        $media_object = json_decode($media_object, true);
                        $media_loc = uploadToMediaEndpoint($config['media-endpoint'],$bearer_string,  $media_object);
                        if($media_loc){
                            $media_urls[] = $media_loc;
                        }
                        
                    }
                    $post_array[$media_type] = $media_urls; 
                } else {
                    $media_data = json_decode($media_data, true);
                    $post_array[$media_type] = uploadToMediaEndpoint($config['media-endpoint'],$bearer_string,  $media_data);
                }

            }
        }

    } //end foreach media type 
}

$post_data = http_build_query($post_array);

$response = standardPost($micropub_endpoint, $bearer_string, $post_data);
returnResponse($response);

