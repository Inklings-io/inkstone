import {Config} from './config';
import {areEqual} from './utility';

export class PostDetails {
  static inject() { return [Config]; }


  constructor(Config){
    this.config = Config;

    this.settings = {
      scope: config.get('scope'),
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

    this.config.save(this.post);

  }


}
