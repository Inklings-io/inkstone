import {MicropubAPI} from './micropub';
import {areEqual} from './utility';
import {Router} from 'aurelia-router';

export class PostDetails {
  static inject() { return [Router, MicropubAPI]; }


  constructor(Router, MicropubAPI){
    this.mp = MicropubAPI;
    this.router = Router;
    this.saved_index = -1;

      //TODO: have this saved in settings
    this.default_post = {
      content  :'',
      category :'',
      in_reply_to :'',
      location :'',
      like_of :''
    }
    this.default_shown= {
      in_reply_to :false,
      location :false,
      like_of :false
    }

    this.post = this.default_post;
    this.shown = this.default_shown;
    this.originalPost = JSON.parse(JSON.stringify(this.post));
  }

  clear_post_data(){
    this.saved_index = -1;
    this.post = this.default_post;
    this.originalPost = JSON.parse(JSON.stringify(this.post));
  }

  blank_post(){
    this.clear_post_data();
    this.shown = this.default_shown;
  }


  activate(params, routeConfig) {
    this.routeConfig = routeConfig;

    if(params.num){
        var recalled = this.mp.recall_saved(params.num);
        if(recalled){
          this.post = recalled;
          this.saved_index = params.num;
          this.shown = this.post.shown;
          unset(this.post.shown);
          this.originalPost = JSON.parse(JSON.stringify(this.post));
        } else {
          this.blank_post(); //not needed?
          this.router.navigate('/post');
        }
    }

    return true;
  }


  clear_post_confirm(){
    if(this.saved_index > -1){
        if( confirm('This will delete the saved copy. Are you sure?')) {
          this.mp.remove_saved(this.saved_index);
          this.router.navigate('/post');
        }
    } else {
        if (!areEqual(this.originalPost, this.post)){
            if( confirm('Are you sure you want to clear the post?')) {
                this.blank_post();
            }
        } else {
            this.blank_post();
        }

    }
  }

  canDeactivate() {
    if (!areEqual(this.originalPost, this.post)){
      return confirm('You have unsaved changes. Are you sure you wish to leave?');
    }

    return true;
  }

  save() {

    this.post.shown = this.shown;
    
    if(this.saved_index > -1){
        this.mp.remove_saved(this.saved_index);
        this.saved_index = -1;
    }
    this.mp.save(this.post);

    this.blank_post();
    this.router.navigate('/post');

  }

  do_post(){
      //TODO
    if(this.saved_index > -1){
        this.mp.remove_saved(this.saved_index);
        this.saved_index = -1;
    }
    this.blank_post();

  }

  toggle_like_field() {
    this.shown.like_of = !this.shown.like_of;
  }

  toggle_reply_field() {
    this.shown.in_reply_to = !this.shown.in_reply_to;
  }

  toggle_location_field() {
    this.shown.location = !this.shown.location;
  }


  get canPost() {
    return navigator.onLine;
  }
  

}
