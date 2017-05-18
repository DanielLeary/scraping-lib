
var actions = require('./actions.js');

window.onload = function() {

    var {ipcRenderer} = require('electron');

    ipcRenderer.on('rpc-function', (event,funcName,args,messageID,hasReturn) => {
        // creates the function reference from string 'funcName'
        var fn;
        hasReturn ? fn = actions.remote[funcName] : fn = actions.remoteDestructive[funcName];
        //var wait = Math.floor(Math.random()*4000)+1000;

        if(typeof fn === 'function') {
            //calls function with arguments in 'args' array
            if (!hasReturn){
                ipcRenderer.sendToHost(messageID,JSON.stringify("Done destructive func"));
                fn.apply(this,args);
            }
            else {
                var result = fn.apply(this,args);
                var resultJSON = JSON.stringify(result);
                ipcRenderer.sendToHost(messageID,resultJSON);
            }

            /*
            setTimeout(()=>{
                //Waits to resolve promise with timer
                ipcRenderer.sendToHost(messageID,"done");
            },wait);
            */
        } else {
            console.log("Err: Received undefined function");
            ipcRenderer.sendToHost(messageID,"err");
        }
    })

    console.log(document.URL);

    // Should be last in onLoad
    ipcRenderer.sendToHost('Status',"Ready");
};
