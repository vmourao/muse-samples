requirejs.config({
    baseUrl: 'js',
    paths: {
        jquery: '../vendor/jquery/dist/jquery.min',
        react: '../vendor/react/react',
        'react-dom': '../vendor/react/react-dom',
        'domReady': '../vendor/domReady/domReady'
    }
});

require(["activerse/ui/ActivityBubbles", "activerse/ui/ActivityList", "react-dom", "react", "domReady", "cnxclient/activities/ActivityClient"], function (ActivityBubbles, ActivityList, ReactDom, React, domReady, ActivityClient) {

    "use strict";

    var aClient = new ActivityClient();

    domReady(function () {
        console.log("Reacting Bobbles");
        var bobbles = ReactDom.render(React.createElement(ActivityBubbles, { client: aClient, instanceUrl: 'https://apps.ce.collabserv.com' }), document.getElementById("bubbles"));
        console.log("Reacting List");
        var actList = ReactDom.render(React.createElement(ActivityList, { client: aClient, instanceUrl: 'https://apps.ce.collabserv.com' }), document.getElementById("actList"));
    });
});