import {Config} from './config';
import {MicropubAPI} from './micropub';
import {areEqual} from './utility';
import {Router} from 'aurelia-router';

export class EditDetails {
  static inject() { return [Router, MicropubAPI, Config]; }

  //TODO for this class
  //    add visual confirmation when things are saved, cleared, etc
  //    add ability to actually submit posts
  //

  constructor(Router, MicropubAPI, Config){
    this.config = Config;
    this.mp = MicropubAPI;
    this.router = Router;
    this.saved_index = -1;
    this.notifications = [];
    this.notifications_id= 1;

    this.user = this.mp.get_user();

    this.default_post = this.config.get('default_post');
    this.default_post_config = this.config.get('default_post_config');
    
    this.post = JSON.parse(JSON.stringify(this.default_post));
    this.post_config = JSON.parse(JSON.stringify(this.default_post_config));

    this.syndicate_tos = [];

    this.originalPost = JSON.parse(JSON.stringify(this.post));

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
  }

  clearPostData(){
    this.saved_index = -1;
    this.post = JSON.parse(JSON.stringify(this.default_post));
    this.originalPost = JSON.parse(JSON.stringify(this.post));

  }

  blankPost(){
    this.post_config = JSON.parse(JSON.stringify(this.default_post_config));
    this.clearPostData();
  }


  activate(params, routeConfig) {
    this.routeConfig = routeConfig;

    field_name = '';
    if(params.field){
      field_name = params.field
    }

    if(params.url){

        var recalled = this.mp.fetch_source(params.url, field_name);
        if(recalled){
          this.post = recalled.properties;
          this.originalPost = JSON.parse(JSON.stringify(this.post));

        } else {
          //TODO: some sort of session error message
          this.router.navigate('/post');
        }
    } else {
        //TODO: some sort of session error message?
        this.router.navigate('/post');
    }

    return true;
  }


  clearPostConfirm(){
    if(this.saved_index > -1){
        if( confirm('This will delete the saved copy. Are you sure?')) {
          this.mp.remove_saved(this.saved_index);
          this.blankPost();
          this.router.navigate('/post');
        }
    } else {
        if (!areEqual(this.originalPost, this.post)){
            if( confirm('Are you sure you want to clear the post?')) {
                this.blankPost();
            }
        } else {
            this.blankPost();
        }

    }
  }

  canDeactivate() {
    if (!areEqual(this.originalPost, this.post)){
      return confirm('You have unsaved changes. Are you sure you wish to leave?');
    }

    return true;
  }


  doPost(){
    //TODO this needs some sort of loading UI
    if(this.saved_index > -1){
      this.mp.remove_saved(this.saved_index);
      this.saved_index = -1;
    }
    this.post.post_config = this.post_config;
    this.post['mp-syndicate-to'] = this.syndicate_tos;
    this.mp.send(this.post).then(data => {
      //console.log(data);
      this.addNotification("New Post created", data);
      this.blankPost();
    }).catch(error => {
      delete this.post.post_config;
    });
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

  addNotification(message, url){
    this.notifications.push({id:this.notifications_id, msg: message, url:url});
    this.notifications_id += 1;
  }

  delNotification(id){
      for(var i = 0; i < this.notifications.length; i++){
        if(this.notifications[i].id == id){
          this.notifications.splice(i,1);
          break;
        }
      }
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
