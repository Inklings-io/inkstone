export class Config {


  constructor(){
    this.client_id = 'https://inklings.io/inkstone/';
    this.redirect_uri = 'https://inklings.io/inkstone/';


    if(!window.localStorage.getItem('settings_scope')){
        window.localStorage.setItem('settings_scope', 'post');
    }
  }


    get(key){
        return window.localStorage.getItem('settings_' + key);
    }

    set(key, value){
        window.localStorage.setItem('settings_' + key, value);
    }


    get_custom_fields(){
        var fields = window.localStorage.getItem("custom_fields");
        if(fields){
            fields = JSON.parse(fields);
        } else {
            fields = [];
        }
        return fields;
    }

    get_custom_fields(fields){
        window.localStorage.setItem("custom_fields", JSON.stringify(fields));
    }


}
