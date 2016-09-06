import {HttpClient} from 'aurelia-fetch-client';
import {serialize, getFormattedDate} from './utility';

let client = new HttpClient();

export class MicropubAPI {
    isRequesting = false;

    logout(){
        //window.localStorage.clear();
        window.localStorage.removeItem("scope");
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("me");
        window.localStorage.removeItem('syndications');
    }

    logged_in(){
        return(window.localStorage.getItem("me") && window.localStorage.getItem("token"));
    }

    login(me){
        if(!this.isRequesting){
            this.get_endpoints(me).then(data => {
                window.localStorage.setItem("mp_endpoint", data.mp_endpoint);

                
                var state =  Math.floor(Math.random() * 100000);
                window.localStorage.setItem("state", state);
                window.localStorage.setItem("me", me);

                var url = data.auth_endpoint +
                    (data.auth_endpoint.indexOf('?') > -1 ? '&' : '?' ) +
                    serialize({
                        me: me,
                        redirect_uri: 'http://192.168.1.51/mobilepub/',
                        response_type: 'id',
                        state: state,
                        client_id: 'http://192.168.1.51/mobilepub',
                        scope: 'post',
                        response_type: 'code'
                    });

                
                location.href = url;
            });
        }
    }

    auth(me, code, state){
        return new Promise((resolve, reject) => {
            var original_state = window.localStorage.getItem("state");
            var original_me = window.localStorage.getItem("me");
            window.localStorage.removeItem("state");

            if(original_state != state){
                reject('State does not match. Sent ' + original_state + ' received ' + state );
            //} else if (original_me != me) {
                //window.localStorage.removeItem("me");
                //result.message = 'Login does not match. Sent ' + original_me + ' received ' + me ;
            } else {
                
                var redirect_uri =  'http://192.168.1.51/mobilepub/';

                this.get_token(me, code, state, redirect_uri).then(data => {

                    window.localStorage.setItem("scope", data.scope);
                    window.localStorage.setItem("token", data.token);
                    resolve('success');
                }).catch(error => {
                    reject('Error: ' + error);
                });
            }
        });
    }

    login_test(me){
        window.localStorage.setItem("me", me);
        window.localStorage.setItem("token", me + 'asdf');
    }

    get_token(me, code, state, redirect_uri){
        this.isRequesting = true;
        return new Promise((resolve, reject) => {
            //TODO don't use php end if possible

            client.fetch('php/token.php',
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: serialize({
                        me: me,
                        code: code,
                        state: state,
                        client_id: 'http://192.168.1.51/mobilepub',
                        redirect_uri: redirect_uri
                    })
                }
            ).then( resonse => resonse.json()
            ).then( data => {
                if(data.success){
                    resolve(data);
                } else {
                    reject('Error connecting to token endpoint');
                }
                this.isRequesting = false;
            }).catch(error => {
                reject('Error connecting to MobilePub Server');
                this.isRequesting = false;
            });

        });

    }
    get_endpoints(me){
        //TODO have this cache results  in local storage
        this.isRequesting = true;
        return new Promise((resolve, reject) => {
            //TODO don't use php end if possible

            client.fetch('php/discoverEndpoints.php',
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: serialize({me: me})
                }
            ).then( resonse => resonse.json()
            ).then( data => {
                if(data.success){
                    resolve(data);
                } else {
                    reject('Unable to find auth endpoint');
                }
                this.isRequesting = false;
            }).catch(error => {
                reject('Error connecting to MobilePub Server');
                this.isRequesting = false;
            });

        });

    }

    get_syndication_targets(){
        this.isRequesting = true;
        return new Promise((resolve, reject) => {

            syndications = window.localStorage.getItem("syndications");
            if(syndications){
                resolve(JSON.parse(syndications));
                this.isRequesting = false;
            } else {
                token = window.localStorage.getItem("token");
                me = window.localStorage.getItem("me");
                client.fetch('php/syndicationTargets.php', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: serialize({me:me,token:token})
                }
                ).then( data => {
                    if(data.success){
                        window.localStorage.setItem("syndications", JSON.stringify(data.targets));
                        resolve(data.targets);
                    } else {
                        reject('Error finding Syndication Targets');
                    }
                    this.isRequesting = false;

                }).catch(error => {
                    reject('Error connecting to MobilePub Server');
                    this.isRequesting = false;
                });
            }
        });

    }

    send(send_data){
        this.isRequesting = true;
        return new Promise((resolve, reject) => {
            send_data.token = window.localStorage.getItem("token");
            send_data.me = window.localStorage.getItem("me");
            client.fetch('php/send.php', 
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                        //TODO: include token headers
                    },
                    //TODO only send if each item is shown
                    //      and unset show property
                    body: serialize(send_data)
                }
            ).then( data => {
                if(data.success){
                    resolve(data.url);
                } else {
                    reject(data.error);
                }
                this.isRequesting = false;

            }).catch( error => {
                reject( "Error connecting to MobilePub Server");
                this.isRequesting = false;
            });

        });
    }

    save(data){
        data.published = getFormattedDate();

        var saved = window.localStorage.getItem("saved");
        if(saved){
            saved = JSON.parse(saved);
        } else {
            saved = [];
        }
        saved.push(data);
        window.localStorage.setItem("saved", JSON.stringify(saved));
    }

    has_saved(){
        if( window.localStorage.getItem("saved")){
            return true;
        }
        return false;
    }

    send_all_saved(){
        var saved = window.localStorage.getItem("saved");
        if(saved){
            saved = JSON.parse(saved);
            for(var i = 0; i < saved.length; i++){
                this.send(saved[i]);
            }
        } 
        window.localStorage.removeItem("saved");

    }

    get_saved_list(){
        var saved = window.localStorage.getItem("saved");
        if(saved){
          saved = JSON.parse(saved);
          return saved;
        } else {
          return null;
        }
    }

    recall_saved(index){
        var saved = window.localStorage.getItem("saved");
        if(saved){
          saved = JSON.parse(saved);
          if(saved[index]){
              return saved[index];
          } else {
            return null;
          }
        } else {
          return null;
        }

    }

    remove_saved(index){
        var saved = window.localStorage.getItem("saved");
        if(saved){
          saved = JSON.parse(saved);
          if(saved[index]){
            saved.splice(index, 1);
            window.localStorage.setItem("saved", JSON.stringify(saved));
          }
        }
    }
    
}

/*
 * this is leftover from cordova days of mobilepub, need to work out how to do this all in raw JS
 *
 */
/*
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
*/
