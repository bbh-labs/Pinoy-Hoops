'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router';

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
    <Router history={ browserHistory }>
        <Route path='/' component={ App }>
            <IndexRoute component={ Dashboard } onEnter={ requireAuth } />
            <Route path='login' component={ Login } />
        </Route>
    </Router>
), document.getElementById('root'));
