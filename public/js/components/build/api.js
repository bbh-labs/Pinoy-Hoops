'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _dispatcher = require('./dispatcher');

var _dispatcher2 = _interopRequireDefault(_dispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var API = function () {
    function API() {
        _classCallCheck(this, API);
    }

    _createClass(API, null, [{
        key: 'login',

        //static BASE_URL = 'http://pinoy-hoops.bbh-labs.com.sg'

        value: function login(type) {
            switch (type) {
                default:
                case 'facebook':
                    FB.login(function (user) {
                        FB.api('/me', 'GET', { fields: 'id,name,email' }, function (user) {
                            API.loginUser({ name: user.name, email: user.email, facebook_id: user.id }, function (user) {
                                API.user = user;
                                _dispatcher2.default.dispatch({ type: 'loggedIn', user: user });
                            }, function (response) {
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
    }, {
        key: 'loginUser',
        value: function loginUser(user, done, fail) {
            _jquery2.default.ajax({
                url: API.BASE_URL + '/api/login',
                method: 'POST',
                data: user,
                dataType: 'json'
            }).done(done).fail(fail);
        }
    }, {
        key: 'loggedIn',
        value: function loggedIn() {
            return !!API.user;
        }
    }, {
        key: 'checkLogIn',
        value: function checkLogIn(done, fail) {
            _jquery2.default.ajax({
                url: '/api/login',
                method: 'GET'
            }).done(done).fail(fail);
        }
    }, {
        key: 'logOut',
        value: function logOut() {
            API.user = null;
        }
    }, {
        key: 'fetchHoops',
        value: function fetchHoops(done, fail) {
            _jquery2.default.ajax({
                url: API.BASE_URL + '/api/hoops',
                method: 'GET',
                dataType: 'json'
            }).done(done).fail(fail);
        }
    }, {
        key: 'addHoop',
        value: function addHoop(data, done, fail) {
            _jquery2.default.ajax({
                url: API.BASE_URL + '/api/hoop',
                method: 'POST',
                data: data,
                contentType: false,
                processData: false
            }).done(done).fail(fail);
        }
    }]);

    return API;
}();

/////////////////
// Other stuff //
/////////////////

API.BASE_URL = '';
API.user = null;
function statusChangeCallback(response) {
    if (response.status === 'connected') {
        FB.api('/me', 'GET', { fields: 'id,name,email' }, function (response) {
            API.getUser(response.email, function (user) {
                _dispatcher2.default.dispatch({ type: 'loggedIn', user: { id: user.id, email: user.email } });
            }, function (response) {
                console.log('failed: ' + response);
                alert('Could not login!');
            });
        });
    } else if (response.status === 'not_authorized') {} else {}
}

function checkLoginState() {
    FB.getLoginState(function (response) {
        statusChangeCallback(response);
    });
}

module.exports = API;