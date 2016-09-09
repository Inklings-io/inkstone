export function areEqual(obj1, obj2) {
    for( var key in obj1){
        if(obj1.hasOwnProperty(key)){
            if(!obj2.hasOwnProperty(key)){
                return false;
            }
            if(typeof obj1[key] === 'string'){
                if(obj1[key] !== obj2[key]){
                    return false;
                }
            } else {
                if(!areEqual(obj1[key], obj2[key])){
                    return false;
                }
            }
        }
    }
	return true;
    
};

export function getFormattedDate(){
    var now = new Date();

    var formatted_out = now.getFullYear() + "-";

    // ugh zero indexed months
    if(now.getMonth() < 9){
        formatted_out += "0";
    }
    formatted_out += (now.getMonth()+1) + "-";

    if(now.getDate() < 10){
        formatted_out += "0";
    }
    formatted_out += now.getDate() + "T";

    if(now.getHours() < 10){
        formatted_out += "0";
    }
    formatted_out += now.getHours() + ":";

    if(now.getMinutes() < 10){
        formatted_out += "0";
    }
    formatted_out += now.getMinutes() + ":";

    if(now.getSeconds() < 10){
        formatted_out += "0";
    }
    formatted_out += now.getSeconds();

    var tz_offset = now.getTimezoneOffset();

    if(tz_offset > 0){
        formatted_out += "-";
    } else {
        formatted_out += "+";
    }
    
    var offset_hours = Math.abs(tz_offset) / 60;
    var offset_mins = Math.abs(tz_offset) % 60;

    if(offset_hours < 10){
        formatted_out += "0";
    }
    formatted_out += offset_hours + ":";
    

    if(offset_mins < 10){
        formatted_out += "0";
    }
    formatted_out += offset_mins ;

    return formatted_out
};

export function serialize(obj) {
      var str = [];
      for(var p in obj)
            if (obj.hasOwnProperty(p)) {
                      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    }
      return str.join("&");
}
