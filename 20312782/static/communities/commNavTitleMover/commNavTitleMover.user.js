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
// @name         commNavTitleMover
// @version      0.15
// @description  *** PROTOTYPE CODE *** repositions a community's title off the toc
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
            
            
            // HELPER VARIABLES
            var isSubCommunity = function(){ return( (typeof(parentResourceId) != "undefined" && parentResourceId != null) || dojo.query("h3 .lotusIndent15.communityLink").length ); };
            var navElId = ( location.href.indexOf("/communities/") > 0? "#lotusNavBar" : "#bizCardNav"); // communities draws toc via jsp, other apps via bizcard
            
            waitFor(
                function(){
                    try {
                        if( ic_comm_communityName && ic_comm_communityName != "") {
                            
                            // place comm name and icon in titlebar area
                            var titleNode = null;
                            var newTitleNode = null;
                            if( dojo.query(".lotusRightCorner .lotusInner h2").length) {
                                titleNode = ( dojo.query(".lotusRightCorner .lotusInner h2").length > 1? dojo.query(".lotusRightCorner .lotusInner h2")[1] : dojo.query(".lotusRightCorner .lotusInner h2")[0]);                 
                                if( titleNode != null) {                                    
                                    dojo.place("<div id='titleNode'><h2></h2></div>"+"<div id='hiddenTitleNode' class='lotusHidden'></div>", titleNode, "before");
                                    dojo.place( titleNode, dojo.byId("hiddenTitleNode"), "first"); // hide current title
                                    
                                    newTitleNode = dojo.byId("titleNode");
                                    commNameNode = dojo.query(".lotusColLeft a.lotusBold")[0]; 
                                    if( commNameNode) dojo.place( commNameNode, dojo.query("#titleNode h2")[0], "first"); // move toc's community name node to titlebar
                                }
                                else { 
                                    return;
                                }
                            }
                            
                            // remove comm toc nav twisty
                            if( ic_comm_communityUuid && dojo.byId(ic_comm_communityUuid+"_twisty")) 
                                dojo.destroy( dojo.byId(ic_comm_communityUuid+"_twisty")); 
                            
                            // if subcommunity, make breadcrumb
                            if( isSubCommunity() && newTitleNode) {
                                subcommNameNode = dojo.query(".lotusBottomCorner .lotusInner .lotusIndent10 a").length > 1? dojo.query(".lotusBottomCorner .lotusInner .lotusIndent10 a")[1] : dojo.query(".lotusBottomCorner .lotusInner .lotusIndent10 a")[0];
                                dojo.place( "<span class='lotusSprite lotusArrow lotusTwistyClosed' style='float:none;display:inline-block;height:12px;margin:0;width:12px;' />", dojo.query("#titleNode h2")[0], "append");
                                dojo.place( subcommNameNode, dojo.query("#titleNode h2")[0], "append"); // move subcomm name to title
                                
                                dojo.query("#avtLotusMenuLeft h3").forEach(dojo.destroy); // cleanup
                                dojo.query("#avtLotusMenuLeft div .lotusMenuSection.lotusIndent10").forEach(dojo.destroy); // cleanup
                            } else {
                                if( dojo.query("#avtLotusMenuLeft h3").length) dojo.destroy(dojo.query("#avtLotusMenuLeft h3")[0]); // cleanup
                            }
                            
							dojo.query(".vcomm.X-community-display-inline .personinlinemenu .lotusMenu").addClass("lotusHidden");
                            dojo.query("a", newTitleNode).style({ "text-decoration":"none" });
                            dojo.query("a img", newTitleNode).style({ "height":"20px" });
                        }
                        
                    } catch(ex) {
                        alert("comm nav title mover error: COMMON: "+ex);
                    }
                    
                }, navElId );
            
            
        } catch(ex) {
            alert("comm nav title mover error: MAIN: "+ex);
        }
        
    });
}



