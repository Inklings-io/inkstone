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

    this.post_config = this.config.get('default_post_config');

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
    this.post_config = JSON.parse(JSON.stringify(this.originalPostConfig));
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
        this.url = params.url;

        this.mp.fetch_source(params.url, field_names).then(data => {
            //console.log('sucessfully recalled ' + JSON.stringify(data));
            var keys = Object.keys(data['properties']);

            //console.log(JSON.stringify(keys));
            //console.log(JSON.stringify(this.post_config));
            
            this.post = {};
            for(var i = 0; i < this.post_config.length; i++){
              this.post_config[i].shown = false;
            }

            for(var i = 0; i < keys.length; i++){
              var field_name = keys[i];

              var entry = data['properties'][field_name];

              //TODO if this is an array of one item (string field) we need to clean this up
              for(var j = 0; j < this.post_config.length; j++){
                  if(this.post_config[j].name == field_name){
                      this.post_config[j].shown = true;
                    if( this.post_config[j].type == 'string' || 
                        this.post_config[j].type == 'text' ||
                        this.post_config[j].type == 'select') {

                        if( typeof entry === 'object' && entry.constructor === Array){
                            entry = entry[0];
                        }
                    }
                  }
              }
                console.log(JSON.stringify(entry));
              this.post[field_name] = entry;
                console.log(JSON.stringify(this.post[field_name]));
                console.log(JSON.stringify(this.post));



            }
            //this.post = data['properties'];
            this.originalPost = JSON.parse(JSON.stringify(this.post));
            this.originalPostConfig = JSON.parse(JSON.stringify(this.post_config));
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
    var edit_obj =  this.prepForPost();
    if(edit_obj){
        this.mp.send_edit(edit_obj).then(data => {
          console.log(data);
          //this.addNotification("Post Updated", data);
          this.blankPost();
        }).catch(error => {
          delete this.post.post_config;
        });
    }
  }

  prepForPost() {

    var result_obj = {
        'action': 'update',
        'url': this.url
        };

    var deletes = [];
    var removes = {};
    var adds = {};
    var replaces = {};

    var deletes_tainted = false;
    var adds_tainted = false;
    var replaces_tainted = false;

    var only_array_replaces = true;

    //console.log(JSON.stringify(this.post_config));
    for(var i = 0; i < this.post_config.length; i++){
      var field_name = this.post_config[i].name;
      if(this.post_config[i].shown){
          if(this.originalPost.hasOwnProperty(field_name)){
              if(JSON.stringify(this.originalPost[field_name]) != JSON.stringify(this.post[field_name])){
                  if(this.post[field_name] == null || this.post[field_name] == '' || this.post[field_name] == []){
                      deletes_tainted = true;
                      deletes.push(field_name);
                  } else {
                      replaces_tainted = true;
                      if (typeof this.post[field_name] === 'object' && this.post[field_name].constructor === Array){
                          replaces[field_name] = this.post[field_name];
                      } else {
                          replaces[field_name] = [this.post[field_name]];
                          only_array_replaces = false;
                      }
                  }
              }
              //might be updating
          } else {
              if(this.post[field_name] != null && this.post[field_name] != '' && this.post[field_name] != []){
                  adds_tainted = true;

                  if (typeof this.post[field_name] === 'object' && this.post[field_name].constructor === Array){
                      adds[field_name] = this.post[field_name];
                  } else {
                      adds[field_name] = [this.post[field_name]];
                  }
              }
          }

      } else if (this.originalPost.hasOwnProperty(field_name) ) {
          //item is not shown and the original post had it
          deletes_tainted = true;
          deletes.push(field_name);
      }
    }


    if(!deletes_tainted && !adds_tainted && !replaces_tainted){
        return null;
    }
    if(!deletes_tainted && !adds_tainted && replaces_tainted && only_array_replaces){
        var keys = Object.keys(replaces);
        for(var i = 0; i < keys.length; i++){
            var field_name = keys[i];
            var entry_list = replaces[field_name];

            for(var j = 0; j < entry_list.length; j++){
                var current_entry = entry_list[j];
                var found = false;
                for(var k = 0; k < this.originalPost[field_name].length && !found ; k++){
                    var original_entry = this.originalPost[field_name][k];
                    if( original_entry == current_entry){
                        found = true;
                    }
                }
                if(!found){
                    if(!adds.hasOwnProperty(field_name)){
                        adds[field_name] = [];
                    }
                    adds_tainted = true;
                    adds[field_name].push(current_entry);
                }
            }


            for(var j = 0; j < this.originalPost[field_name].length ; j++){
                var original_entry = this.originalPost[field_name][j];
                console.log(original_entry);
                var found = false;
                for(var k = 0; k < entry_list.length && !found; k++){
                    var current_entry = entry_list[k];
                    if( original_entry == current_entry){
                        found = true;
                    }
                }
                if(!found){
                    console.log("didn't find it");
                    if(!removes.hasOwnProperty(field_name)){
                        console.log('debug ' + field_name);
                        removes[field_name] = [];
                    }
                    deletes_tainted = true;
                    removes[field_name].push(original_entry);
                    console.log(JSON.stringify(removes));
                }
            }

        }
        if(deletes_tainted){
            result_obj['delete'] = removes;
        }
        if(adds_tainted){
            result_obj['add'] = adds;
        }
        
    } else {
        if(deletes_tainted){
            result_obj['delete'] = deletes;
        }
        if(adds_tainted){
            result_obj['add'] = adds;
        }
        if(replaces_tainted){
            result_obj['replace'] = replaces;
        }
    }

    console.log(JSON.stringify(result_obj));
    return result_obj;
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
                  if(this.post[field_name] == null){
                      this.post[field_name] = [];
                  }
                  this.post[field_name].push(this.post_config[i].adding);
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
      //return true;
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
