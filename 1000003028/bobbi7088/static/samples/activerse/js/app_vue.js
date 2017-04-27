requirejs.config({
    baseUrl: 'js',
    paths: {
        jquery: '../vendor/jquery/dist/jquery.min',
        'domReady': '../vendor/domReady/domReady',
        'vue': '../vendor/vue/dist/vue'
    }
});

require(["activerse/uivue/ActivityWidgets", "vue", "domReady", "cnxclient/activities/ActivityClient"], function (ActivityWidgets, Vue, domReady, ActivityClient) {

    "use strict";

    var aClient = new ActivityClient();

    console.log("client:", aClient);

    domReady(function () {

        console.log('Starting vue');
     
        new Vue({
            el: "#bubbles",
            data: {
                user: "Daniele Vistalli",
                client: aClient
            }
        });

    });
});