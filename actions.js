
module.exports = {
	/*
	Remote actions that have a return statement.
	WARNING: do NOT add remote actions that destroy the current document, for
	example clicking a link that navigates to a new page, reloading the page,
	going back or forward - add these to 'remoteDestructive' Object instead.
	*/
	remote: {
		logMessage: function(message) {
		    console.log("Received message:",message);
			return "Message logged successfully";
		},

		typeText: function(selector, text) {
			//this chooses the first match to selector
			//change to querySelectorAll() for match array
			document.querySelector(selector).value = text;
			return "Text typed successfully";
		},


	},
	/*
	Remote actions that destroy the current document for example
	clicking a link that navigates to a new page, reloading the page, going
	back or forward.
	*/
	remoteDestructive: {
		//click first element matching selector
		click: function(selector) {
		    // Means nothing has focus
		    document.activeElement.blur();

			//this chooses the first match to selector
			//change to querySelectorAll() for match array
		    var element = document.querySelector(selector);
		    if (!element) {
		        throw new Error('Unable to find element by selector: ' + selector);
		    }
		    var event = new MouseEvent("click");
		    element.dispatchEvent(event);
		},
	},

	local: {
		goBack: function(){
			webview.goBack();
			return pageFinishedLoading();
		},

		loadURL: function(url){
			webview.loadURL(url);
			return pageFinishedLoading();
		},

		finLoading: function(){
			return pageFinishedLoading();
		}
	},

	compound: {
		// Clicks the first link that matches selector
		// Resolves promise once the page finishes loading
		clickLink: function(selector){
			return this.click(selector)
			.finLoading()
		}
	},


}

var waitRandom = function(){
	return Math.floor(Math.random()*4000)+1000;
}

var pageFinishedLoading = function(){
	var wait = waitRandom();

	return new Promise(function(resolve,reject){
		webview.addEventListener('did-finish-load', loadstop);
		function loadstop(){
			webview.removeEventListener('did-finish-load', loadstop);
			setTimeout(()=>{
				//Waits to resolve promise with timer
				resolve('Webview finished loading');
			},wait);
		}
		// in case it already finished loading when we added did-finish-load listener
		if (!webview.isLoading()){
			webview.removeEventListener('did-finish-load', loadstop);
			setTimeout(()=>{
				//Waits to resolve promise with timer
				resolve('Webview finished loading');
			},wait);
		}
	})
}
