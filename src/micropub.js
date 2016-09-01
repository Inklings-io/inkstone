import {HttpClient} from 'aurelia-http-client';

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
    login_test(me){
        window.localStorage.setItem("me", me);
        window.localStorage.setItem("token", me + 'asdf');
    }

    get_login_redirect(me){
        this.isRequesting = true;
        return new Promise((resolve, reject) => {
            client.post('php/discoverEndpoint.php', 'me='+me).then( data => {
                if(data.success){
                    resolve(data.auth_endpoint);
                } else {
                    reject('Unable to fine auth endpoint');
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
                client.post('php/syndicationTargets.php', {me:me,token:token}).then( data => {
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
            client.post('php/send.php', send_data).then( data => {
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
