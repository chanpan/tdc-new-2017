const smartcard = require("smartcard");
const Devices = smartcard.Devices;
const devices = new Devices();
const CommandApdu = smartcard.CommandApdu;
const pcsc1 = require("pcsclite");
const pcsc = pcsc1();
const legacy = require("legacy-encoding");
const md5 = require("md5");
const fs = require("fs");
const opn = require("opn");
const utils = require("../utils/Utils.js");

/** Var */
var obj = {
  cmdIndex: "",
  inGetImage: false,
  imgTemp: "",
  image: "",
  ptlink: "",
  fullname_th: "",
  fullname_en: "",
  address_full: "",
  birthday_full: "",
  cid: "",
  pathname: __dirname,
  dirAsset:utils.HomePath()+"/cards/images",//obj.pathname + "/assets",
  dir:utils.HomePath()+"/cards/images",
  rootPath:utils.HomePath(),
  haveCard: false,
  mImgTemp: "",
  checkMod: 0
};
var output=[];
var encodeData = [];

/** Life Cycle  **/
devices.on("device-activated", event => {//เครื่องกำลังทำงาน
  const currentDevices = event.devices;
  let device = event.device;
  //console.log(`Device '${device}' activated, devices: ${currentDevices}`);
  for (let prop in currentDevices) {
    //console.log("Devices: " + currentDevices[prop]);//เช็คจำนวนเครื่อง
  }

  device.on("card-inserted", event => {//เสียบการ์ด
    obj.haveCard = true;
    obj.mImgTemp = "";
    obj.imgTem = "";
    obj.cmdIndex = 0;//ตำแหน่งที่จะอ่าน

    let card = event.card;

    card.on("command-issued", event => {
      //console.log(`Command '${event.command}' issued to '${event.card}' `);
    }); //command-issued
    card.on("response-received", event => {//รับข้อมูลเมื่อเราสั่งอ่านการ์ด
      //ShowCid(obj.cid);
      if (obj.inGetImage) {
        //console.log("read image " + obj.imgTemp);
        // readImageOneLine(card);
      } else {
        //console.log("no read image " + obj.imgTemp);
      }
    //   console.log(
    //     `Response '${event.response}' received from '${event.card}' in response to '${event.command}'`
    //   );
    }); //response-received

    card
      .issueCommand(
        new CommandApdu(
          new CommandApdu({
            bytes: [
              0x00,
              0xa4,
              0x04,
              0x00,
              0x08,
              0xa0,
              0x00,
              0x00,
              0x00,
              0x54,
              0x48,
              0x00,
              0x01
            ]
          })
        )
      )
      .then(response => {
        //console.log(response);
        ReadData(card);
      })
      .catch(error => {
        //console.error(error);
      });
  }); //card-inserted

  device.on("card-removed", event => {
    console.log(`Card removed from '${event.name}' `);
    ClearOutput();
    obj.ptlink = "";
    obj.fullname_th = "";
    obj.address_full = "";
    obj.birthday_full = "";
    obj.cid = "";
    obj.imgTemp='';
  }); //card-removed
}); //device-activated

devices.on("device-deactivated", event => {
//   console.log(
//     `Device '${event.device}' deactivated, devices: [${event.devices}]`
//   );
}); //device-deactivated

obj.mImgTemp = "";
obj.ptlink = "";

