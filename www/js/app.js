// We use an "Immediate Function" to initialize the application to avoid leaving anything behind in the global scope
(function () {

    /* ---------------------------------- Local Variables ---------------------------------- */

    /* --------------------------------- Event Registration -------------------------------- */
    $('#login-btn').on('click', login);
    $('#logout-btn').on('click', logout);
    $('#post-btn').on('click', sendPost);


    /* ---------------------------------- Local Functions ---------------------------------- */
    function showPostingUI(){
        $('#loginPage').hide();
        $('#postingPage').show();
        getSyndicationTargets(function(targets){
            targets_array = targets.split(',');
            if(!targets_array){
                $('#input-syndication-wrapper').hide();
            } else {
                $('#input-syndicateto').html('');
                for (i = 0; i < targets_array.length; i++) {
                    $('#input-syndicateto').append('<option value="'+targets_array[i]+'">'+targets_array[i]+'</option');
                }
                $('#input-syndication-wrapper').show();
            }
        });
    }

    function logout(){
        $('#postingPage').hide();
        $('#loginPage').show();
        mp_logout();
    }


    function sendPost(){
        content = $('#input-content').val();
        syndicate = $('#input-syndicateto').val();

        // todo escapte content and syndicate
        data = 'type=note&h=entry&content='+content;
        if(syndicate){
            for (i = 0; i < syndicate.length; i++) {
                    data += '&syndicate-to[]='+syndicate[i];
            }
        }

        mp_send(data, function(){
            $('#input-content').val('');
            $('#input-syndicateto').val('');
            $('#success').html('Posted!');
            $('#success').show();
            setTimeout(function() {
                    $('#success').fadeOut('fast');
            }, 2000);

        });

    }



    function login() {
        mp_login($('.me').val(), function(){
                showPostingUI()
        });
    } // end login()



    if(mp_logged_in()){
        showPostingUI();
    }

}());
