<?php
require_once DIR_BASE . 'libraries/php-mf2/Mf2/Parser.php';
require_once DIR_BASE . 'libraries/link-rel-parser-php/src/IndieWeb/link_rel_parser.php';
require_once DIR_BASE . 'libraries/indieauth-client-php/src/IndieAuth/Client.php';

class ControllerMicropubClient extends Controller {
    public function index()
    {

        $this->document->setTitle('Create a New Post');
        $data['title'] = 'Create a New Post';

        $data['header'] = $this->load->controller('common/header');
        $data['footer'] = $this->load->controller('common/footer');
        $data['login'] = $this->url->link('auth/login');

        if ($this->session->data['is_owner']) {
            $data['is_owner'] = true;
        }

        $this->document->setDescription($this->config->get('config_meta_description'));

        if (isset($this->session->data['user_site'])) {
            $user = $this->session->data['user_site'];
            $data['user_name'] = $user;

            $micropub_endpoint = $this->session->data['micropub_' . $user];
            if (!$micropub_endpoint) {
                $micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($user);
                $this->session->data['micropub_' . $user] = $micropub_endpoint;
            }
            if ($micropub_endpoint) {
                $data['micropubEndpoint'] = $micropub_endpoint;
                $data['action'] = $this->url->link('micropub/client/send', '', '');
            }
            $data['syn_arr'] = $this->getSyndicationArray();
        }

        if ($this->session->data['is_owner'] && isset($this->request->get['id']) && !empty($this->request->get['id'])) {
            $this->load->model('blog/post');
            $data['post'] = $this->model_blog_post->getPost($this->request->get['id']);
        }

        if (isset($this->request->get['url']) && !empty($this->request->get['url'])) {
            $data['post'] = $this->downloadEntry($this->request->get['url'], isset($this->request->get['type']) && $this->request->get['type']);
        }

        if (isset($this->request->get['type'])) {
            $data['type'] = strtolower($this->request->get['type']);
        }
        if (isset($this->request->get['reply_to'])) {
            $data['post'] = array('replyto' => $this->request->get['reply_to']);
        }
        if (isset($this->request->get['bookmark'])) {
            $data['post'] = array('bookmark' => $this->request->get['bookmark']);
        }
        if (isset($this->request->get['like-of'])) {
            $data['post'] = array('like-of' => $this->request->get['like-of']);
        }


        $data['token'] = isset($this->session->data['token']);

        $data['new_entry_link'] = $this->url->link('micropub/client');
        $data['edit_entry_link'] = $this->url->link('micropub/client/editPost');
        $data['delete_entry_link'] = $this->url->link('micropub/client/deletePost');
        $data['undelete_entry_link'] = $this->url->link('micropub/client/undeletePost');


        if (file_exists(DIR_TEMPLATE . $this->config->get('config_template') . '/template/micropub/new.tpl')) {
            $this->response->setOutput($this->load->view($this->config->get('config_template') . '/template/micropub/new.tpl', $data));
        } else {
            $this->response->setOutput($this->load->view('default/template/micropub/new.tpl', $data));
        }
    }
    public function contacts()
    {

        $this->document->setTitle('Contacts Management');
        $data['title'] = 'Contacts Management';

        $data['header'] = $this->load->controller('common/header');
        $data['footer'] = $this->load->controller('common/footer');
        $data['login'] = $this->url->link('auth/login');

        if ($this->session->data['is_owner']) {
            $data['is_owner'] = true;
        }

        $this->document->setDescription($this->config->get('config_meta_description'));

        if (isset($this->session->data['user_site'])) {
            $user = $this->session->data['user_site'];
            $data['user_name'] = $user;

            $micropub_endpoint = $this->session->data['micropub_' . $user];
            if (!$micropub_endpoint) {
                $micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($user);
                $this->session->data['micropub_' . $user] = $micropub_endpoint;
            }
            if ($micropub_endpoint) {
                $data['micropubEndpoint'] = $micropub_endpoint;
                $data['action'] = $this->url->link('micropub/client/send', '', '');
            }
            $data['syn_arr'] = $this->getSyndicationArray();
        }

        //if($this->session->data['is_owner'] && isset($this->request->get['id']) && !empty($this->request->get['id'])){
            //$this->load->model('blog/post');
            //$data['post'] = $this->model_blog_post->getPost($this->request->get['id']);
        //}

        if (isset($this->request->get['url']) && !empty($this->request->get['url'])) {
            $data['card'] = $this->getCard($this->request->get['url']);
        }

        if (isset($this->request->get['mp-action'])) {
            $data['mp_action'] = strtolower($this->request->get['mp-action']);
        }

        $data['token'] = isset($this->session->data['token']);

        if (file_exists(DIR_TEMPLATE . $this->config->get('config_template') . '/template/micropub/contacts.tpl')) {
            $this->response->setOutput($this->load->view($this->config->get('config_template') . '/template/micropub/contacts.tpl', $data));
        } else {
            $this->response->setOutput($this->load->view('default/template/micropub/contacts.tpl', $data));
        }
    }

