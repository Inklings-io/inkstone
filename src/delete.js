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

    this.url = '';

  }

  clearPostData(){
    this.url = '';
  }

  blankPost(){
    this.clearPostData();
  }


  activate(params, routeConfig) {
    this.routeConfig = routeConfig;

    if(params.url){
        this.url = params.url;
    }
    return true;
  }


  clearPostConfirm(){
    if (!areEqual(this.originalPost, this.post)){
        if( confirm('Are you sure you want to clear the url?')) {
            this.blankPost();
        }
    }
  }

  canDeactivate() {
    if (this.url){
      return confirm('You have not submitted. Are you sure you wish to leave?');
    }

    return true;
  }


  doPost(){
    if(this.url){
        this.mp.send_delete(this.url).then(data => {
          console.log(data);
          this.addNotification("Post Deleted", data);
          this.blankPost();
        }).catch(error => {
          console.log(error);
        });
    }
  }




  canPost() {
      //return true;
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

}
