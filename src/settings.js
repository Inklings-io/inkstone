import {MicropubAPI} from './micropub';

export class Settings{

  static inject() { return [ MicropubAPI]; }


  constructor(MicropubAPI){
    this.mp = MicropubAPI;
  }


}
