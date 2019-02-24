import React, { Component } from 'react';
import AuthorizeContainer from './Authorize';
import './App.css';

class App extends Component {
  state = {
    desiredAuthStatus: AuthorizeContainer.NOT_AUTHENTICATED
  }

  handleLogin = () => {
    this.setState({
      desiredAuthStatus: AuthorizeContainer.AUTHENTICATED
    });
  }

  handleLogout = () => {
    this.setState({
      desiredAuthStatus: AuthorizeContainer.NOT_AUTHENTICATED
    });
  }

  render() {
    const { desiredAuthStatus } = this.state;
    const { authParams } = this.props;
    return (
      <div>
        <AuthorizeContainer authParams={authParams} desiredAuthStatus={desiredAuthStatus}>
          {
            (status) => {
              switch(status) {
                case AuthorizeContainer.NOT_AUTHENTICATED:
                  return <div>
                    <button onClick={this.handleLogin}>Login</button>
                  </div>;
                case AuthorizeContainer.AUTHENTICATED:
                  return <div>
                    <button onClick={this.handleLogout}>Logout</button>
                  </div>;
                default:
                  return <div>{status}</div>;
              }
            }
          }
        </AuthorizeContainer>
      </div>
    );
  }
}

export default App;
