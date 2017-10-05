/** reactive programming **/
var Observable = require('rxjs/Observable').Observable;
require('rxjs/add/operator/map');

var baseUrl = require("./BaseUrl.js");

function Settings(url, method, headers="", data=""){
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": url,
        "method": method,
        "headers": {
          "authorization": "Basic "+data,
        }
      }
    return settings;  
}

exports.GetLoginService=function(url,headers="",data){
    return new Observable(ob=>{
        $.ajax(Settings(url, "GET", headers,data)).done(function (response) {
           ob.next(response);
        }).fail(function(error){
            ob.error( JSON.stringify(error));
        });
    });
}
 

exports.GetService=function(url){  
    //settings.url = "https://tdcservice.thaicarecloud.org/buffe-config?token=HreXtADA4KJMP-7QC9wjF5U6NrZS5z84";
    var options = Settings(url, "GET", "", "");
    return new Observable(ob=>{
        $.ajax(options).done(function (response) {
            ob.next(response);
        });
    });
}//getSetting

exports.PostService=function(url,headers="",form){
    /*var form = new FormData();
    form.append("ezf_id", "1505970320082452600");
    form.append("data", "{\"var3\":\"ณัฐพล\",\"sys_lat\":11,\"sys_lng\":12}");
    form.append("target", "");
    form.append("sitecode", "10980");
    form.append("user_id", "1435745159010041100");
    form.append("submit", "false");
    form.append("data_id", "12345");*/
   
    return new Observable(ob=>{
        $.ajax(Settings(urls, "POST", headers,form)).done(function (response) {
           ob.next(response);
        });
    });
}
