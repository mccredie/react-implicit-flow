
import React from 'react';
import PropTypes from 'prop-types';

const AUTHENTICATED = "AUTHENTICATED";
const NOT_AUTHENTICATED = "NOT_AUTHENTICATED";
const AUTHENTICATING = "AUTHENTICATING";
const AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED";

export default class AuthorizeContainer extends React.Component {
    static get AUTHENTICATED() {
        return AUTHENTICATED;
    }
    static get NOT_AUTHENTICATED() {
        return NOT_AUTHENTICATED;
    }
    static get AUTHENTICATING() {
        return AUTHENTICATING;
    }
    static get AUTHENTICATION_FAILED(){
        return AUTHENTICATION_FAILED;
    }

    static propTypes = {
        desiredAuthStatus: PropTypes.oneOf([
            AUTHENTICATED,
            NOT_AUTHENTICATED
        ]).isRequired
    }

    constructor(props) {
        super(props);
        this.state = {
            authStatus: NOT_AUTHENTICATED,
            authTokens: null
        };
    }

    handleReceiveTokens = (e) => {
        if (e.origin === window.location.origin) {
            console.log(e);
            const result = e.data.result;
            if(result && result.access_token && result.id_token) {
                this.setState({
                    authStatus: AUTHENTICATED,
                    authTokens: result
                });
            }
        }
    }

    updateStatus() {
        const { desiredAuthStatus } = this.props;
        const { authStatus } = this.state;

        if (authStatus !== desiredAuthStatus) {
            if (desiredAuthStatus === AUTHENTICATED) {
                this.setState({ authStatus: AUTHENTICATING });
                window.addEventListener('message', this.handleReceiveTokens, false)
            }
            else if (desiredAuthStatus === NOT_AUTHENTICATED) {
                this.setState({ authStatus: NOT_AUTHENTICATED });
            }
        }
    }

    componentDidMount() {
        if (inIFrame()) {
            const authResult = queryToObject(window.location.hash); 
            window.parent.postMessage(
                {
                    result: authResult
                },
                window.location.origin
            );
        }
        this.updateStatus();
    }

    componentDidUpdate(prevProps) {
        const { desiredAuthStatus: prevDesiredAuthStatus } = prevProps;
        const { desiredAuthStatus } = this.props;

        if (desiredAuthStatus !== prevDesiredAuthStatus) {
            this.updateStatus();
        }
    }

    render() {
        const { children } = this.props;
        const { authStatus, authTokens } = this.state;
         
        if (inIFrame()) {
            return null;
        }

        const content = children(authStatus, authTokens);
        if (authStatus === AUTHENTICATING) {
            const { authParams }  = this.props;
            const { authority, ...params } = authParams;

            const authUrl = makeAuthUrl(
                authority, 
                {
                    prompt: 'none',
                    nonce: randomString(30),
                    redirect_uri: window.location.origin,
                    ...params
                }
            );
            return <div>
                {content}
                <iframe title="login" src={authUrl}/>
            </div>;
        } else {
            return content;
        }
    }
} 

const queryToObject = (queryString) => (
    queryString.substr(1).split('&')
        .map(
            (entry) => entry.split('=')
                .map(decodeURIComponent)
        ).reduce(
            (acc, [key, value]) => ({ ...acc, [key]: value }),
            {}
        )
);

const inIFrame = () => {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
};

const enc = encodeURIComponent;
const makeAuthUrl = (base, params) => (
  `${base}?` + Object.keys(params)
    .map((key) => `${enc(key)}=${enc(params[key])}`)
    .join('&')
);

var randomString = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
