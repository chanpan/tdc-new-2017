const remote = require("electron").remote;
const main = remote.require('./main.js');
var window = remote.getCurrentWindow();
$(".btnLogout").click(function(){
    window.hide();
    main.MainWindow();
});