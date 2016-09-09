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
      "like-of" :'',

      summary: '',
      slug: '',
      "repost-of": '',
      "bookmark-of": '',

      custom : [
          { 
            label: 'Type',
            name: 'mp-type',
            type: 'select',
            options: ['note','checkin'],
            value: 'note'
          }, 
          { 
            label: 'Tag of',
            name: 'tag-of',
            type: 'list',
            adding: '',
            values: [] 
          },
          { 
            name: 'location-name',
            label: 'Location Name',
            type: 'string',
            value: ''
          } 
      ]
    }
    
    this.default_shown= {
      "in-reply-to" :false,
      location :false,
      "like-of" :false,
      custom: {
          "mp-type": false,
          "tag-of": false,
          "location-name": false
      }
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
      


		for (var key in params) {
			// skip loop if the property is from prototype
			if (!params.hasOwnProperty(key)) continue;

			var invalue = params[key];
			if(this.post.hasOwnProperty(key)){
				this.post[key] = params[key];
				if(this.shown.hasOwnProperty(key)){
					this.shown[key] = true;
				}
			} else {
				//do this same thing for custom fields
				for(var i = 0; i < this.post.custom.length; i++){
					if(this.post.custom[i].name == key){
						if(this.post.custom[i].hasOwnProperty('value')){
							this.post.custom[i].value = params[key];
						} else if(this.post.custom[i].hasOwnProperty('values')){
							this.post.custom[i].values.push(params[key]);
						}
						if(this.shown.custom.hasOwnProperty(key)){
							this.shown.custom[key] = true;
						}
						break;
					}
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

  toggle_field(field_name){
    this.shown[field_name] = !this.shown[field_name];
  }

  toggle_custom(field_name){
    this.shown.custom[field_name] = !this.shown.custom[field_name];
  }

  add_custom_list_item(field_name){
      var found_index = -1;
      console.log('asdf');

      for(var i = 0; i < this.post.custom.length; i++){
          if(this.post.custom[i].name == field_name){
              found_index = i;
              break;
          }
      }

      if (found_index > -1){
          this.post.custom[found_index].values.push(this.post.custom[found_index].adding);
          this.post.custom[found_index].adding = '';
      }

  }


  get canPost() {
    return navigator.onLine;
  }
  

}
