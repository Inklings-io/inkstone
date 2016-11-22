export class Config {


  constructor(){
    this.client_id = 'https://inklings.io/inkstone/';
    this.redirect_uri = 'https://inklings.io/inkstone/';

    this.field_template = { 
      name: 'micropub-field',
      label: 'Field Display Name',
      type: 'string',
      icon: 'icons/circle-icons/settings.svg',
      adding: '',
      adding_option: '',
      options: [],
      custom: true,
      shown: false,
      always_send: false
    } 


    this.preset_post = {
         'h'              : 'entry',
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
         'tag-of'         : [],
         'photo'          : [],
         'video'          : [],
         'audio'          : []
    };
    this.preset_fields = [
        { 
          name: 'h',
          label: 'microformat type',
          type: 'select',
          icon: '',
          adding: '',
          adding_option: '',
          options: ['entry'],
          custom: false,
          shown: false,
          always_send: true
        },
        { 
          name: 'content',
          label: 'Content',
          type: 'text',
          icon: '',
          adding: '',
          adding_option: '',
          options: [],
          custom: false,
          shown: true,
          always_send: false
        },
        { 
          name: 'name',
          label: 'Title',
          type: 'string',
          icon: 'icons/circle-icons/document.svg',
          adding: '',
          adding_option: '',
          options: [],
          custom: false,
          shown: true,
          always_send: false
        },
        { 
          name: 'category',
          label: 'Category',
          type: 'list',
          icon: 'icons/circle-icons/document.svg',
          adding: '',
          adding_option: '',
          options: [],
          custom: false,
          shown: false,
          always_send: false
        },
        { 
          name: 'in-reply-to',
          label: 'In Reply To',
          type: 'string',
          icon: 'icons/circle-icons/bubble.svg',
          adding: '',
          adding_option: '',
          options: [],
          custom: false,
          shown: false,
          always_send: false
        },
        { 
          name: 'location',
          label: 'Location',
          type: 'string',
          icon: 'icons/circle-icons/location.svg',
          adding: '',
          adding_option: '',
          options: [],
          custom: false,
          shown: false,
          always_send: false
        },
        { 
          name: 'photo',
          label: 'Photo',
          type: 'files',
          icon: 'icons/circle-icons/photo.svg',
          adding: '',
          adding_option: '',
          options: [],
          custom: false,
          shown: false,
          always_send: false
        },
        { 
          name: 'video',
          label: 'Video',
          type: 'files',
          icon: 'icons/circle-icons/film.svg',
          adding: '',
          adding_option: '',
          options: [],
          custom: false,
          shown: false,
          always_send: false
        },
        { 
          name: 'audio',
          label: 'Audio',
          type: 'files',
          icon: 'icons/circle-icons/audio.svg',
          adding: '',
          adding_option: '',
          options: [],
          custom: false,
          shown: false,
          always_send: false
        },
        { 
          name: 'like-of',
          label: 'Like of',
          type: 'string',
          icon: 'icons/circle-icons/heart.svg',
          adding: '',
          adding_option: '',
          options: [],
          custom: false,
          shown: false,
          always_send: false
        },
        { 
          name: 'summary',
          label: 'Summary',
          type: 'string',
          icon: 'icons/circle-icons/document.svg',
          adding: '',
          adding_option: '',
          options: [],
          custom: false,
          shown: false,
          always_send: false
        },
        { 
          name: 'slug',
          label: 'Slug',
          type: 'string',
          icon: 'icons/circle-icons/search.svg',
          adding: '',
          adding_option: '',
          options: [],
          custom: false,
          shown: false,
          always_send: false
        },
        { 
          name: 'repost-of',
          label: 'Repost Of URL',
          type: 'string',
          icon: 'icons/circle-icons/recycle.svg',
          adding: '',
          adding_option: '',
          options: [],
          custom: false,
          shown: false,
          always_send: false
        },
        { 
          name: 'bookmark-of',
          label: 'Bookmark URL',
          type: 'string',
          icon: 'icons/circle-icons/bookmark.svg',
          adding: '',
          adding_option: '',
          options: [],
          custom: false,
          shown: false,
          always_send: false
        },
        { 
          name: 'tag-of',
          label: 'Tag of',
          type: 'list',
          icon: 'icons/circle-icons/person.svg',
          adding: '',
          adding_option: '',
          options: [],
          custom: false,
          shown: false,
          always_send: false
        },
        { 
          name: 'location-name',
          label: 'Location Name',
          type: 'string',
          icon: 'icons/circle-icons/location.svg',
          adding: '',
          adding_option: '',
          options: [],
          custom: true,
          shown: false,
          always_send: false
        },
        { 
          label: 'Type',
          name: 'mp-type',
          type: 'select',
          icon: 'icons/circle-icons/settings.svg',
          adding: '',
          adding_option: '',
          options: ['note','checkin'],
          custom: true,
          shown: false,
          always_send: false
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
        if(this.hasOwnProperty(key)){
            return this[key];
        } else {
            return null;
        }
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
