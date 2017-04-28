define(["vue"], function (Vue) {

    Vue.component('av-bubbles', {
        props : ['user','client'],
        template: '<div class="activitiesBubbles" >' +
            '<a v-for="bubble in bubbles" v-on:click="selectBubble(bubble)" ><img :src="userPhoto(bubble)" :title="bubble.text" class="avatar" ></a>' +
            '</div>', 
        methods : {
            userPhoto : function(bubble) {
                return this.serverBaseUrl + "/contacts/profiles/photo/" + bubble.userid;
            },
            community : function(bubble) {
                return this.serverBaseUrl + "/contacts/profiles/photo/" + bubble.userid;
            },
            selectBubble : function(bubble) {
                console.log(bubble.text);
            }
        },
        data : function() {
            return {
                serverBaseUrl : 'https://apps.collabservintegration.com',
                bubbles : [
                    { id: 1, text: "Daniele Vistalli", userid: "200305132" },
                    { id: 2, text: "Marco Merlo", userid: "200276273" }
                ]
            };
        },
        mounted: function() {
            this.bubbles = [
                    { id: 1, text: "Daniele Vistalli", userid: "200305132" },
                    { id: 2, text: "Marco Merlo", userid: "200276273" },
                    { id: 3, text: "Daniele Vistalli2", userid: "200305132" },
                    { id: 4, text: "Marco Merlo2", userid: "200276273" }
            ]
        }
    });

    Vue.component('av-list', {
        template: '<div>Hello World !!!</div>'
    });

    var ActivitiyWidgets = {

    }

    return ActivitiyWidgets;
});