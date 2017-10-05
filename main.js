const electron = require("electron");
const {app, BrowserWindow,ipcMain} = electron;

let mainWin="";
let child="";

app.on("ready", ()=>{
  CreateMainWindow();
});
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
    app.exit(); 
  }
  child = null; 
  mainWin=null;
  app.exit(); 
});
app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

exports.MainWindow = function(){
  CreateMainWindow();
}//mainWindow
exports.childWindow = function(data){
  CreateChildWindow(data); 
}//childWindow



function CreateMainWindow(){
  mainWin = new BrowserWindow({ 
    width:800, height:700,
    minWidth:800,
    minHeight: 800,
    maxHeight:800,
    maxWidth:800,
    frame: true,
    resizable: false
    //fullscreen: true
  });
  mainWin.loadURL(`file://${__dirname}/login.html`);
  mainWin.on('closed', function () { 
    mainWin = null;
    app.exit(); 
 });
	app.on('closed', function () { mainWin = null; app.exit() });
  //mainWin.toggleDevTools();
  //child.exit();
}
function CreateChildWindow(data){
  child = new BrowserWindow({ 
    width:1024, height:600,
    minWidth:1024, minHeight: 600,
    //parent: mainWin, 
    //modal: true,
    show: true
  });
   child.loadURL(`file://${__dirname}/index.html?token=${data}`);
   //child.toggleDevTools();
   child.on('closed', function () { 
      child = null;
      app.exit(); 
   });
   mainWin.exit();
}