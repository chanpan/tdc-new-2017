const api = require("../shared/api/Api.js");
const baseUrl = require("../shared/api/BaseUrl.js");
const alertBootstrap = require("../shared/utils/AlertBootstrap.js");
const knexSql = require("../shared/sql/Knex.js");

const remote = require("electron").remote;
const main = remote.require('./main.js');
var window = remote.getCurrentWindow();

$(".btnLogin").click(function() {
  Login();
});

function Login() {
  var frm = $("#form-login").serializeArray();
  var data = {};
  var url = baseUrl.TdcUrl();

  for (let i of frm) {
    data[i.name] = i.value;
  }
  var d = btoa(data.Username + ":" + data.Password);
  if(data.Username != "" && data.Password != ""){
    api.GetService(url, "", d).subscribe(
        res => {SaveDataLogin(res);},
        err => {
          err = JSON.parse(err);
          $(".error-message").html(
            alertBootstrap.AlertDanger(
              err.responseJSON.name,
              err.responseJSON.message + " Status=" + err.responseJSON.status
            )
          );
        }
      );//subscribe
  }else{
    $(".error-message").html(alertBootstrap.AlertDanger( "Validate","กรุณากรอกข้อมูลให้ครบ"));
  }
  
}//Login

function SaveDataLogin(data){
    var columns = Object.keys(data);
    knexSql.CreateTableIfNotExist("user_login", columns, ["id"],'longtext',collates='utf8_unicode_ci','')
    .then(res=>{
       knexSql.ReadPromise("user_login",{id:data.id}, 1).then(res=>{
           if(res.length == 0){
                knexSql.Create("user_login",data).then(res=>{
                    console.log('มีการทึกข้อมูลแล้ว');
                    window.hide();
                    main.childWindow("1");
                });
           }else{
                console.log('มันทึกข้อมูลแล้ว');
                window.hide();
                main.childWindow("1");
           }
       });
    })
    .catch(err=>console.log(err));
    
}
