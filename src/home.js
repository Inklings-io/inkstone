import {MicropubAPI} from './micropub';

export class Home{

        /*
        icons = [
            {'image':'icons/circle-icons/pencil.svg', 'label':'Note', 'id':'newnote'}, 
            {'image':'icons/circle-icons/bubble.svg', 'label':'Reply', 'id':'newreply'},
            {'image':'icons/circle-icons/location.svg', 'label':'Checkin', 'id':'newcheckin'},
            {'image':'icons/circle-icons/bookmark.svg', 'label':'Bookmark', 'id':'newbookmark'},
            {'image':'icons/circle-icons/heart.svg', 'label':'Like', 'id':'newlike'},
            {'image':'icons/circle-icons/power.svg', 'label':'Logout', 'id':'exit', 'function': 'logout'}
        ];

        if(config['support_photo']){
            icons.push({'image':'icons/circle-icons/photo.svg', 'label':'Photo', 'id':'newphoto'});
        }
        if(config['support_audio']){
            icons.push({'image':'icons/circle-icons/mic.svg', 'label':'Audio', 'id':'newaudio'});
        }
        if(config['support_video']){
            icons.push({'image':'icons/circle-icons/film.svg', 'label':'Video', 'id':'newvideo'});
        }
        */

        //icons.push({'image':'icons/circle-icons/calendar.svg', 'label':'New Event', 'id':'newevent'});
        //icons.push({'image':'icons/circle-icons/settings.svg', 'label':'Settings', 'id':'settings'});
        //
        logout(){
              var mp = new MicropubAPI;
              mp.logout();
              return true;
        }

}
