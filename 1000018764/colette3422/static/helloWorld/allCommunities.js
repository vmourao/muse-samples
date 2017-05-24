// ==UserScript==
// @copyright    Copyright IBM Corp. 2017
//
// @name         helloWorld
// @version      0.1
// @description  *** PROTOTYPE CODE *** demonstrates simple hello world script to customize the Home Page
//
// @namespace  http://ibm.com
//
// @author       Hello World (aka You!)
//
// @include      *://apps.collabservintegration.com/homepage/*
//
// @exclude
//
// @run-at       document-end
//
// ==/UserScript==

if(typeof(dojo) != "undefined") {
	require(["dojo/domReady!"], function(){
        try {
            // utility function to let us wait for a specific element of the page to load...
		var waitFor = function(callback, elXpath, maxInter, waitTime) {
        if(!maxInter) var maxInter = 20;  // number of intervals before expiring
        if(!waitTime) var waitTime = 100;  // 1000=1 second
        if(!elXpath) return;
        
        var waitInter = 0;  // current interval
        var intId = setInterval(function(){
			console.log(!dojo.query(elXpath).length +" "+ waitInter + maxInter);
            if (++waitInter<maxInter && !dojo.query(elXpath).length) return;
            clearInterval(intId);
            callback();
        }, waitTime);
		};

            // here we use waitFor to wait on the .lotusStreamTopLoading div.loaderMain.lotusHidden element
            // before we proceed to customize the page...
            waitFor( function(){
                
            	//wait until the "loading..." node has been hidden, 
            	//indicating that we have loaded content
                //dojo.query(".lotusMeta")[2].textContent="This community can have members from outside your organization.";
				dojo.query(".lotusMeta")[2].style="color:#6eff00";

            }, "div[class='lotusMeta']");

      } catch(e) {
          alert("Exception occurred in helloWorld: " + e);
      }
   });
}
