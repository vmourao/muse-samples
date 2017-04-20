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
// @name         commNavTabsIBMUX
// @version      0.13
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
// @include      *://icstage.swg.usma.ibm.com/*communities/service/*
// @include      *://icstage.swg.usma.ibm.com/*blogs/*
// @include      *://icstage.swg.usma.ibm.com/*activities/*
// @include      *://icstage.swg.usma.ibm.com/*forums/*
// @include      *://icstage.swg.usma.ibm.com/*wikis/*
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
         waitFor(
              function(){
                  try {
                      if( !ic_comm_communityUuid || ic_comm_communityUuid == "") return;
                      
                      ab=dojo.query(".lotusFrame .lotusPlaceBar")[0];
                      if(!ab) return;
                      


                      //************** HELPER FUNCTIONS ****************
                      
                      // move toc into tabs
                      var addAsTab = function(node) {
                          dojo.place(node, dojo.byId(tocTabsUL), "last");
                          dojo.addClass( dojo.query("a",node)[0],"lotusTab");
                      };
                      
                      var isTabVisible = function(c,n) {
                          return( dojo.position(n).y+2 >= dojo.position(c).y &&
                                  dojo.position(n).y < dojo.position(c).y + dojo.position(c).h);
                      };
                      
                      var doesTabFit = function(c,n) {
                          tabs = dojo.byId("tocTabsUL");
                          return( tabs.scrollHeight > n.scrollHeight);
                      };

                      // find the first hidden tab after the currently visible tabs
                      var displayNextTabRow = function(ev) { 
                          var tabContainer = dojo.byId("tocTabsUL");
                          var tocItems = dojo.query("#tocTabsUL li");
                          for( sel=-1, i=0; i<tocItems.length; i++) {
                              n=tocItems[i];
                              if( isTabVisible(tabContainer,n)) {
                                sel = i;
                                continue;
                              }
                              
                              if( !isTabVisible(tabContainer,n) && sel != -1 ) {
                                  n.scrollIntoViewIfNeeded(true);
                                  break;
                              }
                          }
                      };
                      
                      // find the first hidden tab before the currently visible tabs
                      var displayPrevTabRow = function(ev) {
                          var tocItems = dojo.query("#tocTabsUL li");
                          var tabContainer = dojo.byId("tocTabsUL");
                          for( sel=-1, i=tocItems.length-1; i>=0; i--) {
                              n=tocItems[i];
                              if( isTabVisible(tabContainer,n)) {
                                sel = i;
                                continue;
                              }
                              
                              if( !isTabVisible(tabContainer,n) && sel != -1 ) {
                                  n.scrollIntoViewIfNeeded(true);
                                  break;
                              }
                          }
                      };
                      
                      // display the prev/next toc arrows, if required
                      var displayTocNavArrows = function(ev) {
                          var tabContainer = dojo.byId("tocTabsUL");
                          var tocItems = dojo.query("#tocTabsUL li");
                          var showBack = false, showFwd = false;
                          var sel=-1;
                          for( i=0; i<tocItems.length; i++) {
                              n=tocItems[i];
                              if( isTabVisible(tabContainer,n) && sel == -1) sel = i;
                              if( !isTabVisible(tabContainer,n)) {
                                if( !showBack) showBack = (i < sel || sel < 0);
                                if( !showFwd) showFwd = (i > sel && sel >= 0);
                              }
                          }
                          
                          if( showBack || showFwd)
                              dojo.removeClass("tabsArrowContainer","lotusHidden"); 
                          else 
                              dojo.addClass("tabsArrowContainer","lotusHidden");
                          
                          dojo.style( dojo.query("#prevToc span")[0], { "opacity":( showBack?"0.8":"0.3") });
                          dojo.style( dojo.query("#nextToc span")[0], { "opacity":( showFwd?"0.8":"0.3") });
                      };

                      
                      //------------------------------------------------------------------------------------
                      // create tab container and place all toc items as tabs under it
                      // set style for rounded tabs
                      dojo.place(
                          //"<style>#tocTabsUL li { border-radius:.5em .5em 0em 0em; }</style>"+
                          "<style>"+
                          '.lotusui30 .lotusTabCondensed .lotusTabs a,'+
                          '.lotusui30 .lotusTabCondensed .lotusTabs li, '+
                          '.lotusui30 .lotusTabCondensed .lotusTabs .lotusSelected a'+
                          '{ border-bottom: none; margin-right: 0; margin-left: 0;}'+
                          
                          '.lotusui30 .lotusTabCondensed .lotusTabs a'+
                          '{ bottom: 0px; height: 15px; padding-top: 11px; padding-left: 15px; padding-right: 15px;}'+
                          
                          '.lotusui30 .lotusTabCondensed .lotusTabs li:hover  '+
                          '{ background-color: #1f7cae; }'+     

                          '.lotusui30 .lotusTabCondensed .lotusTabs a:hover,  '+
                          '.lotusui30 .lotusTabCondensed .lotusTabs a:focus,  '+
                          '.lotusui30 .lotusTabCondensed .lotusTabs a:active,  '+
                          '.lotusui30 .lotusTabCondensed .lotusTabs .lotusSelected, '+
                          '.lotusui30 .lotusTabCondensed .lotusTabs .lotusSelected a,  '+
                          '.lotusui30 .lotusTabCondensed .lotusTabs .lotusSelected a:hover,  '+
                          '.lotusui30 .lotusTabCondensed .lotusTabs .lotusSelected a:focus,  '+
                          '.lotusui30 .lotusTabCondensed .lotusTabs .lotusSelected a:active, '+
                          '.lotusui30 .lotusTabs li.lotusSelected a,'+ 
                          '.lotusui30 .lotusTabs li.lotusSelected a:visited'+
                          '{ background-color: #1f7cae; color:white; }'+
                          
                          '.lotusui30 .tocScroll, .lotusui30 .tocScroll '+
                          '{ padding:7px 5px 7px 5px; border-left:1px solid #ccc;  }'+
                          
                          '.scrollOn'+
                          '{ background-color:#1f7cae; color:white; }'+
                          
                          '.scrollable'+
                          '{ opacity:.80 }'+
                          
                          '.easeInOut { transition: all 0.1s; -webkit-transition-timing-function:ease-in-out; }'+
                          "</style>",
                      dojo.doc.getElementsByTagName("head")[0], "last");

                      dojo.query( navElId+" li[role='button'").forEach(
                          function(n,i,x){
                              if( i==0) {  // first tab? create the UL
                                  dojo.place(
                                      "<div id='' class='lotusPlaceBar' style='background:white;'>"+
                                      "<div id='' class='lotusRightCorner' style='padding-right: 0px; height: 30px;'>"+
                                      "<div id='tocTabsDIV' class='lotusTabContainer lotusTabCondensed' style='position:absolute; left:0px; background:white; margin: 0 0 0 20px; border-bottom:0px; margin-right:60px;'>"+
                                      "<ul id='tocTabsUL' class='lotusTabs' style='border-bottom:0px; bottom:0px; height:30px; overflow:hidden; '/>"+
                                      "</div>"+
                                      "<div id='tabsArrowContainer' class='lotusHidden' style='float:right;'>"+
                                      "<div id='prevToc' class='tocScroll' style='float:left;' ><span class='lotusSprite lotusArrow lotusTwistyOpen' style='background-position-y:-310px'/></div>"+
                                      "<div id='nextToc' class='tocScroll' style='float:right;'><span class='lotusSprite lotusArrow lotusTwistyClosed'/></div>"+
                                      "</div>"+
                                      "</div>"+
                                      "</div>",
                                      ab, "after");
                              }
                              
                              addAsTab(n);
                              if( !isTabVisible("tocTabsUL",n) && dojo.hasClass(n,"lotusSelected")) {
                                  n.scrollIntoViewIfNeeded(true);
                              }
                          }
                      );

                      //------------------------------------------------------------------------------------
                      // create a subcommunities tab and make subcommunities toc a displayable block
                      var subComms = dojo.byId( ic_comm_communityUuid+"_comm_subLinks");
                      if( subComms ) {
                          var showSubComms = function() { dojo.addClass(subCommsTab, "lotusSelected"); dojo.style( subComms, { "top":(dojo.position("toggleShowSubCommsTab").y+30)+"px","left":dojo.position("toggleShowSubCommsTab").x+"px","opacity":"1","visibility":"visible"}); };
                          var hideSubComms = function() { dojo.removeClass(subCommsTab, "lotusSelected"); dojo.style( subComms, { "opacity":"0","visibility":"hidden","top":"-100px"}); };
                          var toggleShowSubComms = function() { if( dojo.hasClass( subComms, "lotusHidden")) showSubComms(); else hideSubComms(); };
                          
                          // deal with the title
                          subCommTitleNode = dojo.query("h3 div", subComms.parentNode )[0];
                          subCommsText = subCommTitleNode.textContent;
                          dojo.addClass( subCommTitleNode.parentNode.parentNode, "lotusHidden");

                          // deal with the block of subcomms
                          dojo.query(".lotusPlaceBar").style({ "z-index":"5"});
                          dojo.query("#lotusTitleBar").style({ "z-index":"5"});
                          
                          dojo.addClass(subComms, "easeInOut");
                          dojo.addClass( dojo.query("ul",subComms)[0], "lotusActionMenu");
                          dojo.style( subComms, { 
                              "position":"absolute",
                              "top":"-100px",
                              "left":"0px",
                              "z-index":"1",
                              "background":"white",
                              "visibility":"hidden"
                          });
                          dojo.place( subComms, dojo.query(".lotusPlaceBar")[0], "after");
                                     
                          dojo.place(
                              '<li id="toggleShowSubCommsTab" tabindex="-1">'+
																'<a href="javascript:void(0)" title="'+subCommsText+'" tabindex="-1" class="lotusTab"><b>'+subCommsText+
																	'<img alt="" src="'+dojo.config.blankGif+'" class="lotusArrow lotusDropDownSprite">'+
																'</b></a>'+
                              '</li>',
                              "tocTabsUL","append");
                          
                          var subCommsTab = dojo.byId("toggleShowSubCommsTab");
                          dojo.connect( subCommsTab, "onclick",  toggleShowSubComms);
                          dojo.connect( subCommsTab, "onmouseover", showSubComms);
                          dojo.connect( subCommsTab, "onmouseleave", hideSubComms);
                          dojo.connect( subComms, "onmouseover", showSubComms);
                          dojo.connect( subComms, "onmouseleave", hideSubComms);
                          
                          hideSubComms();
                      }
                      // end of subcommunities tab 
                      //------------------------------------------------------------------------------------

                      var tabScroller = function() {
                          displayTocNavArrows();

                          // hack, sometimes on resize the tab container does not scroll all the way up for some reason...
                          var el = dojo.byId("tocTabsUL");
                          if(el && el.scrollTop > 0 && el.scrollTop < 5)  
                              setTimeout( function(){ 
                                  dojo.byId("tocTabsUL").scrollTop = 0; 
                                  displayTocNavArrows();
                              }, 10);
                      };
                      window.onresize = tabScroller;
                      
                      dojo.connect( dojo.byId("nextToc"), "onmouseover", function(ev){ dojo.addClass("nextToc", ( parseFloat( dojo.style( dojo.query("#nextToc span")[0],"opacity")) >= 0.80? "scrollOn":"")); });
                      dojo.connect( dojo.byId("prevToc"), "onmouseover", function(ev){ dojo.addClass("prevToc", ( parseFloat( dojo.style( dojo.query("#prevToc span")[0],"opacity")) >= 0.80? "scrollOn":"")); });
                      dojo.connect( dojo.byId("nextToc"), "onmouseout", function(ev){ dojo.removeClass("nextToc","scrollOn"); });
                      dojo.connect( dojo.byId("prevToc"), "onmouseout", function(ev){ dojo.removeClass("prevToc","scrollOn"); });
                      dojo.connect( dojo.byId("nextToc"), "onclick", function(ev){ displayNextTabRow(); displayTocNavArrows(); });
                      dojo.connect( dojo.byId("prevToc"), "onclick", function(ev){ displayPrevTabRow(); displayTocNavArrows(); });
                      displayTocNavArrows();
                      
                      
                  } catch(ex) {
                      alert("comm nav cleanup error: TABS: "+ex);
                  }
              }, navElId );
                          
      } catch(ex) {
          alert("comm nav cleanup error: MAIN: "+ex);
      }
      
   });
}


