define(['jquery'], function ($) {
    "use strict";

    var parser = {
        getActivities: function (xmldata) {

            var _self = this;
            var result = {
                activities: []
            };

            $(xmldata).find("entry").each(function () {

                var tmp = {};
                tmp.title = $(this).children('title').text();
                tmp.content = $(this).children('content').text().trim();
                tmp.id = $('snx\\:activity', this).text();
                tmp.isExternal = $(this).children('snx\\:isExternal').text();
                tmp.author = _self._parsePerson($('author', this));
                tmp.tags = [];

                // Priority
                // category scheme="http://www.ibm.com/xmlns/prod/sn/priority"

                $(this).children("category").each(function () {
                    if ($(this).attr('scheme') === 'http://www.ibm.com/xmlns/prod/sn/type') {
                        tmp.type = {
                            term: $(this).attr('term'),
                            label: $(this).attr('label')
                        };
                    } else if ($(this).attr('scheme') === 'http://www.ibm.com/xmlns/prod/sn/priority') {
                        tmp.priority = {
                            level: $(this).attr('term'),
                            label: $(this).attr('label')
                        };
                    } else {
                        tmp.tags.push($(this).attr('term'));
                    }
                });

                $(this).find('contributor').each(function () {
                    tmp.contributors = tmp.contributors || [];
                    tmp.contributors.push(_self._parsePerson(this));
                });

                tmp.dueDate = $('snx\\:duedate', this).text();

                if ($('snx\\:communityUuid', this) != null) {
                    tmp.community = {
                        communityUUID: $('snx\\:communityUuid', this).text(),
                        communityName: $('snx\\:communityName', this).text()
                    };
                }

                result.activities.push(tmp);
            });

            result.total = $('os\\:totalResults', xmldata).text();
            result.updated = $('updated', xmldata).text();

            return result;
        },
        _parsePerson: function (personNode) {

            var person = {};
            person.name = $('name', personNode).text();
            person.id = $('snx\\:userid', personNode).text();
            person.isExternal = $('snx\\:isExternal', personNode).text();
            // person.orgId = '';
            // person.email = '';

            return person;
        }
    };

    return parser;
});