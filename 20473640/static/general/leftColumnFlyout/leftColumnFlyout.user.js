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
// @name         leftColumnFlyout
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
    
    var lc = dojo.byId("lotusColLeft");
    if( lc) {
        //--------------------------------------------------------------------------------------------
        // TURN LEFT AND RIGHT COLUMNS INTO SLIDE MENUS IN ORDER TO FREE-UP THE CANVAS
        dojo.place(
        "<style>"+
            ".lcflyout .smooth025 { transition: right .25s, left .25s, top .25s, width .25s, height .25s, transform .25s; transition-timing-function ease; }"+
            ".lcflyout .smooth05 { transition: right .5s, left .5s, top .5s, width .5s, height .5s, transform .5s; transition-timing-function ease; }"+
            ".lcflyout .smooth1 { transition: right 1s, left 1s, top 1s, width 1s, height 1s, transform 1s; transition-timing-function ease; }"+
            
            ".lcflyout .boxItLight { background: white; border: 1px solid #d2d2d2; padding: 10px; z-index: 100; }"+ 
            ".lcflyout .boxItDark { background: #363a3e; border: 1px solid #222222; padding: 10px; z-index: 100; boder-shadow: -1px 0 0 #404749 inset; }"+    
    
            ".lcflyout .hideTopLeft { position: fixed; top: -5000px; left: 5px; }"+     
            ".lcflyout .hideLeft { position: fixed; left: -500px;  }"+     
            ".lcflyout .hidePartialLeft { position: fixed; left: -188px; top:110px;  }"+
            ".lcflyout .showLeft { position: fixed; left: -1px; top:110px; }"+

            "#homepageLeftNavigationMenu { margin-top: 0px; width: 215px; }"+
            "#homepageLeftNavigationMenu.isSticky { position:static; margin-top:0px; top:auto; }"+
        "</style>",
        dojo.doc.head,"last");   
        
        dojo.addClass( dojo.body(), "lcflyout");
    
        if( dojo.byId("hpUserPhoto")) {
            dojo.place( dojo.byId("hpUserPhoto"), lc, "first");
            dojo.style( "hpUserPhoto", {"position":"relative","top":"-45px","left":"35px"});
            dojo.style( "hpUserPhotoImg", {"border":"5px solid white"});
        }
            
        dojo.addClass( lc, "hidePartialLeft boxItDark smooth025");
        dojo.removeClass( lc, "lotusColLeft");
        dojo.connect( lc, "onmouseover", function(){ dojo.addClass(lc, "showLeft"); dojo.removeClass(lc, "hidePartialLeft"); });
        dojo.connect( lc, "onmouseleave", function(){ dojo.addClass(lc, "hidePartialLeft"); dojo.removeClass(lc, "showLeft"); });
    }
}

        