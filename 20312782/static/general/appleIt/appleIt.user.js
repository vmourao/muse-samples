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
// @name       appleIt
// @version    0.10
// @description  *** PROTOTYPE CODE *** styles a page to look like an apple styled page (rounded corners, fonts, etc)
//
// @namespace  http://ibm.com
//
// @author       Tony Estrada
//
// @include      *://*connections*.ibm.com/*
// @include      *://apps.*.collabserv.com/*
// @include      *://w3alpha*.toronto.ca.ibm.com/*
// @include      *://lcauto*.swg.usma.ibm.com/*
// @exclude
//
// @run-at       document-end
//
// ==/UserScript==

if(typeof(dojo) != "undefined") {
    
	// rounded corner photos and buttons
	dojo.place(
	'<style type="text/css">'+
    	//'.lotusui30, .lotusui30 button, .lotusui30 input, .lotusui30 select { font-family: GillSans; font-size: 14px; }'+
    	//'.lotusui30 .lotusHeader .lotusHeading, .lotusui30 .lotusHeader h1 { font-size: 2em; font-weight: normal; }'+
    	'.lotusui30 .lotusBtn, .lotusui30 button.lotusFormButton, .lotusui30 input.lotusFormButton, .lotusui30 span.lotusBtn a, .lotusui30 span.lotusBtn a:visited, .lotusui30 span.lotusBtn a:hover, .lotusui30 span.lotusBtn a:focus, .lotusui30 span.lotusBtn a:active { border-radius: 5px 5px 5px 5px; }'+
    	'.lotusui30 .lotusPostContent .lotusPostAction .vcard, .lotusui30 .lotusWidget2 h2, .lotusui30 span.lotusBtn, .lotusui30 .lotusFormButton, .lotusui30 .lotusBtn, .lotusui30 #activityStream.lotusStream .lotusInlinelist.lotusActions a, a { font-weight: normal; }'+
    	'.lotusui30 img[src*="profiles/photo"] { border-radius:10% }'+
   	'</style>',
      dojo.body(), 
      "first");
}
