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
// @name         commNavTabs
// @version      0.6
// @description  *** PROTOTYPE CODE *** creates horizontal tab navigation out of a community's toc
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
         // HELPER VARIABLES
         var isSubCommunity = function(){ return( (typeof(parentResourceId) != "undefined" && parentResourceId != null) || dojo.query("h3 .lotusIndent15.communityLink").length ); };
         var navElId = ( location.href.indexOf("/communities/") > 0? "#lotusNavBar" : "#bizCardNav"); // communities draws toc via jsp, other apps via bizcard
         
         //---------------------------------------------
         // TABBED TOC
         var renderUsingMoreTabMode = true, numRenderedTabs = 7;
         var renderUsingMenuTabMode = false;

         waitFor(
              function(){
                  try {
                      ab=dojo.query("#lotusContent")[0];
                      if(!ab) return;
                      
                      // set style for rounded tabs
                      dojo.place("<style>#tocTabsUL li { border-radius:.5em .5em 0em 0em; }</style>", dojo.doc.getElementsByTagName("head")[0], "last"); 
                      dojo.style( dojo.byId("lotusContent"), "margin-top", "0px"); // fix space after tabs

                      // move toc into tabs
                      var moveToTab = function(node) {
                          dojo.place(node, dojo.byId(tocTabsUL), "last");
                          dojo.addClass( dojo.query("a",node)[0],"lotusTab");
                      };
                      
                      dojo.query( navElId+" li[role='button'").forEach(
                          function(n,i,x){
                              if( i==0) dojo.place(
                                  "<div id='tocTabsDIV'>"+ 
                                  	"<ul id='tocTabsUL' class='lotusTabs' style='padding-left:5px;'>"+
                                  	"</ul>"+
                                 "</div>", 
                                  ab, "before");

                              moveToTab(n);
                              if(i >= numRenderedTabs)
                                  if( !dojo.hasClass( n,"lotusSelected")) dojo.addClass( n,"lotusHidden"); // hide other tabs, except if selected
                              
                              
                              // add a More... tab and Less... tab at the end
                              if( i+1 == x.length && renderUsingMoreTabMode) {
                                  dojo.place(
                                      '<li role="button" aria-pressed="false" tabindex="-1" uilocation="col2" id="More_navItem" itemidx_="'+(i+1)+'" '+
                                      	'onclick="'+
                                      		//'debugger;'+
                                      		'dojo.query(\'li.lotusHidden\', this.parentNode).removeClass(\'lotusHidden\');'+
                                      		'dojo.addClass(this,\'lotusHidden\');'+
                                      	'" '+
                                      '>'+
                                	      '<a class="lotusTab" href="javascript:void(0);">'+
                                    		  'more...'+  //'<img class="lotusIcon16 lotusIconShow" alt="More" src="'+dojo.config.blankGif+'">'+
                                 	     '</a>'+
                                      '</li>',
                                      dojo.byId("tocTabsUL"), "last");

                                  dojo.place(
                                      '<li role="button" aria-pressed="false" tabindex="-1" uilocation="col2" class="lotusHidden" id="Less_navItem" itemidx_="'+(i+2)+'" '+
                                      	'onclick="'+
	                                      'dojo.query(\'li\', this.parentNode).forEach(function(n,i){ if(i>='+numRenderedTabs+' && !dojo.hasClass(n,\'lotusSelected\')) dojo.addClass(n,\'lotusHidden\');});'+
                                      	  'dojo.addClass(this,\'lotusHidden\');'+
                                      	  'dojo.removeClass(dojo.byId(\'More_navItem\'),\'lotusHidden\');'+
                                      	'">'+
                                      	'<a class="lotusTab" href="javascript:void(0);">less...</a>'+
                                      '</li>',
                                      dojo.byId("tocTabsUL"), "last");
                              }
                          }
                      );
                      

                      // turn overflowed tabs into menu
                      var overflowTocTabs = function(){

                          dojo.style( dojo.byId("tocTabsDIV"), { "overflow":"hidden", "height":"26px" }); // hide overflowed tabs

                          // create dijit menu of tabs not shown
                          if (dijit.byId('tocDropDown')) { 
                              dijit.byId('tocDropDown').destroyRecursive(true); 
                              dojo.empty('tocDropDown'); 
                          } 
                          
                          var firstHiddenElement = false;
                          
                          pMenu = new dijit.DropDownMenu({ style:""}, "tocDropDown");
                          dojo.query("li", dojo.byId("tocTabsUL")).forEach(
                              function(n,i,x) {
                                 if(dojo.position(n,true).y != dojo.position(n.parentElement,true).y  // is overflowed (wrapped)
                                    //|| (dojo.position(n,true).x+dojo.position(n,true).w+18) > dojo.position(n.parentElement,true).x+dojo.position(n.parentElement,true).w // the more items tab needs room too
                                    ) {
                                      
                                      if(!firstHiddenElement) firstHiddenElement = n;
				                      
                                      // add item to menu
                                      pMenu.addChild( new dijit.MenuItem({
                                          label:dojo.string.trim(n.innerText),
                                          onClick: dojo.hitch(this, n.keypress)
                                      }));
                                  }
                              }
                          );
                          pMenu.startup();

                          
                          // if menu was created, add it as the last tab
                          if(dojo.byId("DDmenu_navItem")) dojo.destroy("DDmenu_navItem"); // remove previous tab first if one was created
                          if( firstHiddenElement){
                              dojo.place(
                                  '<li id="DDmenu_navItem" role="button" aria-pressed="false" tabindex="-1" uilocation="col2" '+
                                  	    'onclick="'+
                                  			'if(dojo.hasClass(\'tocMoreItemsContainer\',\'lotusHidden\')) dojo.removeClass(\'tocMoreItemsContainer\',\'lotusHidden\'); else dojo.addClass(\'tocMoreItemsContainer\',\'lotusHidden\');'+ // toggle show menu
                                      	'" '+
                                  		'>'+
                                  	'<a id="tocMoreTabsMenu" class="lotusTab" href="javascript:void(0);" style="padding: 6px 0px 0px 4px;">'+
                                  		'<img class="lotusIcon16 lotusIconShow" alt="More" src="'+dojo.config.blankGif+'">'+
                                 	'</a>'+
                                  '</li>',
                                  firstHiddenElement,
                                  "before");
                              
                              dd = dojo.byId("DDmenu_navItem");
                              //if( dojo.position(dd,true).y != dojo.position(dd.parentElement,true).y) dojo.place(dd, dd.previousSibling, "before");
                                  
                              dojo.place('<div id="tocMoreItemsContainer" class="lotusHidden" style="overflow:visible;position:fixed;z-index:10000"></div>',"DDmenu_navItem","last");
                              pMenu.placeAt("tocMoreItemsContainer");
                          }
                      };
                      
                      if( renderUsingMenuTabMode) { 
                          overflowTocTabs(); // initial set
                          overflowConnect = dojo.connect(window, "onresize", overflowTocTabs);
                      }
                      
                  } catch(ex) {
                      alert("comm nav cleanup error: TABS: "+ex);
                  }
              }, navElId );
                          

      } catch(ex) {
          alert("comm nav cleanup error: MAIN: "+ex);
      }
      
   });
}