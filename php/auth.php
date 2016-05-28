<?php
session_start();
require '../vendor/autoload.php';

    $me = normalizeUrl($_GET['me']);
    $code = $_GET['code'];
    $state = $_GET['state'];
    $redir_url = CLIENT_URL . '/php/auth.php';

    $result = confirmAuth($me, $code, $redir_url, $state);
    if ($result) {
        $token_results = getToken($me, $code, $redir_url, $state);
        ?>

        <html>
        <body>
        <script>
            window.localStorage.setItem("me", '<?php echo $me?>');
            window.localStorage.setItem("token", '<?php echo $token_results['access_token']?>');
            window.localStorage.setItem("scope", '<?php echo $token_results['scope']?>');
            setTimeout("location.href = '<?php echo CLIENT_URL;?>';", 1500);
        </script>
        <h1>Please wait, while your login is completed.</h1>
        </body>
        </html>


        <?php
    } else {
        ?>
        <html>
        <body>
        <script>
            setTimeout("location.href = '<?php echo CLIENT_URL;?>';", 1500);
        </script>
            <h1>Login Failed, Redirecting back to main application;</h1>
        </body>
        </html>
        <?php

    }

?>
