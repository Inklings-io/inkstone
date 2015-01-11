// We use an "Immediate Function" to initialize the application to avoid leaving anything behind in the global scope
(function () {

    /* ---------------------------------- Local Variables ---------------------------------- */
    var loginTpl = Handlebars.compile($("#login-tpl").html());
    var homeTpl = Handlebars.compile($("#home-tpl").html());
    var newNoteTpl = Handlebars.compile($("#new-note-tpl").html());
    var newCheckinTpl = Handlebars.compile($("#new-checkin-tpl").html());
    var cameraTpl = Handlebars.compile($("#camera-tpl").html());
    var audioTpl = Handlebars.compile($("#audio-tpl").html());
    var videoTpl = Handlebars.compile($("#video-tpl").html());
    var settingsTpl = Handlebars.compile($("#settings-tpl").html());
    var config;
    var photoData;
    var audioData;
    var videoData;

    if(window.localStorage.getItem("config")){
        config = JSON.parse(window.localStorage.getItem("config"));
    } else {
        config = {}
    }
    if(config['photo_width'] === undefined){
        config['photo_width']= 512;
    }
    if(config['photo_height'] === undefined){
        config['photo_height']= 512;
    }
    if(config['photo_edit'] === undefined){
        config['photo_edit']= true;
    }
    if(config['support_photo'] === undefined){
        config['support_photo']= true;
    }
    if(config['support_video'] === undefined){
        config['support_video']= true;
    }
    if(config['support_audio'] === undefined){
        config['support_audio']= true;
    }
    if(config['geo_high_accuracy'] === undefined){
        config['geo_high_accuracy']= true;
    }
    if(config['palette'] === undefined){
        config['palette']= 'shine';//dark, light, or shine
    }
    window.localStorage.setItem("config", JSON.stringify(config));

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
        icons = [];
        icons.push({'image':'icons-nonfree/iconSweets2/'+config['palette']+'/64-Speech-Bubble.png', 'label':'Note', 'id':'newnote'});
        icons.push({'image':'icons-nonfree/iconSweets2/'+config['palette']+'/64-Marker.png', 'label':'Checkin', 'id':'newcheckin'});

        if(config['support_photo']){
            icons.push({'image':'icons-nonfree/iconSweets2/'+config['palette']+'/64-Camera.png', 'label':'Photo', 'id':'newphoto'});
        }
        if(config['support_audio']){
            icons.push({'image':'icons-nonfree/iconSweets2/'+config['palette']+'/64-Microphone.png', 'label':'Audio', 'id':'newaudio'});
        }
        if(config['support_video']){
            icons.push({'image':'icons-nonfree/iconSweets2/'+config['palette']+'/64-Film-Strip.png', 'label':'Video', 'id':'newvideo'});
        }

        //icons.push({'image':'icons-nonfree/iconSweets2/'+config['palette']+'/64-Day-Calendar.png', 'label':'New Event', 'id':'newevent'});
        icons.push({'image':'icons-nonfree/iconSweets2/'+config['palette']+'/64-Settings-2.png', 'label':'Settings', 'id':'settings'});
        icons.push({'image':'icons-nonfree/iconSweets2/'+config['palette']+'/64-Exit.png', 'label':'Logout', 'id':'exit'});
        
        //icons.push({'image':'icons-nonfree/iconSweets2/'+config['palette']+'/64-Document.png', 'label':'New Article', 'id':'newarticle'});
        $('body').html(homeTpl(icons));
        $('#homeicon_newnote').on('click', renderNewNoteView);
        $('#homeicon_newcheckin').on('click', renderNewCheckinView);
        $('#homeicon_exit').on('click', logout);
        $('#homeicon_newphoto').on('click', renderNewPhotoView);
        $('#homeicon_newaudio').on('click', renderNewAudioView);
        $('#homeicon_newvideo').on('click', renderNewVideoView);
        $('#homeicon_settings').on('click', renderSettingsView);
    }

    function renderLoginView() {
        $('body').html(loginTpl(config));
        $('#login-btn').on('click', login);
    }

    function renderSettingsView() {
        $('body').html(settingsTpl(config));
        $('#home-btn').on('click', renderHomeView);
        $('.onoffswitch').on('click', function(ev){
            theSwitch = $(this);
            theSwitch.toggleClass('on');
            config[theSwitch.attr('id')] = theSwitch.hasClass('on'); 
            window.localStorage.setItem("config", JSON.stringify(config));
        });
        $('.setting .input-label input').on('change', function(ev){
            theInput = $(this);
            config[theInput.attr('name')] = theInput.val(); 
            window.localStorage.setItem("config", JSON.stringify(config));
        });
        $('#btn-reset').on('click', function(ev){
            config = {
                'photo_width': 512,
                'photo_height': 512,
                'photo_edit': true,
                'support_photo': true,
                'support_video': true,
                'support_audio': true,
                'geo_high_accuracy': true,
                'palette': 'shine'//dark, light, or shine
            };
          window.localStorage.setItem("config", JSON.stringify(config));
        });
    }

    function renderNewVideoView() {
        $('body').html(videoTpl(config));
        $('#home-btn').on('click', renderHomeView);
        $('#post-btn').on('click', postVideo);
        $('#video-btn').on('click', recordVideo);
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
    function renderNewAudioView() {
        $('body').html(audioTpl(config));
        $('#home-btn').on('click', renderHomeView);
        $('#post-btn').on('click', postAudio);
        $('#audio-btn').on('click', recordAudio);
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

    function renderNewPhotoView() {
        $('body').html(cameraTpl(config));
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

    function renderNewCheckinView() {
        $('body').html(newCheckinTpl(config));
        $('#home-btn').on('click', renderHomeView);
        $('#post-btn').on('click', sendCheckin);
        $('#geo-btn').on('click', getGeo);
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
        $('body').html(newNoteTpl(config));
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

    function sendCheckin(){
        content = $('#input-content').val();
        syndicate = $('#input-syndicateto').val();
        geo_location = $('#geoloc').val();
        geo_place_name = $('#loc_name').val();

        // todo escapte content and syndicate
        data = 'type=checkin&h=entry&operation=create&content='+content;
        if(geo_location != ''){
            data += '&location='+geo_location
        }
        if(geo_place_name != ''){
            data += '&place_name='+geo_place_name
        }
        if(syndicate){
            for (i = 0; i < syndicate.length; i++) {
                    data += '&syndicate-to[]='+syndicate[i];
            }
        }

        mp_send(data, function(){
            alert('Posted!');
            $('#input-content').val('');
            $('#input-syndicateto').val('');
            $('#geoloc').val('');
            $('#loc_name').val('');
            //$('#success').html('Posted!');
            //$('#success').show();
            //setTimeout(function() {
                    //$('#success').fadeOut('fast');
            //}, 2000);

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
        navigator.camera.getPicture(onPhotoSuccess, onPhotoFail, {
              destinationType: Camera.DestinationType.NATIVE_URI,
              sourceType: Camera.PictureSourceType.PHOTOLIBRARY
        });
    }
    function take_a_picture(){
        navigator.camera.getPicture(onPhotoSuccess, onPhotoFail, { quality: 50,
              destinationType: Camera.DestinationType.FILE_URI,
              sourceType : Camera.PictureSourceType.CAMERA,
              allowEdit : config['photo_edit'],
              encodingType: Camera.EncodingType.JPEG,
              targetWidth: config['photo_width'],
              targetHeight: config['photo_height'],
              popoverOptions: CameraPopoverOptions,
              correctOrientation: true,
              saveToPhotoAlbum: false
        });
    }



    function getGeo(){
        navigator.geolocation.getCurrentPosition(
         function(position){
            $('#geoloc').val('geo:'+position.coords.latitude + "," + position.coords.longitude)
    //alert('Latitude: '          + position.coords.latitude          + '\n' +
          //'Longitude: '         + position.coords.longitude         + '\n' +
          //'Altitude: '          + position.coords.altitude          + '\n' +
          //'Accuracy: '          + position.coords.accuracy          + '\n' +
          //'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          //'Heading: '           + position.coords.heading           + '\n' +
          //'Speed: '             + position.coords.speed             + '\n' +
          //'Timestamp: '         + position.timestamp                + '\n');

         },
         function(message){
            alert('error: ' + error.code + '\n' + 'message: ' + error.message + '\n');
         },
         {
            maximumAge: 3000, timeout: 5000, enableHighAccuracy: config['geo_high_accuracy'] 
         });
    }


    function recordVideo(){
        navigator.device.capture.captureVideo( function(mediaFiles){
            //if there are somehow multiple files, only take the last one
            videoData = mediaFiles[mediaFiles.length -1];
            $('#VideoFile').html(videoData.name);
        },
        function(message){
            alert('Failed: ' + message);
        });
    }

    function recordAudio(){
        navigator.device.capture.captureAudio( function(mediaFiles){
            //if there are somehow multiple files, only take the last one
            audioData = mediaFiles[mediaFiles.length -1];
            $('#AudioFile').html(audioData.name);
        },
        function(message){
            alert('Failed: ' + message);
        });
    }


    function onPhotoSuccess(imageSrc) {
        $('#PhotoPreview').attr('src', imageSrc);
        photoData = imageSrc;
        navigator.camera.cleanup(function(){}, function(){});
    }

    function onPhotoFail(message) {
        alert('Failed: ' + message);
        //i don't think you need this if it failed to capture
        //navigator.camera.cleanup(function(){}, function(){});
    }

    function postVideo(){
        content = $('#input-content').val();
        syndicate = $('#input-syndicateto').val();

        data_obj = { 'h': 'entry',
            'type':'video',
            'operation':'create',
            'content': content
        }
        // todo escape content and syndicate
        if(syndicate){
            for (i = 0; i < syndicate.length; i++) {
                data_obj['syndicate-to['+i+']'] = syndicate[i];
            }
        }
        mp_uploadFile(data_obj, "video", videoData.type, videoData.fullPath,
            function(r){ 
                alert('Posted!');
                $('#input-content').val('');
                $('#input-syndicateto').val('');
                videoData = null;
                $('#videoFile').html('');
            },
            function(error){ alert("An error has occurred: Code = " + error.code); 
        });
    }

    function postAudio(){
        content = $('#input-content').val();
        syndicate = $('#input-syndicateto').val();

        data_obj = { 'h': 'entry',
            'type':'audio',
            'operation':'create',
            'content': content
        }
        // todo escape content and syndicate
        if(syndicate){
            for (i = 0; i < syndicate.length; i++) {
                data_obj['syndicate-to['+i+']'] = syndicate[i];
            }
        }
        mp_uploadFile(data_obj, "audio", audioData.type, audioData.fullPath,
            function(r){ 
                alert('Posted!');
                $('#input-content').val('');
                $('#input-syndicateto').val('');
                audioData = null;
                $('#AudioFile').html('');
            },
            function(error){ alert("An error has occurred: Code = " + error.code); 
        });
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
                $('#PhotoPreview').attr('src', '');
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

}());