    public function live()
    {

        $this->document->setTitle('Post A Note');
        $this->document->setIcon('/image/static/note.jpg');
        $this->document->addMeta("mobile-web-app-capable", "yes");
        $data['title'] = 'Post A Note';

        $data['header'] = $this->load->controller('common/header/clean');
        $data['footer'] = $this->load->controller('common/footer/clean');
        $data['login'] = $this->url->link('auth/login');

        if ($this->session->data['is_owner']) {
            $data['is_owner'] = true;
        }

        $this->document->setDescription($this->config->get('config_meta_description'));

        if (isset($this->session->data['user_site'])) {
            $user = $this->session->data['user_site'];
            $data['user_name'] = $user;

            $micropub_endpoint = $this->session->data['micropub_' . $user];
            if (!$micropub_endpoint) {
                $micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($user);
                $this->session->data['micropub_' . $user] = $micropub_endpoint;
            }
            if ($micropub_endpoint) {
                $data['micropubEndpoint'] = $micropub_endpoint;
                $data['action'] = $this->url->link('micropub/client/send', '', '');
            }
            $data['syn_arr'] = $this->getSyndicationArray();
        }

        $data['post'] = array();

        if ($this->session->data['is_owner'] && isset($this->request->get['id']) && !empty($this->request->get['id'])) {
            $this->load->model('blog/post');
            $data['post'] = $this->model_blog_post->getPost($this->request->get['id']);
        }

        if (isset($this->request->get['category'])) {
            $data['post']['category'] = $this->request->get['category'];
        }
        if (isset($this->request->get['syndicate-to'])) {
            $data['post']['syndicate-to'] = $this->request->get['syndicate-to'];
        }

        $data['token'] = isset($this->session->data['token']);


        if (file_exists(DIR_TEMPLATE . $this->config->get('config_template') . '/template/micropub/live.tpl')) {
            $this->response->setOutput($this->load->view($this->config->get('config_template') . '/template/micropub/live.tpl', $data));
        } else {
            $this->response->setOutput($this->load->view('default/template/micropub/live.tpl', $data));
        }
    }
    public function note()
    {

        $this->document->setTitle('Post A Note');
        $this->document->setIcon('/image/static/note.jpg');
        $this->document->addMeta("mobile-web-app-capable", "yes");
        $data['title'] = 'Post A Note';

        $data['header'] = $this->load->controller('common/header/clean');
        $data['footer'] = $this->load->controller('common/footer/clean');
        $data['login'] = $this->url->link('auth/login');

        if ($this->session->data['is_owner']) {
            $data['is_owner'] = true;
        }

        $this->document->setDescription($this->config->get('config_meta_description'));

        if (isset($this->session->data['user_site'])) {
            $user = $this->session->data['user_site'];
            $data['user_name'] = $user;

            $micropub_endpoint = $this->session->data['micropub_' . $user];
            if (!$micropub_endpoint) {
                $micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($user);
                $this->session->data['micropub_' . $user] = $micropub_endpoint;
            }
            if ($micropub_endpoint) {
                $data['micropubEndpoint'] = $micropub_endpoint;
                $data['action'] = $this->url->link('micropub/client/send', '', '');
            }
            $data['syn_arr'] = $this->getSyndicationArray();
        }

        if ($this->session->data['is_owner'] && isset($this->request->get['id']) && !empty($this->request->get['id'])) {
            $this->load->model('blog/post');
            $data['post'] = $this->model_blog_post->getPost($this->request->get['id']);
        }

        $data['token'] = isset($this->session->data['token']);


        if (file_exists(DIR_TEMPLATE . $this->config->get('config_template') . '/template/micropub/note.tpl')) {
            $this->response->setOutput($this->load->view($this->config->get('config_template') . '/template/micropub/note.tpl', $data));
        } else {
            $this->response->setOutput($this->load->view('default/template/micropub/note.tpl', $data));
        }
    }

