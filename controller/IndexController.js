const remote = require("electron").remote;
const main = remote.require('./main.js');
var window = remote.getCurrentWindow();
var Model=require("../model/Model.js");
var knexSqlite=require("../shared/sql/Knex.js");
$(".btnLogout").click(function(){
    window.hide();
    main.MainWindow();
});

Init();
function Init(){
    ShowUserLogin();
}

function ShowUserLogin(){
    let token = $("#access_token").val();
    knexSqlite.ReadPromise(Model.TABLE_USER_LOGIN,{access_token:token},1)
    .then(res=>{
        for(let i of res){
            //console.log(i);
            $("#user_login_name").html(i.name);
            $("#user_login_sitecode").html("<b>"+i.sitecode+":"+i.hospital+"</b>");
        }
    })  
    .catch(err=>console.log(err));
}