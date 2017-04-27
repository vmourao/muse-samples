define(["react"], function (React) {

    class ActivityList extends React.Component {

        constructor() {
            super();
            this.state = {
                activitySet: {
                    activities: []
                },
                currentOwner: null
            };
        }

        _getActivityAvatar(activity) {
            if (activity.community.communityUUID) {
                return React.createElement(
                    "a",
                    { href: this.props.instanceUrl + "/communities/service/html/communitystart?communityUuid=" + activity.community.communityUUID, target: "_new" },
                    React.createElement("img", { src: this.props.instanceUrl + "/communities/service/html/image?communityUuid=" + activity.community.communityUUID + "&showDefaultForNoPermissions=true", title: activity.community.communityName, className: "avatar" })
                );
            } else {
                return React.createElement(
                    "a",
                    { href: this.props.instanceUrl + "/profiles/html/profileView.do?userid=" + activity.author.id, target: "_new" },
                    React.createElement("img", { src: this.props.instanceUrl + "/contacts/profiles/photo/" + activity.author.id, title: activity.author.name, className: "avatar" })
                );
            }
        }

        _getActivities() {

            return this.state.activitySet.activities.map(activity => {
                return React.createElement(
                    "div",
                    { className: "activity", key: activity.id },
                    this._getActivityAvatar(activity),
                    React.createElement(
                        "span",
                        { className: "actTitle" },
                        React.createElement(
                            "a",
                            { href: this.props.instanceUrl + "/activities/service/html/mainpage#activitypage," + activity.id, target: "_new" },
                            activity.title
                        )
                    ),
                    React.createElement(
                        "span",
                        { className: "actContent" },
                        activity.content
                    )
                );
            });
        }

        render() {
            return React.createElement(
                "div",
                { className: "activitiesView" },
                this._getActivities()
            );
        }

        componentDidMount() {
            var _self = this;
            this.props.client.loadData(function () {
                _self.setState({ activitySet: _self.props.client.getActivities() });
            });
        }

        _selectContext(ownerId, event) {
            event.preventDefault();
            if (this.state.currentOwner == null || this.state.currentOwner !== ownerId) {
                activity.setState({ currentOwner: ownerId });
            } else {
                activity.setState({ currentOwner: null });
            }
        }

    }

    return ActivityList;
});