    public function checkin()
    {

        $this->document->setTitle('Check-in');
        $data['title'] = 'Check-in';
        $this->document->setIcon('/image/static/checkin.jpg');
        $this->document->addMeta("mobile-web-app-capable", "yes");

        $data['header'] = $this->load->controller('common/header/clean');
        $data['footer'] = $this->load->controller('common/footer/clean');
        $data['login'] = $this->url->link('auth/login');

        if ($this->session->data['is_owner']) {
            $data['is_owner'] = true;
        }

        $this->document->setDescription($this->config->get('config_meta_description'));

        if (isset($this->session->data['user_site'])) {
            $user = $this->session->data['user_site'];
            $data['user_name'] = $user;

            $micropub_endpoint = $this->session->data['micropub_' . $user];
            if (!$micropub_endpoint) {
                $micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($user);
                $this->session->data['micropub_' . $user] = $micropub_endpoint;
            }
            if ($micropub_endpoint) {
                $data['micropubEndpoint'] = $micropub_endpoint;
                $data['action'] = $this->url->link('micropub/client/send', '', '');
            }
            $data['syn_arr'] = $this->getSyndicationArray();
        }

        if ($this->session->data['is_owner'] && isset($this->request->get['id']) && !empty($this->request->get['id'])) {
            $this->load->model('blog/post');
            $data['post'] = $this->model_blog_post->getPost($this->request->get['id']);
        }

        $data['token'] = isset($this->session->data['token']);

        if (file_exists(DIR_TEMPLATE . $this->config->get('config_template') . '/template/micropub/checkin.tpl')) {
            $this->response->setOutput($this->load->view($this->config->get('config_template') . '/template/micropub/checkin.tpl', $data));
        } else {
            $this->response->setOutput($this->load->view('default/template/micropub/checkin.tpl', $data));
        }
    }

