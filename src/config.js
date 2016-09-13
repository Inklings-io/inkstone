export class Config {


  constructor(){
    this.client_id = 'https://inklings.io/inkstone/';
    this.redirect_uri = 'https://inklings.io/inkstone/';

    this.preset_post = {
         'bookmark-of'    : '',
         'category'       : [],
         'content'        : '',
         'in-reply-to'    : '',
         'like-of'        : '',
         'location'       : '',
         'location-name'  : '',
         'mp-type'        : 'note',
         'name'           : '',
         'repost-of'      : '',
         'slug'           : '',
         'summary'        : '',
         'tag-of'         : [] 
    };
    this.preset_fields = [
        { 
          name: 'content',
          label: 'Content',
          type: 'text',
          icon: '',
          shown: true
        },
        { 
          name: 'name',
          label: 'Title',
          type: 'string',
          icon: 'icons/circle-icons/document.svg',
          shown: true
        },
        { 
          name: 'category',
          label: 'Category',
          type: 'list',
          icon: 'icons/circle-icons/document.svg',
          adding: '',
          shown: false
        },
        { 
          name: 'in-reply-to',
          label: 'In Reply To',
          type: 'string',
          icon: 'icons/circle-icons/bubble.svg',
          shown: false
        },
        { 
          name: 'location',
          label: 'Location',
          type: 'string',
          icon: 'icons/circle-icons/location.svg',
          shown: false
        },
        { 
          name: 'like-of',
          label: 'Like of',
          type: 'string',
          icon: 'icons/circle-icons/heart.svg',
          shown: false
        },
        { 
          name: 'summary',
          label: 'Summary',
          type: 'string',
          icon: 'icons/circle-icons/document.svg',
          shown: false
        },
        { 
          name: 'slug',
          label: 'Slug',
          type: 'string',
          icon: 'icons/circle-icons/search.svg',
          shown: false
        },
        { 
          name: 'repost-of',
          label: 'Repost Of URL',
          type: 'string',
          icon: 'icons/circle-icons/recycle.svg',
          shown: false
        },
        { 
          name: 'bookmark-of',
          label: 'Bookmakr URL',
          type: 'string',
          icon: 'icons/circle-icons/bookmark.svg',
          shown: false
        },
        { 
          label: 'Type',
          name: 'mp-type',
          type: 'select',
          icon: 'icons/circle-icons/settings.svg',
          adding_option: '',
          options: ['note','checkin'],
          shown: false
        }, 
        { 
          name: 'tag-of',
          label: 'Tag of',
          type: 'list',
          icon: 'icons/circle-icons/person.svg',
          adding: '',
          shown: false
        },
        { 
          name: 'location-name',
          label: 'Location Name',
          type: 'string',
          icon: 'icons/circle-icons/location.svg',
          shown: false
        } 
    ];

    this.preset_scope = 'post';

    if(!window.localStorage.getItem('settings_default_post')){
        window.localStorage.setItem('settings_default_post', JSON.stringify(this.preset_post));
    }
    if(!window.localStorage.getItem('settings_default_post_config')){
        window.localStorage.setItem('settings_default_post_config', JSON.stringify(this.preset_fields));
    }

    if(!window.localStorage.getItem('settings_scope')){
        window.localStorage.setItem('settings_scope', JSON.stringify(this.preset_scope));
    }
  }



    get(key){
      if(window.localStorage.getItem('settings_' + key)){
        return JSON.parse(window.localStorage.getItem('settings_' + key));
      } else {
        return null;
      }
    }

    set(key, value){
        window.localStorage.setItem('settings_' + key, JSON.stringify(value));
    }


    reset(){
      window.localStorage.setItem('settings_default_post', JSON.stringify(this.preset_post));
      window.localStorage.setItem('settings_default_post_config', JSON.stringify(this.preset_fields));
      window.localStorage.setItem('settings_scope', JSON.stringify(this.preset_scope));
    }



}
