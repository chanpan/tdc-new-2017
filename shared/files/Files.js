var fs = require('fs');
/** reactive programming **/
var Observable = require('rxjs/Observable').Observable;
require('rxjs/add/observable/of');
require('rxjs/add/operator/map');

var utils = require('../utils/Utils.js');

exports.CreateFolder = function(folderName){
    return new Observable(ob => {
        var dir = utils.HomePath() + "/" + folderName;
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        ob.next("success");
    });
}
exports.CopyFile = function(target, src){
    /**  Example
        let target = utils.HomePath() + "/folders/file.txt";
		let src = __dirname+"/assets/file.txt"; 
     **/
    return new Observable(ob => {
        fs.readFile(target,function(err, data){
            if(err){
                fs.writeFileSync(target, fs.readFileSync(src));
                ob.next("Success.");
            }else{
                ob.next("Success.");
            }
        });
    });
}
exports.CreateFile = function(fileName, data){
    return new Observable(ob => {
        fs.writeFile(fileName, data, function(err) {
            if(err) {
                ob.error(err);
            }
            ob.next(data);
        }); 
    });
}
exports.ReadFile = function(filename){
    return new Observable(ob => {
        fs.readFile(filename, "utf8", function(err, data) {
            if (err) ob.error(err);
            ob.next(data);
        });
    }); 
}