    public function editPost()
    {

        $this->document->setTitle('Edit a Post');
        $data['title'] = 'Edit a Post';

        $data['header'] = $this->load->controller('common/header');
        $data['footer'] = $this->load->controller('common/footer');
        $data['login'] = $this->url->link('auth/login');

        $this->document->setDescription($this->config->get('config_meta_description'));

        if (isset($this->session->data['user_site'])) {
            $user = $this->session->data['user_site'];
            $data['user_name'] = $user;

            $micropub_endpoint = $this->session->data['micropub_' . $user];
            if (!$micropub_endpoint) {
                $micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($user);
                $this->session->data['micropub_' . $user] = $micropub_endpoint;
            }
            if ($micropub_endpoint) {
                $data['micropubEndpoint'] = $micropub_endpoint;
                $data['action'] = $this->url->link('micropub/client/send', '', '');
            }
            $data['syn_arr'] = $this->getSyndicationArray();
        }

        if ($this->session->data['is_owner'] && isset($this->request->get['id']) && !empty($this->request->get['id'])) {
            $this->load->model('blog/post');
            $data['post'] = $this->model_blog_post->getPost($this->request->get['id']);
        }

        if (isset($this->request->get['url']) && !empty($this->request->get['url'])) {
            //TaODOME
            //mpDownloadPost
            $data['post'] = $this->mpDownloadPost($this->request->get['url']);
            //$data['post'] = $this->downloadEntry($this->request->get['url']);
        }

        if (isset($this->request->get['op'])) {
            $data['op'] = $this->request->get['op'];
        }

        $data['token'] = isset($this->session->data['token']);

        $data['new_entry_link'] = $this->url->link('micropub/client');
        $data['edit_entry_link'] = $this->url->link('micropub/client/editPost');
        $data['delete_entry_link'] = $this->url->link('micropub/client/deletePost');
        $data['undelete_entry_link'] = $this->url->link('micropub/client/undeletePost');

        if (file_exists(DIR_TEMPLATE . $this->config->get('config_template') . '/template/micropub/edit.tpl')) {
            $this->response->setOutput($this->load->view($this->config->get('config_template') . '/template/micropub/edit.tpl', $data));
        } else {
            $this->response->setOutput($this->load->view('default/template/micropub/edit.tpl', $data));
        }
    }

    public function deletePost()
    {
        $this->document->setTitle('Delete a Post');
        $data['title'] = 'Delete a Post';

        $data['header'] = $this->load->controller('common/header');
        $data['footer'] = $this->load->controller('common/footer');
        $data['login'] = $this->url->link('auth/login');

        $this->document->setDescription($this->config->get('config_meta_description'));

        if (isset($this->session->data['user_site'])) {
            $user = $this->session->data['user_site'];
            $data['user_name'] = $user;

            $micropub_endpoint = $this->session->data['micropub_' . $user];
            if (!$micropub_endpoint) {
                $micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($user);
                $this->session->data['micropub_' . $user] = $micropub_endpoint;
            }
            if ($micropub_endpoint) {
                $data['micropubEndpoint'] = $micropub_endpoint;
                $data['action'] = $this->url->link('micropub/client/send', '', '');
            }
            $data['syn_arr'] = $this->getSyndicationArray();
        }

        if ($this->session->data['is_owner'] && isset($this->request->get['id']) && !empty($this->request->get['id'])) {
            $this->load->model('blog/post');
            $data['post'] = $this->model_blog_post->getPost($this->request->get['id']);
        }

        if (isset($this->request->get['url']) && !empty($this->request->get['url'])) {
            //$data['post'] = $this->downloadEntry($this->request->get['url'], true);
            $data['post'] = array('permalink' => $this->request->get['url']);
        }


        $data['token'] = isset($this->session->data['token']);

        $data['new_entry_link'] = $this->url->link('micropub/client');
        $data['edit_entry_link'] = $this->url->link('micropub/client/editPost');
        $data['delete_entry_link'] = $this->url->link('micropub/client/deletePost');
        $data['undelete_entry_link'] = $this->url->link('micropub/client/undeletePost');

        if (file_exists(DIR_TEMPLATE . $this->config->get('config_template') . '/template/micropub/delete.tpl')) {
            $this->response->setOutput($this->load->view($this->config->get('config_template') . '/template/micropub/delete.tpl', $data));
        } else {
            $this->response->setOutput($this->load->view('default/template/micropub/delete.tpl', $data));
        }
    }
    public function unDeletePost()
    {
        $this->document->setTitle('Undelete a Post');
        $data['title'] = 'Undelete a Post';

        $data['header'] = $this->load->controller('common/header');
        $data['footer'] = $this->load->controller('common/footer');
        $data['login'] = $this->url->link('auth/login');

        $this->document->setDescription($this->config->get('config_meta_description'));

        if (isset($this->session->data['user_site'])) {
            $user = $this->session->data['user_site'];
            $data['user_name'] = $user;

            $micropub_endpoint = $this->session->data['micropub_' . $user];
            if (!$micropub_endpoint) {
                $micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($user);
                $this->session->data['micropub_' . $user] = $micropub_endpoint;
            }
            if ($micropub_endpoint) {
                $data['micropubEndpoint'] = $micropub_endpoint;
                $data['action'] = $this->url->link('micropub/client/send', '', '');
            }
            $data['syn_arr'] = $this->getSyndicationArray();
        }

        if ($this->session->data['is_owner'] && isset($this->request->get['id']) && !empty($this->request->get['id'])) {
            $this->load->model('blog/post');
            $data['post'] = $this->model_blog_post->getPost($this->request->get['id']);
        }

        if (isset($this->request->get['url']) && !empty($this->request->get['url'])) {
            //$data['post'] = $this->downloadEntry($this->request->get['url'], true);
            $data['post'] = array('permalink' => $this->request->get['url']);
        }


        $data['token'] = isset($this->session->data['token']);

        $data['new_entry_link'] = $this->url->link('micropub/client');
        $data['edit_entry_link'] = $this->url->link('micropub/client/editPost');
        $data['delete_entry_link'] = $this->url->link('micropub/client/deletePost');
        $data['undelete_entry_link'] = $this->url->link('micropub/client/undeletePost');

        if (file_exists(DIR_TEMPLATE . $this->config->get('config_template') . '/template/micropub/undelete.tpl')) {
            $this->response->setOutput($this->load->view($this->config->get('config_template') . '/template/micropub/undelete.tpl', $data));
        } else {
            $this->response->setOutput($this->load->view('default/template/micropub/undelete.tpl', $data));
        }
    }

