<?php



function normalizeUrl($url)
{
    $url = trim($url);
    if (strpos($url, 'http') !== 0) {
        $url = 'http://' . $url;
    }
    return $url;
}

function uploadToMediaEndpoint($media_endpoint, $bearer_string, $media_data){

    $split = explode(';base64,', $media_data['src']);

    $encoded_data = str_replace(' ','+',$split[1]);
    $filedata = base64_decode($encoded_data);

	$filename = $media_data['name'];
	$filesize = $media_data['size'];
	if ($filedata != '')
	{

//TODO make this safe
$boundary = md5($filedata);

// generate safe boundary
    do {
        $boundary = "---------------------" . md5(mt_rand() . microtime());
    } while (preg_grep("/{$boundary}/", $filename.$filedata));
    

        $headers = array('Content-Type:multipart/form-data; boundary='.$boundary,
                         'Authorization: ' . $bearer_string
            ); // cURL headers for file uploading

$postfields = '--'.$boundary.'
Content-Disposition: form-data; name="file"; filename="'.$filename.'"
Content-Type: '.$media_data['type'].'
Content-Transfer-Encoding: binary

'.$filedata.'
--'.$boundary.'--';


		$ch = curl_init();
		$options = array(
			CURLOPT_URL => $media_endpoint,
			CURLOPT_HEADER => true,
			CURLOPT_POST => 1,
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
				$header_text = substr($response, 0, strpos($response, "\r\n\r\n"));
				$body_text = substr($response, strlen($header_text));

				foreach (explode("\r\n", $header_text) as $i => $line){

					if( preg_match('/^location/i', $line)){

						$split = explode(': ', $line);
						curl_close($ch);
						return $split[1];

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
