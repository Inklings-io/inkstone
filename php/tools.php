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
        echo "debug 10\n";

//TODO make this safe
$boundary = md5($filedata);

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
        echo "debug 40\n";
		curl_setopt_array($ch, $options);
        echo "debug 50\n";
		$response = curl_exec($ch);
        echo "$media_endpoint\n";
        print_r($response);
        echo "debug 60\n";
		if(!curl_errno($ch)) {
			$info = curl_getinfo($ch);
			if ($info['http_code'] == 201){
        echo "debug 70\n";
				$errmsg = "File uploaded successfully";
				$header_text = substr($response, 0, strpos($response, "\r\n\r\n"));
				$body_text = substr($response, strlen($header_text));

				foreach (explode("\r\n", $header_text) as $i => $line){

					if( preg_match('/^location/i', $line)){
        echo "debug 75\n";

						$split = explode(': ', $line);
						curl_close($ch);
						return $split[1];

					}
				}
			} else {
        echo "debug 80\n";
				// todo if ! 201
				curl_close($ch);
				return null;
			}
		} else {
        echo "debug 90\n";
			$errmsg = curl_error($ch);
        echo $errmsg;
			curl_close($ch);
			return null;
		}
	}
}
