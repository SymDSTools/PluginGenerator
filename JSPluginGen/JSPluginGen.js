
(function(){

var touch = true; //when false it disables the back button
var showAlert = true; //show initial alert info message
var appPath = app.GetAppPath(); //get public directory
var configPath = appPath + "/res/configPath.json"; //save configPath
var conf = {name: "", assets: "Html,Img,Snd", exec: false};
var _exit;

LoadConf();

if(conf.exec) {
    saveConf("exec", false);
    app.LoadScript(appPath + "/res/~PluginTest.js");
    return;
}

OnStart = function() { _OnStart(); };
OnBack = function() { _OnBack(); };

function _OnStart() {

    //show info message
    if(showAlert) app.Alert("This is just the plugin installer\n\nPlugin.js is your plugin file which you should edit.\n\nDocumentation.html contains the documentation of your plugin.\n\nYou will have to run this app to be sure all files are saved\n\nYou should only execute this app in DroidScript itself. It is not supposed to work as apk.\n\nHappy Coding!\n\nbest regards,\nSymbroson", "Information");

    //disable back key and lock orientation
    app.EnableBackKey(false);
    app.SetOrientation( app.GetOrientation() );

    //GUI
    layMain = app.CreateLayout("absolute");

    var scrLay = app.CreateScroller(1, 1);
    layMain.AddChild(scrLay);

    var lay = app.CreateLayout("Linear");
    scrLay.AddChild(lay);
    lay.SetSize(1, 1);

        var txtTitle = app.CreateText("<b>JavaScript Plugin<br>installer for DS</b>", -1, -1, "html,multiline");
        txtTitle.SetTextSize(30, "dip");
        txtTitle.SetMargins(0, .03);
        lay.AddChild(txtTitle);

        txtName = app.CreateText(conf.name, .8, -1, "center");
        txtName.SetTextSize(25, "dip");
        txtName.SetMargins(0, .05);
        lay.AddChild(txtName);

        var txtAssets = app.CreateText("<b>Additional ressources</b><br>comma separated list of files or folders which will be included to the plugin", .8, -1, "html,multiline,left");
        txtAssets.SetMargins(0, .035, 0, .02);
        txtAssets.SetTextSize(15, "dip");
        lay.AddChild(txtAssets);

        edtAssets = app.CreateTextEdit(conf.assets, .8, -1, "singleline");
        edtAssets.SetOnChange(edtAssets_OnChange);
        edtAssets.SetTextSize(17, "dip");
        edtAssets.name = "assets";
        lay.AddChild(edtAssets);

        var btnZip = app.CreateButton("Export Plugin Zip", .7);
        btnZip.SetOnTouch(btnZip_OnTouch);
        btnZip.SetMargins(0, .04);
        lay.AddChild(btnZip);

        var btnInstall = app.CreateButton("Install Plugin (instant)", .7);
        btnInstall.SetEnabled(appPath === "/sdcard/DroidScript/" + app.GetAppName());
        btnInstall.SetOnTouch(btnInstall_OnTouch);
        lay.AddChild(btnInstall);

        var btnUninstall = app.CreateButton("Uninstall Plugin", .7);
        btnUninstall.SetOnTouch(btnUninstall_OnTouch);
        lay.AddChild(btnUninstall);

        var btnTest = app.CreateButton("Test plugin ->", .7);
        btnTest.SetOnTouch(btnTest_OnTouch);
        lay.AddChild(btnTest);

        layTest = app.CreateLayout("absolute", "fillxy,VCenter");
        layTest.SetBackColor("#ee000000");
        layTest.SetVisibility("Hide");
        layTest.SetSize(1, 1);

            if(false && app.IsPremium()) { //use code edit
                edtCode = app.CreateCodeEdit("", 1, .9, "");
                edtCode.SetColorScheme("dark");
                edtCode.SetBackColor("#00000000");
                layTest.AddChild(edtCode);
            } else { //use horizontal scroller with text edit
                var scr = app.CreateScroller(1, .9);
                var layScr = app.CreateLayout("linear");
                layScr.SetSize(10, .9);
                edtCode = app.CreateTextEdit("", 10, .9, "monospace");
                layScr.AddChild(edtCode);
                scr.AddChild(layScr);
                layTest.AddChild(scr);
            }

            edtCode.SetOnChange(edtCode_OnChange);
            edtCode.SetTextSize(14, "dip");
            edtCode.name = "code";

            var btnBack = app.CreateButton("Back", .2);
            btnBack.SetOnTouch(btnBack_OnTouch);
            btnBack.SetPosition(.05, .9);
            layTest.AddChild(btnBack);

            var btnUndo = app.CreateButton("Undo", .2);
            btnUndo.SetOnTouch(edtCode.Undo);
            btnUndo.SetPosition(.275, .9);
            layTest.AddChild(btnUndo);

            var btnRedo = app.CreateButton("Redo", .2);
            btnRedo.SetOnTouch(edtCode.Redo);
            btnRedo.SetPosition(.5, .9);
            layTest.AddChild(btnRedo);

            var btnRun = app.CreateButton("Run", .2);
            btnRun.SetOnTouch(btnRun_OnTouch);
            btnRun.SetPosition(.725, .9);
            layTest.AddChild(btnRun);

        layMain.AddChild(layTest);

    app.AddLayout(layMain);

	if(!conf.name) {
	    do
			conf.name = prompt("How would you like your plugin to be called?", "");
		while(!conf.name || !conf.name.trim());

	    alert("Your plugin will be called '" + conf.name + "'.\n\nIf your ok with that" +
	        " press Ok.\nIf not, exit the app immediately.\n\nAfterwards you have to" +
	        " modify Plugin.js and Documentation.html file in order to change the name.");

	    saveConf("name", conf.name.trim());
	    txtName.SetText(conf.name);
		app.ReplaceInFile(appPath + "/Plugin.js", "%PLGNAME%", conf.name);
		app.ReplaceInFile(appPath + "/Documentation.html", "%PLGNAME%", conf.name);
		app.ReplaceInFile(appPath + "/res/PluginTest.js", "%PLGNAME%", conf.name);
	}

	edtCode.SetText(app.ReadFile(appPath + "/res/PluginTest.js"));
}

//Export plugin zip to public folder
function btnZip_OnTouch() {
    app.ShowProgress("Zipping");

    //get zip destination and delete file if it exists
    var path = appPath + "/" + conf.name + ".zip";
    if(app.FileExists(path)) app.DeleteFile(path);

    //zipping process
    var zip = app.CreateZipUtil();
    zip.Create(path);

    //add and rename Plugin.js and Documentation.html to <name>.inc and <name>.html
    zip.AddFile(appPath + "/" + conf.name + ".inc", appPath + "/Plugin.js");
    zip.AddFile(appPath + "/" + conf.name + ".html", appPath + "/Documentation.html");

    //append additional assets
    var lst = edtAssets.GetText().split(",");
    for(var i in lst) {
        var file = lst[i];
        if(!lst[i].startsWith("/")) file = appPath + "/" + file;
        if(app.FolderExists(file) || app.FileExists(file))
            AddToZip(zip, path, file);
    }

    zip.Close();

    app.HideProgress();
    app.ShowPopup("Zip created at " + path);
}

//add items to zip file
function AddToZip(zip, name, path) {
    if(app.IsFolder(path)) {
        var lst = app.ListFolder(path, "");
        for(var i = 0; i < list.length; i++) addToZip(zip, name + "/" + path, path + "/" + lst[i])
    } else zip.AddFile(name + "/" + path, path);
}

//instant install plugin
function btnInstall_OnTouch() {

    app.ShowProgress("Installing");

    //get name and define destination directories
    var privdir = app.GetPrivateFolder("Plugins");  // appPath + "/../Plugins";
    var paths = [privdir, appPath + "/../.edit/docs/plugins"];

    //copy plugin files to each destination
    paths.forEach( function(path) {
        //create lower-cased folder
        path += "/" + conf.name.toLowerCase() + "/";
        if(!app.FolderExists(conf.name)) app.MakeFolder(path);

        //copy and rename Plugin.js and Documentation.html to <name>.inc and <name>.html
        app.CopyFile(appPath + "/Plugin.js", path + conf.name + ".inc");
        app.CopyFile(appPath + "/Documentation.html", path + conf.name + ".html");

        //copy additional assets
        var lst = edtAssets.GetText().split(",");
        for(var i in lst) {
            if(app.FolderExists(lst[i])) app.CopyFolder(lst[i], path + lst[i], true);
            else if(app.FileExists(lst[i])) {
                var fld = path + lst[i];
                fld = fld.slice(0, fld.lastIndexOf("/"));
                if(!app.FolderExists(fld)) app.MakeFolder(fld);
                app.CopyFile(lst[i], path + lst[i]);
            }
        }
    } );

    app.HideProgress();
    app.ShowPopup("Plugin '" + conf.name + "' installed!");
}

//instant uninslall
function btnUninstall_OnTouch() {
    app.ShowProgress("Uninstalling");

    //delete private dir
    var path = app.GetPrivateFolder("Plugins") + "/" + conf.name.toLowerCase();
    if(app.FolderExists(path)) app.DeleteFolder(path);

    //delete public dir
    path = appPath + "/../.edit/docs/plugins/" + conf.name.toLowerCase();
    if(app.FolderExists(path)) app.DeleteFolder(path);

    app.HideProgress();
    app.ShowPopup("Plugin '" + conf.name + "' deistalled!\nRestart DroidScript to see the effect");
}

//show test area
function btnTest_OnTouch() {
    layMain.SetTouchable(touch = false);
    layTest.Animate("SlideFromRight", function() { layMain.SetTouchable(touch = true); });
}

//hide test area
function btnBack_OnTouch() {
    layMain.SetTouchable(touch = false);
    layTest.Animate("SlideToRight", function() { layMain.SetTouchable(touch = true); });
}

//run code from text area
function btnRun_OnTouch() {
    //execute test code
	var code = edtCode.GetText();
    app.WriteFile(appPath + "/res/PluginTest.js", code);
    app.WriteFile(appPath + "/res/~PluginTest.js", code.replace(/%PLGNAME%/g, conf.name));
    if(app.IsAPK()) app.StartApp(appPath + "/res/~PluginTest.js");
    else {
        saveConf("exec", true);
        app.SetAlarm("Set", 2542, null, Date.now()+1000);
        app.Exit();
    }
}

//save test code
function edtCode_OnChange() {
    if(edtCode.tmt) clearTimeout(edtCode.tmt);
    edtCode.tmt = setTimeout( function() {
        app.WriteFile(appPath + "/PluginTest.js", edtCode.GetText().replace(/\xa0/g, " "));
        edtCode.tmt = false;
    }, 5000 );
}

//onchange-save method for text edits
//saves data after one second no input
function edtAssets_OnChange() {
    var obj = this;
    if(obj.tmt) clearTimeout(obj.tmt);
    obj.tmt = setTimeout( function() {
        saveConf("assets", obj.GetText());
        obj.tmt = false;
    }, 1000 );
}

//save text across multiple starts
function saveConf(key, val) {
    if(key) conf[key] = val;
    app.WriteFile(configPath, JSON.stringify(conf));
}

function LoadConf() {
	try {
		obj = JSON.parse(app.ReadFile(configPath) || "{}");
	} catch(e){
		app.ShowPopup("corrupt config file. Resetting.");
	}
	for(var i in obj) conf[i] = obj[i];
	saveConf();
}

//handle back-key event
function _OnBack() {
    if(!touch) return; //back key locked

    //hide test area if visible
    if(layTest.IsVisible()) return btnBack_OnTouch();

    //exit app after second press
    if(_exit) app.Exit();
    else app.ShowPopup("press back again to exit");

    //set timeout to exit app
    _exit = true;
    setTimeout("_exit=false", 2000);
}

})();
