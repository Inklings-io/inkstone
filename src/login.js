import {MicropubAPI} from './micropub';
import {Router} from 'aurelia-router';

export class Login {
  static inject() { return [Router, MicropubAPI]; }

  constructor(Router, MicropubAPI){
    this.debug_mode = false;
    this.loginUrl = "";
    this.mp = MicropubAPI;
    this.router = Router;
    this.message = "";
  }

  activate(params, routeConfig) {
    if(document.location.search){
        document.location = document.location.pathname + '#/login' + document.location.search; 
    }
    if(params.code || params.state ){
        if(!params.code || !params.state ){
            this.message = "There seems to have been an issue in the login process. Data needed to verify your login is missing.";
        } else {
            this.mp.auth(params.code, params.state)
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
          if(this.debug_mode){
            this.mp.login_test(this.loginUrl);
            window.location.href = '/';
          } else {
            this.mp.login(this.loginUrl).then( url => {
                //console.log('good' + url );
                window.location = url;
            })
            .catch( error => { 
                this.message = 'Login Error: ' + error.message;
            });
          }
      }
      return true;
  }

  isOnline() {
    return this.debug_mode || navigator.onLine;
  }

  clearMessage(){
    this.message = '';

  }
}
