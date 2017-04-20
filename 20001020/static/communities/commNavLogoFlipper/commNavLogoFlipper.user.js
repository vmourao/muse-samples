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
// @name         commNavLogoFlipper
// @version      0.6
// @description  *** PROTOTYPE CODE *** flips a communities logo on mouseover to expose additional info
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
            if(!maxInter) var maxInter = 50;  // number of intervals before expiring
            if(!waitTime) var waitTime = 100;  // 1000=1 second
            if(!elXpath) return;
            
            var waitInter = 0;  // current interval
            var intId = setInterval( function(){
               if (++waitInter<maxInter && !dojo.query(elXpath).length) return;
               clearInterval(intId);
               callback();
            }, waitTime);
         };
         
          //--------------------------------------------
          // CARD FLIPPER
          waitFor(
              function(){
                  try {
                      if( dojo.byId("communityLogo")) dojo.style( dojo.byId("communityLogo"), { "border-radius":".5em" }); // round corners
                      if( !dojo.byId("communityLogo")) return;
                      
                      // base all on the community logo img element being #communityLogo
                      var logoA = dojo.byId("communityLogo").parentElement;
                      if( logoA.nodeName != "A") throw("cannot find anchor of community logo");
                      
                      // prep the logo containers by stripping all paddings and margins so that card is the same size as the logo 
                      if( dojo.query("#avtLotusMenuLeft div").length) dojo.style(dojo.query("#avtLotusMenuLeft div")[0], "margin-bottom", "10px");
                      if( dojo.query(".communityImgLink", dojo.byId("lotusNavBar")).length) dojo.style( dojo.query(".communityImgLink", dojo.byId("lotusNavBar"))[0], "padding-left", "30px");
                      dojo.style( logoA, { "padding":0, "margin":0 });
                                          
                      // add CSS styling
                      var h = dojo.doc.getElementsByTagName("head")[0];
                      if(!h) throw("head node not found");
                      
                      var flipStyle = dojo.place(
                        "<style>"+
                          ".flip-container { perspective:1000; -webkit-perspective:1000; margin-bottom: 1em;}"+
                          ".flip-container:hover .flipper, .flip-container.hover .flipper { transform: rotateY(180deg); }"+
                          ".flip-container, .front, .back { width: 157px; height: 157px; }"+
                          ".flipper { transition: 0.25s; transform-style: preserve-3d; position: relative; }"+
                          
                          ".front, .back { backface-visibility:hidden; position: absolute; top:0; left:0; border-radius:.5em; box-shadow: 5px 5px 5px rgba(162, 162, 162, 0.34);}"+
                          ".front { z-index: 2; }"+
                          ".front:hover { opacity: .15; }"+
                          
                          ".back { transform: rotateY(180deg); background-color:white; color:#505050; text-align:left; boder:1px solid black; overflow:hidden; padding-left:3px; }"+
                        "</style>",
                        logoA, "before");
                      
                      // create the flipping container node structure
                      dojo.place(
						'<div id="cardFlipper" class="flip-container" ontouchstart="this.classList.toggle(\'hover\');">'+
							'<div class="flipper">'+
								'<div id="cardFront" class="front">'+
								'</div>'+
								'<div id="cardBack" class="back">'+
                          			//'<img src="'+dojo.config.blankGif+'" width="155" height="155" />'+ 
                        		'</div>'+
							'</div>'+
						'</div>',
                       logoA, "before");
                      
                      // place log in front of card
                      dojo.place( logoA, "cardFront", "first");
                      
                      // back of card
                      dojo.place(
                          "<h4>"+ic_comm_communityName+"</h4>"
                          , "cardBack", "first");
                  } catch(ex) {
                      alert("comm card flipper error: FLIPPER: "+ex);
                  }
              }, "#communityLogo");
      } catch(ex) {
          alert("comm card flipper error: MAIN: "+ex);
      }
      
   });
}