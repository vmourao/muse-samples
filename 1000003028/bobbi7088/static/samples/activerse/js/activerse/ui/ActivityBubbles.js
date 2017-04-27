define(["react"], function (React) {

    class ActivityBubbles extends React.Component {

        constructor() {
            super();
            this.state = {
                bubbles: [],
                currentOwner: null
            };
        }

        _getBubbles() {
            return this.state.bubbles.map(bubble => {
                if (bubble.communityUUID) {
                    return React.createElement(
                        "a",
                        { href: "#" + bubble.communityUUID,
                            className: "ownerFilter",
                            target: "_new",
                            key: bubble.communityUUID,
                            onClick: this._selectContext.bind(this, bubble.communityUUID) },
                        React.createElement("img", { src: this.props.instanceUrl + "/communities/service/html/image?communityUuid=" + bubble.communityUUID + "&showDefaultForNoPermissions=true",
                            title: bubble.communityName, className: "avatar" })
                    );
                } else {
                    return React.createElement(
                        "a",
                        { href: "#" + bubble.id,
                            className: "ownerFilter",
                            target: "_new",
                            key: bubble.id,
                            onClick: this._selectContext.bind(this, bubble.id) },
                        React.createElement("img", { src: this.props.instanceUrl + "/contacts/profiles/photo/" + bubble.id, title: bubble.name, className: "avatar" })
                    );
                }
            });
        }

        render() {
            return React.createElement(
                "div",
                { className: "activitiesBubbles" },
                this._getBubbles()
            );
        }

        componentDidMount() {
            var _self = this;
            this.props.client.loadData(function () {
                _self.setState({ bubbles: _self.props.client.getBubbles() });
            });
        }

        _selectContext(ownerId, event) {
            event.preventDefault();
            if (this.state.currentOwner == null || this.state.currentOwner !== ownerId) {
                this.setState({ currentOwner: ownerId });
            } else {
                this.setState({ currentOwner: null });
            }
        }

    }

    return ActivityBubbles;
});