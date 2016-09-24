import {MicropubAPI} from './micropub';
import {Router} from 'aurelia-router';

export class Login {
  static inject() { return [Router, MicropubAPI]; }

  constructor(Router, MicropubAPI){
    this.loginUrl = "";
    this.mp = MicropubAPI;
    this.router = Router;
    this.message = "";
  }

  activate(params, routeConfig) {
    if(document.location.search){
        document.location = document.location.pathname + '#/login' + document.location.search; 
    }
    if(params.me || params.code || params.state ){
        if(!params.me || !params.code || !params.state ){
            this.message = "There seems to have been an issue in the login process. Data needed to verify your login is missing.";
        } else {
            this.mp.auth(params.me, params.code, params.state)
            .then( data => {
                this.router.navigate('#/home');
            })
            .catch( error => { 
                this.message = 'Login Error: ' + error.message;
            });
        }
    }
    this.routeConfig = routeConfig;
  }

  submit_login(){
      if(this.loginUrl){
          this.mp.login(this.loginUrl);
          //this.router.navigate('#');

          //return true;
      }
      //return false;
  }

  isOnline() {
    return navigator.onLine;
  }
}
