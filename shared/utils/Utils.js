const os = require("os");

/** reactive programming **/
var Observable = require('rxjs/Observable').Observable;
require('rxjs/add/operator/map');

exports.HomePath=function(){
    return os.homedir();
}
exports.GeneratorAutoId=function(){
    var n = Date.now();
    let val = n * 1000;
    return new Observable(ob=>{
        ob.next(n + RandomValue());
        ob.complete();
    });
}
function RandomValue() {
    var number = Math.round((Math.random() * 999999999));
    return number.toString().substr(0, 4);
}