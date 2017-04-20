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
// @name         commNavHamburgerIBMUX
// @version      0.17
// @description  *** PROTOTYPE CODE *** changes a community's toc nav into a hamburger style menu
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
            if(!maxInter) var maxInter = 100;  // number of intervals before expiring
            if(!waitTime) var waitTime = 10;  // 1000=1 second
            if(!elXpath) return;
            
            var waitInter = 0;  // current interval
            var intId = setInterval( function(){
               if (++waitInter<maxInter && !dojo.query(elXpath).length) return;
               clearInterval(intId);
               callback();
            }, waitTime);
         };
         
          waitFor(
              function(){
                  try {
                      if( !ic_comm_communityUuid || ic_comm_communityUuid == "") return;

                      var menuTopHiddenInt = -3000;
                      var menuTopHidden = menuTopHiddenInt.toString()+"px";
                      var initialShowDelay = 1500;
                      
					  var webresources = lconn.core.config.services.webresources.url;
					  var webresourcesRoot = webresources.substring(webresources.indexOf(".com/")+4);
					  
                      // shark fin
                      var hamburgerImgUrl = webresourcesRoot + "/web/com.ibm.lconn.core.styles.oneui3/images/lotusSprite-32bit.png";
                      var hamburgerImgPos = "6px -510px"; 
                      var hamburgerImgDim = "height:32px; width:25px;";

                      // hamburger
                      //var hamburgerImgUrl = webresourcesRoot + "/web/com.ibm.social.gen4.theme/sprite/sprite16.png";
                      //var hamburgerImgPos = "-639px 8px"; 
                      //var hamburgerImgDim = "height:32px; width:19px;";
                      
                      var hamburgerPlacement = "second";
                      
                      // show/hide functions
                      var hideHamburgerMenu = function() { dojo.style("hamburgerMenu", "top", "-3000px"); };
                      var showHamburgerMenu = function() { 
                          var p = dojo.position("hamburger");
                          if(p) dojo.style("hamburgerMenu", { "top":(p.h+p.y)+"px", "left":(p.x)+"px" }); 
                      };
                      var toggleHamburgerMenu = function() { if(dojo.style('hamburgerMenu','top') <= -3000) showHamburgerMenu(); else hideHamburgerMenu(); };
                 
                      // get the toc 
                      var menu = dojo.query(".lotusMenu")[0];
                      if(!menu) return;
                      dojo.attr( menu, "id", "hamburgerMenu");
                      
                      // get the title bar
                      var titleBar = dojo.query(".lotusPlaceBar .lotusRightCorner .lotusInner")[0];
                      if(!titleBar) return;

                      // hack:
                      // make a copy of the lotusPlaceBar and change the lotusPlaceBar id so that wikis does not recreate it...
                      //
                      // while in a wiki, clicking the wiki toc pages forces a recreation of the lotusPlaceBar node in order to redo the Following Actions menu, 
                      // thus we loose all the mods made under that node
                      if( location.href.indexOf("/wikis/") > 0 && dojo.byId("lotusPlaceBar")) {
                          dojo.place( "<div id='lotusPlaceBarHidden' class='lotusHidden' />", "lotusPlaceBar", "after");
                          var origPlaceBar = dojo.clone( dojo.byId("lotusPlaceBar"));
                          
                          dojo.attr( dojo.byId("lotusPlaceBar"), "id", "lotusPlaceBar2");
                          dojo.place( origPlaceBar, "lotusPlaceBarHidden", "first");
                      }
                      
                      
                      // place hamburger on the title bar and style it
                      var createHamburger = function( onNode, pos) {
                          var titleBar = dojo.query(".lotusPlaceBar .lotusRightCorner .lotusInner")[0];
                          
                          if(dojo.byId("hamburger") == null) {
                              dojo.place( 
                                  '<style>'+
																		"#hamburger { position: relative; top:0px; left:1px; margin-left:10px; float:left; z-index:5; background-image: url("+hamburgerImgUrl+"); background-position:"+hamburgerImgPos+"; background-repeat: no-repeat; background-color: #1f7cae; "+hamburgerImgDim+" }"+
                                  "</style>"+
                                  '<div id="hamburger"></div>', onNode, pos);
                          }
                      };
                      createHamburger( titleBar, hamburgerPlacement);
                      
                      
                      // place toc menu as a sliding item and style it
                      var p = dojo.position("hamburger");
                      dojo.place(
                          "<style>"+
                          "#hamburgerMenu { transition: top 0.25s; -webkit-transition-timing-function:ease-in-out; overflow:hidden; }"+
                          "#hamburgerMenu { position:fixed; top:"+(p.h+p.y-3)+"px; left:"+(p.x)+"px;"+" width:250px; z-index:5; background-color:#f0f0f0; border:1px solid rgb(202, 202, 202); /*opacity:0.95;*/ }"+

                          '.lotusui30 .lotusMenu2 .lotusMenuHeader .lotusHeading,'+
                          '.lotusui30 .lotusMenu2 h3,'+
                          '.lotusui30 .personinlinemenu .lotusMenu2 .lotusMenuHeader .lotusHeading,'+
                          '.lotusui30 .personinlinemenu .lotusMenu2 h3'+
														'{ font-weight:bold; text-shadow:none; color:#666; }'+ 
                          
                          '.lotusui30 .lotusMenu2 .lotusMenuSubsection li a:before,'+ 
                          '.lotusui30 .personinlinemenu .lotusMenu2 .lotusMenuSubsection li a:before'+ 
                          '{ content: none; }'+                          
                          
                          '.lotusui30 .lotusMenu2 .lotusMenuSubsection li a,'+
                          '.lotusui30 .personinlinemenu .lotusMenu2 .lotusMenuSubsection li a '+
                          '{ font-weight:normal; text-shadow:none; color:#666; }'+ 

                          '.lotusui30 .lotusMenu2 li a:active,'+
                          '.lotusui30 .lotusMenu2 li.lotusSelected a,'+
                          '.lotusui30 .lotusMenu2 li.lotusSelected a:visited,'+
                          '.lotusui30 .lotusMenu2 li.lotusSelected a:hover,'+
                          '.lotusui30 .lotusMenu2 li.lotusSelected a:focus,'+
                          '.lotusui30 .lotusMenu2 li.lotusSelected a:active,'+
                          '.lotusui30 .lotusMenu2 .lotusHeaderSelected, '+
                          
                          '.lotusui30 .personinlinemenu .lotusMenu2 li a:active,'+
                          '.lotusui30 .personinlinemenu .lotusMenu2 li.lotusSelected a,'+
                          '.lotusui30 .personinlinemenu .lotusMenu2 li.lotusSelected a:visited,'+
                          '.lotusui30 .personinlinemenu .lotusMenu2 li.lotusSelected a:hover,'+
                          '.lotusui30 .personinlinemenu .lotusMenu2 li.lotusSelected a:focus,'+
                          '.lotusui30 .personinlinemenu .lotusMenu2 li.lotusSelected a:active,'+
                          '.lotusui30 .personinlinemenu .lotusMenu2 .lotusHeaderSelected,'+
                          
                          '.lotusui30 .lotusMenu2 .lotusMenuSubsection li a:active,'+
                          '.lotusui30 .lotusMenu2 .lotusMenuSubsection li.lotusSelected a,'+
                          '.lotusui30 .lotusMenu2 .lotusMenuSubsection li.lotusSelected a:visited,'+
                          '.lotusui30 .lotusMenu2 .lotusMenuSubsection li.lotusSelected a:hover,'+
                          '.lotusui30 .lotusMenu2 .lotusMenuSubsection li.lotusSelected a:focus,'+
                          '.lotusui30 .lotusMenu2 .lotusMenuSubsection li.lotusSelected a:active,'+

                          '.lotusui30 .personinlinemenu .lotusMenu2 .lotusMenuSubsection li a:active,'+
                          '.lotusui30 .personinlinemenu .lotusMenu2 .lotusMenuSubsection li.lotusSelected a,'+
                          '.lotusui30 .personinlinemenu .lotusMenu2 .lotusMenuSubsection li.lotusSelected a:visited,'+
                          '.lotusui30 .personinlinemenu .lotusMenu2 .lotusMenuSubsection li.lotusSelected a:hover,'+
                          '.lotusui30 .personinlinemenu .lotusMenu2 .lotusMenuSubsection li.lotusSelected a:focus,'+
                          '.lotusui30 .personinlinemenu .lotusMenu2 .lotusMenuSubsection li.lotusSelected a:active,'+
                          '.lotusui30 .personinlinemenu .lotusMenu2 .lotusMenuSubsection .lotusHeaderSelected '+
                          '{ font-weight:normal; text-shadow:none; color:#fff; border:0; }'+
                          
                          '.lotusui30 .lotusMenu2 .lotusMenuSubsection li a:hover, '+
                          '.lotusui30 .personinlinemenu .lotusMenu2 .lotusMenuSubsection li a:hover '+
                          '{ color:#fff; }'+  

                          "</style>",
                          menu, "before"); //dojo.doc.getElementsByTagName("head")[0], "last"); 
                      
                      // tweak some styles to allow for blue block hamburger; eat any exceptions
                      try {
													if( dojo.byId("hamburgerMenu")) dojo.addClass( dojo.byId("hamburgerMenu"), "lotusMenu2");

                          if( dojo.query(".lotusFrame .lotusPlaceBar").length) dojo.style( dojo.query(".lotusFrame .lotusPlaceBar")[0], { "border-bottom":"0px", "z-index":"10" });
                          if( dojo.byId("lotusTitleBar")) dojo.style( dojo.byId("lotusTitleBar"), { "z-index":"10" });
                          
                          if( dojo.query(".lotusPlaceBar .lotusRightCorner .lotusInner").length) dojo.style( dojo.query(".lotusPlaceBar .lotusRightCorner .lotusInner")[0], { "padding":"0px","border-bottom":"1px solid #CACACA" });
                          if( dojo.query(".lotusPlaceBar .lotusRightCorner .lotusInner h2").length) dojo.style( dojo.query(".lotusPlaceBar .lotusRightCorner .lotusInner h2")[0], { "padding":"5px 0 5px" });
                          
                          if( dojo.query("#communityActions").length) dojo.style( dojo.query("#communityActions")[0], { "padding":"8px" });
                          if( dojo.query("#lotusTitleBar").length) dojo.style( dojo.query("#lotusTitleBar")[0],{ "z-index":"10", "position":"relative" });
                          
	                        if( dojo.query(".lotusMenu #"+ic_comm_communityUuid+"_twisty").length) dojo.destroy(dojo.query(".lotusMenu #"+ic_comm_communityUuid+"_twisty")[0]); // remove twisty
                          
                          if( dojo.query(".lotusMenu table").length) dojo.query(".lotusMenu table").style("width","225px"); // more room for title

                          // ensure menu is never collapsed/hidden
                          if(  dojo.query(".lotusMenuSubsection", menu).length) {
                             var menuSub = dojo.query(".lotusMenuSubsection", menu)[0];
                             if( menuSub && dojo.style( menuSub, "display") == "none") 
                                 dojo.style( menuSub, { "display":"block" });
                          }
                          
                      } catch(ex) { 
                      }
                      
                      
                      // connect show/hide to mouse events
                      var hideHMtimeout = null;
                      var h = dojo.byId("hamburger");
                      var hm = menu;
                      dojo.connect( h, "onclick", toggleHamburgerMenu);
                      dojo.connect( h, "onmouseover", showHamburgerMenu);
                      //dojo.connect( h, "onmouseleave", function(ev){ hideHMtimeout = setTimeout( function(ev){ hideHamburgerMenu(); }, 250); });
                      dojo.connect( h, "onmouseleave", hideHamburgerMenu);
                      
                      dojo.connect( hm, "onmouseleave", hideHamburgerMenu);
                      //dojo.connect( hm, "onmouseenter", function(ev){ if(hideHMtimeout != null) clearTimeout(hideHMtimeout); showHamburgerMenu(); });
                      dojo.connect( hm, "onmouseover", showHamburgerMenu);

                      
                      // dojo.style("lotusMain", { "overflow-y": "visible","overflow-x": "inherit" }); // make sure the menu's vertical overflow is not hidden 
                      dojo.style(dojo.query(".lotusMain")[0], { "min-height": "1000px" }); // make sure the menu's vertical overflow is not hidden 
                      
                      // connect the menu hider to all TOC items so that it hides immediately on click as some of the options fire off a xhr request without reloading a page
                      dojo.query("#hamburgerMenu li").connect("onclick", function(){ 
                          setTimeout( function(){ hideHamburgerMenu(); }, 500); // hide briefly after clicking it
                      });
                      
                      setTimeout( function(){ hideHamburgerMenu(); }, initialShowDelay);  // hide menu after initial show 

                  } catch(ex) {
                      alert("comm card hamburger error: "+ex);
                  }
                  
              }, "#"+ic_comm_communityUuid+"_twisty");

      } catch(ex) {
          alert("comm card hamburger error: MAIN: "+ex);
      }
      
   });
}
