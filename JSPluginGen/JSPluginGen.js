
var touch = true; //when false it disables the back button
var showAlert = true; //show initial alert info message
var appPath = app.GetAppPath(); //get public directory

function OnStart() {
    
    //show info message
    if(showAlert) app.Alert("This is just the plugin installer\n\nPlugin.js is your plugin file which you should edit\n\nDocumentation.html contains the documentation of your plugin\n\nYou will have to run this app to be sure all files are saved\n\nYou should only execute this app in DroidScript itself. It is not supposed to work as apk.\nMaybe this will be added in the future.\n\nWhen running your test code inside this app pressing the back key will also cause this app to exit. You should rather create your own plugin test project ;)\n\nHappy Coding!\n\nbest regards,\nSymbroson", "Information");
    
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
        
        var txtName = app.CreateText("<b>Plugin name:</b><br>Deinstall your plugin before renaming it! Renaming will cause the replacement of the previous name in Documentation.html and Plugin.js with the new one", .8, -1, "html,multiline,left");
        txtName.SetMargins(0, .03, 0, .02);
        txtName.SetTextSize(15, "dip");
        lay.AddChild(txtName);
        
        var temp = LoadText("name", "MyJSPlugin");
        edtName = app.CreateTextEdit(temp, .8, -1, "singleline,center");
        edtName.SetOnChange(edtName_OnChange);
        edtName.SetTextSize(17, "dip");
        edtName.name = "name";
        edtName.prev = temp;
        lay.AddChild(edtName);
        
        var txtAssets = app.CreateText("<b>Additional ressources</b><br>comma separated list of files or folders which will be included to the plugin", .8, -1, "html,multiline,left");
        txtAssets.SetMargins(0, .035, 0, .02);
        txtAssets.SetTextSize(15, "dip");
        lay.AddChild(txtAssets);
        
        edtAssets = app.CreateTextEdit(LoadText("assets", "Html,Img,Snd"), .8, -1, "singleline");
        edtAssets.SetOnChange(_edt_OnChange);
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
            
            //default code value
            var code = LoadText("code", false) || (
                'app.LoadPlugin("%s");\n\nfunction OnStart() {\n\n' + 
                '    plg = app.Create%s();\n\n' +
                '    var lay = app.CreateLayout("Linear", "VCenter,FillXY");\n' +
                '    btn = app.CreateButton("GetVersion");\n' +
                '    btn.SetOnTouch(CallPlugin);\n    lay.AddChild(btn);\n'+
                '    app.AddLayout(lay);\n}\n\nfunction CallPlugin() {\n'+
                '    alert(plg.GetVersion());\n}').replace(/\%s/g, edtName.GetText());
            
            if(app.IsPremium()) { //use code edit
                edtCode = app.CreateCodeEdit("", 1, .9, "");
                edtCode.SetText(code);
                edtCode.SetColorScheme("dark");
                edtCode.SetBackColor("#00000000");
                layTest.AddChild(edtCode);
            } else { //use horizontal scroller with text edit
                var scr = app.CreateScroller(1, .9);
                var layScr = app.CreateLayout("linear");
                layScr.SetSize(10, .9);
                edtCode = app.CreateTextEdit(code, 10, .9, "monospace");
                layScr.AddChild(edtCode);
                scr.AddChild(layScr);
                layTest.AddChild(scr);
            }
            
            edtCode.SetOnChange(_edt_OnChange);
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
}

