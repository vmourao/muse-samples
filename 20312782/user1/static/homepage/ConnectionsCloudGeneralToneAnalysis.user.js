
(function() {
    'use strict';
    //
    // Function to process the content
    //
    function analyzeConnectionsContent()
    {
        // Get the highlighted text content
        var textContent = findConnectionsHighlightedContent();

        if ( textContent == null || textContent == "" || textContent.length == 0 )
        {
            alert("Please first highlight some content before selecting the Analyze Tone button.");
            return;
        }
        
        getConnectionsToneAnalysis(textContent);
    }

    // #######################################################################
    // Code related to the Analyze Tone button on the user interface.
    // #######################################################################

    //
    // Function that searches for highlighted content in the document or in any
    // iFrames where the content is highlighted.
    //
    function findConnectionsHighlightedContent()
    {
        var retVal = document.getSelection().toString();

        // First look in the main HTML document
        if ( retVal == null || retVal == "" || retVal.length == 0 )
        {
            // Couldn't find it in the main document.  Now search all iframes for
            // highlighted content.
            //
            var iframeNode = findConnectionsIFrame();
            if ( iframeNode !== null )
            {
                retVal = iframeNode.contentDocument.getSelection().toString();
            }
        }
        return retVal;
    }

    //
    // Function that searches for the iframe used to hold the content.
    //
    function findConnectionsIFrame()
    {
        var retVal = null;

        // First ask the document for all iframes
        var alliFrames = document.getElementsByTagName("iframe");

        for ( var i = 0 ; i < alliFrames.length ; i++ )
        {
            var iFrameNode = alliFrames[i];
            if ( iFrameNode.parentNode !== null )
            {
                if ( iFrameNode.parentNode.id.includes("cke") &&
                    iFrameNode.parentNode.id.includes("contents") )
                {
                    retVal = iFrameNode;
                    break;
                }
            }
        }

        return retVal;
    }

    //
    // Function that finds the Connections Navigation bar at the top of the screen
    // so that the "Analyze Tone" button can be inserted there.
    //
    function findConnectionsNavbar()
    {
        var retVal = null;

        //
        // Find the SameTime tray by ID
        //
        var divElement = document.getElementById("ics-scbanner-home");
        if ( divElement !== null )
        {
            retVal = divElement;
        }

        // Return the parent DIV container
        return retVal;
    }

    // #######################################################################
    // Generic code to present Tone Analyzer results
    // #######################################################################
    
    //
    // Make REST call to Muse proxy which calls the Watson Tone Analyzer service
    //
    function getConnectionsToneAnalysis(contentToAnalyze)
    {

		var xhrArgs = {
    		 url: "/files/muse-static/tone-analyzer/api/v3/tone?version=2016-05-19",
    		 postData: contentToAnalyze,
    		 handleAs: "text",
    		 headers: { "Content-Type": "text/plain", "muse-watson":"gateway"},
    		 load: function(data){
    		        showConnectionsToneAnalysis(data)
    		  },
    		  error: function(error){
    		    	console.log(error)
    		  }
    		}

    	var deferred = dojo.xhrPost(xhrArgs); 
             
    }

    //
    // Function to generate a new content node based on the score data
    //
    function createConnectionsScoreContent(title, score, classId, scoreId, barColor)
    {
        var scoreDiv = document.createElement("div");
        scoreDiv.id = classId;

        // Insert the title
        var contentTitle = document.createElement("h3");
        contentTitle.innerHTML=title + " : " + score;
        contentTitle.style="padding-left: 5%;";
        contentTitle.appendChild(insertInfoPopup(scoreId));
        scoreDiv.appendChild(contentTitle);

        // Create the container to hold the bars
        var barContainerDiv = document.createElement("div");
        barContainerDiv.style="position:relative;margin:0 0 0 0;width:80%;height:15px;left:3%;background-color:#bbbbbb;";

        // Create the score bar that fills only a certain percentage
        var barScoreDiv = document.createElement("div");
        barScoreDiv.style="position:absolute;margin:0 0 0 0;padding:0 0 0 0;height:15px;top:0px;left:0px;background-color:"+barColor+";width:"+(score*100)+"%;";

        // Combine the elements
        barContainerDiv.appendChild(barScoreDiv);
        scoreDiv.appendChild(barContainerDiv);

        return scoreDiv;
    }

    //
    // Function that returns a dictionary object containing the Tone Analysis.
    // It parses the JSON object returned from the Watson Tone Analytics API for
    // the specific tone analysis category, such as "emotion_tone" or "social_tone".
    //
    function getConnectionsToneCategoryAnalysis(jsonObj, whichToneCategory)
    {
        var retVal = {};

        if ( whichToneCategory == "emotion_tone" ) {
            retVal = { "Anger": 0.00, "Disgust": 0.00, "Fear": 0.00, "Joy": 0.00, "Sadness": 0.00 };
        }
        else if ( whichToneCategory == "language_tone" ) {
            retVal = { "Analytical": 0.00, "Confident": 0.00, "Tentative": 0.00 };
        }
        else if ( whichToneCategory == "social_tone" ) {
            retVal = { "Openness": 0.00, "Conscientiousness": 0.00, "Extraversion": 0.00, "Agreeableness": 0.00, "Emotional Range": 0.00 };
        }

        var numToneCategories = jsonObj["document_tone"]["tone_categories"].length;
        for (var toneCatIdx = 0 ; toneCatIdx < numToneCategories ; toneCatIdx++)
        {
            var toneCategory = jsonObj["document_tone"]["tone_categories"][toneCatIdx];

            if ( toneCategory["category_id"] == whichToneCategory )
            {
                var numTones = toneCategory["tones"].length;
                for (var tonesIdx = 0 ; tonesIdx < numTones ; tonesIdx++)
                {
                    var tone_name = toneCategory["tones"][tonesIdx]["tone_name"];
                    var tone_score = toneCategory["tones"][tonesIdx]["score"];
                    retVal[tone_name] = tone_score;
                }
            }
        }

        return retVal;
    }

    //
    // Function to toggle when a popup is shown in the Tone Analysis Document Level dialog
    //
    function popUpToggle(whichOne)
    {
        var popup = document.getElementById(whichOne);
        popup.style.display = ( popup.style.display == "none" ? "inline" : "none" );
    }

    //
    // Returns a new DOM node that contains the informational popup for the Document Level dialog
    //
    function insertInfoPopup(popupType)
    {
        var popupInfo = {
            "emotionsScoreInfo" : "Emotional tone is inferred from different types of emotions and feelings that people express in their language. For each of these emotions, the service outputs a score that lies between 0 to 1 that indicates the probability that the emotion came across in the text. The low value describes the lowest a score a sentence or document can receive and can still be considered to contain that emotion. The high value describes when the sentence or document has a high probability of belonging to that emotion.",
            "languageScoreInfo" : "Describes perceived writing style using these categories: analytical style, reasoning style, and confidence. For each of these categories, the service outputs a score from 0 to 1 that indicates the tendency toward being perceived as described in the categories.",
            "socialScoreInfo" : "Social tone measures the social tendencies in people's writing. Tone Analyzer responds with analysis on five different social tones: openness, conscientiousness, extraversion, agreeableness, and emotional range (or neuroticism). These five social tones are adopted fromÂ the Big-five personality model. For each of these categories, the service outputs a score from 0 to 1 that indicates tendency toward the listed behaviors.",
            "angerScoreInfo" : "Evoked due to injustice, conflict, humiliation, negligence or betrayal. If anger is active, the individual attacks the target, verbally or physically. If anger is passive, the person silently sulks and feels tension and hostility.<p>Less than 0.5 - less likely to be perceived as angry.</p><p>More than 0.75 - Highly likely to be perceived as angry.</p>",
            "disgustScoreInfo" : "An emotional response of revulsion to something considered offensive or unpleasant. It is a sensation that refers to something revolting.<p>Less than 0.5 - less likely to be perceived as disgusted.</p><p>More than 0.75 - Highly likely to be perceived as disgusted.</p>",
            "fearScoreInfo" : "A response to impending danger. It is a survival mechanism that is a reaction to some negative stimulus. It may be a mild caution or an extreme phobia.<p>Less than 0.5 - less likely to be perceived as scared.</p><p>More than 0.75 - Highly likely to be perceived as scared.</p>",
            "joyScoreInfo" : "Joy or happiness has shades of enjoyment, satisfaction and pleasure. There is a sense of well-being, inner peace, love, safety and contentment.<p>Less than 0.5 - less likely to be perceived as joyful.</p><p>More than 0.75 - Highly likely to be perceived as joyful.</p>",
            "sadnessScoreInfo" : "Indicates a feeling of loss and disadvantage. When a person can be observed to be quiet, less energetic and withdrawn, it may be inferred that sadness exists.<p>Less than 0.5 - less likely to be perceived as sad.</p><p>More than 0.75 - Highly likely to be perceived as sad.</p>",
            "analyticalScoreInfo" : "A person's reasoning and analytical attitude about things.<p>Less than 0.25 - the text contains little or no evidence of analytical tone.</p><p>More than 0.75 - more likely to be perceived as intellectual, rational, systematic, emotionless, or impersonal.</p>",
            "confidentScoreInfo" : "A person's degree of certainty.<p>Less than 0.25 - the text contains little or no evidence of confidence in tone.</p><p>More than 0.75 - more likely to be perceived as assured, collected, hopeful, or egotistical.</p>",
            "tentativeScoreInfo" : "A person's degree of inhibition.<p>Less than 0.25 - the text contains little or no evidence of tentativeness in tone.</p><p>More than 0.75 - more likely to be perceived as questionable, doubtful, limited, or debatable.</p>",
            "opennessScoreInfo" : "The extent a person is open to experience a variety of activities.<p>Less than 0.25 - more likely to be perceived as no-nonsense, straightforward, blunt, or preferring tradition and the obvious over the complex, ambiguous, and subtle.</p><p>More than 0.75 - more likely to be perceived as intellectual, curious, emotionally-aware, imaginative, willing to try new things, appreciating beauty, or open to change.</p>",
            "conscientiousnessScoreInfo" : "The tendency to act in an organized or thoughtful way.<p>Less than 0.25 - more likely to be perceived as spontaneous, laid-back, reckless, unmethodical, remiss, or disorganized.</p><p>More than 0.75 - more likely to be perceived as disciplined, dutiful, achievement-striving, confident, driven, or organized.</p>",
            "extraversionScoreInfo" : "The tendency to seek stimulation in the company of others.<p>Less than 0.25 - more likely to be perceived as independent, timid, introverted, restrained, boring, or dreary.</p><p>More than 0.75 - more likely to be perceived as engaging, seeking attention, needy, assertive, outgoing, sociable, cheerful, excitement-seeking, or busy.</p>",
            "agreeablenessScoreInfo" : "The tendency to be compassionate and cooperative towards others.<p>Less than 0.25 - more likely to be perceived as selfish, uncaring, uncooperative, self-interested, confrontational, skeptical, or arrogant.</p><p>More than 0.75 - more likely to be perceived as caring, sympathetic, cooperative, compromising, trustworthy, or humble.</p>",
            "emotionalRangeScoreInfo" : "The extent a person's emotion is sensitive to the environment.<p>Less than 0.25 - more likely to be perceived as calm, bland, content, relaxed, unconcerned, or careful.</p><p>More than 0.75 - more likely to be perceived as concerned, frustrated, angry, passionate, upset, stressed, insecure, or impulsive.</p>"
        };
        var contentEmotionsPopup = document.createElement("span");
        contentEmotionsPopup.style="background-color: #eee;border-style: solid;border-width: 1px;border-radius: 8px;border-color: #000;margin-left: 3px;padding-left: 5px;padding-right: 5px;color: #07f;font-size: 10px;font-style: italic;position:relative;top:-9px;cursor:pointer;";
        contentEmotionsPopup.innerHTML="i";
        contentEmotionsPopup.onclick = function() { popUpToggle(popupType); };
        var contentEmotionsPopupContent = document.createElement("span");
        contentEmotionsPopupContent.style="font-style: normal;font-size:12px;display: none;width: 200px;background-color: rgba(150,190,225,0.98);color: #fff;text-align: left;border-radius: 6px;padding: 8px 10px;position: absolute;z-index: 2500;top: -50px;left: -70px;margin-left: 10px;";
        contentEmotionsPopupContent.innerHTML=popupInfo[popupType];
        contentEmotionsPopupContent.id=popupType;
        contentEmotionsPopup.appendChild(contentEmotionsPopupContent);

        return contentEmotionsPopup;
    }


    //
    // Display results of Tone Analysis
    //
    function showConnectionsToneAnalysis(analysis)
    {
        var bodyJSONObj = JSON.parse(analysis);

        // First insert a new div into the body that starts off hidden
        var newDiv = document.createElement("div");
        newDiv.id = "showWatsonToneAnalysis";
        newDiv.style = "display:none;position:fixed;z-index:1000;padding-top:0px;left:0;top:0;width:100%;height:100%;overflow:auto;background-color:rgb(0,0,0);background-color:rgba(0,0,0,0.3);";

        // Create a right floating button to close the dialog
        var closeDialogSpan = document.createElement("span");
        closeDialogSpan.id = "closeWatsonAnalysis";
        closeDialogSpan.style = "color:#aaaaaa;float:right;font-size:28px;cursor:pointer;font-weight:bold;padding-top:5px;padding-right:10px;";
        closeDialogSpan.innerHTML="x";
        closeDialogSpan.onclick = function() {
            // Add the newDiv to the body
            document.body.removeChild(document.getElementById("showWatsonToneAnalysis"));
        };

        // The content header to show in the contentDiv
        var contentDialogIntro = document.createElement("p");
        contentDialogIntro.id = "contentWatsonAnalysis";
        contentDialogIntro.style="padding-left: 5%;";
        contentDialogIntro.innerHTML="<h1>Document Level Scores</h1>";

        // The content for each of the scores
        var contentEmotionsDiv = document.createElement("div");
        contentEmotionsDiv.id = "emotionsScores";
        contentEmotionsDiv.style="position:absolute;left:5%;top:15%;width:25%; height:80%; background-color: #eeeeee;";
        var contentEmotionsTitle = document.createElement("h2");
        contentEmotionsTitle.innerHTML="Emotion Scores";
        contentEmotionsTitle.style="padding-left: 5%;";
        contentEmotionsTitle.appendChild(insertInfoPopup('emotionsScoreInfo'));
        contentEmotionsDiv.appendChild(contentEmotionsTitle);
        var emotionAnalysis = getConnectionsToneCategoryAnalysis(bodyJSONObj, "emotion_tone");
        contentEmotionsDiv.appendChild(createConnectionsScoreContent("Anger", emotionAnalysis["Anger"], "watsonAngerTone", "angerScoreInfo", "#ff0000"));
        contentEmotionsDiv.appendChild(createConnectionsScoreContent("Disgust", emotionAnalysis["Disgust"], "watsonDisgustTone", "disgustScoreInfo", "#551a8b"));
        contentEmotionsDiv.appendChild(createConnectionsScoreContent("Fear", emotionAnalysis["Fear"], "watsonFearTone", "fearScoreInfo", "#00dd00"));
        contentEmotionsDiv.appendChild(createConnectionsScoreContent("Joy", emotionAnalysis["Joy"], "watsonJoyTone", "joyScoreInfo", "#ffff00"));
        contentEmotionsDiv.appendChild(createConnectionsScoreContent("Sadness", emotionAnalysis["Sadness"], "watsonSadnessTone", "sadnessScoreInfo", "#0000ff"));

        var contentLanguageDiv = document.createElement("div");
        contentLanguageDiv.id = "languageScores";
        contentLanguageDiv.style="position:absolute;left:35%;top:15%;width:25%; height:80%; background-color: #eeeeee;";
        var contentLanguageTitle = document.createElement("h2");
        contentLanguageTitle.innerHTML="Language Scores";
        contentLanguageTitle.style="padding-left: 5%;";
        contentLanguageTitle.appendChild(insertInfoPopup('languageScoreInfo'));
        contentLanguageDiv.appendChild(contentLanguageTitle);
        var languageAnalysis = getConnectionsToneCategoryAnalysis(bodyJSONObj, "language_tone");
        contentLanguageDiv.appendChild(createConnectionsScoreContent("Analytical", languageAnalysis["Analytical"], "watsonAnalyticalTone", "analyticalScoreInfo", "#00ccbb"));
        contentLanguageDiv.appendChild(createConnectionsScoreContent("Confident", languageAnalysis["Confident"], "watsonConfidentTone", "confidentScoreInfo", "#00ccbb"));
        contentLanguageDiv.appendChild(createConnectionsScoreContent("Tentative", languageAnalysis["Tentative"], "watsonTentativeTone", "tentativeScoreInfo", "#00ccbb"));

        var contentSocialDiv = document.createElement("div");
        contentSocialDiv.id = "socialScores";
        contentSocialDiv.style="position:absolute;left:65%;top:15%;width:25%; height:80%; background-color: #eeeeee;";
        var contentSocialTitle = document.createElement("h2");
        contentSocialTitle.innerHTML="Social Scores";
        contentSocialTitle.style="padding-left: 5%;";
        contentSocialTitle.appendChild(insertInfoPopup('socialScoreInfo'));
        contentSocialDiv.appendChild(contentSocialTitle);
        var socialAnalysis = getConnectionsToneCategoryAnalysis(bodyJSONObj, "social_tone");
        contentSocialDiv.appendChild(createConnectionsScoreContent("Openness", socialAnalysis["Openness"], "watsonOpennessTone", "opennessScoreInfo", "#00aacc"));
        contentSocialDiv.appendChild(createConnectionsScoreContent("Conscientiousness", socialAnalysis["Conscientiousness"], "watsonConsciousTone", "conscientiousnessScoreInfo", "#00aacc"));
        contentSocialDiv.appendChild(createConnectionsScoreContent("Extraversion", socialAnalysis["Extraversion"], "watsonExtraversionTone", "extraversionScoreInfo", "#00aacc"));
        contentSocialDiv.appendChild(createConnectionsScoreContent("Agreeableness", socialAnalysis["Agreeableness"], "watsonAgreeableTone", "agreeablenessScoreInfo", "#00aacc"));
        contentSocialDiv.appendChild(createConnectionsScoreContent("Emotional Range", socialAnalysis["Emotional Range"], "watsonEmotionRangeTone", "emotionalRangeScoreInfo", "#00aacc"));

        var chevronDiv = document.createElement("div");
        chevronDiv.id = "watsonToneAnalysisChevron";
        chevronDiv.style= "position: absolute; right: 2%; top: 45%; width: 5%; height: 80%;font-size:60px;cursor:pointer;";
        chevronDiv.onclick=function () { showSentenceToneAnalysis(bodyJSONObj); };
        chevronDiv.innerHTML = "&rangle;&rangle;";

        // Create the contentDiv
        var contentDiv = document.createElement("div");
        contentDiv.id = "watsonToneAnalysisContent";
        contentDiv.style = "background-color:#fefefe;position:relative;top:10%;z-index:1200;overflow:auto;margin:auto;border:1px solid #888;width:80%;height:80%;";

        // Add the close 'X' and content into it
        contentDiv.appendChild(closeDialogSpan);
        contentDiv.appendChild(contentDialogIntro);
        contentDiv.appendChild(contentEmotionsDiv);
        contentDiv.appendChild(contentLanguageDiv);
        contentDiv.appendChild(contentSocialDiv);
        contentDiv.appendChild(chevronDiv);

        // Add the contentDiv into the newDiv
        newDiv.appendChild(contentDiv);

        // Add the newDiv to the body
        document.body.appendChild(newDiv);
        // Show the results (turn on the newDiv)
        newDiv.style.display="block";
    }

    //
    // Highlight sentences when the user selects on category
    //
    function highlightSentences(bodyJSONObj,category)
    {
        var categoryColors = { "Anger":   { "fg" : "#FFF", "bg" : "#F00" },
                              "Disgust": { "fg" : "#FFF", "bg" : "#551a8b" },
                              "Fear":    { "fg" : "#FFF", "bg" : "#0D0" },
                              "Joy":     { "fg" : "#000", "bg" : "#FF0" },
                              "Sadness": { "fg" : "#FFF", "bg" : "#00F" },
                              "Analytical": { "fg" : "#FFF", "bg" : "#0CB" },
                              "Confident": { "fg" : "#FFF", "bg" : "#0CB" },
                              "Tentative": { "fg" : "#FFF", "bg" : "#0CB" },
                              "Openness":{ "fg" : "#FFF", "bg" : "#0AC" },
                              "Conscientiousness":{ "fg" : "#FFF", "bg" : "#0AC" },
                              "Extraversion":{ "fg" : "#FFF", "bg" : "#0AC" },
                              "Agreeableness":{ "fg" : "#FFF", "bg" : "#0AC" },
                              "Emotional Range":{ "fg" : "#FFF", "bg" : "#0AC" }
                             };
        var sentencesObj = bodyJSONObj["sentences_tone"];
        for ( var i = 0 ; i < sentencesObj.length ; i++ )
        {
            var numToneCategories = sentencesObj[i]["tone_categories"].length;
            for ( var j = 0 ; j < numToneCategories ; j++ )
            {
                var numTonesInCategory = sentencesObj[i]["tone_categories"][j]["tones"].length;
                for ( var k = 0 ; k < numTonesInCategory ; k++ )
                {
                    var currentToneObj = sentencesObj[i]["tone_categories"][j]["tones"][k];
                    if ( currentToneObj["tone_name"] == category )
                    {
                        var score = Number(currentToneObj["score"]);
                        var sentenceP = document.getElementById("toneSentence_" + i);
                        if ( score >= 0.75 )
                        {
                            var bgColor = categoryColors[category]["bg"];
                            var fgColor = categoryColors[category]["fg"];
                            sentenceP.style = "background-color: " + bgColor +";color:"+fgColor+";";
                        }
                        else
                        {
                            sentenceP.style = "background-color: white;color:black;";
                        }
                    }
                }
            }
        }
    }

    //
    // Show the details for selected sentences
    //
    function showSentenceBreakdown(bodyJSONObj, sentenceID)
    {
        var sortedCategories = [];
        var pos = sentenceID.indexOf("_");
        if ( pos == -1 )
        {
            return;
        }
        var sentenceNumber = Number(sentenceID.slice(pos+1));
        if ( sentenceNumber < 0 )
        {
            return;
        }
        var breakdownNode = document.getElementById("sentenceToneAnalysisBreakdown");
        breakdownNode.innerHTML = ""; // Clear it out
        var sentencesObj = bodyJSONObj["sentences_tone"];
        var numToneCategories = sentencesObj[sentenceNumber]["tone_categories"].length;
        for ( var j = 0 ; j < numToneCategories ; j++ )
        {
            var numTonesInCategory = sentencesObj[sentenceNumber]["tone_categories"][j]["tones"].length;
            for ( var k = 0 ; k < numTonesInCategory ; k++ )
            {
                var currentToneObj = sentencesObj[sentenceNumber]["tone_categories"][j]["tones"][k];
                var name = currentToneObj["tone_name"];
                var sentenceScore = Number(currentToneObj["score"]);
                sortedCategories.push( {category: name, score: sentenceScore} );
            }
        }
        // Sort the categories now
        sortedCategories.sort( function (a,b) {
            if ( a.score < b.score )
            {
                return -1;
            }
            if ( a.score > b.score )
            {
                return 1;
            }
            return 0;
        });
        // Insert the scores into the breakdown section
        var htmlTableStr = "<table style=\"margin:auto;padding: 5%;text-align:left;\"><tr><th>Category</th><th>Score</th></tr>";
        for ( var i = sortedCategories.length-1 ; i >=0 ; i-- )
        {
            htmlTableStr = htmlTableStr + "<tr><td>"+sortedCategories[i].category+"</td><td>"+sortedCategories[i].score+"</td></tr>";
        }
        breakdownNode.innerHTML = htmlTableStr + "</table>";
    }

    function showSentenceGraph(bodyJSONObj, sentenceID)
    {
        var largestCategory = "None";
        var largestCategoryScore = 0;

        var pos = sentenceID.indexOf("_");
        if ( pos == -1 )
        {
            return;
        }
        var sentenceNumber = Number(sentenceID.slice(pos+1));
        if ( sentenceNumber < 0 )
        {
            return;
        }
        var categoryBarGraphTitle = document.getElementById("categoryBarGraphTitle");
        var sentencesObj = bodyJSONObj["sentences_tone"];
        var numToneCategories = sentencesObj[sentenceNumber]["tone_categories"].length;
        for ( var j = 0 ; j < numToneCategories ; j++ )
        {
            var numTonesInCategory = sentencesObj[sentenceNumber]["tone_categories"][j]["tones"].length;
            for ( var k = 0 ; k < numTonesInCategory ; k++ )
            {
                var currentToneObj = sentencesObj[sentenceNumber]["tone_categories"][j]["tones"][k];
                var name = currentToneObj["tone_name"];
                var score = Number(currentToneObj["score"]);
                if ( score > largestCategoryScore )
                {
                    largestCategory = name;
                    largestCategoryScore = score;
                }
            }
        }
        // First reset the graphic bar by just hiding it
        var graphicBarPanel = document.getElementById("toneAnalysisCategoryBarGraph");
        graphicBarPanel.style.display = "block";

        // Set the title
        categoryBarGraphTitle.innerHTML=largestCategory;
        // Hide the message
        var categoryInfo = {
            "Anger" : "Evoked due to injustice, conflict, humiliation, negligence or betrayal. If anger is active, the individual attacks the target, verbally or physically. If anger is passive, the person silently sulks and feels tension and hostility.<p>Less than 0.5 - less likely to be perceived as angry.</p><p>More than 0.75 - Highly likely to be perceived as angry.</p>",
            "Disgust" : "An emotional response of revulsion to something considered offensive or unpleasant. It is a sensation that refers to something revolting.<p>Less than 0.5 - less likely to be perceived as disgusted.</p><p>More than 0.75 - Highly likely to be perceived as disgusted.</p>",
            "Fear" : "A response to impending danger. It is a survival mechanism that is a reaction to some negative stimulus. It may be a mild caution or an extreme phobia.<p>Less than 0.5 - less likely to be perceived as scared.</p><p>More than 0.75 - Highly likely to be perceived as scared.</p>",
            "Joy" : "Joy or happiness has shades of enjoyment, satisfaction and pleasure. There is a sense of well-being, inner peace, love, safety and contentment.<p>Less than 0.5 - less likely to be perceived as joyful.</p><p>More than 0.75 - Highly likely to be perceived as joyful.</p>",
            "Sadness" : "Indicates a feeling of loss and disadvantage. When a person can be observed to be quiet, less energetic and withdrawn, it may be inferred that sadness exists.<p>Less than 0.5 - less likely to be perceived as sad.</p><p>More than 0.75 - Highly likely to be perceived as sad.</p>",
            "Analytical" : "A person's reasoning and analytical attitude about things.<p>Less than 0.25 - the text contains little or no evidence of analytical tone.</p><p>More than 0.75 - more likely to be perceived as intellectual, rational, systematic, emotionless, or impersonal.</p>",
            "Confident" : "A person's degree of certainty.<p>Less than 0.25 - the text contains little or no evidence of confidence in tone.</p><p>More than 0.75 - more likely to be perceived as assured, collected, hopeful, or egotistical.</p>",
            "Tentative" : "A person's degree of inhibition.<p>Less than 0.25 - the text contains little or no evidence of tentativeness in tone.</p><p>More than 0.75 - more likely to be perceived as questionable, doubtful, limited, or debatable.</p>",
            "Openness" : "The extent a person is open to experience a variety of activities.<p>Less than 0.25 - more likely to be perceived as no-nonsense, straightforward, blunt, or preferring tradition and the obvious over the complex, ambiguous, and subtle.</p><p>More than 0.75 - more likely to be perceived as intellectual, curious, emotionally-aware, imaginative, willing to try new things, appreciating beauty, or open to change.</p>",
            "Conscientiousness" : "The tendency to act in an organized or thoughtful way.<p>Less than 0.25 - more likely to be perceived as spontaneous, laid-back, reckless, unmethodical, remiss, or disorganized.</p><p>More than 0.75 - more likely to be perceived as disciplined, dutiful, achievement-striving, confident, driven, or organized.</p>",
            "Extraversion" : "The tendency to seek stimulation in the company of others.<p>Less than 0.25 - more likely to be perceived as independent, timid, introverted, restrained, boring, or dreary.</p><p>More than 0.75 - more likely to be perceived as engaging, seeking attention, needy, assertive, outgoing, sociable, cheerful, excitement-seeking, or busy.</p>",
            "Agreeableness" : "The tendency to be compassionate and cooperative towards others.<p>Less than 0.25 - more likely to be perceived as selfish, uncaring, uncooperative, self-interested, confrontational, skeptical, or arrogant.</p><p>More than 0.75 - more likely to be perceived as caring, sympathetic, cooperative, compromising, trustworthy, or humble.</p>",
            "Emotional Range" : "The extent a person's emotion is sensitive to the environment.<p>Less than 0.25 - more likely to be perceived as calm, bland, content, relaxed, unconcerned, or careful.</p><p>More than 0.75 - more likely to be perceived as concerned, frustrated, angry, passionate, upset, stressed, insecure, or impulsive.</p>"
        };
        var categoryColorSteps = {
            "Anger" :             {step1:"rgb(255,255,255)",step2:"rgb(255,204,255)",step3:"rgb(255,175,175)",step4:"rgb(255,0,0)"},
            "Disgust" :           {step1:"rgb(255,255,255)",step2:"rgb(255,102,255)",step3:"rgb(204,0,204)",step4:"rgb(153,0,204)"},
            "Fear" :              {step1:"rgb(255,255,255)",step2:"rgb(204,255,153)",step3:"rgb(102,255,102)",step4:"rgb(0,255,0)"},
            "Joy" :               {step1:"rgb(255,255,255)",step2:"rgb(255,255,204)",step3:"rgb(255,255,153)",step4:"rgb(255,255,0)"},
            "Sadness" :           {step1:"rgb(255,255,255)",step2:"rgb(153,204,255)",step3:"rgb(51,204,255)",step4:"rgb(0,153,255)"},
            "Analytical" :        {step1:"rgb(255,255,255)",step2:"rgb(153,255,246)",step3:"rgb(26,255,236)",step4:"rgb(0,204,187)"},
            "Confident" :         {step1:"rgb(255,255,255)",step2:"rgb(153,255,246)",step3:"rgb(26,255,236)",step4:"rgb(0,204,187)"},
            "Tentative" :         {step1:"rgb(255,255,255)",step2:"rgb(153,255,246)",step3:"rgb(26,255,236)",step4:"rgb(0,204,187)"},
            "Openness" :          {step1:"rgb(255,255,255)",step2:"rgb(153,238,255)",step3:"rgb(51,221,255)",step4:"rgb(0,170,204)"},
            "Conscientiousness" : {step1:"rgb(255,255,255)",step2:"rgb(153,238,255)",step3:"rgb(51,221,255)",step4:"rgb(0,170,204)"},
            "Extraversion" :      {step1:"rgb(255,255,255)",step2:"rgb(153,238,255)",step3:"rgb(51,221,255)",step4:"rgb(0,170,204)"},
            "Agreeableness" :     {step1:"rgb(255,255,255)",step2:"rgb(153,238,255)",step3:"rgb(51,221,255)",step4:"rgb(0,170,204)"},
            "Emotional Range" :   {step1:"rgb(255,255,255)",step2:"rgb(153,238,255)",step3:"rgb(51,221,255)",step4:"rgb(0,170,204)"}
        };
        var mesg = document.getElementById("categoryBarMessageText");
        mesg.innerHTML = categoryInfo[largestCategory];
        // Update the bar graph's colors
        var step1 = categoryColorSteps[largestCategory].step1;
        var step2 = categoryColorSteps[largestCategory].step2;
        var step3 = categoryColorSteps[largestCategory].step3;
        var step4 = categoryColorSteps[largestCategory].step4;
        var horizBar = document.getElementById("largestToneLinearGradient");
        horizBar.style = "display:block;width:100%;height:25px;background:linear-gradient(to right,"+step1+","+step2+","+step3+","+step4+");";
        var blackLinePosition = document.getElementById("blackLinePosition");
        var leftPos = (largestCategoryScore*100).toFixed(0);
        blackLinePosition.style = "display:block;position:absolute;top:0px;width:2px;height:25px;background-color:black;left:"+leftPos.toString()+"%;";
        var blackLineText = document.getElementById("blackLineText");
        blackLineText.innerHTML = "&nbsp;" + largestCategoryScore;
    }

    //
    // Iterates through all sentence paragraphs on the page and removes
    // any borders from them that are put there when the user clicks on
    // a sentence.
    //
    function unHighlightSentences()
    {
        var paragraphs = document.getElementsByTagName("p");
        for ( var i = 0 ; i < paragraphs.length ; i++ )
        {
            if ( paragraphs[i].id.slice(0,13) == "toneSentence_" )
            {
                paragraphs[i].style["border-style"] = "none";
            }
        }
    }

    //
    // Show the details and graph for selected sentences
    //
    function showSentenceDetail(bodyJSONObj, sentenceID)
    {
        // Unhighlight all the sentences
        unHighlightSentences();

        // Highlight which sentence was chosen
        var whichSentence = document.getElementById( sentenceID );
        whichSentence.style["border-style"] = "groove";
        whichSentence.style["border-width"] = "1px;";

        // Display the sentence graph
        showSentenceGraph(bodyJSONObj, sentenceID);

        // Display the sentence breakdown
        showSentenceBreakdown(bodyJSONObj, sentenceID);
    }

    //
    // Emphasizes the categories when they are clicked.
    //
    function emphasizeCategory(event)
    {
        // De-emphasize all the categories and emphasize the selected one
        var listItems = document.getElementsByTagName("li");
        for ( var i = 0 ; i < listItems.length ; i++ )
        {
            if ( listItems[i].id.slice(0,17) == "toneCategoryItem_" )
            {
                listItems[i].style["background-color"] = "rgb(238, 238, 238)";
                listItems[i].style["color"] = "#000";
                listItems[i].style["font-size"] = "1.0em";
            }
            if ( listItems[i].innerHTML == event.target.innerHTML )
            {
                listItems[i].style["background-color"] = "#000";
                listItems[i].style["color"] = "#FFF";
                listItems[i].style["font-size"] = "14px";
            }
        }
    }

    //
    // Resets the Greatest Factor and Sentence Scores to their default state
    function resetRightPanels()
    {
        // First reset the graphic bar by just hiding it
        var graphicBarPanel = document.getElementById("toneAnalysisCategoryBarGraph");
        graphicBarPanel.style.display = "none";

        // Reset the sentence scores section
        var categoryInfoDetails = document.getElementById("sentenceToneAnalysisBreakdown");
        categoryInfoDetails.innerHTML = "Please select a sentence first to see a breakdown of its categories.";
    }

    //
    // Display results of Tone Analysis
    //
    function showSentenceToneAnalysis(bodyJSONObj)
    {
        // First insert a new div into the body that starts off hidden
        var newDiv = document.createElement("div");
        newDiv.id = "showWatsonSentenceToneAnalysis";
        newDiv.style = "display:none;position:fixed;z-index:3000;padding-top:0px;left:0;top:0;width:100%;height:100%;overflow:auto;background-color:rgb(0,0,0);background-color:rgba(0,0,0,0.3);";

        // Create a right floating button to close the dialog
        var closeDialogSpan = document.createElement("span");
        closeDialogSpan.id = "closeWatsonSentenceAnalysis";
        closeDialogSpan.style = "color:#aaaaaa;float:right;font-size:28px;cursor:pointer;font-weight:bold;padding-top:5px;padding-right:10px;";
        closeDialogSpan.innerHTML="x";
        closeDialogSpan.onclick = function() {
            // Add the newDiv to the body
            document.body.removeChild(document.getElementById("showWatsonSentenceToneAnalysis"));
        };

        // The content header to show in the contentDiv
        var contentDialogIntro = document.createElement("p");
        contentDialogIntro.id = "contentWatsonSentenceAnalysis";
        contentDialogIntro.style="padding-left: 5%;";
        contentDialogIntro.innerHTML="<h1>Sentence Level Scores</h1>";

        // --- Category Navigator ---
        var contentSentenceNavDiv = document.createElement("div");
        contentSentenceNavDiv.id = "scoreSentenceNavigation";
        contentSentenceNavDiv.style="position: absolute; left: 5%; top: 15%; width: 17%; height: 80%; background-color: rgb(238, 238, 238);";

        var contentSentenceCatTitle = document.createElement("div");
        contentSentenceCatTitle.style="padding: 5%;font-size: 1.4em;font-weight: bold;border-bottom: 2px inset rgb(220,220,220);";
        contentSentenceCatTitle.innerHTML = "Category Navigator";
        var contentEmotionsScoreTitle = document.createElement("p");
        contentEmotionsScoreTitle.innerHTML="Emotion Scores";
        contentEmotionsScoreTitle.style="padding-left: 5%;font-size: 1.2em;margin-bottom: 0px;font-weight: bold;";
        var contentEmotionsCategories = document.createElement("ul");
        contentEmotionsCategories.style="list-style-type: none;margin-top:2px;";
        var emotionCategories = [ "Anger", "Disgust", "Fear", "Joy", "Sadness" ];

        for ( var i = 0 ; i < emotionCategories.length ; i++ )
        {
            var emotionCategoryLI = document.createElement("li");
            emotionCategoryLI.id="toneCategoryItem_e_"+i;
            emotionCategoryLI.style="cursor:pointer;";
            emotionCategoryLI.onclick = function(event) { emphasizeCategory(event);resetRightPanels();highlightSentences(bodyJSONObj,event.target.innerHTML); };
            emotionCategoryLI.innerHTML = emotionCategories[i];
            contentEmotionsCategories.appendChild(emotionCategoryLI);
        }

        var contentLanguageScoreTitle = document.createElement("p");
        contentLanguageScoreTitle.innerHTML="Language Scores";
        contentLanguageScoreTitle.style="padding-left: 5%;font-size: 1.2em;margin-bottom: 0px;font-weight: bold;";
        var contentLanguageCategories = document.createElement("ul");
        contentLanguageCategories.style="list-style-type: none;margin-top:2px;";
        var languageCategories = [ "Analytical", "Confident", "Tentative" ];
        for ( i = 0 ; i < languageCategories.length ; i++ )
        {
            var languageCategoryLI = document.createElement("li");
            languageCategoryLI.id="toneCategoryItem_l_"+i;
            languageCategoryLI.style="cursor:pointer;";
            languageCategoryLI.onclick = function(event) { emphasizeCategory(event);resetRightPanels();highlightSentences(bodyJSONObj,event.target.innerHTML); };
            languageCategoryLI.innerHTML = languageCategories[i];
            contentLanguageCategories.appendChild(languageCategoryLI);
        }

        var contentSocialScoreTitle = document.createElement("p");
        contentSocialScoreTitle.innerHTML="Social Scores";
        contentSocialScoreTitle.style="padding-left: 5%;font-size: 1.2em;margin-bottom: 0px;font-weight: bold;";
        var contentSocialCategories = document.createElement("ul");
        contentSocialCategories.style="list-style-type: none;margin-top:2px;";
        var socialCategories = [ "Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Emotional Range" ];
        for ( i = 0 ; i < socialCategories.length ; i++ )
        {
            var socialCategoryLI = document.createElement("li");
            socialCategoryLI.id="toneCategoryItem_s_"+i;
            socialCategoryLI.style="cursor:pointer;";
            socialCategoryLI.onclick = function(event) { emphasizeCategory(event);resetRightPanels();highlightSentences(bodyJSONObj,event.target.innerHTML); };
            socialCategoryLI.innerHTML = socialCategories[i];
            contentSocialCategories.appendChild(socialCategoryLI);
        }
        contentSentenceNavDiv.appendChild(contentSentenceCatTitle);
        contentSentenceNavDiv.appendChild(contentEmotionsScoreTitle);
        contentSentenceNavDiv.appendChild(contentEmotionsCategories);
        contentSentenceNavDiv.appendChild(contentLanguageScoreTitle);
        contentSentenceNavDiv.appendChild(contentLanguageCategories);
        contentSentenceNavDiv.appendChild(contentSocialScoreTitle);
        contentSentenceNavDiv.appendChild(contentSocialCategories);

        // --- Sentences Content ---
        var contentSentenceNavTitle = document.createElement("div");
        contentSentenceNavTitle.style="padding: 1%;font-size: 1.4em;font-weight: bold;border-bottom: 2px inset rgb(220,220,220);";
        contentSentenceNavTitle.innerHTML = "Sentence Navigator";
        var contentTextDiv = document.createElement("div");
        contentTextDiv.style = "position: absolute; left: 25%; top: 15%; width: 35%; height: 80%; background-color: rgb(255, 255, 255); padding: 10px; overflow:auto;";
        contentTextDiv.id = "contentSentences";
        contentTextDiv.appendChild(contentSentenceNavTitle);
        var sentencesObj = bodyJSONObj["sentences_tone"];
        for ( i = 0 ; i < sentencesObj.length ; i++ )
        {
            var sentenceP = document.createElement("p");
            sentenceP.style = "background-color: white;color:black;"; // default to black text on white. Colors are changed upon click on the category.
            sentenceP.id = "toneSentence_" + i;
            sentenceP.innerHTML = sentencesObj[i]["text"];
            sentenceP.onclick = function(event) { showSentenceDetail(bodyJSONObj, event.target.id); };
            contentTextDiv.appendChild(sentenceP);
        }

        // --- Sentence Details ---
        var sentenceDetailsDiv = document.createElement("div");
        sentenceDetailsDiv.style = "position: absolute; left: 65%; top: 15%; width: 25%; height: 80%; background-color: rgb(255, 255, 255); padding: 4px; overflow:auto;";
        sentenceDetailsDiv.id = "sentenceDetails";

        var categoryBarGraph = document.createElement("div");
        categoryBarGraph.style= "display:none;background-color: #fff; border-color: #eee; border-style: none; border-width: 2px;box-shadow: 3px 3px 5px #888888;padding: 10px;";
        categoryBarGraph.id = "toneAnalysisCategoryBarGraph";

        var barGraphTitle = document.createElement("div");
        barGraphTitle.style="padding: 1%;font-size: 1.4em;font-weight: bold;border-bottom: 2px inset rgb(220,220,220);";
        barGraphTitle.innerHTML = "Greatest Factor";

        var categoryBarGraphTitle = document.createElement("div");
        categoryBarGraphTitle.id="categoryBarGraphTitle";
        categoryBarGraphTitle.style="padding-top:8px;";
        categoryBarGraphTitle.innerHTML = "Category";

        var categoryBarGraphic = document.createElement("div");
        categoryBarGraphic.style="position: relative;";
        var linearGradient = document.createElement("div");
        linearGradient.id="largestToneLinearGradient";
        linearGradient.style = "display:none;width:100%;height:25px;background:linear-gradient(to right,white,pink,rgb(255,175,175),red);";
        var blackLinePosition = document.createElement("div");
        blackLinePosition.id="blackLinePosition";
        blackLinePosition.style = "display:none;position:absolute;top:0px;left:20%;width:2px;height:25px;background-color:black;";
        var blackLineText = document.createElement("span");
        blackLineText.id="blackLineText";
        blackLineText.style="font-size:0.8em;padding-left:7px;";
        blackLineText.innerHTML = "&nbsp;" + "0.203137";
        blackLinePosition.appendChild(blackLineText);

        categoryBarGraphic.appendChild(linearGradient);
        categoryBarGraphic.appendChild(blackLinePosition);
        categoryBarGraph.appendChild(barGraphTitle);
        categoryBarGraph.appendChild(categoryBarGraphTitle);
        categoryBarGraph.appendChild(categoryBarGraphic);
        var categoryBarMessageText = document.createElement("p");
        categoryBarMessageText.id="categoryBarMessageText";
        categoryBarMessageText.innerHTML = "Please select a sentence to see it's largest category and score.";
        categoryBarGraph.appendChild(categoryBarMessageText);

        // Sentence scores
        var categoryInfoText = document.createElement("div");
        categoryInfoText.style= "background-color: #fff; border-color: #eee; border-style: none; border-width: 2px;margin-top: 5px;box-shadow: 3px 3px 5px #888888;padding: 10px;font-size:0.9em;";
        categoryInfoText.id = "toneAnalysisCategoryInfoText";

        var sentenceScoresTitle = document.createElement("div");
        sentenceScoresTitle.style="padding: 1%;font-size: 1.4em;font-weight: bold;border-bottom: 2px inset rgb(220,220,220);";
        sentenceScoresTitle.innerHTML = "Sentence Scores";
        var categoryInfoDetails = document.createElement("div");
        categoryInfoDetails.id = "sentenceToneAnalysisBreakdown";
        categoryInfoDetails.innerHTML = "Please select a sentence first to see a breakdown of its categories.";
        categoryInfoText.appendChild(sentenceScoresTitle);
        categoryInfoText.appendChild(categoryInfoDetails);

        sentenceDetailsDiv.appendChild(categoryBarGraph);
        sentenceDetailsDiv.appendChild(categoryInfoText);

        var chevronDiv = document.createElement("div");
        chevronDiv.id = "watsonSentenceToneAnalysisChevron";
        chevronDiv.style= "position: absolute; right: 2%; top: 45%; width: 5%; height: 80%;font-size:60px;cursor:pointer;";
        chevronDiv.onclick=function () {
            // Add the newDiv to the body
            document.body.removeChild(document.getElementById("showWatsonSentenceToneAnalysis"));
        };
        chevronDiv.innerHTML = "&rangle;&rangle;";

        // Create the contentDiv
        var contentDiv = document.createElement("div");
        contentDiv.id = "watsonSentenceToneAnalysisContent";
        contentDiv.style = "background-color:#fefefe;position:relative;top:10%;z-index:3200;overflow:hidden;margin:auto;border:1px solid #888;width:80%;height:80%;";


        // Add the close 'X' and content into it
        contentDiv.appendChild(closeDialogSpan);
        contentDiv.appendChild(contentDialogIntro);
        contentDiv.appendChild(contentSentenceNavDiv);
        contentDiv.appendChild(contentTextDiv);
        contentDiv.appendChild(sentenceDetailsDiv);
        contentDiv.appendChild(chevronDiv);

        // Add the contentDiv into the newDiv
        newDiv.appendChild(contentDiv);

        // Add the newDiv to the body
        document.body.appendChild(newDiv);
        // Show the results (turn on the newDiv)
        newDiv.style.display="block";
    }

    //
    // Function to setup the "Analyze Tone" button.  The button is on the
    // main screen that allows a user to highlight email text and then
    // click on the "Analyze Tone" button to get an analysis.  This button is
    // located at the top of the page in the Navigation Bar.
    //
    function cxMain()
    {
        // Add button to allow user to select content from anywhere and have
        // it analyzed by Watson Tone Analyzer
        var navBarDiv = findConnectionsNavbar();
        if ( navBarDiv !== null )
        {
            var img = document.createElement("img");
            img.src = "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH4AkYAR0ydFT7iAAAAAd0RVh0QXV0aG9yAKmuzEgAAAAMdEVYdERlc2NyaXB0aW9uABMJISMAAAAKdEVYdENvcHlyaWdodACsD8w6AAAADnRFWHRDcmVhdGlvbiB0aW1lADX3DwkAAAAJdEVYdFNvZnR3YXJlAF1w/zoAAAALdEVYdERpc2NsYWltZXIAt8C0jwAAAAh0RVh0V2FybmluZwDAG+aHAAAAB3RFWHRTb3VyY2UA9f+D6wAAAAh0RVh0Q29tbWVudAD2zJa/AAAABnRFWHRUaXRsZQCo7tInAAACu0lEQVQ4jYWUT4iWZRTFf+drhikkTEP6w6Azgen4J80WEaFig2FoIIIR5KJFuJFqIS402xi0aBUSQSSKVrhQKzVUwsIUVNCmQkcoEmESTAIZQUX9mnNafM9n77wOzIUX3nu5z7nnOc+9V0kYz5JsARqSNo+X26j5ncCOJJNr8QnAQ7Uic5J8Mh5gM0k38O4YhbpqsS3A/ddLMuqz/Yztv20/XIk9bvvJSt4M21dtT66fl+1Zki7UiiySdDzJLGAx8AhwszA6AQxJ6gEGaudmY/tn27uSPFZh1G37R9t/2f44Sb/tw7Z/sn3e9l7bT1Xyn7C9O8mZBrAQ+DfJt6XKCuAocBXYCTSBNcBc4ABwAegGBpKsLuQOAteBRVXtpth+wfag7amV+HLbV2wfs33S9roSn2v7rO0ltqe08+sPcsn22+V/he01tpfaPlRir9u+bHtO8efb/q2KUQXstz2SZF6SiUWr52x/XnTstD3J9peF8WdF99he1cbpqLzQMmBbkj5J04GXgA2S3kryZ5Ib5bVPAbMlrU3SlDQMLAW+rjf2RGAHsDHJAuBFSX8kuQXskfQ+0AE0JT2bZD3Qn+Q6MK0N0lEBnAS8J+lukk8lXU7SB2yX9EGSLuAirWlaCfRImpnkQ6BnLMA7QG+SXyStS7IfeA2YmWQIuF1aZhC4UtgNAueBR8cCHJD0RpJ9SaYVTe4Ae4FfiyQ/ALeAl4HttCZlJ7D1HkqlZabaHk7yQPF32R5KMqH4C5Mszv/WsP18+e+9N8vVfZjkI+BBSe8U/0hh+l1hkaLjOUlf0Vp1TUlr2xijAIFGkm8k3U7yPfAmMAI8TasjNkv6AuhKsgmYL+lVWuPZAmC0WdKqJCOStgELgHPAVknzgM4kp5Nck9QLrKyCjcWwev0+WkvhlXLVf4Bh4HdJ+6mtrrb9B7P1dCpRoQ8IAAAAAElFTkSuQmCC";
           
            img.id = 'watsonToneAnalyzer';
            img.addEventListener('click', analyzeConnectionsContent, false);
            var insertedNode = navBarDiv.parentNode.insertBefore(img, null);
        }
    }

    //
    // Kick off the processing of the page as soon as the page has loaded
    //
    window.addEventListener("load", function(event) {
        cxMain();
    });

})();