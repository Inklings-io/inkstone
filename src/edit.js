import {Config} from './config';
import {MicropubAPI} from './micropub';
import {areEqual} from './utility';
import {Router} from 'aurelia-router';

export class EditDetails {
  static inject() { return [Router, MicropubAPI, Config]; }


  constructor(Router, MicropubAPI, Config){
    this.config = Config;
    this.mp = MicropubAPI;
    this.router = Router;
    this.notifications = [];
    this.notifications_id= 1;

    this.user = this.mp.get_user();

    this.default_post_config = this.config.get('default_post_config');
    
    this.post_config = JSON.parse(JSON.stringify(this.default_post_config));

    //this.syndicate_tos = [];

    /*
    this.mp_configs =  null
    this.mp.get_configs().then(data => {
      if(!data){
        this.mp.get_configs(true,true).then(data => {
          this.mp_configs = data;
        }).catch(error => {
            console.log(error);
        });
      }
      this.mp_configs = data;
    }).catch(error => {
        this.mp.get_configs(true,true).then(data => {
          this.mp_configs = data;
        }).catch(error => {
            console.log(error);
        });
    });
    */
  }

  clearPostData(){
    this.post = JSON.parse(JSON.stringify(this.originalPost));
  }

  blankPost(){
    this.clearPostData();
  }


  activate(params, routeConfig) {
    this.routeConfig = routeConfig;
    
    var field_names = '';
    if(params.properties){
      field_names = params.properties
    }
      //this.toggleField('content');
      //

    if(params.url){

        this.post = {};

        this.mp.fetch_source(params.url, field_names).then(data => {
            //console.log('sucessfully recalled ' + JSON.stringify(data));
            var keys = Object.keys(data['properties']);

            console.log(JSON.stringify(keys));
            //console.log(JSON.stringify(this.post_config));
            
            for(var i = 0; i < this.post_config.length; i++){
              this.post_config[i].shown = false;
            }

            for(var i = 0; i < keys.length; i++){
              var field_name = keys[i];
              this.toggleField(field_name);

              this.post[field_name] = data['properties'][field_name][0];
            }
            //foreach(data.properties as 
            this.post = data['properties'];
            this.originalPost = JSON.parse(JSON.stringify(this.post));
        }).catch( error => {
          console.log('routing away from edit, T1 ' + error);
          //TODO: some sort of session error message
          this.router.navigate('/post');
        });

    } else {
          console.log('routing away from edit, T2');
        //TODO: some sort of session error message?
        this.router.navigate('/post');
    }

    return true;
  }


  clearPostConfirm(){
    if (!areEqual(this.originalPost, this.post)){
        if( confirm('Are you sure you want to reset this edit?')) {
            this.blankPost();
        }
    }
  }

  canDeactivate() {
    if (!areEqual(this.originalPost, this.post)){
      return confirm('You have  changes. Are you sure you wish to leave?');
    }

    return true;
  }


  doPost(){
    this.post.post_config = this.post_config;
    //this.post['mp-syndicate-to'] = this.syndicate_tos;
    this.mp.send(this.post).then(data => {
      //console.log(data);
      this.addNotification("New Post created", data);
      this.blankPost();
    }).catch(error => {
      delete this.post.post_config;
    });
  }

  toggleField(field_name){
    for(var i = 0; i < this.post_config.length; i++){
      if(this.post_config[i].name == field_name){
        this.post_config[i].shown = !this.post_config[i].shown;
        break;
      }
    }
  }

  addListItem(field_name){

      for(var i = 0; i < this.post_config.length; i++){
          if(this.post_config[i].name == field_name){
              if(this.post_config[i].adding != '' ){
                  this.post[this.post_config[i].name].push(this.post_config[i].adding);
                  this.post_config[i].adding = '';
              }
              break;
          }
      }
  }

  removeListItem(field_name, option){

    if (this.post.hasOwnProperty(field_name) && typeof this.post[field_name] === 'object' && this.post[field_name].constructor === Array){

      for(var i = 0; i < this.post[field_name].length; i++){
        if(this.post[field_name][i] == option){
          this.post[field_name].splice(i, 1);
          break;
        }
      }
    }
  }


  canPost() {
    return navigator.onLine;
  }

 getGeo(){
    function setPos(position){
      console.log( 'geo:'+position.coords.latitude + "," + position.coords.longitude);
      this.post.location =  'geo:'+position.coords.latitude + "," + position.coords.longitude
    }
    navigator.geolocation.getCurrentPosition(setPos.bind(this),
      function(message){
        console.log(message);
      //error('error: ' + error.code + '\n' + 'message: ' + error.message + '\n');
      },{
        maximumAge: 3000, timeout: 5000, enableHighAccuracy: false
      }
      );
  }

}
