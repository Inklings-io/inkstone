// We use an "Immediate Function" to initialize the application to avoid leaving anything behind in the global scope
(function () {

    /* ---------------------------------- Local Variables ---------------------------------- */
    var loginTpl = Handlebars.compile($("#login-tpl").html());
    var homeTpl = Handlebars.compile($("#home-tpl").html());
    var newNoteTpl = Handlebars.compile($("#new-note-tpl").html());
    var cameraTpl = Handlebars.compile($("#camera-tpl").html());
    var palette = 'shine'; //dark, light, or shine
    var config;

    /* --------------------------------- Event Registration -------------------------------- */

    document.addEventListener('deviceready', function () {
      if (navigator.notification) { // Override default HTML alert with native dialog
          window.alert = function (message) {
              navigator.notification.alert(
                  message,    // message
                  null,       // callback
                  "Workshop", // title
                  'OK'        // buttonName
              );
          };
      }
    }, false);

    /* ---------------------------------- Local Functions ---------------------------------- */
    function renderHomeView() {
        icons = [
            {'image':'icons-nonfree/iconSweets2/'+palette+'/64-Speech-Bubble.png', 'label':'New Note', 'id':'newnote'},
            {'image':'icons-nonfree/iconSweets2/'+palette+'/64-Document.png', 'label':'New Article', 'id':'newarticle'},
            {'image':'icons-nonfree/iconSweets2/'+palette+'/64-Marker.png', 'label':'New Checkin', 'id':'newcheckin'},
            {'image':'icons-nonfree/iconSweets2/'+palette+'/64-Camera.png', 'label':'New Photo', 'id':'newphoto'},
            {'image':'icons-nonfree/iconSweets2/'+palette+'/64-Microphone.png', 'label':'New Audio', 'id':'newaudio'},
            {'image':'icons-nonfree/iconSweets2/'+palette+'/64-Day-Calendar.png', 'label':'New Event', 'id':'newevent'},
            {'image':'icons-nonfree/iconSweets2/'+palette+'/64-Settings-2.png', 'label':'Settings', 'id':'settings'},
            {'image':'icons-nonfree/iconSweets2/'+palette+'/64-Exit.png', 'label':'Logout', 'id':'exit'}
        ]
        $('body').html(homeTpl(icons));
        $('#homeicon_newnote').on('click', renderNewNoteView);
        $('#homeicon_exit').on('click', logout);
        $('#homeicon_newphoto').on('click', renderNewPhotoView);
    }

    function renderLoginView() {
        $('body').html(loginTpl({'palette':palette}));
        $('#login-btn').on('click', login);
    }

    function renderNewPhotoView() {
        $('body').html(cameraTpl({'palette':palette}));
        $('#home-btn').on('click', renderHomeView);
        $('#post-btn').on('click', postPhoto);
        $('#camera-btn').on('click', take_a_picture);
        $('#gallery-btn').on('click', get_a_picture);
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

    function renderNewNoteView() {
        $('body').html(newNoteTpl({'palette':palette}));
        $('#home-btn').on('click', renderHomeView);
        $('#post-btn').on('click', sendNote);
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

    function sendNote(){
        content = $('#input-content').val();
        syndicate = $('#input-syndicateto').val();

        // todo escapte content and syndicate
        data = 'type=note&h=entry&operation=create&content='+content;
        if(syndicate){
            for (i = 0; i < syndicate.length; i++) {
                    data += '&syndicate-to[]='+syndicate[i];
            }
        }

        mp_send(data, function(){
            alert('Posted!');
            $('#input-content').val('');
            $('#input-syndicateto').val('');
            //$('#success').html('Posted!');
            //$('#success').show();
            //setTimeout(function() {
                    //$('#success').fadeOut('fast');
            //}, 2000);

        });
    }

    function get_a_picture(){
        navigator.camera.getPicture(onPhotoSuccess, onPhotoFail, { quality: 50,
              destinationType: Camera.DestinationType.FILE_URI,
              sourceType : Camera.PictureSourceType.PHOTOLIBRARY, // or SAVEDPHOTOALBUM not sure what the difference is
              allowEdit : true,
              encodingType: Camera.EncodingType.JPEG,
              targetWidth: config.photo_width,
              targetHeight: config.photo_height,
              popoverOptions: CameraPopoverOptions,
              correctOrientation: true,
              saveToPhotoAlbum: false
        });
    }
    function take_a_picture(){
        navigator.camera.getPicture(onPhotoSuccess, onPhotoFail, { quality: 50,
              destinationType: Camera.DestinationType.FILE_URI,
              sourceType : Camera.PictureSourceType.CAMERA,
              allowEdit : true,
              encodingType: Camera.EncodingType.JPEG,
              targetWidth: config.photo_width,
              targetHeight: config.photo_height,
              popoverOptions: CameraPopoverOptions,
              correctOrientation: true,
              saveToPhotoAlbum: false
        });
    }

    var photoData;
    function onPhotoSuccess(imageSrc) {
            $('#MyImage').attr('src', imageSrc);
            photoData = imageSrc;

    }

    function onPhotoFail(message) {
            alert('Failed because: ' + message);
    }

    function postPhoto(){
        content = $('#input-content').val();
        photo_uri = photoData;
        syndicate = $('#input-syndicateto').val();

        data_obj = { 'h': 'entry',
            'type':'photo',
            'operation':'create',
            'content': content
        }
        // todo escape content and syndicate
        if(syndicate){
            for (i = 0; i < syndicate.length; i++) {
                data_obj['syndicate-to['+i+']'] = syndicate[i];
            }
        }
        mp_uploadFile(data_obj, "photo", "image/jpeg", photo_uri,
            function(r){ 
                alert('Posted!');
                $('#input-content').val('');
                $('#input-syndicateto').val('');
                photoData = null;
                $('#MyImage').attr('src', '');
            },
            function(error){ alert("An error has occurred: Code = " + error.code); 
        });

    }


    function logout(){
        mp_logout();
        renderLoginView();
    }

    function login() {
        mp_login($('.me').val(), function(){
            renderHomeView();
        });
    } // end login()

    if(mp_logged_in()){
        renderHomeView();
    } else {
        renderLoginView();
    }

    config = window.localStores.getItem("config");
    if(!config){
        config = {
            photo_width: 512,
            photo_height: 512
        }
        window.localStores.setItem("config", config);
    }
}());
