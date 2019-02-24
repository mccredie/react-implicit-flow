import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
    <App
        authParams={{
            authority: process.env.REACT_APP_AUTH_URL,
            client_id: process.env.REACT_APP_CLIENT_ID,
            response_type: 'token id_token',
        }}
     />,
    document.getElementById('root')
);




// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
