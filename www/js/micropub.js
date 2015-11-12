
    function mp_logout(){
        //window.localStorage.clear();
        window.localStorage.removeItem("micropub");
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("me");
    }
    function mp_logged_in(){
        return(window.localStorage.getItem("micropub") && window.localStorage.getItem("token"));
    }

    function mp_login(me, success_callback) {
        getSiteObject(me, function(site){
            if(!site.authorization_endpoint){
                //TODO: warn about this
                site.authorization_endpoint='https://indieauth.com/auth';
            }
            if(!site.token_endpoint){
                //TODO: warn about this
                site.token_endpoint='https://tokens.indieauth.com/token';
            }
            //TODO: FAIL if no MP endpoint
            //$('#debugger').append('<li>'+site.authorization_endpoint+'</li>');
            //$('#debugger').append('<li>'+site.token_endpoint+'</li>');
                
            auth_and_token(site, function (site) {
                $('#debugger').append('<li>token:'+site.token+'</li>');
                window.localStorage.setItem("token", site.token);
                window.localStorage.setItem("me", site.me);
                window.localStorage.setItem("micropub", site.micropub);

                //success('logged in as ' + site.me);

                success_callback();
                
            });
        });
        
    } // end mp_login()



    /** getSyndicationTargets
     * get the array of all syndication targets from the clients micropub endpoint
     * @param callback callback function to pass array of strings to
     *
     */
    function getSyndicationTargets(callback){
        syndications = window.localStorage.getItem("syndications");
        if(syndications){
            callback(syndications);
        } else {
            token = window.localStorage.getItem("token");
            micropub = window.localStorage.getItem("micropub");

            $.ajax({
                url: micropub,
                type: 'get',
                data: 'q=syndicate-to',
                headers: {
                    Authorization: 'Bearer ' + token
                },
                success: function(result){
                    arr_with_key = result.split('&');
                    clean_arr = [];

                    for (i = 0; i < arr_with_key.length; i++) {
                        arr_with_key[i].substr(0,15);
                        if(arr_with_key[i].substr(0,15) == 'syndicate-to[]='){
                            clean_arr.push(arr_with_key[i].substr(15));
                        }
                    }
                    comma_delim  = clean_arr.join(',');
                    window.localStorage.setItem("syndications", comma_delim);
                    callback(comma_delim);
                }
            });
        }
    }


    function auth_and_token(site,callback) {

        url=site.authorization_endpoint+'?me='+site.url+'&state=88332&client_id=http%3A%2F%2Fmobilepub.thatmustbe.me&redirect_uri=http%3A%2F%2Flocalhost%2F&scope=post'

        //wnd = window.open(url, "_blank", 'toolbar=yes,closebuttoncaption=Back,presentationstyle=formsheet,toolbarposition=top,clearsessioncache=yes,clearcache=yes');
        wnd = window.open(url, "_blank", 'toolbar=no,location=yes,clearcache=yes');

        wnd.addEventListener("loadstart", function(ev) {
            var results;
            if (ev.url.substr(0, 17) !== "http://localhost/") {
                return;
            }
            results = /\?code=([^&]*)/.exec(ev.url);
            //$('#debugger').append('<li>results: ' + results + '</li>');
            wnd.close();
            if (results && results[1]) {
                code = results[1];
                $.ajax({
                    type: 'POST',
                    data: 'code='+code+'&state=88332&client_id=http%3A%2F%2Fmobilepub.thatmustbe.me&redirect_uri=http%3A%2F%2Flocalhost%2F&scope=post',
                    datatype: 'json',
                    crossdomain: true,
                    url: site.authorization_endpoint, 
                    success:  function(data){
                        $('#debugger').append('<li>debug 3</li>');
                        results = /me=([^&]*)/.exec(data);
                        if (results && results[1]) {
                            site.me = results[1];
                        }
                        results = /scope=([^&]*)/.exec(data);
                        if (results && results[1]) {
                            site.scope = results[1];
                        }
                        if(site.scope && site.me){
                            $('#debugger').append('<li>attempting verification</li>');
                            $.post(site.token_endpoint, 'grant_type=authorization_code&code='+code+'&state=88332&client_id=mobilepub.thatmustbe.me&redirect_uri=http%3A%2F%2Flocalhost%2F&me='+site.me, function(data){
                                results = /access_token=([^&]*)/.exec(data);
                                $('#debugger').append('<li>response: '+data+'</li>');
                                if (results && results[1]) {
                                $('#debugger').append('<li>debug 5</li>');
                                    site.token = results[1];
                                    callback(site);
                                }

                            });
                        }
                    },
                    error:  function(data){
                        $('#debugger').append('<li>error debug 2' + data + '</li>');
                    }
                });
            } else if (callback && typeof callback === "function") {
                callback(new Error("unable to receive token"));
            }
        });
    } //end auth_and_token()

    function getSiteObject(url,callback){
      if (url.substr(0, 7) !== "http://" && url.substr(0, 8) !== "https://") {
        url = 'http://' + url;
      }
      var site = {url:url};
      var xmlhttp=new XMLHttpRequest();

      xmlhttp.open("GET", url );
      xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4){
          if(xmlhttp.status==200){
            var html = xmlhttp.responseText;
            var headers = xmlhttp.getAllResponseHeaders();
            
            //hopefully this will get supported soon
            if(xmlhttp.responseURL){
               site.url=xmlhttp.responseURL;
            }

            //do our best to find authorization_endpoint, token_endpoint, and micropub values
            results = /<([^>]*)>; +rel=["']authorization_endpoint["']/i.exec(headers)
            if(results && results[1]){
              site.authorization_endpoint = results[1];
            }
            if(!site.authorization_endpoint){
              results = /<link +rel=["']authorization_endpoint["'] +href=["']([^"']*)["']/i.exec(html)
              if(results && results[1]){
                site.authorization_endpoint = results[1];
              }
            }
            if(!site.authorization_endpoint){
              results = /<link +href=["']([^"']*)["'] +rel=["']authorization_endpoint["']/i.exec(html)
              if(results && results[1]){
                site.authorization_endpoint = results[1];
              }
            }

            results = /<([^>]*)>; +rel=["']token_endpoint["']/i.exec(headers)
            if(results && results[1]){
              site.token_endpoint = results[1];
            }
            if(!site.token_endpoint){
              results = /<link +rel=["']token_endpoint["'] +href=["']([^"']*)["']/i.exec(html)
              if(results && results[1]){
                site.token_endpoint = results[1];
              }
            }
            if(!site.token_endpoint){
              results = /<link +href=["']([^"']*)["'] +rel=["']token_endpoint["']/i.exec(html)
              if(results && results[1]){
                site.token_endpoint = results[1];
              }
            }

            results = /<([^>]*)>; +rel=["']micropub["']/i.exec(headers)
            if(results && results[1]){
              site.micropub = results[1];
            }
            if(!site.micropub){
              results = /<link +rel=["']micropub["'] +href=["']([^"']*)["']/i.exec(html)
              if(results && results[1]){
                site.micropub = results[1];
              }
            }
            if(!site.micropub){
              results = /<link +href=["']([^"']*)["'] +rel=["']micropub["']/i.exec(html)
              if(results && results[1]){
                site.micropub = results[1];
              }
            }
            
          }else{
           //console.log('error')}
           site.error = 'Error polling site'
          }
          callback(site);
        }
        
      }
      xmlhttp.send();
    } // end getSiteObject


    function mp_send(data, success_callback, failure_callback){
        token = window.localStorage.getItem("token");
        micropub = window.localStorage.getItem("micropub");

        //alert(micropub);
        $.ajax({
            url: micropub,
            type: 'post',
            data: data,
            headers: {
                Authorization: 'Bearer ' + token
            },
            success: function(data){
                success_callback();
            },
            error: function(){
                failure_callback();
            }
        });
        
    } // end mp_send

    function mp_uploadFile(data_obj, fileKey, mimeType, fileUriToUpload, success, failure) {
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
