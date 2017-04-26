// ==UserScript==
// @name         WatsonWorkspace - Status
// @namespace    WatsonWorkspace-Status
// @version      0.1
// @description  Post Connections Status to WatsonWorkspace!
// @author       You
// @match        https://apps.na.collabserv.com/homepage/web/updates/*
// @grant          GM_xmlhttpRequest
// ==/UserScript==

(function() {
    if(!dojo) {
        return;
    }

    const _logger = data => console.log('****** ', data, ' ********');

    const onCheck = () => {
        const email = gllConnectionsData.caller;
        _logger(email);
        const editor = dijit.byId('lconn_news_microblogging_sharebox_InputForm_0_textBoxContainer');
        _logger(editor);
        const button = dijit.byId('lconn_news_microblogging_sharebox_InputForm_0_myactions');
        _logger(button);
        if(!email || !editor || !button) {
            setTimeout(onCheck, 1000);
            return;
        }
        dojo.connect(button.postButtonNode, "onclick", e => {
            _logger('CLICKED');
            const text = editor.getText();
            if(text && text.length) {
                const data = JSON.stringify({ email, text });
                _logger(data);
                var xhrArgs = {
    		 url: "/files/muse-static/",
    		 postData: data,
    		 handleAs: "text",
    		 headers: { "Content-Type": "text/plain", "muse-workspace":"gateway"},
    		 load: function(data){
    		       console.log(data)
    		  },
    		  error: function(error){
    		    	console.log(error)
    		  }
    		}

    	var deferred = dojo.xhrPost(xhrArgs);  
            }
        });
    };

    dojo.addOnLoad(onCheck);
})();