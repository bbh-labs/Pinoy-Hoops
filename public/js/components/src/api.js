'use strict';

import $ from 'jquery';

import dispatcher from './dispatcher';

class API {
    static BASE_URL = ''
    static user = null
    //static BASE_URL = 'http://pinoy-hoops.bbh-labs.com.sg'

    static login(type) {
        switch (type) {
        default:
        case 'facebook':
            FB.login(function(user) {
                FB.api('/me', 'GET', { fields: 'id,name,email' }, function(user) {
                    API.loginUser({ name: user.name, email: user.email, facebook_id: user.id }, function(user) {
                        API.user = user;
                        dispatcher.dispatch({ type: 'loggedIn', user: user });
                    }, function(response) {
                        alert('failed: ' + response.statusText);
                    });
                });
            }, { scope: 'public_profile,email' });
            break;
        case 'twitter':
            console.log('Logging in through Twitter');
            break;
        }
    }
    static loginUser(user, done, fail) {
        $.ajax({
            url: API.BASE_URL + '/api/login',
            method: 'POST',
            data: user,
            dataType: 'json',
        }).done(done).fail(fail);
    }
    static loggedIn() {
        return !!API.user;
    }
    static checkLogIn(done, fail) {
        $.ajax({
            url: '/api/login',
            method: 'GET',
        }).done(done).fail(fail);
    }
    static logOut() {
        $.ajax({
            url: '/api/logout',
            method: 'POST',
        }).done(function() {
            API.user = null;
            window.location.reload();
        }).fail(fail);
    }
    static getHoops(done, fail) {
        $.ajax({
            url: API.BASE_URL + '/api/hoops',
            method: 'GET',
            dataType: 'json',
        }).done(done).fail(function(response) {
            fail(response);
            if (response.status == 400) {
                window.location.reload();
            }
        });
    }
    static addHoop(data, done, fail) {
        $.ajax({
            url: API.BASE_URL + '/api/hoop',
            method: 'POST',
            data: data,
            contentType: false,
            processData: false,
        }).done(done).fail(function(response) {
            fail(response);
            if (response.status == 400) {
                window.location.reload();
            }
        });
    }
    static deleteHoop(data, done, fail) {
        $.ajax({
            url: API.BASE_URL + '/api/hoop',
            method: 'DELETE',
            data: data,
            contentType: false,
            processData: false,
        }).done(done).fail(function(response) {
            fail(response);
            if (response.status == 400) {
                window.location.reload();
            }
        });
    }
    static getActivities(done, fail) {
        $.ajax({
            url: API.BASE_URL + '/api/activities',
            method: 'GET',
            dataType: 'json',
        }).done(done).fail(function(response) {
            fail(response);
            if (response.status == 400) {
                window.location.reload();
            }
        });
    }
}

/////////////////
// Other stuff //
/////////////////

function statusChangeCallback(response) {
    if (response.status === 'connected') {
        FB.api('/me', 'GET', { fields: 'id,name,email' }, function(response) {
            API.getUser(response.email, function(user) {
                dispatcher.dispatch({ type: 'loggedIn', user: { id: user.id, email: user.email } });
            }, function(response) {
                console.log('failed: ' + response);
                alert('Could not login!');
            });
        });
    } else if (response.status === 'not_authorized') {
        
    } else {
        
    }
}

function checkLoginState() {
    FB.getLoginState(function(response) {
        statusChangeCallback(response);
    });
}

module.exports = API;
