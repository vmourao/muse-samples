var injectHtml = '<div id="onedriveSection" class="lotusWidget2" widgetid="onedrive" role="region" aria-labelledby="onedriveId">                        ' +
                 '	<h2 style="cursor: default">                                                                                                      ' +
                 '		<span class="lotusAltText">▼</span></a><span class="ibmDndDragHandle" id="onedriveId">Network</span>                          ' +
                 '	</h2>                                                                                                                             ' +
                 '  <div id="onedriveSubArea" style="-webkit-user-select: auto;" widgetloaded="true" widgetneedrefresh="false">                           ' +
                 '	  <div id="onedrive">                                                                                                               ' +
                 '		  <div class="onedrive Content view">                                                                                           ' +
                 '		  	<iframe border="0" height="500" width="100%" src="https://localhost:9002/communityapp/filelist/index?jwt=eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJpby5hcHBzcG9rZXMuaHViIiwibmJmIjoxNDkzMzAyNDc2LCJleHAiOjE0OTMzMzEyNzYsInN1YiI6IiIsImNvbnRleHQiOnsidXNlciI6eyJjdXN0b21lcklkIjoiMjAwOTcxMDYzIiwiaWJtVXNlcklkIjoiMjAwOTcxMDY0In0sImRhdGEiOnsic291cmNlIjp7InJlc291cmNlSWQiOiI1YjQ5NGZhZS0wYWY5LTQ1YzctYTgxMC0yYmFiYjNiNjM0MmEiLCJyZXNvdXJjZU5hbWUiOiJPbmVEcml2ZSBmb3IgQnVzaW5lc3MiLCJyZXNvdXJjZVR5cGUiOiJjb21tdW5pdHkiLCJ3aWRnZXRJbnN0YW5jZUlkIjoiVzIxZDRkMDFmZjViN180NjQ2X2FiYWFfODFmYmRiNDRjM2IzIiwib3JnSWQiOiIyMDA5NzEwNjMifSwidXNlciI6eyJ1c2VySWQiOiIyMDA5NzEwNjQiLCJvcmdJZCI6IjIwMDk3MTA2MyIsImRpc3BsYXlOYW1lIjoiTWFyY2ggMjAxNyIsImVtYWlsIjoibWFyY2gyMDE3QGRhdmlkc2ltcHNvbi5tZSJ9LCJleHRyYUNvbnRlbnQiOnsiY2FuQ29udHJpYnV0ZSI6InRydWUiLCJjYW5QZXJzb25hbGl6ZSI6InRydWUifX19fQ.8zrUSUZnfoVeSrzFDIgLUaviO187wGc-Ne0dXsz_HkdfjpMXYvbP3uKRb7phZWqGdDFHBgtc1fftc7O2VzO84g"></iframe>' + 
                 '	  	</div>                                                                                                                        ' +
                 '	  </div>                                                                                                                            ' +
                 '  </div>                                                                                                                                ' +
                 '</div>                                                                                                                              ' ;










////
// @author Tony McGuckin, IBM
// @name Profiles Customization
// @version 0.1
// @date February, 2017
//
if(typeof(dojo) != "undefined") {
    dojo.place(
        "<link rel=\"stylesheet\" type=\"text/css\" href=\"/files/muse-static/samples/profiles/profilesCustomization.css\"></link>",
        dojo.doc.head,
        "last"
    );
    
    
    	require(["dojo/domReady!"], function(){
        try {
            // utility function to let us wait for a specific element of the page to load...
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

            // here we use waitFor to wait on the .lotusStreamTopLoading div.loaderMain.lotusHidden element
            // before we proceed to customize the page...
            waitFor( function(){                
                dojo.place(injectHtml,
                    dojo.byId("widget-container-col3").value,
                    "first"
                );

            }, "div#widget-container-col3");

      } catch(e) {
          alert("Exception occurred in helloWorld: " + e);
      }
   });	
}
