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

                
            	//wait until the "loading..." node has been hidden, 
            	//indicating that we have loaded content. 
                dojo.query(".lotusMeta")[4].textContent="This community can have members from outside your organization.";
				dojo.query(".lotusMeta")[4].style="color:#6eff00";



      } catch(e) {
          alert("Exception occurred in helloWorld: " + e);
      }
   });
}
