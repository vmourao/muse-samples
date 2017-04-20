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
// @name         commNavLogoMover
// @version      0.11
// @description  *** PROTOTYPE CODE *** repositions a community's logo outside of the toc twisty
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
         var moveCommNavLogo = function(commUuid) {
             if(!commUuid) return;
             
             // move logo outside of collapsible sections
             if( dojo.query(".vcomm.X-community-display-inline .lconnCommLogo a").length  && dojo.query(".vcomm.X-community-display-inline .personinlinemenu").length) {
                 
                 var logo = dojo.query(".vcomm.X-community-display-inline .lconnCommLogo a")[0];
                 
                 dojo.place( '<div id="commLogo" style="padding-left:30px;"></div>', dojo.query(".vcomm.X-community-display-inline .personinlinemenu")[0], "first");
                 dojo.place( logo, "commLogo", "first");
                 
                 dojo.style( dojo.query("img", logo)[0], { 
                     "margin-bottom": "10px",
                     "border-radius": ".5em"
                 });
             }
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
                  var isCommAct = ( typeof(OAGetCommunityUuid) == "function" && OAGetCommunityUuid() != null);
                  if( !isCommAct) return;
                  moveCommNavLogo( ic_comm_communityUuid );                  
               }, "#actPageCommCard .personinlinemenu");
         }

         //---------------------------------------------
         // WHEN IN WIKI:
         else if(location.href.indexOf("/wikis/") > 0) {        
            waitFor(function(){
               if( isCommunityWiki) {
                  moveCommNavLogo( ic_comm_communityUuid );
               }
            },".vcomm.X-community-display-inline .personinlinemenu");
         }
            
            //---------------------------------------------
            // WHEN IN BLOGS:
            else if(location.href.indexOf("/blogs/") > 0) {   
               waitFor(function(){
                  if( isComm) {
                     moveCommNavLogo( ic_comm_communityUuid );
                  }
               },".vcomm.X-community-display-inline .personinlinemenu");
            }
            
            //---------------------------------------------
            // WHEN FORUMS:
            else if(location.href.indexOf("/forums/") > 0) {   
               waitFor(function(){
                  if( forumsUserId) {
                     moveCommNavLogo( ic_comm_communityUuid );
                  }
               }, navElId+" .communityImgLink a");
            }
               
                //---------------------------------------------
                // WHEN COMMUNITY:            
                else {   
                    waitFor(function(){
                        if( dojo.query(".communityImgLink").length) {
                        var n = dojo.query(".communityImgLink")[0];

                        dojo.place( n, "lotusColLeftContent","first");
                        dojo.style( dojo.query("img",n)[0], { 
                            "margin-bottom": "10px",
                            "border-radius": ".5em"
                        });
												}
                    }, navElId+" .communityImgLink a");
                }
          
         //--------------------------------------------
         // COMMON
         waitFor(
            function(){
               try {
  
                   
               } catch(ex) {
                   alert("comm nav logo mover error: COMMON: "+ex);
               }
            }, navElId );
                 

      } catch(ex) {
          alert("comm nav logo mover error: MAIN: "+ex);
      }
      
   });
}
