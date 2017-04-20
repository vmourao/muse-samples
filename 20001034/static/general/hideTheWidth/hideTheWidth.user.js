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
// @name         hideTheWidth
// @version      0.2
// @description  *** PROTOTYPE CODE *** width hideer; expand means expand!
//
// @namespace  http://ibm.com
//
// @author       Tony Estrada
//
// @include      *://*connections*.ibm.com/*
// @include      *://apps.*.collabserv.com/*
// @include      *://icstage.swg.usma.ibm.com/*
// @include      *://w3alpha*.toronto.ca.ibm.com/*
// @include      *://lcauto*.swg.usma.ibm.com/*
//
// @exclude
//
// @run-at       document-end
// @grant        none
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

         dojo.place( 
              '<style>'+
             '#lotusMain,'+
             '#nav_bar_include > div > div,'+
             '#lotusFrame > div:nth-child(1) > div.lotusTitleBar2 > div.lotusWrapper,'+
             '#lotusFrame > div:nth-child(2) > div.lotusTitleBar2 > div,'+
             '#lotusFrame > div:nth-child(1) > div.lotusPlaceBar > div,'+
             '#lotusTitleBar > div.lotusRightCorner,'+
             '#lotusBanner > div.lotusRightCorner > div,'+
             '#lotusPlaceBar > div.lotusRightCorner'+
             '{ max-width: none; }'+
             '</style>', 
              dojo.body(), "first");         
         
      } catch(ex) {
          alert("hideTheWidth:"+ex);
      }
   });
}
