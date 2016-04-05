'use strict';

import $ from 'jquery';

class API {
    static BASE_URL = ''
    //static BASE_URL = 'http://pinoy-hoops.bbh-labs.com.sg'

    static login(email) {
        console.log('Test login from API');
    }
    static loggedIn() {
        return false;
    }
    static fetchHoops(done, fail) {
        $.ajax({
            url: API.BASE_URL + '/api/hoops',
            method: 'GET',
            dataType: 'json',
        }).done(done).fail(fail);
    }
    static addHoop(data, done, fail) {
        $.ajax({
            url: API.BASE_URL + '/api/hoop',
            method: 'POST',
            data: data,
            contentType: false,
            processData: false,
        }).done(done).fail(fail);
    }
}

/////////////////
// Other stuff //
/////////////////

function statusChangeCallback(response) {
    if (response.status === 'connected') {
        
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
