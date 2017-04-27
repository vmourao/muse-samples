define(['jquery', './activityparser'], function ($, aParser) {
    "use strict";

    class ActivityClient {

        constructor() {
            this.settings = {
                url: '/activities/service/atom2/activities'
            };
            this.state = {
                activities: {},
                bubbles: []
            };
        }

        getActivities() {
            return this.state.activities;
        }

        getBubbles() {
            return this.state.bubbles;
        }

        loadData(readyFunc) {
            let _self = this;

            console.log("loadData", _self.settings.url);

            $.get({
                url: _self.settings.url,
                data: {
                    ps: 50,
                    nodetype: 'activity',
                    sortfields: 'lastmod',
                    sortorder: '1',
                    templates: 'no'
                },
                dataType: 'xml'
            }).done(function (data) {

                console.log("Success", data);

                var activities = aParser.getActivities(data);

                _self.state.activities = activities;

                var bubbles = [];

                // Popolamento dati "bubbles";
                $(activities.activities).each(function () {

                    if (this.community.communityUUID) {
                        var _act = this;
                        if ($.grep(bubbles, function (el, idx) {
                            return _act.community.communityUUID === el.communityUUID;
                        }).length === 0) {
                            bubbles.push(this.community);
                        }
                    } else {
                        var _act = this;
                        if ($.grep(bubbles, function (el, idx) {
                            return _act.author.id === el.id;
                        }).length === 0) {
                            bubbles.push(this.author);
                        }
                    }
                });
                bubbles.sort(function (a, b) {
                    if (a.communityUUID && b.id) {
                        return 1;
                    } else if (a.id && b.communityUUID) {
                        return -1;
                    } else if (a.communityUUID && b.communityUUID) {
                        return a.communityName.localeCompare(b.communityName);
                    } else if (a.id && b.id) {
                        return a.name.localeCompare(b.name);
                    }
                });

                _self.state.bubbles = bubbles; // Save to state

                if (typeof readyFunc == 'function') {
                    readyFunc(this);
                }
            }).fail(function (err) {
                console.log("error", err);
            });
        }
    }

    return ActivityClient;
});