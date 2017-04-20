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
// @name         commListBlurs
// @version      0.9
// @description  *** PROTOTYPE CODE *** blurs non-mousedover communities of the community list
//
// @namespace  http://ibm.com
//
// @author       Tony Estrada
//
// @include      *://*connections*.ibm.com/communities/service/html/mycommunities
// @include      *://*connections*.ibm.com/communities/service/html/ownedcommunities
// @include      *://*connections*.ibm.com/communities/service/html/followedcommunities
// @include      *://*connections*.ibm.com/communities/service/html/communityinvites
// @include      *://*connections*.ibm.com/communities/service/html/allcommunities
// @include      *://*connections*.ibm.com/communities/service/html/trashedcommunities
//
// @include      *://apps.*.collabserv.com/communities/service/html/mycommunities
// @include      *://apps.*.collabserv.com/communities/service/html/ownedcommunities
// @include      *://apps.*.collabserv.com/communities/service/html/followedcommunities
// @include      *://apps.*.collabserv.com/communities/service/html/communityinvites
// @include      *://apps.*.collabserv.com/communities/service/html/allcommunities
// @include      *://apps.*.collabserv.com/communities/service/html/trashedcommunities
//
// @include      *://w3alpha*.toronto.ca.ibm.com/*
//
// @exclude
//
// @run-at       document-end
//
// ==/UserScript==

if(typeof(dojo) != "undefined") {
	dojo.place(
        "<style>"+
            "#lconn_communities_catalog_widgets_ResultsDisplayWidget_0 tbody:hover td { -webkit-filter: blur(5px); }"+
            "#lconn_communities_catalog_widgets_ResultsDisplayWidget_0 tbody:hover tr:hover td { -webkit-filter: blur(0px); font-size:1.25em; }"+
        "</style>", 
        dojo.doc.getElementsByTagName("head")[0], "last"); 
}
