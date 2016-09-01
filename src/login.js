import {MicropubAPI} from './micropub';

export class Login{

      constructor(){
          this.loginUrl = "";
      }

      submit_login(){
          if(this.loginUrl){
              var mp = new MicropubAPI;
              mp.login_test(this.loginUrl);
              return true;
          }
          return false;
      }

}
