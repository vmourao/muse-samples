// ==UserScript==
// @copyright    Copyright IBM Corp. 2016
// @copyright    IBM Confidential
// @copyright    The source code for this program is not published or otherwise divested of its trade secrets, irrespective of what has been deposited with the U.S. Copyright Office.
//
// Non-Disclosure Agreement
// Sharing of this functionality outside of this meeting is prohibited. The content of this prototype is meant to be shared only with IBM Employees or parties
// under NDA with IBM. IBM’s statements regarding its plans, directions, and intent are subject to change or withdrawal without notice at IBM’s sole discretion.
// Information regarding potential future products is intended to outline our general product direction and it should not be relied on in making a purchasing decision.
// The information mentioned regarding potential future products is not a commitment, promise, or legal obligation to deliver any material, code or functionality. 
// Information about potential future products may not be incorporated into any contract. The development, release, and timing of any future features or functionality 
// described for our products remains at our sole discretion. Performance is based on measurements and projections using standard IBM benchmarks in a controlled environment.
// The actual throughput or performance that any user will experience will vary depending upon many factors, including considerations such as the amount of multiprogramming 
// in the user’s job stream, the I/O configuration, the storage configuration, and the workload processed. Therefore, no assurance can be given that an individual
// user will achieve results similar to those stated here.
//
// @name         commNavHamburger
// @version      1.14
// @description  *** PROTOTYPE CODE *** changes a community's toc nav into a hamburger style menu
//
// @namespace  http://ibm.com
//
// @author       Tony Estrada
//
// @include      *://*connections*.ibm.com/communities/service/*
// @include      *://*connections*.ibm.com/blogs/*
// @include      *://*connections*.ibm.com/activities/*
// @include      *://*connections*.ibm.com/forums/*
// @include      *://*connections*.ibm.com/wikis/*
//
// @include      *://apps.*.collabserv.com/communities/service/*
// @include      *://apps.*.collabserv.com/blogs/*
// @include      *://apps.*.collabserv.com/activities/*
// @include      *://apps.*.collabserv.com/forums/*
// @include      *://apps.*.collabserv.com/wikis/*
//
// @include      *://w3alpha*.toronto.ca.ibm.com/*
//
// @exclude
//
// @run-at       document-end
//
// ==/UserScript==

if(typeof(dojo) != "undefined") {
   require(["dojo/domReady!"], function(){
       
     try {
         //---------------------------------------------
         // HELPER FUNCTIONS
         var waitFor = function(callback, elXpath, maxInter, waitTime) {
            if(!maxInter) var maxInter = 100;  // number of intervals before expiring
            if(!waitTime) var waitTime = 10;  // 1000=1 second
            if(!elXpath) return;
            
            var waitInter = 0;  // current interval
            var intId = setInterval( function(){
               if (++waitInter<maxInter && !dojo.query(elXpath).length) return;
               clearInterval(intId);
               callback();
            }, waitTime);
         };
         
          waitFor(
              function(){
                  try {
											if( !ic_comm_communityUuid || ic_comm_communityUuid == "") return;

                      var menu = dojo.query(".lotusMenu")[0];
                      if(!menu) return;
                      
                      var titleBar = dojo.query(".lotusPlaceBar .lotusRightCorner .lotusInner")[0];
                      if(!titleBar) return;
                      
                      var menuTopHiddenInt = -3000;
                      var menuTopHidden = menuTopHiddenInt.toString()+"px";
                      var menuTopShown = "0px";
                      var initialShowDelay = 1500;
					  
					  
					  var webresources = lconn.core.config.services.webresources.url;
					  var webresourcesRoot = webresources.substring(webresources.indexOf(".com/")+4);
					  
                      var hamburgerImgUrl = webresourcesRoot + "/web/com.ibm.social.gen4.theme/sprite/sprite16.png";
                      
                      var hideHamburgerMenu = function() { dojo.style("hamburgerMenu", "top", "-3000px"); };
                      var showHamburgerMenu = function() { dojo.style("hamburgerMenu", "top", "0px"); };
                      var toggleHamburgerMenu = function() { if(dojo.style('hamburgerMenu','top') <= -3000) showHamburgerMenu(); else hideHamburgerMenu(); };

                      dojo.attr( menu, "id", "hamburgerMenu");

                      dojo.place(
                          "<style>"+
                          "#hamburgerMenu { transition: top .5s; transition-timing-function: ease-in-out; overflow:hidden; }"+
                          "#hamburgerMenu { position:absolute; top:"+menuTopShown+"; left:0px; width:250px; z-index:2; padding-top:10px; background-color:rgb(29, 29, 29); opacity:0.95;}"+
                          //"#hamburgerMenu.hover { top:"+menuTopShown+"; }"+
                          "</style>", 
                          dojo.doc.getElementsByTagName("head")[0], "last"); 
                      
                      dojo.place( 
                          '<div'+
                          	' id="hamburger"'+
                          	' style="position:relative; top:3px; left:0px; float:left; z-index:3; width:16px; height:21px; background-image:url('+hamburgerImgUrl+'); background-position: -654px 0;background-repeat: no-repeat;"'+
                          '>'+
                          '</div>',
                          titleBar, "first");
                      
                      var h = dojo.byId("hamburger");
                      dojo.connect( h, "onclick", toggleHamburgerMenu);
                      dojo.connect( h, "onmouseenter", showHamburgerMenu);
                      var hideHMtimeout = null;
                      dojo.connect( h, "onmouseleave", function(){ hideHMtimeout = setTimeout( function(){ hideHamburgerMenu(); }, 500); });
                      
                      var hm = dojo.byId("hamburgerMenu");
                      dojo.connect( hm, "onmouseleave", hideHamburgerMenu);
                      dojo.connect( hm, "onmouseenter", function(){ if(hideHMtimeout) clearTimeout(hideHMtimeout); showHamburgerMenu(); });

                      //dojo.style("lotusMain", { "overflow-y": "visible","overflow-x": "inherit" }); // make sure the menu's vertical overflow is not hidden 
                      dojo.style(dojo.query(".lotusMain")[0], { "min-height": "1000px" }); // make sure the menu's vertical overflow is not hidden 
                      
                      // some decoration tweaks
                      dojo.destroy(dojo.query(".lotusMenu #"+ic_comm_communityUuid+"_twisty")[0]); // remove twisty
                      dojo.query(".lotusMenu table").style("width","225px"); // more room for title
                      
                      // connect the menu hider to all TOC items so that it hides immediately on click as some of the options fire off a xhr request without reloading a page
                      dojo.query("#hamburgerMenu li").connect("onclick", function(){ 
                          setTimeout( function(){ hideHamburgerMenu(); }, 500); // hide briefly after clicking it
                      });
                      
                      setTimeout( function(){ hideHamburgerMenu(); }, initialShowDelay);  // hide menu after initial show 

                  } catch(ex) {
                      alert("comm card hamburger error: "+ex);
                  }
                  
              }, "#"+ic_comm_communityUuid+"_twisty");

      } catch(ex) {
          alert("comm card hamburger error: MAIN: "+ex);
      }
      
   });
}
