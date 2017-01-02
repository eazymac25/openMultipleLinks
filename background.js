


//chrome.extension.onMessage.addListener(linkRequest)
console.log('this is background');
function linkRequest(request, sender, response) {
	
	if (request.message === "openUrls"){
		
		if (request.urls.length ===0) {
			//alert(request.message.toString());
			console.log(request);
			return;
		}
		console.log(request);
		chrome.tabs.get(sender.tab.id, function(tab) {
			chrome.windows.getCurrent(function(window){
				var tab_index = tab.index + 1;

				var tabObj = {
					windowId: window.id,
					url:null,
					selected: false
				}

				for (var i = 0; i<request.urls.length; i++){

					tabObj.url = request.urls[i].url;
					chrome.tabs.create(tabObj, function(tab){

					});

				}
			});
		});
	}
}



chrome.runtime.onMessage.addListener(linkRequest)