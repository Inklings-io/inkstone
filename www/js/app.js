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
    }

    function logout(){
        window.localStorage.clear();
        $('#postingPage').hide();
        $('#loginPage').show();
    }

    function sendPost(){
        me = window.localStorage.getItem("me");
        token = window.localStorage.getItem("token");
        micropub = window.localStorage.getItem("micropub");
        content = $('#input-content').val();
        syndicate = $('#input-syndicateto').val();

        // todo escapte content and syndicate
        data = 'type=note&h=entry&content='+content;
        if(syndicate){
            for (i = 0; i < syndicate.length; i++) {
                    data += '&syndicate-to[]='+syndicate[i];
            }
        }

        //alert(micropub);
        $.ajax({
            url: micropub,
            type: 'post',
            data: data,
            headers: {
                Authorization: 'Bearer ' + token
            },
            success: function(data){
                alert('posted');
            }
        });
    }

    function auth_and_token(site,callback) {

        //$('.debugger').append('<li>micropub() called with '+site.url+'</li>');
        url=site.authorization_endpoint+'?me='+site.url+'&client_id=myapp&redirect_uri=http%3A%2F%2Flocalhost%2F&scope=post'

        //wnd = window.open(url, "_blank", 'toolbar=yes,closebuttoncaption=Back,presentationstyle=formsheet,toolbarposition=top,clearsessioncache=yes,clearcache=yes');
        wnd = window.open(url, "_blank", 'location=yes');

        wnd.addEventListener("loadstart", function(ev) {
            var results;
            if (ev.url.substr(0, 17) !== "http://localhost/") {
                return;
            }
            results = /\?code=([^&]*)/.exec(ev.url);
            wnd.close();
            if (results && results[1]) {
                code = results[1];
                $.post(site.authorization_endpoint, 'code='+code+'&client_id=myapp&redirect_uri=http%3A%2F%2Flocalhost%2F&scope=post', function(data){
                    results = /me=([^&]*)/.exec(data);
                    if (results && results[1]) {
                        site.me = results[1];
                    }
                    results = /scope=([^&]*)/.exec(data);
                    if (results && results[1]) {
                        site.scope = results[1];
                    }
                    if(site.scope && site.me){
                        $.post(site.token_endpoint, 'grant_type=authorization_code&code='+code+'&client_id=myapp&redirect_uri=http%3A%2F%2Flocalhost%2F&me='+site.me, function(data){
                            //alert(data);
                            results = /access_token=([^&]*)/.exec(data);
                            if (results && results[1]) {
                                site.token = results[1];
                                callback(site);
                            }

                        });
                    }
                })
            } else if (callback && typeof callback === "function") {
                callback(new Error("unable to receive token"));
            }
        });
    } //end auth_and_token()

    function login() {
        getSiteObject($('.me').val(), function(site){
            if(!site.authorization_endpoint){
                //TODO: warn about this
                site.authorization_endpoint='https://indieauth.com/auth';
            }
            if(!site.token_endpoint){
                //TODO: warn about this
                site.token_endpoint='https://tokens.indieauth.com/token';
            }
            //TODO: FAIL if no MP endpoint
            //$('.debugger').append('<li>authorization_endpoint:'+site.authorization_endpoint+'</li>');
                
            auth_and_token(site, function (site) {
                //$('.debugger').append('<li>token:'+site.token+'</li>');
                window.localStorage.setItem("token", site.token);
                window.localStorage.setItem("me", site.me);
                window.localStorage.setItem("micropub", site.micropub);

                showPostingUI()
                
                //$('.debugger').append('<li>key:'+res+'</li>');
                //$('.debugger').append('<li>authorization_endpoint:'+site.authorization_endpoint+'</li>');
                //$('.debugger').append('<li>token_endpoint:'+site.token_endpoint+'</li>');
                //$('.debugger').append('<li>micropub:'+site.micropub+'</li>');
                //$('.debugger').append('<li>url:'+site.url+'</li>');
                //$('.debugger').append('<li>error:'+site.error+'</li>');
            });
        });
        
    } // end login()


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


    if(window.localStorage.getItem("me") && window.localStorage.getItem("token")){
        showPostingUI();
        //$('.debugger').append('<li>me:'+window.localStorage.getItem("me")+'</li>');
        //$('.debugger').append('<li>token:'+window.localStorage.getItem("token")+'</li>');
    }

}());
