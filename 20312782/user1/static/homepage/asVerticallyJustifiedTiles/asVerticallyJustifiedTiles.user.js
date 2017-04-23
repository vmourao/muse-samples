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
// @name         asVerticallyJustifiedTiles
// @version      0.5
// @description  *** PROTOTYPE CODE *** displays river of news items as separate card styled sections
//
// @namespace  http://ibm.com
//
// @author       Tony Estrada
//
// @include      *://*connections*.ibm.com/*homepage/*
// @include      *://apps.*.collabserv.com/*homepage/*
// @include      *://icstage.swg.usma.ibm.com/*homepage/*
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
            var waitFor = function(callback, elXpath, elXpathRoot, maxInter, waitTime) {
                if(!elXpathRoot) var elXpathRoot = dojo.body();
                if(!maxInter) var maxInter = 10000;  // number of intervals before expiring
                if(!waitTime) var waitTime = 1;  // 1000=1 second
                if(!elXpath) return;
                
                var waitInter = 0;  // current interval
                var intId = setInterval( function(){
                    if( ++waitInter<maxInter && !dojo.query(elXpath,elXpathRoot).length) return;

                    clearInterval(intId);
                    if( waitInter >= maxInter) { 
                        console.log("**** WAITFOR ["+elXpath+"] WATCH EXPIRED!!! interval "+waitInter+" (max:"+maxInter+")");
                    } else {
                        console.log("**** WAITFOR ["+elXpath+"] WATCH TRIPPED AT interval "+waitInter+" (max:"+maxInter+")");
                        callback();
                    }
                }, waitTime);
            };
    
            waitFor( function(){

                //-------------------------------------------------------------------
                // TILE GRID - turn AS li nodes into a via CSS
                dojo.addClass( dojo.body(), "newsCards");
                
                // common CSS for either TILES or TABLE
                dojo.place(
                    "<style id='newsCards'>"+
                    ".lotusui30 .lotusBoard ul.lotusStream { min-height:1500px; background-color:rgba(240, 240, 240, "+(location.href.indexOf("/profiles/")>0?"0":"1")+"); }"+
                    ".lotusui30 .lotusStream .lotusWidgetBody#activityStreamMain ul.lotusStream > li { border: 1px solid rgb(161, 161, 161); border-radius:3px; box-shadow:5px 5px 15px #aaaaaa; background-color:white; }"+
                    ".lotusui30 .lotusPagingBottom { clear:both; }"+
                    "</style>",
                    dojo.doc.head,"last");
                
                // TILED CARDS VIEW CSS
                createTilesStyle = function() {
                    dojo.place(
                        "<style id='newsTiles'>"+
                        ".lotusui30 .lotusStream .lotusWidgetBody#activityStreamMain ul.lotusStream > li { float:left; max-width: 400px; margin:15px 5px 0 10px; }"+
                        "</style>",
                        dojo.doc.head,"last");
                };
                
                // TABLE VIEW CSS
                createTableStyle = function() { 
                    dojo.place(
                        "<style id='newsTable'>"+
                        ".lotusui30 .lotusBoard .lotusStream .lotusPostContent { max-width: none; }"+
                        ".lotusui30 .lotusBoard .lotusCommentList { max-width: none; }"+
                        ".lotusui30 .lotusStream .lotusWidgetBody#activityStreamMain ul.lotusStream > li { float:none; max-width:none; margin:10px 5px 0 5px; }"+
                        "</style>",
                        dojo.doc.head,"last");
                };
                
                //-------------------------------------------------
                // JUSTIFY TILES - 3 column div approach
                // Create a DIV container with 3 columns and move every AS LI node into its own DIV node within the appropriate column
                getActivityStreamUL = function() {
                    asUL = dojo.query("ul.lotusStream[id='activityStreamMain']")[0];
                    if(!asUL) asUL = dojo.query("#asPermLinkAnchor")[0]; // IC in cloud differs from IC in w3 (newer version in cloud?)
                    return( asUL);
                };
                
                justifyTiles = function(c) {
                    if(!c) c=3; // default num of columns
                    
                    asUL = getActivityStreamUL();
                    
                    if( dojo.byId("newsJustifiedTiles")) dojo.destroy( dojo.byId("newsJustifiedTiles"));
                    dojo.place(
                        "<style id='newsJustifiedTiles'>"+
                        "#justifiedTilesContainer { height:2500px; padding:5px; min-width: 1000px; background-color: rgb(240, 240, 240); }"+
                        "#justifiedTilesContainer>div.col1, #justifiedTilesContainer>div.col2, #justifiedTilesContainer>div.col3 { float: left; width: "+(90/c)+"%; margin-right:5px; max-width: none; padding: 0; }"+
                        ".newsCards .justifiedNode { margin: 15px 0 0 10px; padding: 0; border: 1px solid rgb(161, 161, 161); border-radius: 3px; box-shadow: 5px 5px 15px #aaaaaa; background-color: white; }"+
                        "</style>",
                        dojo.doc.head,"last");
                    
                    
                    // create container with 3 columns if one does not exist
                    if( dojo.byId("justifiedTilesContainer") && asUL) dojo.destroy( dojo.byId("justifiedTilesContainer"));
                    var colsHtml = "<div id='justifiedTilesContainer'>";
                    for(i=1; i<=c; i++) colsHtml += "<div class='col"+i+"'></div>";
                    colsHtml += "</div>";
                    dojo.place(colsHtml,asUL,"after");
                    
                    // create DIV/UL for each li item under AS UL
                    dojo.query(">li",asUL).forEach( function(n,i,a){ 
                        targetNode = dojo.place("<div class='justifiedNode'></div>", dojo.query("#justifiedTilesContainer div.col"+((i%c)+1))[0],"append");
                        dojo.place(n, targetNode,"first"); // place this li item inside the div in the corresponding column 
                    });
                    
                    
                    /*
                    // add flipping capability
                    flipper = function() {
                        if( !dojo.byId("newsFlippingTiles")) {
                            dojo.place(
                                "<style id='newsFlippingTiles'>"+
                                    ".flip-container { perspective:1000; -webkit-perspective:1000; }"+
                                    ".flip-container:hover .flipper, .flip-container.hover .flipper { transform: rotateY(180deg); }"+
                                    //".flip-container, .front, .back { width: 200px; height: 200px; }"+
                                    ".flipper { transition: 0.35s; transform-style: preserve-3d; position: relative; }"+
                                    
                                    ".front, .back { backface-visibility:hidden;}"+
                                    ".front { z-index: 2; }"+
                                    ".front:hover { opacity: .15; }"+
                                    
                                    ".back { transform: rotateY(180deg); background-color:white; color:#505050; text-align:left; boder:1px solid black; overflow:hidden;  }"+
                                "</style>",
                            dojo.doc.head,"last");
                        }
                
                        dojo.query("div.justifiedNode", dojo.byId("justifiedTilesContainer")).forEach( function(n,i,x) {
                            dojo.addClass(n,"flip-container");
                            dojo.attr(n, "ontouchstart", "this.classList.toggle('hover');");
                        });
                        
                        dojo.query("div.justifiedNode div.activityStreamNewsItemContainer", dojo.byId("justifiedTilesContainer")).forEach( function(n,i,x) { // set front and create back
                            dojo.addClass(n,"front");
                               
                            if(!n.prevSibling || !dojo.hasClass(n.prevSibling,"flipper")) {
                                flipper = dojo.place("<div class='flipper'>"+"</div>", n, "before");
                                dojo.place(n, flipper, "first");
                            }
                            
                            if(!n.nextSibling || !dojo.hasClass(n.nextSibling,"back")) { // add back of card if not there
                                dojo.place("<div class='activityStreamNewsItemContainer back'>"+"I AM THE BACK"+"</div>", n, "after");
                            }
                        });
                    }
                    //flipper();
                    */
                };
                
                // puts every as li back under the original ul
                dejustifyTiles = function(c) {
                    if(!c) c=3; // default num of columns
                    asUL = getActivityStreamUL();
                    
                    // move each li back, but select the top one from each column in order to maintain the original order...
                    while( dojo.query("#justifiedTilesContainer div.justifiedNode>li").length) {
                        for(i=1; i<=c; i++) {
                            n = dojo.query("#justifiedTilesContainer div.col"+i+" div.justifiedNode>li")[0];
                            if(n) dojo.place(n, asUL,"append");
                        }
                    }
                    
                    dojo.query("#justifiedTilesContainer div.justifiedNode").forEach(function(n){ dojo.destroy(n);} );
                };
                
                //---------------------------------------------------------------
                // ONCLICK, PLACE EMBEDED EXPERIENCE RESULTS INSIDE THE TILE 
                toggleShowEE = function(evt){
                    if(!evt) return;
                    var elDiv = evt.target; // the clicked node 
                    while( elDiv && !dojo.hasClass( elDiv,"activityStreamNewsItemContainer")) elDiv = elDiv.parentElement; // get the main DIV of the news item clicked (in case we clicked on an inner element)
                    var elLi = elDiv.parentElement;

                    setTimeout( function(){
                        // hide EE stuff
                        dojo.query("#com_ibm_oneui_controls_internal__MasterPopup_0").style("display","none"); // hide the EE popout
                        dojo.addClass(elDiv,"lotusHidden"); // hide post details, since we are going to shove the EE content into this node...

                        // move the EE into the expanded element of the clicked node
                        var expEl = dojo.query("[id='expanded']",elLi).length? dojo.query("[id='expanded']",elLi)[0] : dojo.place("<div id='expanded' class='"+dojo.attr(elDiv,"class")+"'></div>", elLi, "last"); // get or create the expanded div element under this node
                        dojo.removeClass(expEl,"lotusPostHover lotusPostSelected lotusHidden");
                        dojo.place( dojo.query("iframe[id^='__gadget_gadget_']")[0].contentDocument.body, expEl, "first"); // move iframe content doc into expanded element
                        

                        // close shoehorned EE
                        dojo.query("[id='gadgetDiv']",expEl).style("background-color","white");
                        dojo.query(".lotusContent",expEl).style("background-color","white");

                        var closeEl = dojo.place(
                            '<div style="float:right;"><span class="lotusBtnImg lotusClose" title="Close">'+
                            	'<input type="image" src="'+dojo.config.blankGif+'" alt="Close">'+
                            	'<a class="lotusAltText" href="javascript:;">X</a>'+
                            '</span></div>', expEl, "first");
                        
                        dojo.connect(closeEl, "onclick", function(evt){ // connect clicking on the EE will show the original node and destroy the EE that was shoe horned here... 
                            if(!evt) return;
                            var elDiv = evt.target; // the clicked node 
                            while( elDiv && !dojo.hasClass( elDiv,"activityStreamNewsItemContainer")) elDiv = elDiv.parentElement;
                            var elLi = elDiv.parentElement;                        	
                            dojo.query(".activityStreamNewsItemContainer",elLi).removeClass("lotusHidden");
                            dojo.destroy(elDiv);
                        });
                    }, 2000);
                };
                
                // connnect click to new show
                connectEEtoTiles = function() {
                    dojo.query("li:first-of-type>div",getActivityStreamUL()).connect("onclick", function(evt){
                        toggleShowEE(evt); // move EE results into the clicked node
                    });
                };
                
                
                //-------------------------------------------------------------------
                // VIEW CONTROL
                replaceClass=function(id,add,del){
                    dojo.removeClass(id,del);
                    dojo.addClass(id,add);
                };
                
                showTable=function(){
                    dojo.cookie("newsTiles", "0", { expires: -1 });                
                    replaceClass("viewControlTable","lotusDetailsOn","lotusDetailsOff");
                    replaceClass("viewControlTiles","lotusTileOff","lotusTileOn");
                    
                    if(dojo.byId("newsTiles")) dojo.destroy( dojo.byId("newsTiles"));
                    if(!dojo.byId("newsTable")) createTableStyle();
                    dejustifyTiles(tc);
                };
                
                showTiles=function(){
                    dojo.cookie("newsTiles", "1", { expires: 1000 });                
                    replaceClass("viewControlTiles","lotusTileOn","lotusTileOff");
                    replaceClass("viewControlTable","lotusDetailsOff","lotusDetailsOn");
                    
                    if(dojo.byId("newsTable")) dojo.destroy( dojo.byId("newsTable"));
                    if(!dojo.byId("newsTiles")) createTilesStyle();
                };
                
                tc = 3; // tile columns
                var searchEl = dojo.byId("asSearchMenuOption")? dojo.byId("asSearchMenuOption") : dojo.byId("Search");
                dojo.place('<div id="viewControl" class="lotusViewControl lotusRight" style="margin:12px 5px 0 0;">'+
                           '<a id="viewControlTable" class="lotusSprite lotusView lotusDetailsOn" title="show rows" href="javascript:;" onclick="showTable();"><span class="lotusAltText ">Customizable</span></a>'+
                           '<a id="viewControlTiles" class="lotusSprite lotusView lotusTileOff" title="show tiles" href="javascript:;" onclick="showTiles(tc); if(dojo.query(\'#justifiedTilesContainer div.justifiedNode\').length) dejustifyTiles(tc); else justifyTiles(tc);"><span class="lotusAltText lotusBold">List</span></a>'+

                           '<a id="moreCols" class="lotusSprite lotusView" style="background-position: -971px -6px;" title="decrease columns" href="javascript:;" onclick="dejustifyTiles(tc); tc--; if(tc <1) tc=1; justifyTiles(tc); dojo.byId(\'tc\').innerHTML=tc;"><span class="lotusAltText lotusBold">More</span></a>'+
                           '<span id="tc" style="margin: 3px 0;">'+tc+'</span>'+
                           '<a id="lessCols" class="lotusSprite lotusView" style="background-position: -984px -6px;" title="increase columns" href="javascript:;" onclick="dejustifyTiles(tc); tc++; if(tc >10) tc=10; justifyTiles(tc); dojo.byId(\'tc\').innerHTML=tc;"><span class="lotusAltText lotusBold">Less</span></a>'+
                           '</div>',
                           searchEl.parentNode.parentNode,
                           "after");
                
                
                
                //asPermLinkAnchor
                if(dojo.cookie("newsTiles") == "1") {
                    showTiles();
                    connectEEtoTiles();
                    justifyTiles();
                }
                else {
                    showTables();
                }
                 
              }, ".lotusStreamTopLoading div.loaderMain.lotusHidden"); // wait until the "loading..." node has been hidden, indicating that we have loaded content.

      } catch(ex) {
          alert("asVerticallyJustifiedTiles:MAIN:"+ex);
      }
      
   });
}
        