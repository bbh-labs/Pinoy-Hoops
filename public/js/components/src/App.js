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
    let nextPathname = nextState.location.pathname;

    if (API.loggedIn()) {
        switch (nextPathname) {
        case '/login':
            API.checkLogIn(function() {
                hashHistory.replace('/dashboard');
                //replace({
                //    pathname: '/dashboard',
                //    state: { nextPathname: nextPathname },
                //});
            }, function() {
            });
            break;
        }
    } else {
        switch (nextPathname) {
        case '/dashboard':
            API.checkLogIn(function() {
            }, function() {
                hashHistory.replace('/login');
                //replace({
                //    pathname: '/login',
                //    state: { nextPathname: nextPathname },
                //});
            });
        }
    }
}

ReactDOM.render((
    <Router history={ hashHistory }>
        <Route path='/' component={ App }>
            <Route path='dashboard' component={ Dashboard } onEnter={ requireAuth } />
            <Route path='login' component={ Login } onEnter={ requireAuth } />
        </Route>
    </Router>
), document.getElementById('root'));
