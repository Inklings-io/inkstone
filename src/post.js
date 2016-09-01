import {MicropubAPI} from './micropub';
import {areEqual} from './utility';
import {Router} from 'aurelia-router';

export class PostDetails {
  static inject() { return [Router, MicropubAPI]; }


  constructor(Router, MicropubAPI){
    this.mp = MicropubAPI;
    this.router = Router;

    this.saved_index = -1;
    this.post = {
      content  :'',
      category :''
    }
    this.originalPost = JSON.parse(JSON.stringify(this.post));
  }

  clear_post_confirm(){
    if(this.saved_index > -1){
        if( confirm('Are you sure you want to clear the post? This will remove the saved copy as well?')) {
            clear_post();
        }
    } else {
        clear_post();
    }

  }

  clear_post(){
    if(this.saved_index > -1){
        this.mp.remove_saved(this.saved_index);
        this.saved_index = -1;
    }

    //todo: ideally you should be able to change what to leave and what to reset here via settings
    this.post = {
      content  :'',
      category :''
    }
    this.originalPost = JSON.parse(JSON.stringify(this.post));
  }


  save() {
    
    if(this.saved_index > -1){
        this.mp.remove_saved(this.saved_index);
        this.saved_index = -1;
    }
    this.mp.save(this.post);

    this.clear_post();
    this.router.navigate('/post');

  }

  do_post(){
    if(this.saved_index > -1){
        this.mp.remove_saved(this.saved_index);
        this.saved_index = -1;
    }
    this.clear_post();

  }

  get canPost() {
    return navigator.onLine;
  }

  activate(params, routeConfig) {
    this.routeConfig = routeConfig;

    var recalled = this.mp.recall_saved(params.num);
    if(recalled){
      this.post = recalled;
      this.saved_index = params.num
      this.originalPost = JSON.parse(JSON.stringify(this.post));
    } else {
      this.clear_post();
      this.router.navigate('/post');
    }

    return true;
  }

  
  canDeactivate() {
    if (!areEqual(this.originalPost, this.post)){
      return confirm('You have unsaved changes. Are you sure you wish to leave?');
    }

    return true;
  }


}
