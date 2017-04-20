// ==UserScript==
// @name         DoEverythingForMe
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Simple chat dialog interface for Watson Conversation service
// @author       Nikolay Vlasov
// @match        https://*.collabserv.com/*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @unwrap
// ==/UserScript==

var DEFM = {
    windowWidth: 0,
    windowHeight: 0,

    currentURL: window.location.href.split('/'),

    Config: {
        apiServer: 'https://ics-watson-chatbot.mybluemix.net',                 //Server name with NodeJS application
        apiURL: '/message',                                                 //Path to the proxying API on NodeJS server
        resourceServer: 'https://ics-watson-chatbot.mybluemix.net',            //Server name with all the static resources
        connectionsServer:'https://' + window.location.href.split('/')[2],  
        profilesApiUrl: '/profiles/atom/profileEntry.do?userid=',           
        filesApiUrl: '/files/basic/api/myuserlibrary/feed',
        filesUiUrl: '/files/app/file/',
        disableTriggerButtons: false,                                       //Flag to disable or enable conversation buttons

        conversation: {
            action:''
        },
        user:{
            userId: '',
            avatarImageURL: '',
            firstName: '',
            lastName: '',
            email: ''
        },
        files:{
            fileId: '',
            fileName: ''
        }
    },

    Message: {
        input:{
            text:""
            },
        context:{
                system:{
                    dialog_stack:["root"],
                    dialog_turn_counter:1,
                    dialog_request_counter:1,
                    },
                fileOpen: false,
                service: window.location.href.split('/')[3],
                connectionsServer: 'https://' + window.location.href.split('/')[2]
            }
    },

    //Showing a list of buttons that will trigger some actions, for example a list
    // of suggested questions that bot is trained to answer or
    // just simple answers like 'yes' and 'no'.

    showTriggerButtons: function(triggers){

        //DEFM.keywords = [];
        // triggers object example: [{name: 'Files', keywords: 'share file'}, {name: 'Status Update', keywords: 'share status'}]

        if(document.getElementById('triggerButtons')){
            DEFM.removeTriggerButtons();
        }

        var allButtonsHTML = '<li class="defm-left defm-clearfix" id="triggerButtons">';

        for (var i = 0; i < triggers.length; i++){
            //console.log('In Forst Loop: ' + triggers[i].name.replace(/\s+/g, '') +' '+ );
            allButtonsHTML += '<button class="defm-btn defm-btn-warning defm-btn-sm" style="margin-right: 1px; margin-bottom: 1px;" id="btn-' + triggers[i].name.replace(/\s+/g, '') + '">' + triggers[i].name + '</button>';
        }

        allButtonsHTML += '</li>';

        document.getElementsByClassName('defm-chat')[0].insertAdjacentHTML( 'beforeend', allButtonsHTML );

        for (var j = 0; j < triggers.length; j++){
            var btnId = 'btn-' + triggers[j].name.replace(/\s+/g, '');
            //DEFM.keywords[btnId] = triggers[j].keywords;
            //var keywords = triggers[j].keywords.toString();
            //console.log('Keywords: ' + DEFM.keywords[btnId]);
            if(triggers[j].keywords == 'share file'){
                 document.getElementById(btnId).addEventListener('click', function(){ DEFM.sendMsg('share file', true); DEFM.removeTriggerButtons();}, false);
            } else if(triggers[j].keywords == 'share status') {
                 document.getElementById(btnId).addEventListener('click', function(){ DEFM.sendMsg('share status', true); DEFM.removeTriggerButtons();}, false);
            } else if(triggers[j].keywords == 'yes') {
                 document.getElementById(btnId).addEventListener('click', function(){ DEFM.sendMsg('yes', true); DEFM.removeTriggerButtons();}, false);
            } else if(triggers[j].keywords == 'no') {
                 document.getElementById(btnId).addEventListener('click', function(){ DEFM.sendMsg('no', true); DEFM.removeTriggerButtons();}, false);
            } else if(triggers[j].keywords == 'existing') {
                 document.getElementById(btnId).addEventListener('click', function(){ DEFM.sendMsg('existing', true); DEFM.removeTriggerButtons();}, false);
            } else if(triggers[j].keywords == 'new') {
                 document.getElementById(btnId).addEventListener('click', function(){ DEFM.sendMsg('new', true); DEFM.removeTriggerButtons();}, false);
            }
            //document.getElementById(btnId).addEventListener('click', function(){ DEFM.sendMsg(keywords, true); DEFM.removeTriggerButtons();}, false);
        }

        document.getElementsByClassName('defm-panel-body')[0].scrollTop = document.getElementsByClassName('defm-panel-body')[0].scrollHeight;

    },

    removeTriggerButtons: function(){
        var element = document.getElementById('triggerButtons');
        
       //Animation Start
        var to = 1;
        var options = {
                duration: 1000,
                delta: function(progress) {
                    progress = this.progress;
                    return 0.5 - Math.cos(progress * Math.PI) / 2;
                },
                complete: function() {
                    element.parentNode.removeChild(element);
                },
                step: function(delta) {
                    element.style.opacity = to - delta;
                },
                delay: 10
            };
        var start = new Date();
        var id = setInterval(function() {
            var timePassed = new Date() - start;
            var progress = timePassed / options.duration;
            if (progress > 1) {
                progress = 1;
            }
            options.progress = progress;
            var delta = options.delta(progress);
            options.step(delta);
            if (progress == 1) {
                clearInterval(id);
                options.complete();
            }
        }, options.delay || 10);
    },


    toggleButton: function(){
        var elementId = 'chatButton';
        var elementChatButton = document.getElementById(elementId);

        if(elementChatButton.style.display == "none"){
            elementChatButton.style.display = "inline";
        } else {
            elementChatButton.style.display = "none";
        }
    },

    toggleChat: function(){
        var elementId = 'chatPanel';
        var elementChatPanel = document.getElementById(elementId);

        if(document.getElementById(elementId) === null){
            var chatHTML = '<div id="chatPanel" class="defm-chat-panel defm-panel defm-panel-default" style="display:inline; position: fixed; top: '+ (DEFM.windowHeight - 500) +'px; left: '+ (DEFM.windowWidth - 360) +'px; margin-right: 15px; z-index:10001">' +
                        '<div class="defm-panel-heading">' +
                                ' Chat' +
                                '<div class="defm-btn-group defm-pull-right">' +
                                    '<button id="btn-close" type="button" class="defm-btn defm-btn-default defm-btn-xs defm-btn-close" aria-expanded="false">' +
                                        '<img alt="Close" src="' + DEFM.Config.connectionsServer + '/connections/resources/web/com.ibm.lconn.core.styles.oneui3/images/blank.gif?etag=20160903.134200">' +
                                        '<span class="lotusAltText">X</span>' +
                                    '</button>' +
                                '</div>' +
                            '</div>' +
                            '<!-- /.panel-heading -->' +
                            '<div class="defm-panel-body">' +
                                '<ul class="defm-chat">' +
//                                    '<li class="defm-left defm-clearfix">' +
//                                        '<span class="defm-chat-img defm-pull-left">' +
//                                            '<img src="'+ DEFM.Config.resourceServer +'/images/icon2.png" alt="User Avatar" class="defm-img-circle">' +
//                                        '</span>' +
//                                        '<div class="defm-chat-body defm-clearfix">' +
//                                            '<div class="defm-header">' +
//                                                '<strong class="primary-font">Watson</strong>' +
//                                            '</div>' +
//                                            '<p>' +
//                                                'Hi, '+ DEFM.Config.user.firstName +'. How can I help you?' +
//                                            '</p>' +
//                                        '</div>' +
                                    '</li>' +
                                '</ul>' +
                            '</div>' +
                            '<!-- /.panel-body -->' +
                            '<div class="defm-panel-footer">' +
                                '<div class="defm-input-group">' +
                                    '<input id="btn-input" type="text" autofocus class="defm-form-control defm-input-sm" placeholder="Type your message here..." style="position: relative; z-index: 10001;">' +
                                    '<span class="defm-input-group-btn">' +
                                        '<button class="defm-btn defm-btn-warning defm-btn-sm defm-btn-send" id="btn-chat">' +
                                            'Send' +
                                        '</button>' +
                                    '</span>' +
                                '</div>' +
                            '</div>' +
                            '<!-- /.panel-footer -->' +
                '</div>';

            document.getElementsByTagName('body')[0].insertAdjacentHTML( 'beforeend', chatHTML);
            document.getElementById('btn-close').addEventListener("click", function(){DEFM.toggleButton();DEFM.toggleChat();}, false);
            document.getElementById('btn-chat').addEventListener("click", function(){DEFM.sendMsg();}, false);

            document.getElementById('btn-input').addEventListener('keyup', function(event) {
                event.preventDefault();
                if (event.key == 'Enter') {
                    document.getElementById('btn-chat').click();
                }
            });

            DEFM.sendMsg('hi', true);

        } else {
            elementChatPanel.parentNode.removeChild(elementChatPanel);
            DEFM.Files.resetContext();
        }
    },

    sendMsg: function(msg, noDisplay){
            DEFM.Message.input.text = msg || document.getElementById('btn-input').value;

            if (DEFM.currentURL[3] == "files"){
                console.log("checking files context");
                DEFM.Files.checkContext();
            }

            if (!noDisplay){
                var userMsgHTML = '<li class="defm-right defm-clearfix">' +
                                        '<span class="defm-chat-img defm-pull-right">' +
                                            '<img src="' + DEFM.Config.user.avatarImageURL + '" alt="You" class="defm-img-circle">' +
                                        '</span>' +
                                        '<div class="defm-chat-body defm-clearfix">' +
                                            '<div class="defm-header">' +
                                                '<strong class="defm-pull-right defm-primary-font">You</strong>' +
                                            '</div>' +
                                           '<p class="defm-pull-left">' +
                                                DEFM.Message.input.text +
                                            '</p>' +
                                        '</div>' +
                                   '</li>';
                document.getElementsByClassName('defm-chat')[0].insertAdjacentHTML( 'beforeend', userMsgHTML );
                document.getElementById('btn-input').value = '';
                document.getElementsByClassName('defm-panel-body')[0].scrollTop = document.getElementsByClassName('defm-panel-body')[0].scrollHeight;
            }

                //Disable input field until we receive message from Watson
                document.getElementById('btn-input').disabled=true;
                document.getElementById('btn-chat').disabled=true;

            //Call Watson API and get the response into Conversation object
              GM_xmlhttpRequest({
                  method: 'POST',
                  url: DEFM.Config.apiServer + DEFM.Config.apiURL,
                  data: JSON.stringify(DEFM.Message),
                  headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                  },
                  onload: function(response) {
                    var responseJSON = JSON.parse(response.responseText);
                    var responseText = '';
                    for (var i = 0; i<responseJSON.output.text.length; i++){
                        if(responseJSON.output.text[i] !== ''){
                            responseText += responseJSON.output.text[i];
                            responseText += ' ';
                        }
                    }
                    DEFM.Message.context.system.dialog_turn_counter = responseJSON.context.system.dialog_turn_counter + 1;
                    DEFM.Message.context.system.dialog_request_counter = responseJSON.context.system.dialog_request_counter + 1;
                    DEFM.Message.context.system.dialog_stack = responseJSON.context.system.dialog_stack;
                    DEFM.Message.context.conversation_id = responseJSON.context.conversation_id;

                    DEFM.receiveMsg(responseText);

                    //if (DEFM.currentURL[3] == "files"){
                        if(responseJSON.context.action == 'shareCurrent'){
                            DEFM.Files.shareCurrent();
                        }
                        if(responseJSON.context.action == 'shareExisting'){
                            DEFM.Files.shareExisting();
                        }
                        if(responseJSON.context.action == 'shareNew'){
                            DEFM.Files.shareNew();
                        }
                        if(responseJSON.context.action == 'navigateToFiles'){
                            DEFM.Files.navigateToFiles();
                        }
                        if(responseJSON.context.triggers && !DEFM.Config.disableTriggerButtons){
                            DEFM.showTriggerButtons(responseJSON.context.triggers);
                        }
                    //}

                    console.log(responseJSON);
                    }
                });
    },

    receiveMsg: function(msg){
            var watsonMsgHTML = '<li class="defm-left defm-clearfix">' +
                                        '<span class="defm-chat-img defm-pull-left">' +
                                            '<img src="' + DEFM.Config.resourceServer + '/images/icon2.png" alt="User Avatar" class="defm-img-circle">' +
                                        '</span>' +
                                        '<div class="defm-chat-body defm-clearfix">' +
                                            '<div class="defm-header">' +
                                                '<strong class="defm-primary-font">Watson</strong>' +
                                            '</div>' +
                                            '<p>' +
                                                msg +
                                            '</p>' +
                                        '</div>' +
                                    '</li>';
            document.getElementsByClassName('defm-chat')[0].insertAdjacentHTML( 'beforeend', watsonMsgHTML );
            document.getElementsByClassName('defm-panel-body')[0].scrollTop = document.getElementsByClassName('defm-panel-body')[0].scrollHeight;

            //Enable input field untill we receive message from Watson
            document.getElementById('btn-input').disabled=false;
            document.getElementById('btn-chat').disabled=false;
    },

    Files: {
        shareCurrent: function(){
            document.getElementById("share").click();
            document.getElementById("hintDisplay").innerHTML = '<img src="' + DEFM.Config.resourceServer + '/images/ShareOpenedFile.gif" width="250px" height="211px">';
            document.getElementsByClassName('defm-panel-body')[0].scrollTop = document.getElementsByClassName('defm-panel-body')[0].scrollHeight;
        },

        shareExisting: function(){

                //Disable chat input before ajax call to Files service
                document.getElementById('btn-input').disabled=true;
                document.getElementById('btn-chat').disabled=true;

                // Calling Files service to get 5 latest files of our user
                GM_xmlhttpRequest({
                  method: 'GET',
                  url: DEFM.Config.connectionsServer + DEFM.Config.filesApiUrl,
                  headers: {
                    "Accept": "*/*",
                    'User-Agent': 'Mozilla/5.0'    // If not specified, navigator.userAgent will be used.
                  },
                  onload: function(response) {

                        var responseXML = response.responseXML;

                        if (!response.responseXML) {
                          responseXML = new DOMParser()
                            .parseFromString(response.responseText, "text/xml");
                        }

                        var allFiles = responseXML.getElementsByTagName('entry');
                        var allFilesListLength = 5;

                        if (allFiles.length < 5){
                            allFilesListLength = allFiles.length;
                        }

                        for(var i = 0; i < allFilesListLength; i++){

                            var fileName = allFiles[i].getElementsByTagName('title')[0].textContent;

                            var fileLink = DEFM.Config.connectionsServer + DEFM.Config.filesUiUrl + allFiles[i].getElementsByTagName('id')[0].textContent.split(':')[4];

                            var filesListHTML = '<li class="defm-left defm-clearfix">' +
                                            '<span class="defm-chat-img defm-pull-left">' +
                                                '<img src="' + DEFM.Config.connectionsServer + '/connections/resources/web/com.ibm.lconn.core.styles/sprite/ibmdocs_wordprocessing_32.png" alt="User Avatar">' +
                                            '</span>' +
                                            '<div class="defm-chat-body defm-clearfix">' +
                                                '<div class="defm-header">' +
                                                    '<a href="' + fileLink + '">' +
                                                        '<strong class="defm-primary-font">'+ fileName +'</strong>' +
                                                    '</a>' +
                                                '</div>' +
                                            '</div>' +
                                        '</li>';
                            document.getElementsByClassName('defm-chat')[0].insertAdjacentHTML( 'beforeend', filesListHTML );
                            document.getElementsByClassName('defm-panel-body')[0].scrollTop = document.getElementsByClassName('defm-panel-body')[0].scrollHeight;

                        }

                        document.getElementsByClassName('defm-chat')[0].insertAdjacentHTML( 'beforeend', '<span> Open one of the above, switch to "Sharing" tab and here is how to share a file: </span><img src="' + DEFM.Config.resourceServer + '/images/ShareOpenedFile.gif" width="250px" height="211px">');
                        //document.getElementsByClassName('defm-panel-body')[0].scrollTop = document.getElementsByClassName('defm-panel-body')[0].scrollHeight;

                        //Enable chat input back
                        document.getElementById('btn-input').disabled=false;
                        document.getElementById('btn-chat').disabled=false;
                    }
                });

        },

        shareNew: function(){
            //Open menu for uploading/creating new file
            document.getElementById('lconn_files_action_createitem_0').click();
            
            //Display a choice of 4 options: Upload a New File, Create new Document, Create new Spredsheet, Create new Presentation
            var newFileListHTML = '<li class="defm-left defm-clearfix">' +
                                        '<div class="defm-chat-body defm-clearfix">' +
                                            '<div class="defm-header">' +
                                                '<a href="#" onclick="document.getElementById(\'lconn_files_action_uploadfile_0_text\').click()">' +
                                                    '<strong class="defm-primary-font">Upload a New File</strong>' +
                                                '</a>' +
                                            '</div>' +
                                        '</div>' +
                                    '</li>' +
                                    '<li class="defm-left defm-clearfix">' +
                                        '<div class="defm-chat-body defm-clearfix">' +
                                            '<div class="defm-header">' +
                                                '<a href="#" onclick="document.getElementById(\'com_ibm_concord_lcext_newconcorddoc_0_text\').click()">' +
                                                    '<strong class="defm-primary-font">Create new Document with Docs</strong>' +
                                                '</a>' +
                                            '</div>' +
                                        '</div>' +
                                    '</li>' +
                                    '<li class="defm-left defm-clearfix">' +
                                        '<div class="defm-chat-body defm-clearfix">' +
                                            '<div class="defm-header">' +
                                                '<a href="#" onclick="document.getElementById(\'com_ibm_concord_lcext_newconcordsheet_0_text\').click()">' +
                                                    '<strong class="defm-primary-font">Create new Spredsheet with Docs</strong>' +
                                                '</a>' +
                                            '</div>' +
                                        '</div>' +
                                    '</li>' +
                                    '<li class="defm-left defm-clearfix">' +
                                        '<div class="defm-chat-body defm-clearfix">' +
                                            '<div class="defm-header">' +
                                                '<a href="#" onclick="document.getElementById(\'com_ibm_concord_lcext_newconcordpres_0_text\').click()">' +
                                                    '<strong class="defm-primary-font">Create new Presentation with Docs</strong>' +
                                                '</a>' +
                                            '</div>' +
                                        '</div>' +
                                    '</li>';

            document.getElementsByClassName('defm-chat')[0].insertAdjacentHTML( 'beforeend', newFileListHTML );
            document.getElementsByClassName('defm-panel-body')[0].scrollTop = document.getElementsByClassName('defm-panel-body')[0].scrollHeight;

            var sharingInstructionsHTML = '<li class="defm-left defm-clearfix">' +
                                        '<div class="defm-chat-body defm-clearfix">' +
                                            '<div class="defm-header">' +
                                                '<p>' +
                                                    'And here is how to share the file once it is created:'+
                                                '</p>' +
                                                '<img src="' + DEFM.Config.resourceServer + '/images/ShareOpenedFile.gif" width="250px" height="211px">'+
                                            '</div>' +
                                        '</div>' +
                                    '</li>';
            document.getElementsByClassName('defm-chat')[0].insertAdjacentHTML( 'beforeend', sharingInstructionsHTML );

        },

        checkContext: function(callback){
            if (document.getElementsByClassName('ics-viewer-title-name')[0] !== undefined){
                DEFM.Message.context.fileOpen = true;
                DEFM.Message.context.fileName = document.getElementsByClassName('ics-viewer-title-name')[0].innerHTML;
                DEFM.Message.context.service = 'files';
                DEFM.Config.files.fileId = DEFM.currentURL[DEFM.currentURL.length - 1];
            } else {
                DEFM.Files.resetContext();
            }

            if (callback){
                callback();
            }
        },

        resetContext: function(){
            DEFM.Message.context.fileOpen = false;
            DEFM.Message.context.fileName = '';
            DEFM.Config.files.fileId = '';
            DEFM.Message.context.service = window.location.href.split('/')[3];
        },

        navigateToFiles: function(){
            document.getElementById('servicesMenu_container').click();
            var hintHTML = '<img src="' + DEFM.Config.resourceServer + '/images/NavigateToFiles.gif" width="250px" height="211px">';
            document.getElementsByClassName('defm-chat')[0].insertAdjacentHTML( 'beforeend', hintHTML );
            document.getElementsByClassName('defm-panel-body')[0].scrollTop = document.getElementsByClassName('defm-panel-body')[0].scrollHeight;
        }
    },

    doEverythingForMe: function(){

        var imageHTML = '<img id="chatButton"  src="' + DEFM.Config.resourceServer + '/images/icon2.png" height="100" width="100" style="position: fixed; top: '+ (DEFM.windowHeight - 120) +'px; left: '+ (DEFM.windowWidth - 120) +'px; z-index: 1000;">';

        document.getElementsByTagName('body')[0].insertAdjacentHTML( 'beforeend', imageHTML );

        document.getElementById('chatButton').addEventListener("click", function(){DEFM.toggleButton();DEFM.toggleChat();}, false);

        var chatCSS = '<style id="chatPanelCSS">' +
                        '.defm-panel-default{border-color:#ddd}.defm-panel{margin-bottom:20px;background-color:#fff;border:1px solid gray;-webkit-box-shadow:0 1px 1px rgba(0,0,0,.05);box-shadow:0 1px 1px rgba(0,0,0,.05);box-sizing:border-box}.defm-panel-default>.defm-panel-heading{color:#fff;background-color:#325c80;border-color:#fff}.defm-panel-default>.defm-panel-heading img{background-image:url(/connections/resources/web/com.ibm.social.hikari.theme/sprite/lotusHSprite-8bit.png?etag=20160903.134200);background-position:-573px -8px;height:20px;width:15px;background-color:#325c80}.defm-panel-heading{padding:10px 15px;border-bottom:1px solid transparent}.defm-chat-panel .defm-panel-body{height:350px;overflow-y:scroll}.defm-panel-body{padding:15px}.defm-btn-group-vertical>.defm-btn-group:after,.defm-btn-toolbar:after,.defm-clearfix:after,.defm-container-fluid:after,.defm-container:after,.defm-dl-horizontal dd:after,.defm-form-horizontal .defm-form-group:after,.defm-modal-footer:after,.defm-modal-header:after,.defm-nav:after,.defm-navbar-collapse:after,.defm-navbar-header:after,.defm-navbar:after,.defm-pager:after,.defm-panel-body:after,.defm-row:after{clear:both}.defm-btn-group-vertical>.defm-btn-group:after,.defm-btn-group-vertical>.defm-btn-group:before,.defm-btn-toolbar:after,.defm-btn-toolbar:before,.defm-clearfix:after,.defm-clearfix:before,.defm-container-fluid:after,.defm-container-fluid:before,.defm-container:after,.defm-container:before,.defm-dl-horizontal dd:after,.defm-dl-horizontal dd:before,.defm-form-horizontal .defm-form-group:after,.defm-form-horizontal .defm-form-group:before,.defm-modal-footer:after,.defm-modal-footer:before,.defm-modal-header:after,.defm-modal-header:before,.defm-nav:after,.defm-nav:before,.defm-navbar-collapse:after,.defm-navbar-collapse:before,.defm-navbar-header:after,.defm-navbar-header:before,.defm-navbar:after,.defm-navbar:before,.defm-pager:after,.defm-pager:before,.defm-panel-body:after,.defm-panel-body:before,.defm-row:after,.defm-row:before{display:table;content:" "}.defm-panel-footer{padding:10px 15px;background-color:#f5f5f5;border-top:1px solid #ddd}.defm-btn-close{margin-top:-8px;margin-right:-12px;background-color:#325c80!important}.defm-btn-group,.defm-btn-group-vertical{position:relative;display:inline-block;vertical-align:middle}.defm-btn-group>.btn:first-child{margin-left:0}.defm-btn-group-vertical>.btn,.defm-btn-group>.btn{position:relative;float:left}.defm-btn-group-xs>.btn,.defm-btn-xs{padding:1px 5px;font-size:12px;line-height:1.5}.defm-btn-default{color:#333;background-color:#fff;border-color:#ccc}input[type=text]:disabled{background:#ddd}.defm-btn-warning:disabled{background-color:rgba(65,120,190,.54)}.defm-chat{margin:0;padding:0;list-style:none}.defm-chat li{margin-bottom:10px;padding-bottom:5px;border-bottom:1px dotted #999}.defm-pull-left{float:left!important}.defm-img-circle{border-radius:50%;width:50px;height:50px}img{vertical-align:middle;border:0}.defm-chat li.defm-left .defm-chat-body{margin-left:60px}.defm-chat li.defm-right .defm-chat-body{margin-right:60px}b,strong{font-weight:700}.defm-pull-right{float:right!important}.defm-text-muted{color:#777}.defm-small,small{font-size:85%}small{font-size:80%}.defm-input-group{position:relative;display:table;border-collapse:separate}.defm-input-group .defm-form-control:first-child,.defm-input-group-addon:first-child,.defm-input-group-btn:first-child>.btn,.defm-input-group-btn:first-child>.defm-btn-group>.btn,.defm-input-group-btn:first-child>.defm-dropdown-toggle,.defm-input-group-btn:last-child>.defm-btn-group:not(:last-child)>.btn,.defm-input-group-btn:last-child>.defm-btn:not(:last-child):not(.defm-dropdown-toggle){border-top-right-radius:0;border-bottom-right-radius:0}.defm-input-group .defm-form-control,.defm-input-group-addon,.defm-input-group-btn{display:table-cell}.defm-input-group .defm-form-control{position:relative;z-index:2;float:left;width:231px;margin-bottom:0}.defm-input-sm{height:30px;padding:5px 10px;font-size:12px;line-height:1.5}.defm-form-control{display:block;width:100%;height:34px;padding:6px 12px;font-size:14px;line-height:1.42857143;color:#555;background-color:#fff;background-image:none;border:1px solid #ccc;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075);box-shadow:inset 0 1px 1px rgba(0,0,0,.075);-webkit-transition:border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;-o-transition:border-color ease-in-out .15s,box-shadow ease-in-out .15s;transition:border-color ease-in-out .15s,box-shadow ease-in-out .15s}.defm-input-group-btn{position:relative;font-size:0}.defm-input-group-addon,.defm-input-group-btn{width:1%;white-space:nowrap;vertical-align:middle}.defm-input-group .form-control,.defm-input-group-addon,.defm-input-group-btn{display:table-cell}.defm-input-group-btn:last-child>.defm-btn,.defm-input-group-btn:last-child>.defm-btn-group{z-index:2;margin-left:-1px}.defm-input-group .defm-form-control:last-child,.defm-input-group-addon:last-child,.defm-input-group-btn:first-child>.defm-btn-group:not(:first-child)>.defm-btn,.defm-input-group-btn:first-child>.defm-btn:not(:first-child),.defm-input-group-btn:last-child>.defm-btn,.defm-input-group-btn:last-child>.defm-btn-group>.defm-btn,.defm-input-group-btn:last-child>.defm-dropdown-toggle{border-top-left-radius:0;border-bottom-left-radius:0}.defm-input-group-btn>.defm-btn{position:relative;margin-right: 1px;margin-bottom: 1px;}.defm-btn-group-sm>.defm-btn,.defm-btn-sm{padding:5px 10px;font-size:12px;line-height:1.5}.defm-btn-warning{color:#fff;background-color:#4178be;border-color:#4178be}.defm-btn-send{height:48px;width:57px;font-size:14px!important}.defm-btn{display:inline-block;padding:6px 12px;margin-bottom:0;font-size:14px;font-weight:400;line-height:1.42857143;text-align:center;white-space:nowrap;vertical-align:middle;-ms-touch-action:manipulation;touch-action:manipulation;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;background-image:none;border:1px solid transparent}button,input,select,textarea{line-height:inherit}button,html input[type=button],input[type=reset],input[type=submit]{-webkit-appearance:button;cursor:pointer}button,select{text-transform:none}button{overflow:visible}button,input,optgroup,select,textarea{margin:0;font:inherit;color:inherit}' +
                       '</style>';


        document.getElementsByTagName('body')[0].insertAdjacentHTML( 'beforeend', chatCSS );
    }
};


