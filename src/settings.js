import {Config} from './config';
import {areEqual} from './utility';

export class PostDetails {
  static inject() { return [Config]; }


  constructor(Config){
    this.config = Config;

    this.settings = {
      scope: this.config.get('scope'),
      default_post: this.config.get('default_post'),
      default_post_config: this.config.get('default_post_config'),
    }

    this.originalSettings = JSON.parse(JSON.stringify(this.settings));
  }



  canDeactivate() {
    if (!areEqual(this.originalSettings, this.settings)){
      return confirm('You have unsaved changes. Are you sure you wish to leave?');
    }

    return true;
  }

  save() {

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
      default_post: this.config.get('default_post'),
      default_post_config: this.config.get('default_post_config'),
    }

    this.originalSettings = JSON.parse(JSON.stringify(this.settings));
  }
}
