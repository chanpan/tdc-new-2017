const util = require('../shared/utils/Utils.js');
const file = require("../shared/files/Files.js");
Init();
function CopyDefaultDataBase(){
    var target = util.HomePath()+"/cards/card.db";
    var src = "./assets/card_default.db";
     
    file.CopyFile(target,src).subscribe((res)=>{
        console.log(res);
    });
}

function Init(){
    file.CreateFolder("cards").subscribe((res)=>{
        CopyDefaultDataBase();
        require("../shared/cards/Card.js");
    });
}