    private function getSyndicationArray()
    {

        $user = $this->session->data['user_site'];
        $syn_arr = $this->session->data['syndication_' . $user];
        if (!$syn_arr) {
            $micropub_endpoint = $this->session->data['micropub_' . $user];
            if (!$micropub_endpoint) {
                $micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($user);
                $this->session->data['micropub_' . $user] = $micropub_endpoint;
            }

            $ch = curl_init($micropub_endpoint . (strpos($micropub_endpoint, '?') === false ? '?' : '&') . 'q=syndicate-to');

            if (!$ch) {
                $this->log->write('error with curl_init');
            }


            if (!$ch) {
                $this->log->write('error with curl_init');
            }

            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $this->session->data['token']));

            /////////////////////////////////////////////////
            //TODO: once my hosting provider fixes its issue i can remove this
            //curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            /////////////////////////////////////////////////

            $response = curl_exec($ch);
            parse_str($response, $syn_arr);
            $this->session->data['syndication_' . $user] = $syn_arr;
        }
        if (isset($syn_arr['syndicate-to'])) {
            return $syn_arr['syndicate-to'];
        } else {
            return null;
        }

    }

    public function send()
    {

        $post_data_array = $this->request->post;
        if (!isset($post_data_array['h']) || empty($post_data_array['h'])) {
            $post_data_array['h'] = 'entry';
        }

        if (isset($post_data_array['mp-type']) && $post_data_array['mp-type'] == 'article') {
            $post_data_array['content']  = html_entity_decode($post_data_array['content']);
        }

        $syn_to_hack = '';
        if (isset($post_data_array['syndicate-to'])) {
            $syn_to_hack = 'syndicate-to=' . urlencode(implode(',', $post_data_array['syndicate-to'])) . '&';
        }

        $post_data = $syn_to_hack . http_build_query($post_data_array);

        $user = $this->session->data['user_site'];

        $micropub_endpoint = $this->session->data['micropub_' . $user];
        if (!$micropub_endpoint) {
            $micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($user);
            $this->session->data['micropub_' . $user] = $micropub_endpoint;
        }

        $ch = curl_init($micropub_endpoint);

        if (!$ch) {
            $this->log->write('error with curl_init');
        }

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $this->session->data['token']));
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);

        /////////////////////////////////////////////////
        //TODO: once my hosting provider fixes its issue i can remove this
        //curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        /////////////////////////////////////////////////

        $response = curl_exec($ch);
        $result = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if (in_array($result, array(200,201,204,301,302))) {
            if (in_array($result, array(201,301,302))) {
                $target_url = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
                $this->session->data['success_url'] = $target_url;
            }
            $this->session->data['success'] = 'Post Submitted.';
        } else {
            $this->session->data['error'] = 'Error:  Return code ' . $result . '.';
        }
        if (isset($this->request->post['mp-type']) && $this->request->post['mp-type'] == 'article') {
            $this->response->redirect($this->url->link('micropub/client/article'));
        } elseif (isset($this->request->post['postly-live'])) {
            $this->response->redirect($this->url->link('micropub/client/live', $syn_to_hack . 'category=' . $post_data_array['category']));
        } else {
            $this->response->redirect($this->url->link('micropub/client'));
        }
    }

    private function getCard($card_url)
    {

        $ch = curl_init($card_url);

        if (!$ch) {
            $this->log->write('error with curl_init');
        }

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 20);
        $real_source_url = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
        $page_content = curl_exec($ch);
        $mfitems = Mf2\parse($page_content, $real_source_url)['items'];
        $card_mf2 = null;
        foreach ($mfitems as $mf) {
            if (array_key_exists('type', $mf) && in_array('h-card', $mf['type']) && array_key_exists('properties', $mf)) {
                $card_mf2 = $mf;
                break;
            }
        }

        if ($card_mf2) {
            $card = array();
            $properties = $mf['properties'];
            //$this->log->write(print_r($properties,true));

            if (array_key_exists('photo', $properties)) {
                $card['photo'] = $properties['photo'][0];
            }

            if (array_key_exists('name', $properties)) {
                $card['name'] = $properties['name'][0];
            }

            if (array_key_exists('url', $properties)) {
                $card['url'] = $properties['url'][0];
            } else {
                $card['url'] = $real_source_url;
            }
        }

        return $card;
    }
    private function downloadEntry($entry_url, $as_html = false)
    {
        $ch = curl_init($entry_url);

        if (!$ch) {
            $this->log->write('error with curl_init');
        }

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 20);
        $real_source_url = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
        $page_content = curl_exec($ch);
        $mf = Mf2\parse($page_content, $real_source_url)['items'][0];
        //$this->log->write($response);
        $post = array();
        if (array_key_exists('type', $mf) && in_array('h-entry', $mf['type']) && array_key_exists('properties', $mf)) {
            $properties = $mf['properties'];
            //$this->log->write(print_r($properties,true));

            if (array_key_exists('content', $properties)) {
                if ($as_html) {
                    $post['body'] = $properties['content'][0]['html'];
                } else {
                    $post['body'] = strip_tags($properties['content'][0]['html']);
                }
            }

            if (array_key_exists('name', $properties)) {
                $post['name'] = $properties['name'][0];
            }

            if (array_key_exists('in-reply-to', $properties)) {
                $post['replyto'] = $properties['in-reply-to'][0]['value'];
            }
            $post['permalink'] = $real_source_url;
        }

        //$post['body'] = print_r($mf2_parsed['items'][0],true);
        return $post;
    }
    private function mpDownloadPost()
    {

        $user = $this->session->data['user_site'];
        $micropub_endpoint = $this->session->data['micropub_' . $user];
        if (!$micropub_endpoint) {
            $micropub_endpoint = IndieAuth\Client::discoverMicropubEndpoint($user);
            $this->session->data['micropub_' . $user] = $micropub_endpoint;
        }

        $ch = curl_init($micropub_endpoint . (strpos($micropub_endpoint, '?') === false ? '?' : '&') . 'url=' . $this->request->get['url']);

        if (!$ch) {
            $this->log->write('error with curl_init');
        }

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $this->session->data['token']));

        /////////////////////////////////////////////////
        //TODO: once my hosting provider fixes its issue i can remove this
        //curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        /////////////////////////////////////////////////

        $response = curl_exec($ch);
        parse_str($response, $post);
        return $post;

    }

}
