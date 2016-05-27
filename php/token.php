<?php

require_once DIR_BASE . 'libraries/php-mf2/Mf2/Parser.php';
require_once DIR_BASE . 'libraries/link-rel-parser-php/src/IndieWeb/link_rel_parser.php';
require_once DIR_BASE . 'libraries/indieauth-client-php/src/IndieAuth/Client.php';

class ControllerAuthToken extends Controller {
    public function index()
    {
        if (isset($this->request->post['code']) &&
            isset($this->request->post['me']) &&
            isset($this->request->post['redirect_uri'])) {
            $post_data = http_build_query(array(
                'code'          => $this->request->post['code'],
                'me'            => $this->request->post['me'],
                'redirect_uri'  => $this->request->post['redirect_uri'],
                'client_id'     => $this->request->post['client_id'],
                'state'         => $this->request->post['state']
            ));

            $auth_endpoint = IndieAuth\Client::discoverAuthorizationEndpoint($this->request->post['me']);

            //$this->log->write('connecting to : ' . $auth_endpoint);
            //$this->log->write('with : ' . $post_data);
            $ch = curl_init($auth_endpoint);

            if (!$ch) {
                $this->log->write('error with curl_init');
            }

            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);

            /////////////////////////////////////////////////
            //TODO: once my hosting provider fixes its issue i can remove this
            //curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            /////////////////////////////////////////////////

            $response = curl_exec($ch);

            //$this->log->write('response from Auth endpoint: ' . $response);

            $results = array();
            parse_str($response, $results);

            if ($results['me']) {
                $user = $results['me'];
                $scope = $results['scope'];
                $client_id = $this->request->post['client_id'];

                $this->load->model('auth/token');
                $token = $this->model_auth_token->newToken($user, $scope, $client_id);

                $this->response->setOutput(http_build_query(array(
                    'access_token' => $token,
                    'scope' => $scope,
                    'me' => $user)));
            } else {
                header('HTTP/1.1 400 Bad Request');
                exit();
            }
        } else {
            header('HTTP/1.1 400 Bad Request');
            exit();
        }
    }

}
