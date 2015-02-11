// We use an "Immediate Function" to initialize the application to avoid leaving anything behind in the global scope
(function () {

    /* ---------------------------------- Local Variables ---------------------------------- */
    var loginTpl = Handlebars.compile($("#login-tpl").html());
    var homeTpl = Handlebars.compile($("#home-tpl").html());
    var newNoteTpl = Handlebars.compile($("#new-note-tpl").html());
    var newReplyTpl = Handlebars.compile($("#new-reply-tpl").html());
    var newLikeTpl = Handlebars.compile($("#new-like-tpl").html());
    var newBookmarkTpl = Handlebars.compile($("#new-bookmark-tpl").html());
    var newCheckinTpl = Handlebars.compile($("#new-checkin-tpl").html());
    var cameraTpl = Handlebars.compile($("#camera-tpl").html());
    var audioTpl = Handlebars.compile($("#audio-tpl").html());
    var videoTpl = Handlebars.compile($("#video-tpl").html());
    var settingsTpl = Handlebars.compile($("#settings-tpl").html());
    var config;
    var photoData;
    var audioData;
    var videoData;

    //var isOnline;

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

    document.addEventListener("deviceready", function () {
        if(navigator.connection.type == Connection.NONE){
            //alert(navigator.connection.type);
            setOffline();
        } else {
            setOnline();
        }
    }, false);

    document.addEventListener("offline", networkChange, false);
    document.addEventListener("online", networkChange, false);

    /* ---------------------------------- Local Functions ---------------------------------- */
    function noSpacesInUrl(){
        if($('#login-url').val().match(/\s/g)){
           $('#login-url').val($('#login-url').val().replace(/\s/g,''));
        }
    }
    function networkChange(){
        if(navigator.connection.type == Connection.NONE){
            setOffline();
        } else {
            setOnline();
        }
    }
    function setOnline(){
        config['isOnline'] = true;
        $('.online-only').removeAttr("disabled");
        $('.offline-only').hide();
    }
    function setOffline(){
        //alert('Offline');
        config['isOnline'] = false;
        $('.online-only').attr("disabled","disabled");
        $('.offline-only').show();
    }
    function renderHomeView() {
        icons = [];
        icons.push({'image':'svg/bubble.png', 'label':'Note', 'id':'newnote'});
        icons.push({'image':'svg/bubbles.png', 'label':'Reply', 'id':'newreply'});
        icons.push({'image':'svg/marker.png', 'label':'Checkin', 'id':'newcheckin'});

        if(config['support_photo']){
            icons.push({'image':'svg/camera.png', 'label':'Photo', 'id':'newphoto'});
        }
        if(config['support_audio']){
            icons.push({'image':'svg/microphone.png', 'label':'Audio', 'id':'newaudio'});
        }
        if(config['support_video']){
            icons.push({'image':'svg/film.png', 'label':'Video', 'id':'newvideo'});
        }
        icons.push({'image':'svg/bookmark.png', 'label':'Bookmark', 'id':'newbookmark'});
        icons.push({'image':'svg/heart.png', 'label':'Like', 'id':'newlike'});

        //icons.push({'image':'svg/daycalendar.png', 'label':'New Event', 'id':'newevent'});
        icons.push({'image':'svg/gear.png', 'label':'Settings', 'id':'settings'});
        icons.push({'image':'svg/power.png', 'label':'Logout', 'id':'exit'});


        saved = window.localStorage.getItem("saved");
        if(saved){
            saved = JSON.parse(saved);
            if(saved.length > 0 ){
                icons.push({'image':'svg/reload.png', 'label':'Post Saved Data ('+saved.length+')', 'id':'saved'});
            }
        }

        
        $('body').html(homeTpl(icons));
        $('#homeicon_newnote').on('click', renderNewNoteView);
        $('#homeicon_newreply').on('click', renderNewReplyView);
        $('#homeicon_newlike').on('click', renderNewLikeView);
        $('#homeicon_newbookmark').on('click', renderNewBookmarkView);
        $('#homeicon_newcheckin').on('click', renderNewCheckinView);
        $('#homeicon_exit').on('click', logout);
        $('#homeicon_newphoto').on('click', renderNewPhotoView);
        $('#homeicon_newaudio').on('click', renderNewAudioView);
        $('#homeicon_newvideo').on('click', renderNewVideoView);
        $('#homeicon_settings').on('click', renderSettingsView);
        $('#homeicon_saved').on('click', upload_all_saved);


    

    }

    function renderLoginView() {
        $('body').html(loginTpl(config));
        $('#login-btn').on('click', login);
        $('#login-url').on('keyup', noSpacesInUrl);
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
                'geo_high_accuracy': true
            };
          window.localStorage.setItem("config", JSON.stringify(config));
        });
    }

    function renderNewVideoView() {
        $('body').html(videoTpl(config));
        $('#home-btn').on('click', renderHomeView);
        $('#post-btn').on('click', postVideo);
        $('#save-btn').on('click', saveVideo);
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
        $('#save-btn').on('click', saveAudio);
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
        $('#save-btn').on('click', savePhoto);
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
        $('#save-btn').on('click', saveCheckin);
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
        $('#save-btn').on('click', saveNote);
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

    function renderNewReplyView() {
        $('body').html(newReplyTpl(config));
        $('#home-btn').on('click', renderHomeView);
        $('#post-btn').on('click', sendNote);
        $('#save-btn').on('click', saveNote);
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
    function renderNewBookmarkView() {
        $('body').html(newBookmarkTpl(config));
        $('#home-btn').on('click', renderHomeView);
        $('#post-btn').on('click', sendNote);
        $('#save-btn').on('click', saveNote);
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
    function renderNewLikeView() {
        $('body').html(newLikeTpl(config));
        $('#home-btn').on('click', renderHomeView);
        $('#post-btn').on('click', sendNote);
        $('#save-btn').on('click', saveNote);
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

    function saveCheckin(){
        content = $('#input-content').val();
        syndicate = $('#input-syndicateto').val();
        category = $('#category').val();
        geo_location = $('#geoloc').val();
        geo_place_name = $('#loc_name').val();
        $('#save-btn').attr("disabled", "disabled");

        // todo escapte content and syndicate
        data = 'mp-type=checkin&h=entry&mp-action=create&content='+content;
        if(geo_location != ''){
            data += '&location='+geo_location
        }
        if(geo_place_name != ''){
            data += '&place_name='+geo_place_name
        }
        if(category){
            data += '&category=' + encodeURIComponent(category);
        }
        if(replyurl){
            data += '&in-reply-to=' + encodeURIComponent(replyurl);
        }
        if(syndicate){
            for (i = 0; i < syndicate.length; i++) {
                    data += '&syndicate-to[]='+syndicate[i];
            }
        }
        data += '&published='+get_formatted_date();
        savePost({'type':'simple', 'data':data});

        success('Saved!');

        $('#input-content').val('');
        $('#inreplyto').val('');
        $('#like-of').val('');
        $('#bookmark').val('');
        $('#category').val('');
        $('#input-syndicateto').val('');
        $('#geoloc').val('');
        $('#loc_name').val('');
        $('#save-btn').removeAttr('disabled');
    }


    function sendCheckin(){
        content = $('#input-content').val();
        syndicate = $('#input-syndicateto').val();
        category = $('#category').val();
        geo_location = $('#geoloc').val();
        geo_place_name = $('#loc_name').val();
        $('#post-btn').attr("disabled", "disabled");

        // todo escapte content and syndicate
        data = 'mp-type=checkin&h=entry&mp-action=create&content='+content;
        if(geo_location != ''){
            data += '&location='+geo_location
        }
        if(geo_place_name != ''){
            data += '&place_name='+geo_place_name
        }

        if(category){
            data += '&category=' + encodeURIComponent(category);
        }
        if(replyurl){
            data += '&in-reply-to=' + encodeURIComponent(replyurl);
        }

        if(syndicate){
            for (i = 0; i < syndicate.length; i++) {
                    data += '&syndicate-to[]='+syndicate[i];
            }
        }

        data += '&published='+get_formatted_date();

        mp_send(data, function(){
            success('Posted!');
            $('#input-content').val('');
            $('#inreplyto').val('');
            $('#like-of').val('');
            $('#bookmark').val('');
            $('#category').val('');
            $('#input-syndicateto').val('');
            $('#geoloc').val('');
            $('#loc_name').val('');
            $('#post-btn').removeAttr('disabled');
            //$('#success').html('Posted!');
            //$('#success').show();
            //setTimeout(function() {
                    //$('#success').fadeOut('fast');
            //}, 2000);

        }, function(){
            error('Error');
            $('#post-btn').removeAttr('disabled')
        });
    }

    function saveNote(){
        content = $('#input-content').val();
        syndicate = $('#input-syndicateto').val();
        replyurl = $('#inreplyto').val();
        like = $('#like-of').val();
        bookmark = $('#bookmark').val();
        category = $('#category').val();
        $('#save-btn').attr("disabled", "disabled");

        // todo escapte content and syndicate
        data = 'mp-type=note&h=entry&mp-action=create&content='+encodeURIComponent(content);
        if(category){
            data += '&category=' + encodeURIComponent(category);
        }
        if(replyurl){
            data += '&in-reply-to=' + encodeURIComponent(replyurl);
        }
        if(like){
            data += '&like-of=' + encodeURIComponent(like);
        }
        if(bookmark){
            data += '&bookmark=' + encodeURIComponent(bookmark);
        }
        if(syndicate){
            for (i = 0; i < syndicate.length; i++) {
                    data += '&syndicate-to[]='+syndicate[i];
            }
        }
        data += '&published='+get_formatted_date();

        savePost({'type':'simple', 'data':data});

        success('Saved!');
        $('#input-content').val('');
        $('#inreplyto').val('');
        $('#bookmark').val('');
        $('#like-of').val('');
        $('#category').val('');
        $('#input-syndicateto').val('');
        $('#save-btn').removeAttr('disabled');
    }
    function sendNote(){
        content = $('#input-content').val();
        syndicate = $('#input-syndicateto').val();
        replyurl = $('#inreplyto').val();
        like = $('#like-of').val();
        bookmark = $('#bookmark').val();
        category = $('#category').val();
        $('#post-btn').attr("disabled", "disabled");

        // todo escapte content and syndicate
        data = 'mp-type=note&h=entry&mp-action=create&content='+encodeURIComponent(content);
        
        if(category){
            data += '&category=' + encodeURIComponent(category);
        }

        if(replyurl){
            data += '&in-reply-to=' + encodeURIComponent(replyurl);
        }

        if(like){
            data += '&like-of=' + encodeURIComponent(like);
        }

        if(bookmark){
            data += '&bookmark=' + encodeURIComponent(bookmark);
        }

        if(syndicate){
            for (i = 0; i < syndicate.length; i++) {
                    data += '&syndicate-to[]='+syndicate[i];
            }
        }

        data += '&published='+get_formatted_date();

        mp_send(data, function(){
            $('#post-btn').attr("disabled", "disabled");
            success('Posted!');
            $('#input-content').val('');
            $('#inreplyto').val('');
            $('#bookmark').val('');
            $('#like-of').val('');
            $('#category').val('');
            $('#input-syndicateto').val('');
            $('#post-btn').removeAttr('disabled');
            //$('#success').html('Posted!');
            //$('#success').show();
            //setTimeout(function() {
                    //$('#success').fadeOut('fast');
            //}, 2000);

        }, function(){
            error('Error');
            $('#post-btn').removeAttr('disabled')
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
            error('error: ' + error.code + '\n' + 'message: ' + error.message + '\n');
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
            error('Failed: ' + message);
        });
    }

    function recordAudio(){
        navigator.device.capture.captureAudio( function(mediaFiles){
            //if there are somehow multiple files, only take the last one
            audioData = mediaFiles[mediaFiles.length -1];
            $('#AudioFile').html(audioData.name);
        },
        function(message){
            error('Failed: ' + message);
        });
    }


    function onPhotoSuccess(imageSrc) {
        $('#PhotoPreview').attr('src', imageSrc);
        photoData = imageSrc;
        navigator.camera.cleanup(function(){}, function(){});
    }

    function onPhotoFail(message) {
        error('Failed: ' + message);
        //i don't think you need this if it failed to capture
        //navigator.camera.cleanup(function(){}, function(){});
    }

    function saveVideo(){
        content = $('#input-content').val();
        syndicate = $('#input-syndicateto').val();
        category = $('#category').val();
        replyurl = $('#inreplyto').val();
        $('#save-btn').attr("disabled", "disabled");

        data_obj = { 'h': 'entry',
            'mp-type':'video',
            'mp-action':'create',
            'content': content
        }
        if(category){
            data_obj['category'] = encodeURIComponent(category);
        }
        if(replyurl){
            data_obj['in-reply-to'] = encodeURIComponent(replyurl);
        }
        // todo escape content and syndicate
        if(syndicate){
            for (i = 0; i < syndicate.length; i++) {
                data_obj['syndicate-to['+i+']'] = syndicate[i];
            }
        }
        data_obj['published'] = get_formatted_date();

        savePost({'type':'video', 'format':videoData.type, 'file':videoData.fullPath, 'data_obj':data_obj});
        success('Saved!');

        $('#input-content').val('');
        $('#inreplyto').val('');
        $('#category').val('');
        $('#input-syndicateto').val('');
        videoData = null;
        $('#videoFile').html('');
        $('#save-btn').removeAttr('disabled');
    }
    function postVideo(){
        content = $('#input-content').val();
        syndicate = $('#input-syndicateto').val();
        category = $('#category').val();
        replyurl = $('#inreplyto').val();
        $('#post-btn').attr("disabled", "disabled");

        data_obj = { 'h': 'entry',
            'mp-type':'video',
            'mp-action':'create',
            'content': content
        }

        if(category){
            data_obj['category'] = encodeURIComponent(category);
        }
        if(replyurl){
            data_obj['in-reply-to'] = encodeURIComponent(replyurl);
        }
        // todo escape content and syndicate
        if(syndicate){
            for (i = 0; i < syndicate.length; i++) {
                data_obj['syndicate-to['+i+']'] = syndicate[i];
            }
        }

        data_obj['published'] = get_formatted_date();

        mp_uploadFile(data_obj, "video", videoData.type, videoData.fullPath,
            function(r){ 
                success('Posted!');
                $('#input-content').val('');
                $('#inreplyto').val('');
                $('#category').val('');
                $('#input-syndicateto').val('');
                videoData = null;
                $('#videoFile').html('');
                $('#post-btn').removeAttr('disabled');
            },
            function(error){ 
                error("An error has occurred: Code = " + error.code); 
                $('#post-btn').removeAttr('disabled');
        });
    }

    function saveAudio(){
        content = $('#input-content').val();
        syndicate = $('#input-syndicateto').val();
        category = $('#category').val();
        replyurl = $('#inreplyto').val();
        $('#save-btn').attr("disabled", "disabled");

        data_obj = { 'h': 'entry',
            'mp-type':'audio',
            'mp-action':'create',
            'content': content
        }
        if(category){
            data_obj['category'] = encodeURIComponent(category);
        }
        if(replyurl){
            data_obj['in-reply-to'] = encodeURIComponent(replyurl);
        }
        // todo escape content and syndicate
        if(syndicate){
            for (i = 0; i < syndicate.length; i++) {
                data_obj['syndicate-to['+i+']'] = syndicate[i];
            }
        }

        data_obj['published'] = get_formatted_date();

        savePost({'type':'audio', 'format':audioData.type, 'file':audioData.fullPath, 'data_obj':data_obj});
        success('Saved!');

        $('#input-content').val('');
        $('#inreplyto').val('');
        $('#category').val('');
        $('#input-syndicateto').val('');
        audioData = null;
        $('#AudioFile').html('');
        $('#save-btn').removeAttr('disabled');

    }
    function postAudio(){
        content = $('#input-content').val();
        syndicate = $('#input-syndicateto').val();
        category = $('#category').val();
        replyurl = $('#inreplyto').val();
        $('#post-btn').attr("disabled", "disabled");

        data_obj = { 'h': 'entry',
            'mp-type':'audio',
            'mp-action':'create',
            'content': content
        }
        if(category){
            data_obj['category'] = encodeURIComponent(category);
        }
        if(replyurl){
            data_obj['in-reply-to'] = encodeURIComponent(replyurl);
        }
        // todo escape content and syndicate
        if(syndicate){
            for (i = 0; i < syndicate.length; i++) {
                data_obj['syndicate-to['+i+']'] = syndicate[i];
            }
        }

        data_obj['published'] = get_formatted_date();

        mp_uploadFile(data_obj, "audio", audioData.type, audioData.fullPath,
            function(r){ 
                success('Posted!');
                $('#input-content').val('');
                $('#inreplyto').val('');
                $('#category').val('');
                $('#input-syndicateto').val('');
                audioData = null;
                $('#AudioFile').html('');
                $('#post-btn').removeAttr('disabled');
            },
            function(error){ 
                error("An error has occurred: Code = " + error.code); 
                $('#post-btn').removeAttr('disabled');
        });
    }

    function savePhoto(){
        content = $('#input-content').val();
        photo_uri = photoData;
        syndicate = $('#input-syndicateto').val();
        category = $('#category').val();
        replyurl = $('#inreplyto').val();
        $('#save-btn').attr("disabled", "disabled");

        data_obj = { 'h': 'entry',
            'mp-type':'photo',
            'mp-action':'create',
            'content': content
        }
        if(category){
            data_obj['category'] = encodeURIComponent(category);
        }
        if(replyurl){
            data_obj['in-reply-to'] = encodeURIComponent(replyurl);
        }
        // todo escape content and syndicate
        if(syndicate){
            for (i = 0; i < syndicate.length; i++) {
                data_obj['syndicate-to['+i+']'] = syndicate[i];
            }
        }

        data_obj['published'] = get_formatted_date();

        savePost({'type':'photo', 'format':"image/jpeg", 'file':photo_uri, 'data_obj':data_obj});

        success('Saved!');
        $('#input-content').val('');
        $('#inreplyto').val('');
        $('#category').val('');
        $('#input-syndicateto').val('');
        photoData = null;
        $('#PhotoPreview').attr('src', '');
        $('#save-btn').removeAttr('disabled');
    }
    function postPhoto(){
        content = $('#input-content').val();
        photo_uri = photoData;
        syndicate = $('#input-syndicateto').val();
        category = $('#category').val();
        replyurl = $('#inreplyto').val();
        $('#post-btn').attr("disabled", "disabled");

        data_obj = { 'h': 'entry',
            'mp-type':'photo',
            'mp-action':'create',
            'content': content
        }
        if(category){
            data_obj['category'] = encodeURIComponent(category);
        }
        if(replyurl){
            data_obj['in-reply-to'] = encodeURIComponent(replyurl);
        }
        // todo escape content and syndicate
        if(syndicate){
            for (i = 0; i < syndicate.length; i++) {
                data_obj['syndicate-to['+i+']'] = syndicate[i];
            }
        }

        data_obj['published'] = get_formatted_date();

        mp_uploadFile(data_obj, "photo", "image/jpeg", photo_uri,
            function(r){ 
                success('Posted!');
                $('#input-content').val('');
                $('#inreplyto').val('');
                $('#category').val('');
                $('#input-syndicateto').val('');
                photoData = null;
                $('#PhotoPreview').attr('src', '');
                $('#post-btn').removeAttr('disabled');
            },
            function(error){ 
                error("An error has occurred: Code = " + error.code); 
                $('#post-btn').removeAttr('disabled');
        });

    }
    function get_formatted_date(){
        var now = new Date();

        var formatted_out = now.getFullYear() + "-";

        if(now.getMonth() <= 10){
            formatted_out += "0";
        }
        formatted_out += (now.getMonth()+1) + "-";

        if(now.getDate() < 10){
            formatted_out += "0";
        }
        formatted_out += now.getDate() + "T";

        if(now.getHours() < 10){
            formatted_out += "0";
        }
        formatted_out += now.getHours() + ":";
 
        if(now.getMinutes() < 10){
            formatted_out += "0";
        }
        formatted_out += now.getMinutes() + ":";
 
        if(now.getSeconds() < 10){
            formatted_out += "0";
        }
        formatted_out += now.getSeconds();

        tz_offset = now.getTimezoneOffset();

        if(tz_offset > 0){
            formatted_out += "-";
        } else {
            formatted_out += "+";
        }
        
        offset_hours = Math.abs(tz_offset) / 60;
        offset_mins = Math.abs(tz_offset) % 60;

        if(offset_hours < 10){
            formatted_out += "0";
        }
        formatted_out += offset_hours + ":";
        

        if(offset_mins < 10){
            formatted_out += "0";
        }
        formatted_out += offset_mins ;
 
        return formatted_out
    }

    function upload_all_saved(){
        list_processing = true;
        var obj;
        while( list_processing ){
            obj = getFirstSavedPost();
            if(obj === null){
                list_processing = false;
                continue;
                success('Posts submitted');
            }
            type = obj['type'];
            if(type == 'photo' || type == 'audio' || type == 'video'){
                data_obj = obj['data_obj'];
                format = obj['format'];
                file_uri = obj['file'];
                mp_uploadFile(data_obj, type, format, file_uri,
                    function(r){ 
                    },
                    function(error){ 
                        error("An error has occurred: Code = " + error.code); 
                        savePost(obj);
                        list_processing = false;
                });
            } else {
                data = obj['data'];
                mp_send(data, 
                    function(r){
                    },
                    function(error){ 
                        error("An error has occurred: Code = " + error.code); 
                        savePost(obj);
                        list_processing = false;
                });
            }
            
        }
    }

    function savePost(data){
        saved = window.localStorage.getItem("saved");
        if(saved){
            saved = JSON.parse(saved);
        } else {
            saved = [];
        }
        saved.push(data);
        window.localStorage.setItem("saved", JSON.stringify(saved));
    }

    function getFirstSavedPost(){
        saved = window.localStorage.getItem("saved");
        if(!saved){
            return null;
        } 
        saved = JSON.parse(saved);
        if(saved == [] ){
            return null;
        }
        result = saved.shift();
        if(saved == []){
            window.localStorage.removeItem("saved");
        } else {
            window.localStorage.setItem("saved", JSON.stringify(saved));
        }
        return result;
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

    function success(message){
        $('#success').html('<span>'+message+'</span>');
        $('#success').show();
        setTimeout(function() {
            $('#success').fadeOut('fast');
        }, 2000);
    }

    function error(message){
        $('#error').html('<span>'+message+'</span>');
        $('#error').show();
        setTimeout(function() {
            $('#error').fadeOut('fast');
        }, 2000);
    }

    if(mp_logged_in()){
        renderHomeView();
    } else {
        renderLoginView();
    }

}());
