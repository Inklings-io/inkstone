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
                $('#input-syndicateto').hide();
            } else {
                $('#input-syndicateto').html('');
                for (i = 0; i < targets_array.length; i++) {
                    $('#input-syndicateto').append('<option value="'+targets_array[i]+'">'+targets_array[i]+'</option');
                }
          
                $('#input-syndicateto').show();
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
            alert('posted');
            $('#input-content').val('');
            $('#input-syndicateto').val('');

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
