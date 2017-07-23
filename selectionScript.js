
var allLinks = document.getElementsByTagName("a");
var allStyles = [];
var linksToOpen = [];

for (var x = 0; x<allLinks.length; x++){
	allStyles.push(allLinks[x].style.cssText);
}

window.onload = function(){
	selectBox = document.createElement("DIV");
	selectBox.id = "selection";
	selectBox.style.cssText = "display: none; position: absolute; border: 1px dashed #000000; background: transparent; width: 0; height: 0;";
	console.log('window ready');
	document.documentElement.appendChild(selectBox);
}

document.onmousedown = function(e) {
	e = e || window.event;
	var b = e.which || e.button;
	if (e.shiftKey){
		if (("buttons" in e && e.buttons==1) || b == 1){
			if(document.getElementById("selection")){
				mouseDown(e);
			}
			else {
				console.log('document is not ready');
			}
		}
	}
};

function getCursorCoord(e){
	/* correctly get the cursor location 
	for IE or other browser
	*/
	if (e) {
		if (e.pageX || e.pageX == 0){
			return new coord(e.pageX,e.pageY);
		}
		var dE = document.documentElement || {};
		var dB = document.body || {};

		if ((e.clientX || e.clientX == 0) && ((dB.scrollLeft || dB.scrollLeft == 0) || (dE.clientLeft || dE.clientLeft == 0))) {
			return new coord(e.clientX + (dE.scrollLeft || dB.scrollLeft || 0) - (dE.clientLeft || 0),
						e.clientY + (dE.scrollTop || dB.scrollTop || 0) - (dE.clientTop || 0));
		} 
	}
	return null;
}

function mouseDown(e){
	/* get initial cursor location
	keep getting new location
	edit div based on two locations
	highlight selected text
	*/
	e = e || window.event; // for IE compatability window.event
	//pauseEvent(e);

	document.body.style.MozUserSelect = "none";


	var selectBox = document.getElementById('selection');
	selectBox.firstCoord = getCursorCoord(e);

	selectBox.style.left = selectBox.firstCoord.x + "px";
	selectBox.style.top = selectBox.firstCoord.y + "px";
	selectBox.style.display = "block";

	clearEventBubble(e);

	document.onmousemove = mouseMove;
	document.onmouseup = mouseUp;
	//var selectBox = document.createElement("DIV");

}

function mouseMove(e) {
	var movedCoord = getCursorCoord(e);
	var box = document.getElementById('selection');

	//console.log(box.firstCoord.x);
    if(movedCoord.x-box.firstCoord.x<0){
		box.style.left = movedCoord.x+"px";
	}
    if(movedCoord.y-box.firstCoord.y<0){
  		box.style.top = movedCoord.y+"px";
	}

	box.style.width = Math.abs(movedCoord.x-box.firstCoord.x)+"px";
	box.style.height = Math.abs(movedCoord.y-box.firstCoord.y)+"px";

	var minCoor = new coord(Math.min(movedCoord.x,box.firstCoord.x),Math.min(movedCoord.y,box.firstCoord.y));
	var maxCoor = new coord(Math.max(movedCoord.x,box.firstCoord.x),Math.max(movedCoord.y,box.firstCoord.y));

	linksToOpen = overlap(allLinks,minCoor,maxCoor);

	clearEventBubble(e);

}

function mouseUp(e){
	/* undraw box
	parse all tags
	open all links in new tabs
	*/
	var box = document.getElementById("selection");
	box.firstCoord = null;
	box.style.display = "none";
	box.style.width = "0";
	box.style.height = "0";
	console.log(linksToOpen);
	for (var i = 0; i<allLinks.length; i++){
		if (allLinks[i].isHighlighted){
			allLinks[i].style.cssText = allStyles[i];
		}
	}
	console.log('hello');
	if (linksToOpen.length >0 || true){
		console.log('messageSend');
		for (var i=0; i<linksToOpen.length; i++){
			console.log(linksToOpen[i]);
		}
		
		chrome.runtime.sendMessage({
			message: 'openUrls',
			urls: linksToOpen
		}, function(response){
			//console.log(response);
		});
	}

	document.onmousemove = function(){};
	document.onmouseup = function(){};

}

function overlap(allLinks,minCoor,maxCoor){

	var getLinks = [];

	for (var i = 0; i<allLinks.length; i++){
		//allLinks[i].style.border = "thin solid red";
		var bb = allLinks[i].getBoundingClientRect();
		// check if x overlaps
		bb.top = bb.top + pageYOffset;
		bb.left = bb.left + pageXOffset;

		var topLeft = new coord(bb.left, bb.top);
		var botRight = new coord(bb.right,bb.bottom);

		var xBool = true;
		var yBool = true;


		if (topLeft.x > maxCoor.x){
			xBool = false;
		} 
		if (botRight.x < minCoor.x){
			xBool = false;
		}
		if (topLeft.y > maxCoor.y){
			yBool = false;
		}
		if (botRight.y < minCoor.y){
			yBool = false;
		}

		if (xBool && yBool){
			allLinks[i].style.cssText += "border: thin solid red;";
			getLinks.push({url:allLinks[i].href,title:allLinks[i].innerHTML});
			// getLinks.push(allLinks[i].href)
			allLinks[i].isHighlighted = true;
		} else {
			allLinks[i].style.cssText = allStyles[i]
			allLinks[i].isHighlighted = false;
		}
	}

	return getLinks.unique();
}

function isValidLink(link) {
	return false;
}

function getTags(e,html){
	return null;

}

function openLinks(e){
	return null;
}

function coord(x,y){
	this.x = x;
	this.y = y;
	this.showCoord = showCoord;

	function showCoord(){
		return "x:" + parseInt(this.x) + " , y:" + parseInt(this.y);
	}
}


function clearEventBubble(evt) {  
    if (evt.stopPropagation)  
        evt.stopPropagation();  
    else  
        evt.cancelBubble = true;  
    if (evt.preventDefault)  
        evt.preventDefault();  
    else  
        evt.returnValue = false;  
}  

function pauseEvent(e){
    if(e.stopPropagation) e.stopPropagation();
    if(e.preventDefault) e.preventDefault();
    e.cancelBubble=true;
    e.returnValue=false;
    return false;
}

Array.prototype.unique = function() {
	var a = [];
	for (var i = 0; i<this.length; i++){
		if (!a.contains(this[i])){
			a.push(this[i]);
		}
	}
	return a;
}

Array.prototype.contains = function(v) {
	for (var i = 0; i< this.length; i++){
		if (this[i] === v){
			return true;
		}
	}
	return false;
}

// function selectBox(idName){
// 	this.box = document.createElement("DIV");
// 	this.setStyle = setStyle;
// 	this.box.id = idName;

// 	function setStyle(){
// 		this.box.style.cssText = "display: none; position: absolute; border: 1px dashed #000000; background: transparent; width: 0; height: 0;";
// 	}
// }