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
// @name         commNavHamburgerIBMUXv3
// @version      0.1
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

         // HELPER VARIABLES
         var isSubCommunity = function(){ return( (typeof(parentResourceId) != "undefined" && parentResourceId != null) || dojo.query("h3 .lotusIndent15.communityLink").length ); };
         var navElId = ( location.href.indexOf("/communities/") > 0? "#lotusNavBar" :"#bizCardNav"); // communities draws toc via jsp, other apps via bizcard
         
          waitFor(
              function(){
                  try {
                      if( !ic_comm_communityUuid || ic_comm_communityUuid == "") return;

                      var menuTopHiddenInt = -3000;
                      var menuTopHidden = menuTopHiddenInt.toString()+"px";
                      var initialShowDelay = 1500;
                      
					  var webresources = lconn.core.config.services.webresources.url;
					  var webresourcesRoot = webresources.substring(webresources.indexOf(".com/")+4);
					  
                      // shark fin img
                      var hamburgerImgUrl = webresourcesRoot+"/web/com.ibm.lconn.core.styles.oneui3/images/lotusSprite-32bit.png";
                      var hamburgerImgPos = "6px -510px"; 
                      var hamburgerImgDim = "height:32px; width:25px;";

                      // hamburger img
                      //var hamburgerImgUrl = webresourcesRoot + "/web/com.ibm.social.gen4.theme/sprite/sprite16.png";
                      //var hamburgerImgPos = "-639px 8px"; 
                      //var hamburgerImgDim = "height:32px; width:19px;";
                      
                      var hamburgerPlacement = "second";
                      
                      // show/hide functions
                      var hideHamburgerMenu = function(id) { 
                          if(!id || !dojo.byId(id)) return;
                          // dojo.style("hamburgerMenu", { "top":"-3000px" }); 
                          dojo.style(id, {"opacity":"0","visibility":"hidden"});
                      };
                      var showHamburgerMenu = function(id) { 
                          if(!id || !dojo.byId(id)) return;
                          //var p = dojo.position("hamburgerContainer");
                          //if(p) dojo.style("hamburgerMenu", { "top":(p.h+p.y)+"px", "left":(p.x)+"px" }); // this is for when position of menu is fixed...
                          //if(p) dojo.style("hamburgerMenu", { "top":"-3px", "left":"-10px" }); // this is for when position of menu is relative
                          dojo.style(id, {"opacity":"1","visibility":"visible"});
                      };
                      var toggleHamburgerMenu = function(id) { 
                          if(!id || !dojo.byId(id)) return;
                          if(dojo.style(id,'visibility') == 'hidden') showHamburgerMenu(id); else hideHamburgerMenu(id); 
                      };
                      
                      var updateHamburgerTitle = function(id) { if(dojo.byId(id)) dojo.byId(id).innerHTML = dojo.trim(dojo.query("li.lotusSelected a",menu)[0].textContent); };
                      var updateHamburgerTitle2 = function(id) { if(dojo.byId(id)) dojo.byId(id).innerHTML = (isSubCommunity()? "back...":"Subcommunities"); };
                 
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
                      if(dojo.byId("hamburger") == null) {
                          dojo.place( 
                              '<style>'+
                              "#hamburgerContainer, #hamburgerContainer2 { border:3px solid rgb(40,40,40); background-color:#2e3033; padding-left:9px; margin:0 30px 2px 30px; padding-top:0px; padding-right:1px; height:32px; border-radius:0.5em; }"+
                              "#hamburgerContainer:hover, #hamburgerContainer2:hover { border-color:white; background-color:#54575C; }"+
                              "#hamburgerTitle, #hamburgerTitle2 { float:left; padding-top:8px; }"+
                              "#hamburger, #hamburger2 { position:relative; top:0px; left:1px; margin-left:10px; float:right; z-index:5; background-image:url("+hamburgerImgUrl+"); background-position:"+hamburgerImgPos+"; background-repeat:no-repeat; /*background-color:#1f7cae;*/ "+hamburgerImgDim+" }"+
                              "</style>"+
                              '<div id="hamburgerContainer"><div id="hamburgerTitle"></div><div id="hamburger" class="hamburger"></div></div>', 
								menu, "before");
                      
                          // if we have subcommunities, create another menu button out of it */
                          dojo.place(
                              '<div id="hamburgerContainer2" class="'+(isSubCommunity()?' lotusHidden':'')+'"><div id="hamburgerTitle2"></div><div id="hamburger2"></div><div id="hamburgerMenu2" style="z-index:5"></div></div>', 
                              menu, "before");
                          
                          var subcomm = dojo.byId("subcommArea");
                          if(subcomm) {
                              dojo.place( subcomm, "hamburgerMenu2", "first");
                              dojo.query( "h3", subcomm).addClass("lotusHidden");
                              dojo.query( "ul", subcomm).style({"list-style-type":"none","padding-left":"15px"});
                          }                          
                      }

                      // place toc menu as a sliding item and style it
                      dojo.place(
                          "<style>"+
                              "#hamburgerMenu, #hamburgerMenu2 { transition:all 0.10s; -webkit-transition-timing-function:ease-in-out; overflow:hidden; }"+
							  "#hamburgerMenu, #hamburgerMenu2 { opacity:0; position:relative; top:-1px; left:-12px; width:149px; z-index:6; background-color:#f0f0f0; border:3px solid rgb(202,202,202); }"+
                              "#hamburgerMenu:hover, #hamburgerMenu2:hover { border-color:white; }"+
                           "</style>"+
                           "<style>"+    
                              '.lotusui30 .lotusMenu2 .lotusMenuHeader .lotusHeading,'+
                              '.lotusui30 .lotusMenu2 h3,'+
                              '.lotusui30 .personinlinemenu .lotusMenu2 .lotusMenuHeader .lotusHeading,'+
                              '.lotusui30 .personinlinemenu .lotusMenu2 h3'+
                              '{ font-weight:bold; text-shadow:none; color:#666; }'+ 
                              
                              '.lotusui30 .lotusMenu2 .lotusMenuSubsection li a:before,'+ 
                              '.lotusui30 .personinlinemenu .lotusMenu2 .lotusMenuSubsection li a:before'+ 
                              '{ content:none; }'+                          
                              
                              '.lotusui30 .lotusMenu2 .lotusMenuSubsection li a,'+
                              '.lotusui30 .personinlinemenu .lotusMenu2 .lotusMenuSubsection li a, '+
                              
                              '.scloud3 .lotusMenu2 .lotusMenuSubsection ul[aria-labelledby="communityName"] li a, .scloud3 .vcomm .lotusMenu2 .lotusMenuSubsection li a'+
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
                              '.lotusui30 .personinlinemenu .lotusMenu2 .lotusMenuSubsection .lotusHeaderSelected, '+
    
                              '.scloud3 .lotusMenu2 .lotusMenuSubsection ul[aria-labelledby="communityName"] li a:hover, .scloud3 .vcomm .lotusMenu2 .lotusMenuSubsection li a:hover'+
    
                              '{ font-weight:normal; text-shadow:none; color:#fff; border:0; }'+
                              
                              '.lotusui30 .lotusMenu2 .lotusMenuSubsection li a:hover, '+
                              '.lotusui30 .personinlinemenu .lotusMenu2 .lotusMenuSubsection li a:hover '+
                              '{ color:#fff; }'+  
                          "</style>",
                          menu, "before"); //dojo.doc.getElementsByTagName("head")[0], "last"); 
                      
                      var hm = dojo.byId("hamburgerMenu");
                      if(hm) {
                          dojo.addClass( hm, "lotusMenu2");
                          dojo.place( hm, "hamburgerContainer","last");
                          updateHamburgerTitle("hamburgerTitle");
                          hideHamburgerMenu("hamburgerMenu");
                      }
                      
                      
                      var hm2 = dojo.byId("hamburgerMenu2");
                      if(hm2) {
                          dojo.addClass( hm2, "lotusMenu2");
                          dojo.place( hm2, "hamburgerContainer2", "last");
                          updateHamburgerTitle2("hamburgerTitle2");
                          hideHamburgerMenu("hamburgerMenu2");
                      } 
                      
                       
                      // dojo.style("lotusMain", { "overflow-y":"visible","overflow-x":"inherit" }); // make sure the menu's vertical overflow is not hidden 
                      dojo.style(dojo.query(".lotusMain")[0], { "min-height":"1000px" }); // make sure the menu's vertical overflow is not hidden 
                      
                      // connect the menu hider to all TOC items so that it hides immediately on click as some of the options fire off a xhr request without reloading a page
                      dojo.query("#hamburgerMenu li").connect("onclick", function(){ updateHamburerTitle(); });
                      setTimeout( function(){ hideHamburgerMenu("hamburgerMenu"); }, initialShowDelay);  // hide menu after initial show 

                      // connect show/hide all hamburgerContainers to mouse events
                      dojo.connect(dojo.byId("hamburgerContainer"), "onclick", function(evt){ toggleHamburgerMenu( "hamburgerMenu"); });
                      dojo.query("div[id^='hamburger']",dojo.byId("hamburgerContainer")).connect( "onclick", function(evt){ toggleHamburgerMenu( "hamburgerMenu"); });
                      
                      dojo.connect(dojo.byId("hamburgerContainer2"), "onclick", function(evt){ toggleHamburgerMenu( "hamburgerMenu2"); });
                      dojo.query("div[id^='hamburger']",dojo.byId("hamburgerContainer2")).connect( "onclick", function(evt){ toggleHamburgerMenu( "hamburgerMenu2"); });


                      
                     // tweak some styles to allow for blue block hamburger; eat any exceptions
                      try {
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
                          alert("comm card hamburger error in tweaks:"+ex);
                      }
                      

                  } catch(ex) {
                      alert("comm card hamburger error:"+ex);
                  }
                  
              }, "#"+ic_comm_communityUuid+"_twisty");

      } catch(ex) {
          alert("comm card hamburger error:MAIN:"+ex);
      }
      
   });
}