/** Controllers Read data*/
function ReadData(card) {
  card
    .issueCommand(
      new CommandApdu({ bytes: [0x80, 0xb0, 0x00, 0x04, 0x02, 0x00, 0x0d] })
    )
    .then(response => {
      //console.log(`readCid '${response.toString("hex")}`);
      card
        .issueCommand(
          new CommandApdu({ bytes: [0x00, 0xc0, 0x00, 0x00, 0x0d] })
        )
        .then(response => {
          response = response.slice(0, -2);
          obj.cid = response.toString();
          if (obj.cid == "") {
            ReadData(card); /**/
          } else {
            ShowCid(obj.cid);
            //console.log(`Response readCid ${obj.cid} : ${response}`);
            obj.ptlink = md5(obj.cid);
            //console.log(`Response ptlink ${obj.ptlink}`);
            ReadFullName(card); /**/
          }
          // cid = cidRes;

          //  readFullname(card);
        })
        .catch(error => {
          console.error(error);
        });
    })
    .catch(error => {
      console.error(error);
    });
} //ReadData
function ReadFullName(card) {
  card
    .issueCommand(
      new CommandApdu({ bytes: [0x80, 0xb0, 0x00, 0x11, 0x02, 0x00, 0xd1] })
    )
    .then(response => {
      card
        .issueCommand(
          new CommandApdu({ bytes: [0x00, 0xc0, 0x00, 0x00, 0xd1] })
        )
        .then(response => {
          //   var x=  iconv.convert(response); // returns "a va"
          var buffer = legacy.decode(response, "tis620");
          //console.log(`Response readFullname '${buffer}`);
          //$('#fullname').html(buffer);
          obj.mFullName = buffer.toString();
          //showFullname(mFullName);
          ShowFullName(obj.mFullName);
          ReadAddress(card);
        })
        .catch(error => {
          console.error(error);
        });
    })
    .catch(error => {
      console.error(error);
    });
} //ReadFullName
function ReadAddress(card) {
  card
    .issueCommand(
      new CommandApdu({ bytes: [0x80, 0xb0, 0x15, 0x79, 0x02, 0x00, 0x64] })
    )
    .then(response => {
      card
        .issueCommand(
          new CommandApdu({ bytes: [0x00, 0xc0, 0x00, 0x00, 0x64] })
        )
        .then(response => {
          var buffer = legacy.decode(response, "tis620");
          if (buffer == "") {
            ReadAddress(card);
          } else {
            ShowAddress(buffer);
            ReadImageOneLine(card);
          }
        })
        .catch(error => {
          console.error(error);
        });
    })
    .catch(error => {
      console.error(error);
    });
} //ReadAddress
function ReadImageOneLine(card) {
  let ccc = 252;
  let xwd;
  let xof = obj.cmdIndex * ccc + 379;
  if (obj.cmdIndex == 20) xwd = 38;
  else xwd = ccc;
  // console.log('tttt ' + xof);

  let sp2 = (xof >> 8) & 0xff;

  // console.log('tttt2 ' + (xof >> 8));

  let sp3 = xof & 0xff;
  let sp6 = xwd & 0xff;
  let spx = xwd & 0xff;
  let CMD1 = [0x80, 0xb0, sp2, sp3, 0x02, 0x00, sp6];
  let CMD2 = [0x00, 0xc0, 0x00, 0x00, sp6];

  card
    .issueCommand(new CommandApdu({ bytes: CMD1 }))
    .then(response => {
       
      card
        .issueCommand(new CommandApdu({ bytes: CMD2 }))
        .then(response => {
          
          obj.imgTemp += response.toString("base64").replace("kAA=", ""); //.slice(0,-2).toString('base64');
          obj.checkMod++;
          //  }

          if (obj.cmdIndex < 20) {
            if (obj.cmdIndex == 0) {
              if (!fs.existsSync(obj.dirAsset)) {
                fs.mkdirSync(obj.dirAsset);
              }
              if (!fs.existsSync(obj.dir)) {
                fs.mkdirSync(obj.dir);
              }
            }
            if (obj.cmdIndex > 2) {
              var tImg = "data:image/jpeg;base64," + obj.imgTemp;
              
              //$("#pImg").attr("src", tImg);
            }

            ++obj.cmdIndex;
            obj.inGetImage = true;
            ReadImageOneLine(card);
          } else {
            let mImgTemp = obj.imgTemp;

            obj.inGetImage = false;
            imgname="";
            var imgname = `${obj.dir}/${md5(output["cid"])}.jpg`;//obj.dir+"/"+btoa(output['cid'])+".jpg";
            fs.writeFile(imgname, mImgTemp, "base64", { mode: 777 }, function(
              err
            ) {
              imgname += "?timestamp=" + new Date().getTime();
              ShowImage(imgname);
            });
          }
        })
        .catch(error => {
          console.error(error);
        });
    })
    .catch(error => {
      console.error(error);
    });
} //ReadImageOneLine
//
//
//
//
//
//
/** Controller Show Data*/

