import {MicropubAPI} from './micropub';

export class Home{

  static inject() { return [ MicropubAPI]; }


  constructor(MicropubAPI){
    this.mp = MicropubAPI;
    this.saved_post_list = [];

    this.user = this.mp.get_user();

    var list = this.mp.get_saved_list();
    if(list){
      for(var i = 0; i < list.length; i++) {
        var post = list[i];
        
        post.discovered = {
          content: '',
          type: '',
          additional: ''
        }

        if(post.content){
          post.discovered.content = post.content; //todo trim this?
        } else if (post.name){
          post.discovered.content = post.name;
        }

        if(post['rsvp']){
          post.discovered.type = 'RSVP';
          post.discovered.additional = post.discovered.rsvp;
        } else if(post['in-reply-to']){
          post.discovered.type = 'Reply';
          post.discovered.additional = post['in-reply-to'];
        } else if(post['repost-of']){
          post.discovered.type = 'Share';
          post.discovered.additional = post['repost-of'];
        } else if(post['like-of']){
          post.discovered.type = 'Like';
          post.discovered.additional = post['like-of'];
        //} else if(post['video'].length != 0){
          //post.discovered.type = 'Video';
          ////todo
        //} else if(post['photo'].length != 0){
          //post.discovered.type = 'Photo';
          ////todo
        //} else if(post['audio'].length != 0){
          //post.discovered.type = 'Audio';
          ////todo
        } else {
          post.discovered.type = 'Note';
        }



        post.index = i;
        this.saved_post_list.push(post);
      }
    }
  }

  logout(){
    var mp = new MicropubAPI;
    mp.logout();
    return true;
  }

  canPost() {
    return navigator.onLine;
  }

}
