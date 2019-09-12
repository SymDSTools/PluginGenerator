
app.LoadPlugin("%PLGNAME%");

function OnStart() {
    plg = app.Create%PLGNAME%();

    var lay = app.CreateLayout("Linear", "VCenter,FillXY");
    btn = app.CreateButton("GetVersion");
    btn.SetOnTouch(CallPlugin);
    lay.AddChild(btn);
    app.AddLayout(lay);
}

function CallPlugin() {
    alert(plg.GetVersion());
}