//Export plugin zip to public folder
function btnZip_OnTouch() {
    app.ShowProgress("Zipping");
    
    //get zip destination and delete file if it exists
    var name = edtName.GetText();
    var path = appPath + "/" + name + ".zip";
    if(app.FileExists(path)) app.DeleteFile(path);

    //zipping process
    var zip = app.CreateZipUtil();
    zip.Create(path);
    
    //add and rename Plugin.js and Documentation.html to <name>.inc and <name>.html
    zip.AddFile(appPath + "/" + name + ".inc", appPath + "/Plugin.js");
    zip.AddFile(appPath + "/" + name + ".html", appPath + "/Documentation.html");
    
    //append additional assets
    var lst = edtAssets.GetText().split(",");
    for(var i in lst) {
        var file = lst[i].trim();
        if(file) {
            if(!lst[i].startsWith("/")) file = appPath + "/" + file;
            if(app.FolderExists(file) || app.FileExists(file))
                AddToZip(zip, path, file);
        }
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
    var name = edtName.GetText();
    var privdir = app.GetPrivateFolder("Plugins");
    var paths = [privdir, appPath + "/../.edit/docs/plugins"];
    
    //copy plugin files to each destination
    paths.forEach( function(path) {
        //create lower-cased folder
        path +=  "/" + name.toLowerCase() + "/";
        if(!app.FolderExists(name)) app.MakeFolder(path);
        
        //copy and rename Plugin.js and Documentation.html to <name>.inc and <name>.html
        app.CopyFile(appPath + "/Plugin.js", path + name + ".inc");
        app.CopyFile(appPath + "/Documentation.html", path + name + ".html");
        
        //copy additional assets
        var lst = edtAssets.GetText().split(",");
        for(var i in lst)
            if(lst[i] = lst[i].trim()) {
                if(app.FolderExists(lst[i])) app.CopyFolder(lst[i], path, true);
                else if(app.FileExists(lst[i])) app.CopyFile(lst[i], path);
            }
    } );
    
    app.HideProgress();
    app.ShowPopup("Plugin '" + name + "' installed!");
}

//instant uninslall
function btnUninstall_OnTouch() {
    app.ShowProgress("Uninstalling");
    
    var name = edtName.GetText();
    
    //delete private dir
    var path = app.GetPrivateFolder("Plugins") + "/" + name.toLowerCase();
    if(app.FolderExists(path)) app.DeleteFolder(path);
    
    //delete public dir
    path = appPath + "/../.edit/docs/plugins/" + name.toLowerCase();
    if(app.FolderExists(path)) app.DeleteFolder(path);
    
    app.HideProgress();
    app.ShowPopup("Plugin '" + name + "' deistalled!\nRestart DroidScript to see the effect");
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
    //get non-existant file path
    var i = 0, path = appPath + "/_test";
    while(app.FileExists(path + i.toString() + ".js")) i++;
    path = path + i.toString() + ".js";
    
    //save code to file and execute it
    app.WriteFile(path, edtCode.GetText());
    app.StartApp(path);
    
    //delete file soon
    setTimeout(function() { app.DeleteFile(path); }, 1000);
}

//apply name changes on template files
function edtName_OnChange() {
    if(edtName.tmt) clearTimeout(edtName.tmt);
    edtName.tmt = setTimeout( function() {
        //replace &nbsp; with normal space
        var cur = edtName.GetText().replace(/\u00A0/gim, " ");
        
        //save changed name
        SaveText(edtName.name, cur);
        edtName.tmt = false;
        edtName.prev = cur;
    }, 1000 );
}

//onchange-save method for text edits
//saves data after one second no input
function _edt_OnChange() {
    var obj = this;
    if(obj.tmt) clearTimeout(obj.tmt);
    obj.tmt = setTimeout( function() {
        SaveText(obj.name, obj.GetText().replace(/\u00A0/gim));
        obj.tmt = false;
    }, 1000 );
}

//save text across multiple starts
var defaults = appPath + "/defaults.json"; //save defaults
function SaveText(key, txt) {
    var obj = (app.FileExists(defaults)? app.ReadFile(defaults) : false) || "{}";
    try { obj = JSON.parse(obj); }
    catch(e) { obj = {} }
    obj[key] = txt;
    app.WriteFile(defaults, JSON.stringify(obj));
}

//load stored text
function LoadText(key, dflt) {
    var obj = (app.FileExists(defaults)? app.ReadFile(defaults) : false) || "{}";
    try { obj = JSON.parse(obj); }
    catch(e) { obj = {}; }
    if(obj[key] != null) return obj[key];
    else return dflt;
}

var _exit;
//handle back-key event
function OnBack() {
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
