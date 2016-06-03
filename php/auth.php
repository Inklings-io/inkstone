<?php
session_start();
require __DIR__ . '/../vendor/autoload.php';

    $me = normalizeUrl($_GET['me']);
    $code = $_GET['code'];
    $state = $_GET['state'];
    $redir_url = CLIENT_URL . '/php/auth.php';

    $error = null;
    if($state != $_SESSION['state']){
        $error = 'Error with authorization: State does not match';
    } else {
        $token_results = getToken($me, $code, $redir_url, $state);
        if (!$token_results || empty($token_results)) {
            $error = 'Error getting Token';
        }
    }
?>

<html>
<body>
<script>
<?php if(!$error): ?>
    window.localStorage.setItem("me", '<?php echo $me?>');
    window.localStorage.setItem("token", '<?php echo $token_results['access_token']?>');
    window.localStorage.setItem("scope", '<?php echo $token_results['scope']?>');
<?php endif ?>
    setTimeout("location.href = '<?php echo CLIENT_URL;?>';", 3000);
</script>
<?php if(!$error): ?>
    <h1>Please wait, while your login is completed.</h1>
<?php else: ?>
    <h1><?php echo $error?>, Redirecting to main application.</h1>
<?php endif ?>

</body>
</html>
