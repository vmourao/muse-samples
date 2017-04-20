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
// @name         rightColumnFlyout
// @version      0.1
// @description  *** PROTOTYPE CODE *** displays river of news items as separate card styled sections
//
// @namespace  http://ibm.com
//
// @author       Tony Estrada
//
// @include      *://*connections*.ibm.com/*
// @include      *://apps.*.collabserv.com/*
// @include      *://icstage.swg.usma.ibm.com/*
//
// @include      *://w3alpha*.toronto.ca.ibm.com/*
//
// @exclude
//
// @run-at       document-end
//
// ==/UserScript==

if(typeof(dojo) != "undefined") {
    
    var rc = dojo.byId("lotusColRight");
    if( rc) {
        //--------------------------------------------------------------------------------------------
        // TURN LEFT AND RIGHT COLUMNS INTO SLIDE MENUS IN ORDER TO FREE-UP THE CANVAS
        dojo.place(
        "<style>"+
            ".rcflyout .smooth025 { transition: right .25s, left .25s, top .25s, width .25s, height .25s, transform .25s; transition-timing-function ease; }"+
            ".rcflyout .smooth05 { transition: right .5s, left .5s, top .5s, width .5s, height .5s, transform .5s; transition-timing-function ease; }"+
            ".rcflyout .smooth1 { transition: right 1s, left 1s, top 1s, width 1s, height 1s, transform 1s; transition-timing-function ease; }"+
            
            ".rcflyout .boxItLight { background: white; border: 1px solid #d2d2d2; padding: 10px; z-index: 100; }"+    
            ".rcflyout .boxItDark { background: #363a3e; border: 1px solid #222222; padding: 10px; z-index: 100; boder-shadow: -1px 0 0 #404749 inset; }"+    
    
            ".rcflyout .hideTopRight { position: fixed; top: -5000px; right: 5px; }"+     
            ".rcflyout .hideRight { position: fixed; right:-500px; width:300px;}"+     
            ".rcflyout .hidePartialRight { position: fixed; right:-311px; top:110px; width:300px;}"+
            ".rcflyout .showRight { position: fixed; right: -1px; top:110px; }"+
        "</style>",
        dojo.doc.head,"last");   
        
        dojo.addClass( dojo.body(), "rcflyout");
        
        dojo.addClass( rc, "hidePartialRight boxItLight smooth025");
        dojo.removeClass( rc,"lotusColRight");
        dojo.connect( rc, "onmouseover", function(){ dojo.addClass(rc, "showRight"); dojo.removeClass(rc,"hidePartialRight"); });
        dojo.connect( rc, "onmouseleave", function(){ dojo.addClass(rc, "hidePartialRight"); dojo.removeClass(rc,"showRight"); });
    }
}

        