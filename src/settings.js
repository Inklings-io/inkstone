import {Config} from './config';
import {areEqual} from './utility';
import {MicropubAPI} from './micropub';

export class Settings {
  static inject() { return [Config, MicropubAPI]; }


  constructor(Config, MicropubAPI){
    this.config = Config;
    this.mp = MicropubAPI;

    this.settings = {
      scope: this.config.get('scope'),
      post_encoding: this.config.get('post_encoding'),
      default_post: this.config.get('default_post'),
      default_post_config: this.config.get('default_post_config'),
    }

    this.software_version = this.config.get('software_version');

    this.user = this.mp.get_user();

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

    this.originalSettings = JSON.parse(JSON.stringify(this.settings));
  }



  canDeactivate() {
    if (!areEqual(this.originalSettings, this.settings)){
      return confirm('You have unsaved changes. Are you sure you wish to leave?');
    }

    return true;
  }

  save() {
    for(var i = 0; i < this.settings.default_post_config.length; i++){
        var field_name = this.settings.default_post_config[i].name;

        if(!this.settings.default_post.hasOwnProperty(field_name)){
          if(this.settings.default_post_config[i].type == 'list'){
            this.settings.default_post[field_name] = [];
          } else if(this.settings.default_post_config[i].type == 'select'){
            this.settings.default_post[field_name] = this.settings.default_post_config[i].options[0];
          } else {
            this.settings.default_post[field_name] = '';
          }

        }
    }

    for(var key in this.settings){
        console.log(key);

      this.config.set(key, this.settings[key]);
    }
    this.originalSettings = JSON.parse(JSON.stringify(this.settings));
  }

  revert() {

    this.settings = JSON.parse(JSON.stringify(this.originalSettings));

  }

  reset() {
    this.config.reset();

    this.settings = {
      scope: this.config.get('scope'),
      post_encoding: this.config.get('post_encoding'),
      default_post: this.config.get('default_post'),
      default_post_config: this.config.get('default_post_config'),
    }

    this.originalSettings = JSON.parse(JSON.stringify(this.settings));
  }

  add_field() {
      this.settings.default_post_config.push( this.config.get('field_template'));
  }

  remove_field(field_name) {
    for(var i = 0; i < this.settings.default_post_config.length; i++){
      if(this.settings.default_post_config[i].name == field_name){
        if(this.settings.default_post_config[i].custom){
          this.settings.default_post_config.splice(i,1);
          delete this.settings.default_post[field_name];
        }

        break;
      }
    }

  }


  add_selection_item(field_name){
    for(var i = 0; i < this.settings.default_post_config.length; i++){
      if(this.settings.default_post_config[i].name == field_name){

        var input_value = this.settings.default_post_config[i].adding_option.trim();

        if( input_value != '' && this.settings.default_post_config[i].type == 'select' ) {

          this.settings.default_post_config[i].options.push(input_value);
          this.settings.default_post_config[i].adding_option = '';

          if(this.settings.default_post_config[i].options.length == 0){
              this.settings.default_post[field_name] = '';//should never happen
          } else {
              //always default to whatever is first in the list
              this.settings.default_post[field_name] = this.settings.default_post_config[i].options[0];
          }
        }
        break;

      }
    }
  }
  

  remove_selection_item(field_name, option_val){
      
    for(var i = 0; i < this.settings.default_post_config.length; i++){
      if(this.settings.default_post_config[i].name == field_name){

        if(this.settings.default_post_config[i].type == 'select' ){

          for(var j = 0; j < this.settings.default_post_config[i].options.length; j++){
              if(this.settings.default_post_config[i].options[j] == option_val){

                this.settings.default_post_config[i].options.splice(j, 1);
                break;
              }
          }

          if(this.settings.default_post_config[i].options.length == 0){
              this.settings.default_post[field_name] = '';
          } else {
              //always default to whatever is first in the list
              this.settings.default_post[field_name] = this.settings.default_post_config[i].options[0];
          }
        }
        break;
      }

    }
  }

  update_mp_configs(){
    this.mp.get_configs(true).then(data => {
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
  }

}
