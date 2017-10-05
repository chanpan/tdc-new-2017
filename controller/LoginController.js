const api = require("../shared/api/Api.js");
const baseUrl = require("../shared/api/BaseUrl.js");
const alertBootstrap = require("../shared/utils/AlertBootstrap.js");
const knexSql = require("../shared/sql/Knex.js");

const remote = require("electron").remote;
const main = remote.require('./main.js');
var window = remote.getCurrentWindow();

/**model*/
const Model = require("../model/Model.js");

$(".btnLogin").click(function() {
  $('.btnLogin').prop('disabled', true);
  $('.btnLogin i').addClass('fa fa-spinner fa-spin fa-fw');
  Login();
});

function Login() {
  var frm = $("#form-login").serializeArray();
  var data = {};
  var url = baseUrl.TdcUrl("/user");

  for (let i of frm) {
    data[i.name] = i.value;
  }
  var d = btoa(data.Username + ":" + data.Password);
  if(data.Username != "" && data.Password != ""){
    api.GetLoginService(url, "", d).subscribe(
        res => {
          SaveDataLogin(res);
        },
        err => {
           
          $('.btnLogin i').removeClass('fa fa-spinner fa-spin fa-fw');
          err = JSON.parse(err);
          if(typeof err.responseJSON != 'undefined'){
            $('.btnLogin').prop('disabled', false);
            $(".error-message").html(
              alertBootstrap.AlertDanger(
                err.responseJSON.name,
                err.responseJSON.message + " Status=" + err.responseJSON.status
              )
            );
          }else{
            $('.btnLogin').prop('disabled', false);
            $(".error-message").html(alertBootstrap.AlertDanger("","ไม่สามารถส่งข้อมูลขึ้น Server ได้ กรุณาตรวจสอบการเชื่อมต่อ Internet"));
          }
          
        }
      );//subscribe
  }else{
    $('.btnLogin').prop('disabled', false);
    $('.btnLogin i').removeClass('fa fa-spinner fa-spin fa-fw');
    $(".error-message").html(alertBootstrap.AlertDanger( "Validate","กรุณากรอกข้อมูลให้ครบ"));
  }
  
}//Login
 

function SaveDataLogin(data){
    Model.user_login = data;
    var columns = Object.keys(Model.USER_LOGIN);
    knexSql.CreateTableIfNotExist(Model.TABLE_USER_LOGIN, columns, ["id"],'longtext',collates='utf8_unicode_ci','')
    .then(res=>{
       
       knexSql.ReadPromise(Model.TABLE_USER_LOGIN,{id:data.id}, 1).then(res=>{
           if(res.length == 0){
                knexSql.Create(Model.TABLE_USER_LOGIN,data).then(res=>{
                    console.log('มีการทึกข้อมูลแล้ว');        
                });
           }else{
                console.log('บันทึกข้อมูลแล้ว');
           }
           GetBuffeConfig(data.access_token);//buffe-config
           GetBuffeConstanct(data.access_token);//buffe-constants
       });
    })
    .catch(err=>console.log(err));
    
}//SaveDataLogin





/*Service Confir*/
function GetBuffeConfig(token,his_type=""){
   let url = baseUrl.TdcUrl("/buffe-config?token="+token+"&his_type="+his_type);
   
   api.GetService(url).subscribe(next=>{
    Model.BUFFE_CONFIG = next;
    var columns = Object.keys(Model.BUFFE_CONFIG);
    knexSql.CreateTableIfNotExist(Model.TABLE_BUFFE_CONFIG, columns, ["id"],'longtext',collates='utf8_unicode_ci').then(res=>{
 
         knexSql.ReadPromise(Model.TABLE_BUFFE_CONFIG,{id:Model.BUFFE_CONFIG.id},1).then(res1=>{
            if(res1.length == 0){
               //บันทึก
               knexSql.Create(Model.TABLE_BUFFE_CONFIG, Model.BUFFE_CONFIG).then(res=>{
                  $(".error-message").html(alertBootstrap.AlertSuccess( "Success!","save buffe_config success."));
               }).catch(err=>$(".error-message").html(alertBootstrap.AlertDanger( "Error!",err)));
            }else{
               //แก้ไข
               knexSql.Update(Model.TABLE_BUFFE_CONFIG, Model.BUFFE_CONFIG, "id","=",Model.BUFFE_CONFIG.id)
               .then(res=>$(".error-message").html(alertBootstrap.AlertSuccess( "Success!","save buffe_config success.")))
               .catch(err=>$(".error-message").html(alertBootstrap.AlertDanger( "Error!",err)));
            }
         });
    });

   },err=>$(".error-message").html(alertBootstrap.AlertDanger( "Error!",err)));
}//buffe-config


function GetBuffeConstanct(token,his_type=""){
  //buffe-constants
  let url = baseUrl.TdcUrl("/buffe-constants?token="+token+"&his_type="+his_type);
  api.GetService(url).subscribe(response=>{
    Model.BUFFE_CONSTANCT =  response[0];
    var columns = Object.keys(Model.BUFFE_CONSTANCT);
   
    knexSql.CreateTableIfNotExist(Model.TABLE_BUFFE_CONSTANCT, columns, ["id"],'longtext',collates='utf8_unicode_ci').then(res=>{
       
      for(let i in response){
         knexSql.ReadPromise(Model.TABLE_BUFFE_CONSTANCT,{id:response[i].id},1).then(res1=>{
                 if(res1.length == 0){
                    //บันทึก
                    knexSql.Create(Model.TABLE_BUFFE_CONSTANCT, response[i]).then(res=>{
                       $(".error-message").html(alertBootstrap.AlertSuccess( "Success!","save buffe_constants success."));
                    }).catch(err=>$(".error-message").html(alertBootstrap.AlertDanger( "Error!",err)));
                 }else{
                    //แก้ไข

                    knexSql.Update(Model.TABLE_BUFFE_CONSTANCT, response[i], "id","=", response[i].id)
                    .then(res=>$(".error-message").html(alertBootstrap.AlertSuccess( "Success!","save buffe_constants success.")))
                    .catch(err=>$(".error-message").html(alertBootstrap.AlertDanger( "Error!",err)));
                 }
        });
      }
      setTimeout(function(){
        $(".error-message").html(alertBootstrap.AlertInfo( "","กำลังโหลดข้อมูล...")); 
      },1500);
      setTimeout(function(){
        window.hide();
        main.childWindow(token);  
        $('.btnLogin i').removeClass('fa fa-spinner fa-spin fa-fw');
      },5000);
              
    });
  },err=>$(".error-message").html(alertBootstrap.AlertDanger( "Error!",err)));
}//buffe-constants