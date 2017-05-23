
(function() {
    'use strict';

    //
    // Setup general data structure for determining which elements in the document to work with
    // Note that "tagInputID" attributes of the object contain a regular expression that is used
    // in matching against the HTML element IDs in the document in order to accommodate for counters
    // that are placed into the HTML element ID or for other matching purposes.
    //
    var autoTagDatum = {
        "/activities/service/html/mainpage" : [
            {
                tagInputID: "lconn_act_ToDoForm_\\d+?tag[sz]",
                isContentElemAnIFrame: true,
                contentElemID : "null",
                contentElemIFrameContainingDiv : "cke_editor\\d+?",
                autoTagButtonID: "watsonKeywordExtractor_0"
            },
            {
                tagInputID: "lconn_act_ActivityForm_\\d+?tag[sz]",
                isContentElemAnIFrame: false,
                contentElemID : "lconn_act_ActivityForm_\\d+?_descriptionInput",
                contentElemIFrameContainingDiv : "null",
                autoTagButtonID: "watsonKeywordExtractor_1"
            },
            {
                tagInputID: "lconn_act_EntryForm_\\d+?tag[sz]",
                isContentElemAnIFrame: true,
                contentElemID : "null",
                contentElemIFrameContainingDiv : "[cke_editor\\d+?]|[cke_\\d+?_contents]",
                autoTagButtonID: "watsonKeywordExtractor_2"
            }
        ],
        "/blogs/roller-ui/authoring/weblog.do" : [
            {
                tagInputID: "addtagwidgetAddTagsTypeAhead",
                isContentElemAnIFrame: true,
                contentElemID : "null",
                contentElemIFrameContainingDiv : "cke_ckeditor",
                autoTagButtonID: "watsonKeywordExtractor_3"
            }
        ],
        "/communities/service/html/community/bookmarks" : [
            {
                tagInputID: "autocompletetags[\\d+]$",
                isContentElemAnIFrame: false,
                contentElemID : "addBookmarkDescription",
                contentElemIFrameContainingDiv : "null",
                autoTagButtonID: "watsonKeywordExtractor_4"
            },
            {
                tagInputID: "autocompletetags_edit.*$",
                isContentElemAnIFrame: false,
                contentElemID : "editBookmarkDescription[.*]$",
                contentElemIFrameContainingDiv : "null",
                autoTagButtonID: "watsonKeywordExtractor_5"
            }
        ],
        "/communities/service/html/communitycreate" : [
            {
                tagInputID: "autocompletetags",
                isContentElemAnIFrame: true,
                contentElemID : "null",
                contentElemIFrameContainingDiv : "cke_addCommunityDescription",
                autoTagButtonID: "watsonKeywordExtractor_6"
            }
        ],
        "/communities/service/html/communityedit" : [
            {
                tagInputID: "autocompletetags",
                isContentElemAnIFrame: true,
                contentElemID : "null",
                contentElemIFrameContainingDiv : "cke_editCommunityDescription",
                autoTagButtonID: "watsonKeywordExtractor_7"
            }
        ],
        "/communities/service/html/communityoverview" : [
            {
                tagInputID: "lconn_forums_ForumForm_\\d+?_tag",
                isContentElemAnIFrame: false,
                contentElemID : "lconn_forums_ForumForm_\\d+?_description",
                contentElemIFrameContainingDiv : "null",
                autoTagButtonID: "watsonKeywordExtractor_8"
            },
            {
                tagInputID: "^tagsAsString$",
                isContentElemAnIFrame: false,
                contentElemID : "description",
                contentElemIFrameContainingDiv : "null",
                autoTagButtonID: "watsonKeywordExtractor_9"
            },
            {
                tagInputID: "lconn_forums_PostForm_\\d+_postTag",
                isContentElemAnIFrame: true,
                contentElemID : "null",
                contentElemIFrameContainingDiv : "cke_editor\\d+$",
                autoTagButtonID: "watsonKeywordExtractor_10"
            },
            {
                tagInputID: "calendar_event_editor-tagsAsString",
                isContentElemAnIFrame: true,
                contentElemID : "null",
                contentElemIFrameContainingDiv : "cke_calendar_event_editor-description",
                autoTagButtonID: "watsonKeywordExtractor_11"
            }
        ],
        "/communities/service/html/communitystart" : [
            {
                tagInputID: "lconn_act_ActivityForm_\\d+?tag[sz]",
                isContentElemAnIFrame: false,
                contentElemID : "lconn_act_ActivityForm_\\d+?_descriptionInput",
                contentElemIFrameContainingDiv : "null",
                autoTagButtonID: "watsonKeywordExtractor_12"
            },
        ],
        "/communities/service/html/communityview" : [
            {
                tagInputID: "calendar_event_editor-tagsAsString",
                isContentElemAnIFrame: true,
                contentElemID : "null",
                contentElemIFrameContainingDiv : "cke_calendar_event_editor-description",
                autoTagButtonID: "watsonKeywordExtractor_13"
            }
        ],
        "/forums/html/threadTopic" : [
        ],
        "/wikis/home" : [
            {
                tagInputID: "pageTags_selectTag",
                isContentElemAnIFrame: true,
                contentElemID : "null",
                contentElemIFrameContainingDiv : "cke_editor\\d+$",
                autoTagButtonID: "watsonKeywordExtractor_14"
            },
            {
                tagInputID: "lconn_share\\d+?_widget_Tagger_\\d+?_selectTag",
                isContentElemAnIFrame: true,
                contentElemID : "null",
                contentElemIFrameContainingDiv : "cke_editor\\d+$",
                autoTagButtonID: "watsonKeywordExtractor_15"
            }
        ]
    };

    //
    // Process the content in the responseText and add the keywords into the proper DOM element.
    //
    function processAndInsertTags(responseText, tagElement)
    {
        if ( responseText === null || responseText === undefined )
        {
            alert("Error: No keywords returned from Watson");
            return;
        }

        // Convert it into a JSON object to use it
        var bodyJSONObj = JSON.parse(responseText);

        // If the parameter is not null
        if ( bodyJSONObj !== null )
        {
            var keywords = "";
            var keywordSet = new Set();

            // Parse the JSON into keywords
            var keywordsList = bodyJSONObj.keywords;
            if ( keywordsList.length > 0 )
            {
                var keywordCounter = 10; // No more than 10 keywords
                for ( var i = 0 ; i < keywordsList.length && keywordCounter > 0 ; i++ )
                {
                    // Get relevance for this keyword.  If it is greater than 50%, then include it.
                    var keyword = keywordsList[i].text;
                    var keywordRelevance = keywordsList[i].relevance;
                    if ( keywordRelevance !== undefined && keywordRelevance !== null )
                    {
                        var relevance = Number(keywordRelevance);
                        if ( relevance >= 0.50 )
                        {
                            // keywords coming back from the service can be more than 1 word, such as
                            // "5K screen".  Split the string on spaces to get individual keywords and
                            // then iterate over those and add them as appropriate.
                            var arrayOfKeywords = keyword.split(' ');
                            for ( var keywordIdx = 0 ; keywordIdx < arrayOfKeywords.length && keywordCounter > 0 ; keywordIdx++ )
                            {
                                var currKeyWord = arrayOfKeywords[keywordIdx];
                                if ( currKeyWord.length >= 3 )
                                {
                                    if ( !keywordSet.has(currKeyWord) && keywordCounter > 0 )
                                    {
                                        keywordSet.add(currKeyWord);
                                        keywords = keywords.concat(currKeyWord.trim().toLowerCase()+" ");
                                        keywordCounter--;
                                    }
                                }
                            }
                        }
                    }
                }
                // Get the tags widget
                var tagEntryElement = document.getElementById(tagElement);
                if ( tagEntryElement !== null )
                {
                    // Enter the keywords into the widget
                    tagEntryElement.value = keywords + " " + tagEntryElement.value;
                }
            }
            else
            {
                alert("Error: No keywords returned from Watson.");
            }
        }
        else
        {
            alert("Unable to parse keywords from Watson.");
            return;
        }
    }

    //
    // Scan the page based on the url and look for the correct HTML element that
    // represents the field where the tags are entered.  If found, return true, else
    // return false.
    //
    function scanPageForTagInputElement(currentURL)
    {
        var retVal = null;
        if ( currentURL !== undefined && currentURL !== null )
        {
            // Get a list of all of the "input" tags on the page
            var documentInputElements = document.getElementsByTagName("input");

            // Now iterate throught the list of the "input" tags on the page to see if any exist in the
            // currentURLTagInputIDs set.
            for ( var docInputElementIdx = 0 ; docInputElementIdx < documentInputElements.length ; docInputElementIdx++ )
            {
                var docInputTagElementID = documentInputElements[docInputElementIdx].id;

                if ( docInputTagElementID !== undefined && docInputTagElementID !== null )
                {
                    // Iterate through the tagInputIDs in the autoTagDatum[currentURL] array of objects
                    // and compare with the docInputTagElementID to see if there is a match.  We do this
                    // because some of the Connections input tags include a counter in them and we want
                    // to be able to match on part of the ID string that does not include the counter.
                    for ( var tagInputIdIdx = 0 ; tagInputIdIdx < autoTagDatum[currentURL].length ; tagInputIdIdx++ )
                    {
                        var currTagInputID = autoTagDatum[currentURL][tagInputIdIdx].tagInputID;

                        if ( docInputTagElementID.match(currTagInputID) ) // tagInputIDs are regular expressions for matching
                        {
                            return { url: currentURL,
                                    docInputElemObj: documentInputElements[docInputElementIdx],
                                    tagInputIDObj: autoTagDatum[currentURL][tagInputIdIdx] };
                        }
                    }
                }
            }
        }

        return retVal;
    }

    //
    // Function to insert the auto-tag button into the user interface next to the
    // HTML input element in the page.
    //
    function insertAutoTagButton(inputElemInfoObj)
    {
        // If the button already exists, then don't do anything
        if ( document.getElementById(inputElemInfoObj.tagInputIDObj.autoTagButtonID) !== null )
        {
            return;
        }

        // Otherwise, create the Auto-Tag button
        var tagAutoButton = document.createElement("input");
        tagAutoButton.value = 'Auto-Tag';
        tagAutoButton.type = 'button';
        tagAutoButton.className = 'lotusBtnSmall';
        tagAutoButton.addEventListener('click', autoTagEvent, false);
        tagAutoButton.id = inputElemInfoObj.tagInputIDObj.autoTagButtonID;
        tagAutoButton.setAttribute("tagInputID", inputElemInfoObj.docInputElemObj["id"]);
        tagAutoButton.setAttribute("contentElemIFrame", inputElemInfoObj.tagInputIDObj.isContentElemAnIFrame);
        tagAutoButton.setAttribute("contentElemID", inputElemInfoObj.tagInputIDObj.contentElemID);
        tagAutoButton.setAttribute("contentElemIFrameDivContainerID", inputElemInfoObj.tagInputIDObj.contentElemIFrameContainingDiv);

        var documentInputElement = document.getElementById(inputElemInfoObj.docInputElemObj["id"]);
        if ( documentInputElement !== undefined && documentInputElement !== null )
        {
            // Add the button to the UI
            var insertedNode = documentInputElement.parentNode.insertBefore(tagAutoButton, documentInputElement.nextSibling);
        }
    }

    //
    // Function that accepts a DOM Node and finds the first iframe sub-node (child).
    // Note that this function tried using document.getElementsByTagName("iframe"), however
    // it appeared to only sporadically work, while the code to manually descend the DOM
    // was more reliable.
    //
    function findIFrame(startingNode)
    {
        var retVal = null;

        if ( startingNode !== null )
        {
            if (startingNode.nodeName == "iframe" || startingNode.nodeName == "IFRAME")
            {
                return startingNode;
            }
            else if (startingNode.hasChildNodes())
            {
                var childNodes = startingNode.childNodes;
                for ( var i = 0 ; i < childNodes.length ; i++ )
                {
                    var node = findIFrame(childNodes[i]);
                    if ( node !== undefined && node !== null )
                    {
                        return node;
                    }
                }
            }
        }

        return retVal;
    }

    //
    // Function that accepts a starting node and recursively finds all textual content contained in it
    //
    function getBodyContent(startingNode)
    {
        var retVal = "";

        if ( startingNode !== null )
        {
            if (startingNode.hasChildNodes())
            {
                var childNodes = startingNode.childNodes;
                for ( var i = 0 ; i < childNodes.length ; i++ )
                {
                    if (childNodes[i].nodeType == Node.TEXT_NODE)
                    {
                        if ( childNodes[i].textContent !== null )
                        {
                            retVal += childNodes[i].textContent + "\n";
                        }
                    }
                    else
                    {
                        if ( childNodes[i] !== null )
                        {
                            retVal += getBodyContent(childNodes[i]);
                        }
                    }
                }
            }
        }

        return retVal;
    }

    //
    // Find the content on the page that will be used to send to the Watson AlchemyAPI
    // to identify the keywords.
    //
    function getContentToProcess(isAnIFrame, contentElementID, contentIFrameDivContainerID)
    {
        if ( isAnIFrame !== undefined && isAnIFrame !== null )
        {
            if ( isAnIFrame === "false" )
            {
                // Get the content from the textarea with the ID contained in "contentElementID"
                var textAreaElements = document.getElementsByTagName("textarea");
                if ( textAreaElements !== undefined && textAreaElements !== null )
                {
                    for ( var taIdx = 0 ; taIdx < textAreaElements.length ; taIdx++ )
                    {
                        if ( textAreaElements[taIdx].id.match(contentElementID) )
                        {
                            return textAreaElements[taIdx].value;
                        }
                    }
                }
            }
            else
            {
                // Get the content from the the iFrame that is contained within the DIV with the
                // id of "contentIFrameDivContainerID"
                // Look through all "div" nodes to locate it
                var divNodes = document.getElementsByTagName("div");
                if ( divNodes !== undefined && divNodes !== null )
                {
                    // Found DIV tags, now look for the node starting with "cke_" and ending with "_contents".
                    for ( var i = 0 ; i < divNodes.length ; i++ )
                    {
                        // Look at the id attribute
                        if ( divNodes[i].id.match(contentIFrameDivContainerID) )
                        {
                            // Get the iframe's document body
                            var iFrameNode = findIFrame(divNodes[i]);
                            if ( iFrameNode !== undefined && iFrameNode !== null )
                            {
                                var iFrameDocument = iFrameNode.contentDocument || iFrameNode.contentWindow.document;

                                // Iterate through the iframe's body's children nodes now to find content
                                var textContent = getBodyContent(iFrameDocument.body);
                                return textContent;
                            }
                        }
                    }
                }
            }
        }

        return null;
    }

    //
    // Once the Auto-Tag button has been clicked on by the user, then get the content
    // on the page and send it to the Watson API to extract the keywords.  After
    // the keywords have been returned, it calls the generic processAndInsertTags
    // function and inserts it into the appropriate input field as specified by the
    // "tagInputID" attribute that was set when the button was created.
    //
    function autoTagEvent(event)
    {
        // The Auto-Tag button has been clicked on, so first, get the content from the
        // content entry element on the page.  The element is identified from the button
        // as the "contentElemID" attribute, OR if the content is in an iframe, the content
        // can be found based on finding the iframe contained within a DIV with the id of
        // "contentElemIFrameDivContainerID".

        var descriptionContent = getContentToProcess(event.target.getAttribute("contentElemIFrame"),
                                                     event.target.getAttribute("contentElemID"),
                                                     event.target.getAttribute("contentElemIFrameDivContainerID"));

        if ( descriptionContent !== undefined && descriptionContent !== null &&
            descriptionContent.length > 0 )
        	{
        	var encodedData= encodeURI(descriptionContent)
            var xhrArgs = {
           		 url: "/files/muse-static/calls/text/TextGetCombinedData",
           		 postData: "extract=keywords&outputMode=json&text="+encodedData,
           		 handleAs: "text",
           		 headers: { "Content-Type": "text/plain", "muse-watson":"gateway-a"},
           		 load: function(data){
           			processAndInsertTags(data,event.target.getAttribute("tagInputID"))
           		  },
           		  error: function(error){
           		    	console.log(error)
           		  }
           		}

           	var deferred = dojo.xhrPost(xhrArgs);        
        }
        else
        {
            alert("Unable to find the description content to auto-tag.");
        }
    }

    //
    // Main function to process each mutation observation accordingly based on the URL
    //
    function autoTagMain()
    {
        var currentURLPathName = document.location.pathname;
        for ( var url in autoTagDatum )
        {
            if ( currentURLPathName.includes(url) )
            {
                var inputElemInfoObj = scanPageForTagInputElement(url);
                if ( inputElemInfoObj !== undefined && inputElemInfoObj !== null )
                {
                    // insert Auto-Tag button if it does not already exist
                    insertAutoTagButton(inputElemInfoObj);
                }
            }
        }
    }

    //
    // Setup page observer
    //
    function setupObserver()
    {
        var pageObserver = new MutationObserver(function(mutations) {
            autoTagMain();
        });
        pageObserver.observe(document, { childList: true, subtree: true, attributes: true });
        autoTagMain();
    }

    //
    // Kick off the processing of the page as soon as the page has loaded
    //
    window.addEventListener("load", function(event) {
        window.setTimeout(setupObserver, 1000);
    });
})();