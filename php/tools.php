<?php

function normalizeUrl($url)
{
    $url = trim($url);
    if (strpos($url, 'http') !== 0) {
        $url = 'http://' . $url;
    }
    return $url;
}

function getMe()
{
    if(!isset($_POST['mp-me'])){
        header('HTTP/1.1 400 Invalid Request');
        exit();
    }
    //this should be the only difference if we are sending to our local copy and not the live user micropub endpoint dierectly
    // so its important that we unset mp-me when we forward the request
    $me = normalizeUrl($_POST['mp-me']);
    unset($_POST['mp-me']);

    return $me;
}

function getBearerString()
{
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

    return $bearer_string;
}

function getMicropubEndpoint($me)
{
    $micropub_endpoint = $_SESSION['micropub_' . $me];
    if (!$micropub_endpoint) {
        $micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($me);
        $_SESSION['micropub_' . $me] = $micropub_endpoint;
    }
    return $micropub_endpoint;
}


function uploadToMediaEndpoint($media_endpoint, $bearer_string, $media_data, $return_alt_obj = false){

    $split = explode(';base64,', $media_data['src']);
    $encoded_data = str_replace(' ','+',$split[1]);
    $filedata = base64_decode($encoded_data);

	$filename = $media_data['name'];
	$filesize = $media_data['size'];

	if ($filedata != '')
	{

        // generate safe boundary
        do {
            $boundary = "---------------------" . md5(mt_rand() . microtime());
        } while (preg_match("/{$boundary}/", $filename.$filedata));
    

        $headers = array('Content-Type:multipart/form-data; boundary='.$boundary,
                         'Authorization: ' . $bearer_string
            ); // cURL headers for file uploading

        $postfields = '--'.$boundary.                                                           "\n" .
                      'Content-Disposition: form-data; name="file"; filename="'.$filename.'"' . "\n" .
                      'Content-Type: '.$media_data['type'] .                                    "\n" .
                      'Content-Transfer-Encoding: binary' .                                     "\n" .
                                                                                                "\n" .
                      $filedata .                                                               "\n" .
                      '--'.$boundary.'--';


		$ch = curl_init();
		$options = array(
			CURLOPT_URL => $media_endpoint,
			CURLOPT_HEADER => true,
			CURLOPT_VERBOSE => true,
			CURLOPT_POST => true,
			CURLOPT_HTTPHEADER => $headers,
			CURLOPT_POSTFIELDS => $postfields,
			CURLOPT_RETURNTRANSFER => true
		); // cURL options
		curl_setopt_array($ch, $options);

		$response = curl_exec($ch);

		if(!curl_errno($ch)) {
			$info = curl_getinfo($ch);
			if ($info['http_code'] == 201){
				$errmsg = "File uploaded successfully";

                $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
				$header_text = substr($response, 0, $header_size);
				$body_text = substr($response, $header_size);

				foreach (explode("\r\n", $header_text) as $i => $line){

					if( preg_match('/^location/i', $line)){

						$split = explode(': ', $line);
						curl_close($ch);
                        if($return_alt_obj && isset($media_data['alt']) && !empty($media_data['alt'])){
                            return array('alt' => $media_data['alt'], 'value' =>  $split[1]);
                        } else {
                            return $split[1];
                        }

					}
				}
			} else {
				// todo if ! 201
				curl_close($ch);
				return null;
			}
		} else {
			$errmsg = curl_error($ch);
			curl_close($ch);
			return null;
		}
	}
}

//TODO
function multipartPost($target, $bearer_string, $post_data, $media_fields) 
{
    $ch = curl_init($target);

    if (!$ch) {
        header('HTTP/1.1 500 Server Error');
        exit();
    }

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: ' . $bearer_string));
    curl_setopt($ch, CURLOPT_HEADER, true);
    if($post_data){
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
    }

    $response = curl_exec($ch);
    return $response;
}

function standardPost($target, $bearer_string, $post_data = null, $additional_headers = array()) 
{
    $ch = curl_init($target);

    if (!$ch) {
        header('HTTP/1.1 500 Server Error');
        exit();
    }

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge(array('Authorization: ' . $bearer_string), $additional_headers));
    curl_setopt($ch, CURLOPT_VERBOSE, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    if($post_data){
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
    }

    $response = curl_exec($ch);

    $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $header_text = substr($response, 0, $header_size);
    $body_text = substr($response, $header_size);

    return array('header' => $header_text, 'body' => $body_text);
}

function returnResponse($response_obj)
{
    //TODO just return the result directly

    $header_text = $response_obj['header'];
    $body_text = $response_obj['body'];


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
}

function debug_log($content){
    file_put_contents('log.txt', 
        date("Y-m-d H:i:s - ")  .$content . "\n",
        FILE_APPEND);
}

function transform_json_post($old_format){
    $result_obj = array('type' => array(), 'properties' => array());
    if(isset($old_format['h'])){
        $result_obj['type'][] = 'h-' . $old_format['h'];
        unset($old_format['h']);
    }
    foreach($old_format as $key => $val){
        if(!empty($val)){
            if(is_array($val)){
                $result_obj['properties'][$key] = $val;
            } else {
                $result_obj['properties'][$key] = array($val);
            }
        }
    }

    return $result_obj;

}

