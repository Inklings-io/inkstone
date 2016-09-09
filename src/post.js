import {Config} from './config';
import {MicropubAPI} from './micropub';
import {areEqual} from './utility';
import {Router} from 'aurelia-router';

export class PostDetails {
  static inject() { return [Router, MicropubAPI, Config]; }

  //TODO for this class
  //    add visual confirmation when things are saved, cleared, etc
  //    add ability to actually submit posts
  //    add any additional neede fields
  //    move "default post" to settings

  constructor(Router, MicropubAPI, Config){
    this.config = Config;
    this.mp = MicropubAPI;
    this.router = Router;
    this.saved_index = -1;

      //TODO: have this saved in settings
      //
    this.default_post = this.config.get('default_post');
    this.default_post_config = this.config.get('default_post_config');
    
    this.post = JSON.parse(JSON.stringify(this.default_post));
    this.post_config = JSON.parse(JSON.stringify(this.default_post_config));
    this.originalPost = JSON.parse(JSON.stringify(this.post));
  }

  clear_post_data(){
    this.saved_index = -1;
    this.post = JSON.parse(JSON.stringify(this.default_post));
    this.originalPost = JSON.parse(JSON.stringify(this.post));
  }

  blank_post(){
    this.post_config = JSON.parse(JSON.stringify(this.default_post_config));
    this.clear_post_data();
  }


  activate(params, routeConfig) {
    this.routeConfig = routeConfig;

    if(params.num){
        var recalled = this.mp.recall_saved(params.num);
        if(recalled){
          this.post = recalled;
          this.saved_index = params.num;
          this.post_config = this.post.post_config;
          delete this.post.post_config;
          this.originalPost = JSON.parse(JSON.stringify(this.post));
        } else {
          this.blank_post(); //not needed?
          this.router.navigate('/post');
        }
    } else {
      
		for (var key in params) {

			// skip loop if the property is from prototype
			if (!params.hasOwnProperty(key) || !post.hasOwnProperty(key)) continue;

				for(var i = 0; i < this.post_config.length; i++){
					if(this.post_config[i].name == key){

						if(this.post_config[i].type == 'list'){
							this.post[key] = [ params[key] ];
						} else {
							this.post[key] = params[key];
						}

                        this.post_config[i].shown = true;
						break;
					}
				}

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

    this.post.post_config = this.post_config;
    
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

  toggle_field(field_name){
    for(var i = 0; i < this.post_config.length; i++){
      if(this.post_config[i].name == field_name){
        this.post_config[i].shown = !this.post_config[i].shown;
        break;
      }
    }
  }


  add_list_item(field_name){
      var found_index = -1;

      for(var i = 0; i < this.post_config.length; i++){
          if(this.post_config[i].name == field_name){
              this.post[this.post_config[i].name].push(this.post_config[i].adding);
              this.post_config[i].adding = '';
              break;
          }
      }


  }


  get canPost() {
    return navigator.onLine;
  }
  

}
