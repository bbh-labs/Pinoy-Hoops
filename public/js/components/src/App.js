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

        API.loginUser({}, function(user) {
            API.user = user;
            dispatcher.dispatch({ type: 'loggedIn', user: user });
        }, function() {
            // do nothing
        });

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
    switch (nextState.location.pathname) {
    case '/login':
        if (API.loggedIn()) {
            replace({
                pathname: '/dashboard',
                state: { nextPathname: nextState.location.pathname },
            });
        }
        //API.checkLogIn(function() {
        //    hashHistory.replace('/dashboard');
        //}, function() {
        //    // do nothing
        //});
        break;
    case '/dashboard':
        if (!API.loggedIn()) {
            replace({
                pathname: '/login',
                state: { nextPathname: nextState.location.pathname },
            });
        }
        //API.checkLogIn(function() {
        //    // do nothing
        //}, function() {
        //    hashHistory.replace('/login');
        //});
        break;
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
