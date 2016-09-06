export class Config {


  constructor(){
    this.client_id = 'https://inklings.io/inkstone/';
    this.redirect_uri = 'https://inklings.io/inkstone/';
    //todo store this in localstorage and allow customization
    this.scope = 'post';
  }


    get(key){
        if(this.hasOwnProperty(key)){
            return this[key];
        } else {
            return undefined;
        }
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
