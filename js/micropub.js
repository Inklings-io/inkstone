
function mp_logout(){
    //window.localStorage.clear();
    window.localStorage.removeItem("scope");
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("me");
}
function mp_logged_in(){
    return(window.localStorage.getItem("me") && window.localStorage.getItem("token"));
}

function mp_login(me, failure_callback) {

    $.ajax({
        url: 'php/discoverEndpoint.php',
        type: 'post',
        data: 'me='+me,
        datatype: 'json',
        success: function(data){
            if(data.success){
                location.href = data.auth_endpoint

            } else {
                failure_callback(data.error);
            }

        },
        error: function(){
            failure_callback('Failed connecting to mobilepub server');
        }
    });

    
} // end mp_login()



/** getSyndicationTargets
 * get the array of all syndication targets from the clients micropub endpoint
 * @param callback callback function to pass array of strings to
 *
 */
function getSyndicationTargets(callback){
    token = window.localStorage.getItem("token");
    me = window.localStorage.getItem("me");
    syndications = window.localStorage.getItem("syndications");
    if(syndications){
        callback(syndications);
    } else {
        $.ajax({
            url: 'php/syndicationTargets.php',
            type: 'post',
            data: 'me='+ me + 'token='+token,
            datatype: 'json',
            success: function(data){
                if(data.success){
                    window.localStorage.setItem("syndications", data.targets);
                    callback(data.targets);
                } else {
                    callback();
                }

            },
            error: function(){
                callback();
            }
        });
    }
}



function mp_send(data, success_callback, failure_callback){
    token = window.localStorage.getItem("token");
    me = window.localStorage.getItem("me");

    //alert(micropub);
    $.ajax({
        url: 'php/send.php',
        type: 'post',
        data: data+'&me='+me+'&token='+token  ,
        datatype: 'json',
        success: function(data){
            if(data.success){
                success_callback(data.url);
            } else {
                failure_callback(data.error);
            }
        },
        error: function(){
            failure_callback('error 10: failed connecting to MobilePub server');
        }
    });
    
} // end mp_send

function mp_uploadFile(data_obj, fileKey, mimeType, fileUriToUpload, success, failure) {
    //TODO rewrite this
    micropub = window.localStorage.getItem("micropub");
    token = window.localStorage.getItem("token");

    //alert(fileUriToUpload);
    //alert('upload: '+fileUriToUpload);
    var url=encodeURI(micropub);
    var options = new FileUploadOptions();
    options.headers={Connection: "close", Authorization: 'Bearer ' + token };
    options.fileKey = fileKey; //depends on the api
    options.fileName = fileUriToUpload.substr(fileUriToUpload.lastIndexOf('/')+1);
    options.mimeType =  mimeType;
    options.chunkedMode = false; //this is important to send both data and files
    options.params = data_obj;

    var ft = new FileTransfer();
    //what to do during the file transfer? lets show some percentage...
    var status=$('#upload-status');//element in the dom that gets updated during the onprogress
    ft.onprogress = function(progressEvent) {
        var perc;

        if (progressEvent.lengthComputable) {


                perc = Math.ceil(progressEvent.loaded / progressEvent.total * 100);

                status.html(perc+'%'+ '('+progressEvent.total+')');

        }else{
            status.html('not computable');
        }
    };

    ft.upload(fileUriToUpload, url, success, failure, options);
}
