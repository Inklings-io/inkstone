<?php
require_once DIR_BASE . 'libraries/php-mf2/Mf2/Parser.php';
require_once DIR_BASE . 'libraries/link-rel-parser-php/src/IndieWeb/link_rel_parser.php';
require_once DIR_BASE . 'libraries/indieauth-client-php/src/IndieAuth/Client.php';

class ControllerMicropubReceive extends Controller {
    public function index()
    {
        //$this->log->write(print_r($this->request->post, true));
        //$this->log->write(file_get_contents("php://input"));
        $supported_array = array(
                "edit" => "https://ben.thatmustbe.me/edit?url={url}",
                "new" => "https://ben.thatmustbe.me/new",
                "reply" => "https://ben.thatmustbe.me/new?reply_to={url}",
                "repost" => "https://ben.thatmustbe.me/new?url={url}",
                "bookmark" => "https://ben.thatmustbe.me/new?type=bookmark&bookmark={url}",
                "favorite" => "https://ben.thatmustbe.me/new?type=like&like-of={url}",
                "like" => "https://ben.thatmustbe.me/new?type=like&like={url}",
                "delete" => "https://ben.thatmustbe.me/delete?url={url}",
                "undelete" => "https://ben.thatmustbe.me/undelete?url={url}");

        $supported_syndication_array = array(
            "syndicate-to[]=https://www.brid.gy/publish/twitter",
            "syndicate-to[]=https://www.brid.gy/publish/facebook",
            "mp-syndicate-to[]=https://www.brid.gy/publish/twitter",
            "mp-syndicate-to[]=https://www.brid.gy/publish/facebook"
        );

        $this->load->model('auth/mpsyndicate');
        $mp_syndication_targets = $this->model_auth_mpsyndicate->getSiteList();
        foreach ($mp_syndication_targets as $target) {
            $supported_syndication_array[] = 'syndicate-to[]=' . $target;
            $supported_syndication_array[] = 'mp-syndicate-to[]=' . $target;

        }

        $supported_syndication_array_for_json = array(
            "syndicate-to" => array_merge($mp_syndication_targets, array("https://www.brid.gy/publish/twitter",
                                      "https://www.brid.gy/publish/facebook")),
            "mp-syndicate-to" => array_merge($mp_syndication_targets, array("https://www.brid.gy/publish/twitter",
                                      "https://www.brid.gy/publish/facebook")));

        if (isset($this->request->get['q']) && $this->request->get['q'] == 'actions') {
            if ($this->request->server['HTTP_ACCEPT'] == 'application/json') {
                $json = $supported_array;
                $this->response->setOutput(json_encode($json));
            } else {
                $build_array = array();
                foreach ($supported_array as $type => $value) {
                    $build_array[] = $type . '=' . urlencode($value);
                }
                $supported = implode('&', $build_array);

                $this->response->setOutput($supported);
            }

        } elseif (isset($this->request->get['q']) && $this->request->get['q'] == 'syndicate-to') {
            if ($this->request->server['HTTP_ACCEPT'] == 'application/json') {
                $this->response->setOutput(json_encode($supported_syndication_array_for_json));
            } else {
                $supported = implode('&', $supported_syndication_array);
                $this->response->setOutput($supported);
            }

        } elseif (isset($this->request->get['q']) && $this->request->get['q'] == 'mp-syndicate-to') {
            if ($this->request->server['HTTP_ACCEPT'] == 'application/json') {
                $this->response->setOutput(json_encode($supported_syndication_array_for_json));
            } else {
                $supported = implode('&', $supported_syndication_array);
                $this->response->setOutput($supported);
            }

        } elseif (isset($this->request->get['q']) && $this->request->get['q'] == 'json_actions') {
            $json = $supported_array;
            $this->response->setOutput(json_encode($json));
        } elseif (isset($this->request->get['q']) && $this->request->get['q'] == 'indie-config') {
            $build_array = array();
            foreach ($supported_array as $type => $value) {
                $build_array[] = $type . ": '" . $value . "'";
            }
            $indieconfig = "
<script>
(function() {
  if (window.parent !== window) {
    window.parent.postMessage(JSON.stringify({
      // The endpoint you use to write replies
" . implode(",\n", $build_array) . "
    }), '*');
  }
}());
</script>";
            $this->response->setOutput($indieconfig);


        } else {
            $headers = apache_request_headers();
            //check that we were even offered an access token
            if (!isset($this->request->post['access_token'])
                && (!isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']) || empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION']))
                && !isset($headers['Authorization'])) {
                //$this->log->write('err0');
                header('HTTP/1.1 401 Unauthorized');
                exit();
            } else {
                $token = $this->request->post['access_token'];
                if (!$token) {
                    $parts = explode(' ', $_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
                    $token = $parts[1];
                }
                if (!$token) {
                    $parts = explode(' ', $headers['Authorization']);
                    $token = $parts[1];
                }

                $this->load->model('auth/token');
                $auth_info = $this->model_auth_token->getAuthFromToken(urldecode($token));


                $has_post_access = false;
                $has_edit_access = false;
                $has_delete_access = false;
                $has_follow_access = false;
                $has_contacts_access = false;
                $has_register_access = false;

                if (!empty($auth_info) && in_array('post', explode(' ', $auth_info['scope']))) {
                    $has_post_access = true;
                }
                if (!empty($auth_info) && in_array('edit', explode(' ', $auth_info['scope']))) {
                    $has_edit_access = true;
                }
                if (!empty($auth_info) && in_array('delete', explode(' ', $auth_info['scope']))) {
                    $has_delete_access = true;
                }
                if (!empty($auth_info) && in_array('follow', explode(' ', $auth_info['scope']))) {
                    $has_follow_access = true;
                }
                if (!empty($auth_info) && in_array('contacts', explode(' ', $auth_info['scope']))) {
                    $has_contacts_access = true;
                }
                if (!empty($auth_info) && in_array('register', explode(' ', $auth_info['scope']))) {
                    $has_register_access = true;
                }

                $token_user = str_replace(array('http://', 'https://'), array('',''), $auth_info['user']);
                $myself = str_replace(array('http://', 'https://'), array('',''), HTTP_SERVER);

                if ($token_user != $myself && $token_user . '/' != $myself && $token_user != $myself . '/' ) {
                    //$this->log->write('err1');
                    header('HTTP/1.1 401 Unauthorized');
                    exit();
                } else {
                    // ----------------------------------------
                    // Handle new micropub endpoint registration
                    // ----------------------------------------
                    if ($this->request->get['register'] && $has_register_access) {
                        $token = $this->request->get['register_token'];
                        $site = $this->request->get['register'];

                        $this->load->model('auth/mpsyndicate');
                        $this->model_auth_mpsyndicate->addSite($site, $token);

                        //TODO:  test all of this

                        $this->response->addHeader('HTTP/1.1 200 OK');
                        $this->response->setOutput("Syndication Target Added!");
                        exit();

                    }
                    // ----------------------------------------
                    // END Handle new micropub endpoint registration
                    // ----------------------------------------

                    $mp_action = '';
                    if (isset($this->request->post['mp-action']) && !empty($this->request->post['mp-action'])) {
                        $mp_action = strtolower($this->request->post['mp-action']);
                    }

                    $h = 'entry';
                    if (isset($this->request->post['h']) && !empty($this->request->post['h'])) {
                        $h = strtolower($this->request->post['h']);
                    }

                    if (strcmp($h, 'card') == 0) {
                        switch ($mp_action) {
                            case 'unfollow':
                                if ($has_follow_access) {
                                    $this->unfollowCard();
                                } else {
                            //$this->log->write('err2');
                                    header('HTTP/1.1 401 Unauthorized');
                                    exit();
                                }
                                break;
                            case 'follow':
                                if ($has_follow_access) {
                                    $this->followCard();
                                } else {
                            //$this->log->write('err3');
                                    header('HTTP/1.1 401 Unauthorized');
                                    exit();
                                }
                                break;
                            case 'edit':
                                if ($has_contacts_access) {
                                    $this->editCard();
                                } else {
                            //$this->log->write('err4');
                                    header('HTTP/1.1 401 Unauthorized');
                                    exit();
                                }
                                break;
                            case 'delete':
                                if ($has_contacts_access) {
                                    $this->delCard();
                                } else {
                            //$this->log->write('err5');
                                    header('HTTP/1.1 401 Unauthorized');
                                    exit();
                                }
                                break;
                            case 'add':
                            default:
                                if ($has_contacts_access) {
                                    $this->addCard();
                                } else {
                            //$this->log->write('err6');
                                    header('HTTP/1.1 401 Unauthorized');
                                    exit();
                                }
                                break;
                        } //end switch case
                    } else { //end hCard section
                        //hEntry section

                        switch ($mp_action) {
                            case 'delete':
                                if ($has_delete_access) {
                                    $this->deletePost();
                                } else {
                            //$this->log->write('err7');
                                    header('HTTP/1.1 401 Unauthorized');
                                    exit();
                                }
                                break;
                            case 'undelete':
                                // NOTE: should undeletePost() need post access? delete access? both?
                                if ($has_post_access) {
                                    $this->undeletePost();
                                } else {
                            //$this->log->write('err8');
                                    header('HTTP/1.1 401 Unauthorized');
                                    exit();
                                }
                                break;
                            case 'edit':
                                if ($has_edit_access) {
                                    $this->editPost();
                                } else {
                            //$this->log->write('err9');
                                    header('HTTP/1.1 401 Unauthorized');
                                    exit();
                                }
                                break;
                            case 'create':
                            default:
                                if ($has_post_access) {
                                    // NOTE: should getPost() need post access?
                                    if (isset($this->request->get['url']) && !empty($this->request->get['url'])) {
                                        $this->getPost();
                                    } elseif (isset($this->request->post['mp-type']) && $this->request->post['mp-type'] == 'article') {
                                        $this->createPost('article', $auth_info['client_id']);
                                    } elseif (isset($this->request->post['mp-type']) && $this->request->post['mp-type'] == 'checkin') {
                                        $this->createPost('checkin', $auth_info['client_id']);
                                    } elseif ((isset($this->request->post['mp-type']) && $this->request->post['mp-type'] == 'rsvp') || (!isset($this->request->post['mp-type']) && isset($this->request->post['rsvp']) && !empty($this->request->post['rsvp']))) {
                                        $this->createPost('rsvp', $auth_info['client_id']);
                                    } elseif (isset($this->request->post['mp-type']) && $this->request->post['mp-type'] == 'tag') {
                                        $this->createPost('tag', $auth_info['client_id']);
                                    } elseif (isset($this->request->post['mp-type']) && $this->request->post['mp-type'] == 'snark') {
                                        $this->createPost('snark', $auth_info['client_id']);
                                    } elseif (isset($this->request->post['bookmark']) && !empty($this->request->post['bookmark'])) {
                                        $this->createPost('bookmark', $auth_info['client_id']);
                                    } elseif (isset($this->request->post['like-of']) && !empty($this->request->post['like-of'])) {
                                        $this->createPost('like', $auth_info['client_id']);
                                    } elseif (isset($_FILES['video']) && !empty($_FILES['video'])) {
                                        $this->createPost('video', $auth_info['client_id']);
                                    } elseif (isset($_FILES['audio']) && !empty($_FILES['audio'])) {
                                        $this->createPost('audio', $auth_info['client_id']);
                                    } elseif (isset($_FILES['photo']) && !empty($_FILES['photo'])) {
                                        $this->createPost('photo', $auth_info['client_id']);
                                    } else {
                                        $this->createPost('note', $auth_info['client_id']);
                                    }
                                } else {
                            //$this->log->write('err10');
                                    header('HTTP/1.1 401 Unauthorized');
                                    exit();
                                }
                                break;
                        } //end switch case
                    } //end hEntry section

                }  // end check for token is my own
            }  // end check for access token offered
        } //end else from endpoint data lookup
    } //end index funciton

    private function getPost()
    {
        $post = $this->getPostByURL($this->request->get['url']);
        if ($post) {
            $this->response->addHeader('HTTP/1.1 200 OK');
            if ($this->request->server['HTTP_ACCEPT'] == 'application/json') {
                $this->response->setOutput(json_encode($post));
            } else {
                $this->response->setOutput(http_build_query($post));
            }
        }

    }

    private function undeletePost()
    {
        //$this->log->write('called undeletePost()');
        $post = $this->getPostByURL($this->request->post['url']);
        if ($post) {
            $this->load->model('blog/post');
            $this->model_blog_post->undeletePost($post['post_id']);
            $this->cache->delete('post.' . $post['post_id']);
            $this->cache->delete('posts.' . $post['post_id']);

            $this->response->addHeader('HTTP/1.1 200 OK');
            //$this->response->addHeader('Location: '. $post['permalink']);
            $this->response->setOutput($post['permalink']);
        }
    }

    private function deletePost()
    {
        $this->log->write('called deletePost() ' . $this->request->post['url']);
        $post = $this->getPostByURL($this->request->post['url']);
        if ($post) {
            $this->log->write('found post');
            $this->load->model('blog/post');
            $this->model_blog_post->deletePost($post['post_id']);

            $this->cache->delete('post.' . $post['post_id']);

            $this->load->model('webmention/send_queue');
            if (defined('QUEUED_SEND')) {
                $this->model_webmention_send_queue->addEntry($post['post_id']);
            } else {
                $this->load->controller('webmention/queue/sendWebmention', $post['post_id']);
            }

            $this->response->addHeader('HTTP/1.1 200 OK');
            //$this->response->addHeader('Location: '. $post['permalink']);
            $this->response->setOutput($post['permalink']);


        }
    }

    private function editPost()
    {
        //$this->log->write('called editPost()');
        $post = $this->getPostByURL($this->request->post['url']);
        if ($post) {
            //$this->log->write('post set');
            //$this->log->write(print_r($post,true));
            $this->load->model('blog/post');
            if (isset($this->request->post['syndication'])) {
                $this->model_blog_post->addSyndication($post['post_id'], $this->request->post['syndication']);
            }

            $simple_editable_fields = array(
                'name' => 'name',
                'content' => 'body',
                'location' => 'location',
                'place_name' => 'place_name',
                'like-of' => 'like-of',
                'bookmark' => 'bookmark',
                'slug' => 'slug');

            if (isset($this->request->post['delete-fields']) && !empty($this->request->post['delete-fields'])) {
                foreach ($simple_editable_fields as $field_name => $db_name) {
                    if (in_array($field_name, $this->request->post['delete-fields'])) {
                        $post[$db_name] = '';
                    }
                }
                if (in_array('category', $this->request->post['delete-fields'])) {
                    $this->model_blog_post->removeFromAllCategories($post['post_id']);
                }
            }

            foreach ($simple_editable_fields as $field_name => $db_name) {
                if (isset($this->request->post[$field_name]) && !empty($this->request->post[$field_name])) {
                    $post[$db_name] = $this->request->post[$field_name];
                }
            }
            if (isset($this->request->post['category']) && !empty($this->request->post['category'])) {
                $categories = explode(',', urldecode($this->request->post['category']));
                $this->log->write(print_r($categories));
                foreach ($categories as $category) {
                    $this->model_blog_post->addToCategory($post['post_id'], $category);
                }
            }

            //$this->log->write(print_r($post,true));
            $this->model_blog_post->editPost($post);

            $this->response->addHeader('HTTP/1.1 200 OK');
            //$this->response->addHeader('Location: '. $post['permalink']);
            $this->response->setOutput($post['permalink']);
        }
    }


    private function createPost($type, $client_id = null)
    {

        $this->load->model('blog/post');

        $data = array();

        if (isset($_FILES['photo'])) {
            $upload_shot = $_FILES['photo'];
            if ( $upload_shot['error'] != 0) {
                header('HTTP/1.1 500 Error');
                exit();
            }

            move_uploaded_file($upload_shot["tmp_name"], DIR_UPLOAD . '/photo/' . urldecode($upload_shot["name"]));

            $data['image_file'] = DIR_UPLOAD_REL . '/photo/' . $upload_shot["name"];
        }
        if (isset($_FILES['video'])) {
            $upload_shot = $_FILES['video'];
            if ( $upload_shot['error'] != 0) {
                header('HTTP/1.1 500 Error');
                exit();
            }

            move_uploaded_file($upload_shot["tmp_name"], DIR_UPLOAD . '/video/' . urldecode($upload_shot["name"]));

            $data['video_file'] = DIR_UPLOAD_REL . '/video/' . $upload_shot["name"];
        }
        if (isset($_FILES['audio'])) {
            $upload_shot = $_FILES['audio'];
            if ( $upload_shot['error'] != 0) {
                header('HTTP/1.1 500 Error');
                exit();
            }

            move_uploaded_file($upload_shot["tmp_name"], DIR_UPLOAD . '/audio/' . urldecode($upload_shot["name"]));

            $data['audio_file'] = DIR_UPLOAD_REL . '/audio/' . $upload_shot["name"];
        }

        if ($type == 'photo' && !isset($data['image_file'])) {
            $this->log->write('cannot find file in $_FILES');
            $this->log->write(print_r($_FILES, true));
            header('HTTP/1.1 449 Retry With file');
            exit();
        }

        if ($type == 'video' && !isset($data['video_file'])) {
            $this->log->write('cannot find file in $_FILES');
            $this->log->write(print_r($_FILES, true));
            header('HTTP/1.1 449 Retry With file');
            exit();
        }
        if ($type == 'audio' && !isset($data['audio_file'])) {
            $this->log->write('cannot find file in $_FILES');
            $this->log->write(print_r($_FILES, true));
            header('HTTP/1.1 449 Retry With file');
            exit();
        }

        //TODO
        // $this->request->post['h'];

        if (isset($this->request->post['content'])) {
            $data['body'] = $this->request->post['content'];
        } else {
            $data['body'] = '';
        }
        if (isset($this->request->post['published'])) {
            $data['published'] = $this->request->post['published'];
        }
        if (isset($this->request->post['slug'])) {
            $data['slug'] = $this->request->post['slug'];
        } else {
            $data['slug'] = '';
        }
        if (isset($this->request->post['draft'])) {
            $data['draft'] = $this->request->post['draft'];
        }
        if (isset($this->request->post['like-of'])) {
            $data['bookmark_like_url'] = $this->request->post['like-of'];
        }
        if (isset($this->request->post['bookmark'])) {
            $data['bookmark_like_url'] = $this->request->post['bookmark'];
        }
        if (isset($this->request->post['in-reply-to'])) {
            $data['replyto'] = $this->request->post['in-reply-to'];
            $this->load->model('webmention/vouch');
            $this->model_webmention_vouch->addWhitelistEntry($data['replyto']);
        }
        if (isset($this->request->post['tag-of'])) {
            //TODO: correct this once I have the DB updated
            $data['replyto'] = $this->request->post['tag-of'];
            $this->load->model('webmention/vouch');
            $this->model_webmention_vouch->addWhitelistEntry($data['replyto']);
        }
        if (isset($this->request->post['name'])) {
            $data['name'] = $this->request->post['name'];
        }
        if (isset($this->request->post['description'])) {
            $data['description'] = $this->request->post['description'];
        }
        if (isset($this->request->post['location'])) {
            $data['location'] = $this->request->post['location'];
        }
        if (isset($this->request->post['place_name'])) {
            $data['place_name'] = $this->request->post['place_name'];
        }
        if ($type == 'rsvp' && isset($this->request->post['rsvp']) && !empty($this->request->post['rsvp'])) {
            $inputval = strtolower($this->request->post['rsvp']);
            if ($inputval == 'yes') {
                $data['rsvp'] = 'yes';
            } else {
                $data['rsvp'] = 'no';
            }
        }

        if (isset($this->request->post['syndicate-to']) && !empty($this->request->post['syndicate-to'])) {
            $data['syndication_extra'] = '';
            foreach ($this->request->post['syndicate-to'] as $synto) {
                $data['syndication_extra'] .= '<a href="' . $synto . '"></a>';
            }
        } elseif (isset($this->request->post['mp-syndicate-to']) && !empty($this->request->post['mp-syndicate-to'])) {
            $data['syndication_extra'] = '';
            foreach ($this->request->post['mp-syndicate-to'] as $synto) {
                $data['syndication_extra'] .= '<a href="' . $synto . '"></a>';
            }
        }

        if ($client_id) {
            $data['created_by'] = $client_id;
        }

        $post_id = $this->model_blog_post->newPost($type, $data);

        if (isset($this->request->post['category']) && !empty($this->request->post['category'])) {
            $categories = explode(',', urldecode($this->request->post['category']));
            $this->log->write(print_r($categories));
            foreach ($categories as $category) {
                $this->model_blog_post->addToCategory($post_id, $category);
            }
        }
        $this->cache->delete('posts');

        $post = $this->model_blog_post->getPost($post_id);

        if ($post && isset($this->request->post['syndication']) && !empty($this->request->post['syndication'])) {
            $this->load->model('blog/post');
            $this->model_blog_post->addSyndication($post['post_id'], $this->request->post['syndication']);
        }

        $this->syndicateByMp($this->request->post, $post['shortlink'], $post_id);

        $this->load->model('webmention/send_queue');
        if (defined('QUEUED_SEND')) {
            $this->model_webmention_send_queue->addEntry($post_id);
        } else {
            $this->load->controller('webmention/queue/sendWebmention', $post_id);
        }

        $this->cache->delete('post.' . $post['post_id']);


        $this->response->addHeader('HTTP/1.1 201 Created');
        $this->response->addHeader('Location: ' . $post['permalink']);
        $this->response->setOutput($post['permalink']);
    }

    private function getPostByURL($real_url)
    {
        include DIR_BASE . '/routes.php';

        $data = array();
        foreach ($advanced_routes as $adv_route) {
            $matches = array();
            $real_url = ltrim(str_replace(array(HTTP_SERVER, HTTPS_SERVER), array('',''), $real_url), '/');
            preg_match($adv_route['expression'], $real_url, $matches);
            if (!empty($matches)) {
                //$model = $adv_route['controller'];
                foreach ($matches as $field => $value) {
                    $data[$field] = $value;
                }
            }
        }
        try {
            $this->load->model('blog/post');
            $post = $this->model_blog_post->getPostByData($data);
            return $post;
        } catch (Exception $e) {
            $this->log->write('failed to parse ' . $real_url . ' as a url for the site');
            return null;
        }


    }
    private function whiteListUrls($content)
    {
        $this->load->model('webmention/vouch');
        $reg_ex_match = '/(href=[\'"](?<href>[^\'"]+)[\'"][^>]*(rel=[\'"](?<rel>[^\'"]+)[\'"])?)/';
        $matches = array();
        preg_match_all($reg_ex_match, $content, $matches);

        for ($i = 0; $i < count($matches['href']); $i++) {
            $href = strtolower($matches['href'][$i]);
            $rel = strtolower($matches['rel'][$i]);

            if (strpos($rel, "nofollow") === false) {
                $this->model_webmention_vouch->addWhitelistEntry($href);
            }
        }

        $reg_ex_match = '/(rel=[\'"](?<rel>[^\'"]+)[\'"][^>]*href=[\'"](?<href>[^\'"]+)[\'"])/';
        $matches = array();
        preg_match_all($reg_ex_match, $vouch_content, $matches);
        for ($i = 0; $i < count($matches['href']); $i++) {
            //$this->log->write('checking '.$href . '   rel '.$rel);
            $href = strtolower($matches['href'][$i]);
            $rel = strtolower($matches['rel'][$i]);

            if (strpos($rel, "nofollow") === false) {
                $this->model_webmention_vouch->addWhitelistEntry($href);
            }
        }
    }

    private function followCard()
    {

        $this->load->model('contacts/following');
        $this->load->model('blog/post');

        $card_data = array();

        if (isset($this->request->post['name'])) {
            $card_data['name'] = $this->request->post['name'];
        } else {
            $card_data['name'] = '';
        }
        if (isset($this->request->post['url'])) {
            $card_data['url'] = $this->request->post['url'];
        } else {
            $card_data['url'] = '';
        }
        if (isset($this->request->post['photo'])) {
            $card_data['photo'] = $this->request->post['photo'];
        } else {
            $card_data['photo'] = '';
        }

        /*
        if(isset($this->request->post['syndicate-to']) && !empty($this->request->post['syndicate-to'])){
            $data['syndication_extra'] = '';
            foreach($this->request->post['syndicate-to'] as $synto){
                $data['syndication_extra'] .= '<a href="'.$synto.'"></a>';
            }
        } elseif(isset($this->request->post['mp-syndicate-to']) && !empty($this->request->post['mp-syndicate-to'])){
            $data['syndication_extra'] = '';
            foreach($this->request->post['mp-syndicate-to'] as $synto){
                $data['syndication_extra'] .= '<a href="'.$synto.'"></a>';
            }
        }
         */

        $following_id = $this->model_contacts_following->followCard($card_data);
        $post_id = $this->model_blog_post->newPost('follow', array('following_id' => $following_id));
        $this->cache->delete('followings');
        $this->cache->delete('posts');

        $post = $this->model_blog_post->getPost($post_id);

        if ($post && isset($this->request->post['syndication']) && !empty($this->request->post['syndication'])) {
            $this->load->model('blog/post');
            $this->model_blog_post->addSyndication($post['post_id'], $this->request->post['syndication']);
        }

        $this->load->model('webmention/send_queue');
        if (defined('QUEUED_SEND')) {
            $this->model_webmention_send_queue->addEntry($post_id);
        } else {
            $this->load->controller('webmention/queue/sendWebmention', $post_id);
        }

        $this->cache->delete('post.' . $post['post_id']);

        $this->response->addHeader('HTTP/1.1 201 Created');
        $this->response->addHeader('Location: ' . $post['permalink']);
        $this->response->setOutput($post['permalink']);
    }

    private function syndicateByMp($data, $url, $post_id)
    {
        //$this->log->write('called syndicateByMp with '. $url);
        //$this->log->write(print_r($data,true));
        $this->load->model('blog/post');
        $this->load->model('auth/mpsyndicate');
        $mp_syndication_targets = $this->model_auth_mpsyndicate->getSiteList();

        $data['url'] = $url;

        $syndicate_tos = $data['syndicate-to'];
        if (empty($syndicate_tos)) {
            $syndicate_tos = $data['mp-syndicate-to'];
        }
        unset($data['syndicate-to']);
        unset($data['mp-syndicate-to']);
        //we want to make sure we don't relay syndicate-to values

        foreach ($syndicate_tos as $mp_target) {
            if (in_array($mp_target, $mp_syndication_targets)) {
                $site_data = $this->model_auth_mpsyndicate->getDataForName($mp_target);

                $token = $site_data['token'];

                $micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($mp_target);
                $ch = curl_init($micropub_endpoint);

                if (!$ch) {
                    $this->log->write('error with curl_init');
                }

                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $token));
                curl_setopt($ch, CURLOPT_HEADER, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

                $body = curl_exec($ch);
                //$this->log->write(' -------------' . print_r($body, true) . '-------------------' );
                $headers = curl_getinfo($ch);

                if ($headers['http_code'] == 201) {
                    //$this->log->write('responded with  '. $headers['redirect_url']);
                    $matches = null;
                    preg_match('/Location\s*:\s*(https?:\/\/[^\s]+)/', $body, $matches);
                    if ($matches && isset($matches[1])) {
                        $this->model_blog_post->addSyndication($post_id, $matches[1]);
                    }
                    //$this->log->write('all_headers  '. print_r($headers, true));

                } else {
                    $this->log->write('error got http_code  ' . $headers['http_code']);

                }

            }
        }

    }

}
