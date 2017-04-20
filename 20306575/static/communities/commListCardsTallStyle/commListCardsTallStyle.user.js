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
// @name         commListCardsTallStyle
// @version      0.9
// @description  *** PROTOTYPE CODE *** displays community list as cards with additional info at bottom of card
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
    
    var waitFor = function(callback, elXpath, maxInter, waitTime) {
        if(!maxInter) var maxInter = 20;  // number of intervals before expiring
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
            
            replaceClass=function(id,add,del){
                dojo.removeClass(id,del);
                dojo.addClass(id,add);
            };
            
            showTable=function(){
                dojo.cookie("commTiles", "0", { expires: -1 });                
                
                replaceClass("viewControlTable", "lotusDetailsOn", "lotusDetailsOff");
                replaceClass("viewControlTiles", "lotusTileOff", "lotusTileOn");
                dojo.addClass(commTiles, "lotusHidden");
                dojo.removeClass(commTable, "lotusHidden");
            };
            
            showTiles=function(){
                dojo.cookie("commTiles", "1", { expires: 1000 });                
                
                if(commTiles==null) createCommTiles();
                replaceClass("viewControlTiles", "lotusTileOn", "lotusTileOff");
                replaceClass("viewControlTable", "lotusDetailsOff", "lotusDetailsOn");
                dojo.addClass(commTable, "lotusHidden");
                dojo.removeClass(commTiles, "lotusHidden");
            };
            
            showBackSide=function(el){
                return;
                back = dojo.query(".cTileBack",el)[0];
                dojo.removeClass(el, "lotusHidden");
            };
            
            showFrontSide=function(el){
                debugger;
                front = el.parentNode;
                dojo.addClass(el, "lotusHidden");
            };

            createCommTiles=function(){
                out='<style>'+
                    '.cTile{-webkit-transition: width 1s, height 1s, -webkit-transform 1s ease-in-out; width:200px;height:300px;background-color:rgb(250,250,250);cursor:pointer;position:relative;margin:5px 15px 15px 0;white-space:normal;border:1px solid #aaa;box-shadow:5px 5px 15px #DDD;border-radius:2px;}'+
                    //'.cTile:hover {-webkit-transform:rotateY(90deg); }'+

                    '.cTileB{-webkit-transition: width 1s, height 1s, -webkit-transform 1s ease-in-out;}'+
                    //'.cTileB:hover {-webkit-transform:rotateY(90deg); }'+
                    
                    '.cTileImg {background:linear-gradient(white,black);}'+
                    '.cTileImg img{width:200px;height:200px;border-bottom:1px solid #aaa;border-radius:5px 5px 0 0;opacity:0.80;}'+
                    '.cTileType{position:absolute;right:4px;top:280px;font-size:0px;}'+
                    '.cTileTrash{position:absolute;left:3px;top:280px;}'+
                    '.cTileTextContainter{padding:5px;width:190px;height:75px;overflow:hidden;}'+
                    '.cTileTitle a,cTileTitle a:visited{font-family:Roboto,arial;sans-serif;font-weight:bold;font-size:12px;color:#333 }'+
                    '.cTileTitle a:visited{color:#000 }'+
                    '.cTileSmallTextDiv{font-size:smaller;margin-top:2px;}'+
                    '</style>'+
                    '<div id="commTiles" class="lotusHidden"></div>';
                
                commTiles=dojo.byId("commTiles");
                if(commTiles)
                    dojo.place(out,commTiles, "replace");
                else
                    dojo.place(out,commTable, "before");
                commTiles=dojo.byId("commTiles");
                
                dojo.query("tr",commTable).forEach(function(n,i){
                    img=dojo.clone(dojo.query("td.lotusFirstCell img",n)[0] );
                    commAnchor=dojo.query("td a[dojoattachpoint='placeTitleLink']",n)[0];
                    members=dojo.query("td span[dojoattachpoint='numOfMembersPlaceHolder']",n)[0];
                    updatedBy=dojo.query("td span[dojoattachpoint='personPlaceHolder']",n)[0];
                    updatedOn=dojo.query("td span[dojoattachpoint='lastUpdateNode']",n)[0];
                    typeMod=dojo.query("td span[dojoattachpoint='moderatedIconNode']",n)[0];
                    typeRest=dojo.query("td span[dojoattachpoint='restrictedIconNode']",n)[0];
                    trashed=dojo.query("td span[dojoattachpoint='trashedIconNode']",n)[0];
                    src=dojo.query("td span[dojoattachpoint='sourceTypePlaceHolder']",n)[0];
                    tags=dojo.query("td span[dojoattachpoint='tagsSection']",n)[0];
                    
                    out=
                        '<div class="lotusLeft cTile" onmouseover="showBackSide(this);" onclick="location.href=\''+commAnchor.href+'\'">'+
                    	    '<div class="lotusLeft cTile cTileBack lotusHidden" onmouseout="showFrontSide(this)" style="location:absolute;">'+
                        		'this is the back side'+
                 	       '</div>'+
                    	    '<div class="cTileImg">'+img.outerHTML+'</div>'+
                        	'<div class="cTileTextContainter">'+
 		                       	'<div class="cTileTitle">'+ commAnchor.outerHTML +'</div>'+
    		                    '<div class="cTileSmallTextDiv">'+members.outerHTML+'</div>'+
        		                '<div class="cTileSmallTextDiv">'+updatedBy.outerHTML+' | '+updatedOn.outerHTML+'</div>'+
            		            '<div class="cTileSmallTextDiv">'+tags.outerHTML+'</div>'+
                    	        '<div class="cTileType">'+typeRest.outerHTML+typeMod.outerHTML+'</div>'+
                        	    '<div class="cTileTrash">'+trashed.outerHTML+'</div>'+
            	            '</div>'+
                        '</div>';
                    
                    dojo.place(out,commTiles,"add");
                });
            };
            
            commTable=dojo.query("#lconn_communities_catalog_widgets_ResultsDisplayWidget_0 table")[0];
            commTiles=null;
            
            dojo.place('<div id="viewControl" class="lotusViewControl lotusRight">'+
                       '<a id="viewControlTable" class="lotusSprite lotusView lotusDetailsOn" style="padding:0;" href="javascript:;" onclick="showTable();"><span class="lotusAltText ">Customizable</span></a>'+
                       '<a id="viewControlTiles" class="lotusSprite lotusView lotusTileOff"  style="padding:0;" href="javascript:;" onclick="showTiles();"><span class="lotusAltText lotusBold">List</span></a>'+
                       '</div>',
                       dojo.query("#mainContentDiv div.lotusActionBar.lotusBtnContainer")[0],
                       "append");
            
            if(dojo.cookie("commTiles") == "1") showTiles();
            
        }, "td a[dojoattachpoint='placeTitleLink']");
}