function ShowCid(cid) {
  var str = cid; // 1-1005-01040-23-1
  var out = "";
  var res = str.split("");

  for (var i = 0; i <= res.length - 1; i++) {
    if (i == 0) {
      out += res[0] + "-";
    } else if (i == 4) {
      out += res[i] + "-";
    } else if (i == 9) {
      out += res[i] + "-";
    } else if (i == 11) {
      out += res[i] + "-";
    } else {
      out += res[i];
    }
  }
  output["cid"]=out;
  //console.log(out);
  //$("#cid").html(out);
} //ShowCid
function ShowFullName(fullname = "") {
  var name = fullname.split(" ");
  var outputs = "";
  outputs = name[0].replace("#", " ");
  outputs = outputs;
  outputs = outputs.replace("##", " ");
  obj.fullname_th = outputs; //เก็บค่า fullname th
  var en_name = fullname.substr(100, 100);
  en_name = en_name.replace("#", "");
  en_name = en_name;
  en_name = en_name.replace("##", " ");
  obj.fullname_en = en_name; // เก็บค่า fullname en
  output["fullname_th"]=obj.fullname_th;
  output["fullname_en"]=obj.fullname_en;

  //$("#fullname").html(fullname_th);
  ShowBirthday(fullname);
}
function ShowBirthday(birthday=''){
    var str = birthday;//"นาย#ณัฐพล##จันทร์ปาน Mr.#Natthaphon##Chanpan 253608071�";
    var res = str.length;
    var out = str.substr(res - 11, 9);
    var year = out.substr(0, 4);
    var month = out.substr(4, 2);
    var day = out.substr(6, 2);
    var birth = day + "/" + month + "/" + year;

    obj.birthday_full = birth;//เก็บค่า birthday
    output["birthday_full"] = obj.birthday_full;
    //$("#birthday").html(birthday_full);
}
function ShowAddress(address = "") {
    address = address.replace("#", " ");
    address = address;
    address = address.replace("####", " ");
    address = address;
    address = address.replace("#", " ");
    address = address;
    address = address.replace("#", " ");
    address = address.substr(0, address.length - 2);

    obj.address_full = address;//เก็บค่า address
    output["address_full"] = obj.address_full;
    //$("#address").html(address_full);
    

}
function ShowImage(mImgName){
   
    output["image"]=mImgName;
    var res = output["image"].split("/");
    res = res[3].split("?");
    $("#person-md5-imag").val(res[0]);
    ShowOutput(res[0]);
    
}
function ShowOutput(images=""){
  setTimeout(function(){
    $("#person-cid").html(output["cid"]);
    $("#person-birthday").html(output["birthday_full"]);
    $("#person-address").html(output["address_full"]);
    $("#person-fullname-th").html(output["fullname_th"]);
    $("#person-pImg").attr('src',output['image']);
    $("#person-pImg").hide();
    $("#person-pImg").fadeIn(1000);
    let knex = require("../sql/Knex.js");
    let data = {cid:output["cid"], fullname:output["fullname_th"],birthday:output["birthday_full"],address:output["address_full"],images:images};
 
    knex.ReadPromise("register",{cid:output["cid"]},10).then((res)=>{
      if(res.length == 0){
        knex.Create("register",data).then((res)=>{
          console.log("บันทึกข้อมูลเรียบร้อยแล้ว  ");
        }).catch(err=>console.log(err));
      }else{
        console.log("มีการลงทะเบียนแล้ว");
      }
    }).catch((err)=>console.log(err));
 
    
  });
}
function ClearOutput(){
  $("#person-pImg").hide();
  $("#person-cid").html("");
  $("#person-birthday").html("");
  $("#person-address").html("");
  $("#person-fullname-th").html("");
  $("#person-pImg").attr('src','./assets/images/nophoto.png');
  $("#person-md5-imag").val('');
  output=[];

  $("#person-pImg").fadeIn(3000);
  //console.log(output);
}