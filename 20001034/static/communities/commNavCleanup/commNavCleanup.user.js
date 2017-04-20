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
// @name         commNavCleanup
// @version      0.12
// @description  *** PROTOTYPE CODE *** cleans up various nuisances while in a community's external app (such as activities)
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
         
         //---------------------------------------------
         // HELPER VARIABLES
         var isSubCommunity = function(){ return( (typeof(parentResourceId) != "undefined" && parentResourceId != null) || dojo.query("h3 .lotusIndent15.communityLink").length ); };
         var navElId = ( location.href.indexOf("/communities/") > 0? "#lotusNavBar" : "#bizCardNav"); // communities draws toc via jsp, other apps via bizcard
          
         //---------------------------------------------
         // WHEN ACTIVITY:
         if(location.href.indexOf("/activities/") > 0) {
            waitFor( 
               function(){
                  var activityTitle = dojo.byId("lotusPlaceBar-Title").textContent;
                   
                  var isCommAct = ( typeof(OAGetCommunityUuid) == "function" && OAGetCommunityUuid() != null);
                  if( !isCommAct) return;
                  
                  // move activity title to top of page content
                  dojo.place("<div><h3>"+activityTitle+"</h3></div>", dojo.byId("lotusContent"), "first");
                  dojo.style( dojo.byId("lotusContent"), "padding-top", "0px");

                   // fix header icon and name
                  if( dojo.query("#lotusTitleBar h2 img").length) dojo.replaceClass( dojo.query("#lotusTitleBar h2 img")[0], "iconsComponentsBlue24-CommunitiesBlue24", "iconsComponentsBlue24-ActivitiesBlue24"); 
                  if( dojo.query("#lotusTitleBar h2 span.lotusText").length) dojo.query("#lotusTitleBar h2 span.lotusText")[0].innerHTML = '<a href="/communities">Communities</a>'; // comm app name on header
                  
                  // hide activity action tabs
                  if( dojo.byId("activitiesNagvigationToolbar")) dojo.addClass( dojo.byId("activitiesNagvigationToolbar"), "lotusHidden"); 
                  if( dojo.byId("lotusTitleBar")) dojo.removeClass( dojo.byId("lotusTitleBar"), "lotusTitleBar2Tabs");
                                
               }, "#actPageCommCard .personinlinemenu");
         }
      } catch(ex) {
          alert("comm nav cleanup error: MAIN: " + ex);
      }
   });
}

