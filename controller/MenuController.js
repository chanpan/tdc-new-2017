const remote = require("electron").remote;
const main = remote.require('./main.js');
var window = remote.getCurrentWindow();
var Model=require("../model/Model.js");
var knexSqlite=require("../shared/sql/Knex.js");
var route = require("../shared/route/Route.js");
$(".btnLogout").click(function(){
    window.hide();
    main.MainWindow();
});
$("ul.menu-ul li a").click(function(){
    let url = $(this).attr('data-url');
    route.Router("#root-body-page",url);
});

