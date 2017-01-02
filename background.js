


chrome.extension.onMessage.addListener(linkRequest)

function linkRequest(request, sender, callback) {
	if (request.message == "openUrls"){
		if (request.urls ===0) {
			return;
		}
		chrome.tabs.get(sender.tab.id, function(tab) {
			chrome.window.getCurrent(function(window){
				var tab_index = tab.index + 1;

				var tabObj = {
					windowId: window.id,
					url:null,
					selected: false
				}

				for (var i = 0; i<request.urls.length; i++){

					tabObj.url = request.urls[i];
					chrome.tabs.create(tabObj, function(tab){

					});

				}
			});
		});
	}
}