unsafeWindow.DEFM = DEFM;

(function() {
    'use strict';

    var waitForAvatar = function(){
        if(typeof (document.getElementsByClassName("avatar")[0])=="undefined" && DEFM.windowWidth === 0){
            //console.debug("FROM Watson SCRIPT:::: Avatar not available yet, need to wait");
            window.setTimeout(function(){
                waitForAvatar();
            },200);
        }else{
            //console.log('Number of calls, DONE: ' + numberOfCalls);
            console.debug("FROM Watson SCRIPT::::  Avatar available now");
            DEFM.windowWidth = innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

            DEFM.windowHeight = innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            console.log('WindowHeight: ' + DEFM.windowHeight +' WindowWidth: ' + DEFM.windowWidth);

            DEFM.Config.user.avatarImageURL = document.getElementsByClassName("avatar")[0].src;
            DEFM.Config.user.userId = DEFM.Config.user.avatarImageURL.split('=')[1];
            DEFM.Message.context.userId = DEFM.Config.user.userId;

            //DEBUG
            console.log('User ID:' + DEFM.Config.user.userId);

            // Calling Profiles service to lern more about our user
            GM_xmlhttpRequest({
              method: 'GET',
              url: DEFM.Config.connectionsServer + DEFM.Config.profilesApiUrl + DEFM.Config.user.userId,
              headers: {
                "Accept": "*/*",
                'User-Agent': 'Mozilla/5.0'    // If not specified, navigator.userAgent will be used.
              },
              onload: function(response) {
                    var responseXML = response.responseXML;

                    if (!response.responseXML) {
                      responseXML = new DOMParser()
                        .parseFromString(response.responseText, "text/xml");
                    }

                    var userName = responseXML.getElementsByTagName('name')[0].textContent;

                    //console.log(responseXML.getElementsByTagName('name')[0].textContent);

                     DEFM.Config.user.firstName = userName.split(' ')[0];
                     DEFM.Config.user.lastName = userName.split(' ')[1];
                     DEFM.Config.user.email = responseXML.getElementsByTagName("email")[0].textContent;

                     DEFM.Message.context.firstName = DEFM.Config.user.firstName;
                     DEFM.Message.context.lastName = DEFM.Config.user.lastName;
                     DEFM.Message.context.email = DEFM.Config.user.email;
                    // console.log('First name: ' + DEFM.Config.user.firstName);
                    // console.log('Last name: ' + DEFM.Config.user.lastName);
                    // console.log('Email: ' + DEFM.Config.user.email);

                    DEFM.Config.apiURL = '/message';
                    if (DEFM.currentURL[3] == "files"){
                        DEFM.Files.checkContext();
                       //DEFM.Config.apiURL = '/message';
                    } else {
                        DEFM.Files.resetContext();
                        //If in LLShowcase
                        if(window.location.href.split('=')[1]=='2fc47adb-94f7-4571-a501-33d24047ad12'||window.location.href.split('/')[6]=='We56871822ff7_4cac_a22d_715dea3c7b1b'){
                            DEFM.Config.apiURL = '/messagehr';
                        }
                        //If in Silvergreen
                        if(window.location.href.split('=')[1]=='52efacf7-3f1c-4062-803b-f1b88a878f84'||window.location.href.split('/')[6]=='Wf5a3eb48e1c9_4d6c_adbd_9e597a05958b'){
                            DEFM.Config.apiURL = '/messagehr';
                        }

                    }

                    DEFM.doEverythingForMe();
                }
            });

        }
    };

    waitForAvatar();
})();