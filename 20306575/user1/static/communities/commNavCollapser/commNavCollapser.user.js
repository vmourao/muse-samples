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
// @name         commNavCollapser
// @version      0.10
// @description  *** PROTOTYPE CODE *** collapses a communities nav toc based on which community app is being used in order to display that app's toc contents higher on the nav area
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
         var collapseCommNav = function(commUuid) {
             if(!commUuid) return;
             
            // collapse main community card
            if( dojo.byId(commUuid+'_twisty') && dojo.hasClass( dojo.byId(commUuid+'_twisty'), "lotusTwistyOpen")) {
                lconn.communities.bizCard.core.toggleSection(commUuid+'_twisty', commUuid+'_comm_appLinks', commUuid+'_commAltText','community.inline.card.links');
            }
             
            // collapse subcommunity section
            if( dojo.byId(commUuid+'_subtwisty') && dojo.hasClass( dojo.byId(commUuid+'_subtwisty'), "lotusTwistyOpen")) {
                lconn.communities.bizCard.core.toggleSection(commUuid+'_subtwisty', commUuid+'_comm_subLinks', commUuid+'_subAltOpen');
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
                      collapseCommNav( ic_comm_communityUuid );
                  }, "#actPageCommCard .personinlinemenu");
          }
          
          //---------------------------------------------
          // WHEN IN WIKI:
          else if(location.href.indexOf("/wikis/") > 0) {        
              waitFor(function(){
                  if( isCommunityWiki) {
                      collapseCommNav( ic_comm_communityUuid );
                  }
              },".vcomm.X-community-display-inline .personinlinemenu");
          }
              
          //---------------------------------------------
          // WHEN IN BLOGS:
          else if(location.href.indexOf("/blogs/") > 0) {   
             waitFor(function(){
                if( isComm) {
                   collapseCommNav( ic_comm_communityUuid );
                }
             },".vcomm.X-community-display-inline .personinlinemenu");
          }
              
          //---------------------------------------------
          // WHEN FORUMS:
          else if(location.href.indexOf("/forums/") > 0) {   
              waitFor(function(){
                  if( forumsUserId) {
                      collapseCommNav( ic_comm_communityUuid );
                  }
              }, navElId+" .communityImgLink a");
          }
                  
          //---------------------------------------------
          // WHEN COMMUNITY:            
          else {   
              waitFor(function(){
                          
              }, navElId+" .communityImgLink a");
          }          

      } catch(ex) {
          alert("comm nav collapser error: MAIN: "+ex);
      }
   });
}
