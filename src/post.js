import {MicropubAPI} from './micropub';
import {areEqual} from './utility';
import {Router} from 'aurelia-router';

export class PostDetails {
  static inject() { return [Router, MicropubAPI]; }

  //TODO for this class
  //    add visual confirmation when things are saved, cleared, etc
  //    add ability to actually submit posts
  //    add any additional neede fields
  //    move "default post" to settings

  constructor(Router, MicropubAPI){
    this.mp = MicropubAPI;
    this.router = Router;
    this.saved_index = -1;

      //TODO: have this saved in settings
    this.default_post = {
      content  :'',
      category :'',
      name :'',
      "in-reply-to" :'',
      location :'',
      "like-of" :''
    }
    this.default_shown= {
      "in-reply-to" :false,
      location :false,
      "like-of" :false
    }

    this.post = JSON.parse(JSON.stringify(this.default_post));
    this.shown = JSON.parse(JSON.stringify(this.default_shown));
    this.originalPost = JSON.parse(JSON.stringify(this.post));
  }

  clear_post_data(){
    this.saved_index = -1;
    this.post = JSON.parse(JSON.stringify(this.default_post));
    this.originalPost = JSON.parse(JSON.stringify(this.post));
  }

  blank_post(){
    this.clear_post_data();
    this.shown = JSON.parse(JSON.stringify(this.default_shown));
  }


  activate(params, routeConfig) {
    this.routeConfig = routeConfig;

    if(params.num){
        var recalled = this.mp.recall_saved(params.num);
        if(recalled){
          this.post = recalled;
          this.saved_index = params.num;
          this.shown = this.post.shown;
          delete this.post.shown;
          this.originalPost = JSON.parse(JSON.stringify(this.post));
        } else {
          this.blank_post(); //not needed?
          this.router.navigate('/post');
        }
    } else {
      if(params["in-reply-to"]){
        this.shown['in-reply-to'] = !this.shown['in-reply-to'];
        this.post['in-reply-to'] = params["in-reply-to"];
      }
      if(params["like-of"]){
        this.shown['like-of'] = !this.shown['like-of'];
        this.post['like-of'] = params["like-of"];
      }
      if(params.location){
        this.shown.location = !this.shown.location;
        this.post.location = params.location;
      }
      if(params.category){
        this.post.category = params.category;
      }
      if(params.name){
        this.post.name = params.name;
      }
      if(params.content){
        this.post.content = params.content;
      }
    }

    return true;
  }


  clear_post_confirm(){
    if(this.saved_index > -1){
        if( confirm('This will delete the saved copy. Are you sure?')) {
          this.mp.remove_saved(this.saved_index);
          this.blank_post();
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
    this.mp.send(this.post).then(data => {
      this.blank_post();
    });

  }

  toggle_like_field() {
    this.shown["like-of"] = !this.shown["like-of"];
  }

  toggle_reply_field() {
    this.shown['in-reply-to'] = !this.shown['in-reply-to'];
  }

  toggle_location_field() {
    this.shown.location = !this.shown.location;
  }


  get canPost() {
    return navigator.onLine;
  }
  

}
