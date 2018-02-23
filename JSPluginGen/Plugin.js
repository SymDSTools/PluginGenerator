
//returns new plugin instance
app.CreateMyJSPlugin = function() {
    return new _MyJSPlugin();
}

//should contain EVERY function
//it is recommended to don't place other functions outside this class
//and also don't define public variables to prevent difficulties 
//when the user already uses them (so they won't be overridden)
function _MyJSPlugin() {
    this.GetVersion = function() { return "1.00" };
}