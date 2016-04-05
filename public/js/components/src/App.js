'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, Link, hashHistory } from 'react-router';

import Login from "./Login";
import Dashboard from "./Dashboard";
import API from "./api";
import dispatcher from './dispatcher';

class App extends React.Component {
    render() {
        return (
            <div id='app'>
                { this.props.children }
            </div>
        )
    }
    state = {
        user: null,
    }
    componentDidMount() {
        hashHistory.replace('/dashboard');

        this.dispatcherID = dispatcher.register((payload) => {
            switch (payload.type) {
            case 'loggedIn':
                this.setState({ user: payload.user });
                hashHistory.replace('/dashboard');
                break;
            }
        });
    }
}

function requireAuth(nextState, replace) {
    if (!API.loggedIn()) {
        replace({
            pathname: '/login',
            state: { nextPathname: nextState.location.pathname },
        });
    }
}

ReactDOM.render((
    <Router history={ hashHistory }>
        <Route path='/' component={ App }>
            <Route path='dashboard' component={ Dashboard } onEnter={ requireAuth } />
            <Route path='login' component={ Login } />
        </Route>
    </Router>
), document.getElementById('root'));
