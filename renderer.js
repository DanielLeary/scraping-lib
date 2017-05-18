// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var actions = require('./actions.js');

//====================================================================
//                         Add action methods
//====================================================================

// Adds a function by taking its name, and whaterver arguments it is
// called with and calling remoteCall() with them

var addRemoteAction = function(func){
    //extend Promise proto as it's chained to returned promise
    Promise.prototype[func.name] = function(){
        var args = Array.prototype.slice.call(arguments);
        return this.remoteCall(func.name, args, true);
    }
}

var addRemoteDestructiveAction = function(func){
    //extend Promise proto as it's chained to returned promise
    Promise.prototype[func.name] = function(){
        var args = Array.prototype.slice.call(arguments);
        return this.remoteCall(func.name, args, false);
    }
}

var addLocalAction = function(func){
    Promise.prototype[func.name] = function(){
        var args = Array.prototype.slice.call(arguments);
        return this.then(function(){
            return func.apply(this, args);
        });
    }
}

var addCompoundAction = function(func){
    Promise.prototype[func.name] = function(){
        var args = Array.prototype.slice.call(arguments);
        return func.apply(this, args);
    }
}

var addAllActions= function(actionsObj, addFunc) {
    for (var action in actionsObj) {
        if (typeof actionsObj[action] == "function") {
            addFunc(actionsObj[action]);
        }
    }
}

addAllActions(actions.remote, addRemoteAction);
addAllActions(actions.remoteDestructive, addRemoteDestructiveAction);
addAllActions(actions.local, addLocalAction);
addAllActions(actions.compound, addCompoundAction);


//====================================================================
//                              Main
//====================================================================

const webview = document.getElementById('webview')

window.onload = function() {
    //click('[id="checkbox"]');
    console.log("Renderer loaded");

    webview.addEventListener('dom-ready', () => {
        webview.openDevTools()
    })

    bot.steps()
        .loadURL("https://www.google.co.uk/?gws_rd=ssl#q=wiki+germany")
        .logMessage("Now let's click the first result")
        .clickLink(".r > a")
        .logMessage('now lets go back')
        .goBack()
        .then(function(result){
            console.log(result);
            bot.continue()
                .logMessage('testing continued');
        })
        .catch(function(error){
            console.log("Catch block: "+error);
        });
};


//====================================================================
//                  RPC methods to talk to webview
//====================================================================

var bot = {
    //This kicks off the promise chain
    steps: function(){
        return new Promise(function(resolve, reject){
            //ensures webview is ready to receive events
            var replyHandler = function(event) {
                if (event.channel == "Status" && event.args == "Ready")
                    webview.removeEventListener('ipc-message', replyHandler);
                    resolve();
            };
            webview.addEventListener('ipc-message', replyHandler);
        })
    },
    continue: function(){
        return Promise.resolve();
    }
};

/*
can take any number of arguments, must start with funcName
Promise.remoteCall(funcNameAsString[, arg1[, arg2]]) */
Promise.prototype.remoteCall = function(funcName, args, hasReturn){
    var messageID = Math.floor(Math.random()*100000000000000000);

    /* The 'return' is so we have a new promise to chain more methods to
    afterwards. We could just call 'this.then()' and it would work, but we
    couldn't chain a second '.helloWorld' on after without returning promise
    from 'then' */
    return this.then(function(){
        return new Promise(function(resolve, reject) {

            //promise is resolved within eventListener
            addIpcListener(messageID, resolve, reject);
            logReplyID(messageID);

            //dispatch remote call to webview
            webview.send('rpc-function',funcName,args,messageID,hasReturn);
        });
    })
}

var addIpcListener = function(messageID, resolve, reject){
    var replyHandler = function(event){
        var wait = Math.floor(Math.random()*4000)+1000;
        //here we resolve the promise once the reply comes in
        if (event.channel == messageID) {
            webview.removeEventListener('ipc-message', replyHandler);
            if (event.args == "err"){
                reject(Error("func Err in webview"));
            }
            else {
                var returnedResult = JSON.parse(event.args);
                console.log("Returned: "+returnedResult);
                setTimeout(()=>{
                    //Waits to resolve promise with timer
                    resolve(returnedResult);
                },wait);
            }
        }
    };
    // this is what gets the response from the webview frame
    webview.addEventListener('ipc-message', replyHandler);
}

var logReplyID = function(messageID){
    var replyHandler = function(event){
        if (event.channel == messageID) {
            console.log("messageID received: ",messageID);
            webview.removeEventListener('ipc-message', replyHandler);
        }
    };
    webview.addEventListener('ipc-message', replyHandler);
}
