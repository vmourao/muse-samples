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
// @name         commTOCobj
// @version      0.5
// @description  *** PROTOTYPE CODE *** generates a js obj out of the toc items of a community
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
// @exclude
//
// @run-at       document-end
//
// ==/UserScript==

if(typeof(dojo) != "undefined") {
    var _toc = new Array();
    
    require(["dojo/domReady!"], function(){
    try {
        //---------------------------------------------
        // HELPER FUNCTIONS
        var waitFor = function(callback, elXpath, maxInter, waitTime) {
            if(!maxInter) var maxInter = 50;  // number of intervals before expiring
            if(!waitTime) var waitTime = 100;  // 1000=1 second
            if(!elXpath) return;
            
            var waitInter = 0;  // current interval
            var intId = setInterval(function(){
                if (++waitInter<maxInter && !dojo.query(elXpath).length) return;
                clearInterval(intId);
                callback();
            }, waitTime);
        };
        
  		waitFor(
            function(){
				try {
                    if(dojo.query("#lotusNavBar li").length) {
                        j=0;
                        dojo.query("#lotusNavBar li").forEach(function(n,i,x) {
                            if( dojo.attr(n,"role") == "button") {
                                nn = dojo.query("a",n)[0];
                                _toc[j++] = {
                                    id: nn.id,
                                    href: nn.href,
                                    title: nn.title,
                                    text: nn.textContent
                                };
                           }
                        });
                    } 
                    
                    alert("toc objects acquired:"+_toc.length);
                    if( !_toc || !_toc.length) return;
                    
                
                } catch(ex) {
                    alert("comm tabbed toc error: "+ex);
                }
        	}, "#lotusNavBar");
        
        
    } catch(ex) {
		alert("comm tabbed toc error: "+ex);
    }
        
    });
}