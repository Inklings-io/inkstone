// We use an "Immediate Function" to initialize the application to avoid leaving anything behind in the global scope
(function () {

    /* ---------------------------------- Local Functions ---------------------------------- */
    function display_syndication_targets(targets)
    {
        if(!targets){
            $('#input-syndication-wrapper').hide();
        } else {
            $('#input-syndication-wrapper').html('');
            for (i = 0; i < targets.length; i++) {
                $('#input-syndication-wrapper').append('<div class="switch"><input name="syndicate-to" type="checkbox" id="syndicate-'+i+'" value="'+targets[i]['uid']+'"><label for="syndicate-'+i+'">'+targets[i]['name']+'</label></div>');
            }
            $('#input-syndication-wrapper').show();
        }
    }

    function networkChange(){
        if(navigator.onLine ){
            setOnline();
        } else {
            setOffline();
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

    function saveCheckin(){
        content = $('#input-content').val();
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
            split_cat = category.split(',');
            for (i = 0; i < split_cat.length; i++) {
                data += '&category[]=' + encodeURIComponent(split_cat[i].trim());
            }
        }
        if(replyurl){
            data += '&in-reply-to=' + encodeURIComponent(replyurl);
        }

        syndicate = $("input[name='syndicate-to']");
        for (i = 0; i < syndicate.length; i++) {
            if(syndicate[i].checked){
                data += '&syndicate-to[]='+syndicate[i].value;
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
        for (i = 0; i < syndicate.length; i++) {
            syndicate[i].checked = false;
        }
        $('#geoloc').val('');
        $('#loc_name').val('');
        $('#save-btn').removeAttr('disabled');
    }


    function sendCheckin(){
        content = $('#input-content').val();
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
        syndicate = $("input[name='syndicate-to']");
        for (i = 0; i < syndicate.length; i++) {
            if(syndicate[i].checked){
                data += '&syndicate-to[]='+syndicate[i].value;
            }
        }

        data += '&published='+get_formatted_date();

        mp_send(data, function(url){
            success('Posted at ' + url);
            $('#input-content').val('');
            $('#inreplyto').val('');
            $('#like-of').val('');
            $('#bookmark').val('');
            $('#category').val('');
            for (i = 0; i < syndicate.length; i++) {
                syndicate[i].checked = false;
            }
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
        syndicate = $("input[name='syndicate-to']");
        for (i = 0; i < syndicate.length; i++) {
            if(syndicate[i].checked){
                data += '&syndicate-to[]='+syndicate[i].value;
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
        for (i = 0; i < syndicate.length; i++) {
            syndicate[i].checked = false;
        }
        $('#save-btn').removeAttr('disabled');
    }
    function sendNote(){
        content = $('#input-content').val();
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

        syndicate = $("input[name='syndicate-to']");
        for (i = 0; i < syndicate.length; i++) {
            if(syndicate[i].checked){
                data += '&syndicate-to[]='+syndicate[i].value;
            }
        }

        data += '&published='+get_formatted_date();

        mp_send(data, function(url){
            $('#post-btn').attr("disabled", "disabled");
            success('Posted at ' + url);
            $('#input-content').val('');
            $('#inreplyto').val('');
            $('#bookmark').val('');
            $('#like-of').val('');
            $('#category').val('');
            for (i = 0; i < syndicate.length; i++) {
                syndicate[i].checked = false;
            }
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


    function get_formatted_date(){
        var now = new Date();

        var formatted_out = now.getFullYear() + "-";

        // ugh zero indexed months
        if(now.getMonth() < 9){
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
        success('subitting saved posts');
        $('#homeicon_saved').hide();
        list_processing = true;
        var obj;
        while( list_processing ){
            obj = getFirstSavedPost();
            if(obj === null){
                list_processing = false;
                success('Posts submitted');
                $('#homeicon_saved').hide();
                break;
            }
            type = obj['type'];
            if(type == 'photo' || type == 'audio' || type == 'video'){
                data_obj = obj['data_obj'];
                format = obj['format'];
                file_uri = obj['file'];
                mp_uploadFile(data_obj, type, format, file_uri,
                    function(url){ 
                    },
                    function(error){ 
                        error("An error has occurred: Code = " + error.code); 
                        savePost(obj);
                        list_processing = false;
                });
            } else {
                data = obj['data'];
                mp_send(data, 
                    function(url){
                        ;
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
        mp_login($('.me').val(), function(err){
            error('Failed to Log In: ' + err);
        });
        return false;
    } // end login()

    function success(message){
        $('#success').html('<div>'+message+'</div>');
        $('#success').show();
        setTimeout(function() {
            $('#success').fadeOut('fast');
        }, 2000);
    }

    function error(message){
        $('#error').html('<div>'+message+'</div>');
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
