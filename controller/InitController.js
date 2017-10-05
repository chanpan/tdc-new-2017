const util = require('../shared/utils/Utils.js');
const file = require("../shared/files/Files.js");
Init();
function CopyDefaultDataBase(){
    var target = util.HomePath()+"/tdc/tdc.db";
    var src = "./assets/tdc_default.db";
     
    file.CopyFile(target,src).subscribe((res)=>{
        console.log(res);
    });
}

function Init(){
    file.CreateFolder("tdc").subscribe((res)=>{
        CopyDefaultDataBase();
    });
}

