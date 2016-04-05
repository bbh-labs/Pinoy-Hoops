'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var API = function () {
    function API() {
        _classCallCheck(this, API);
    }

    _createClass(API, null, [{
        key: 'login',

        //static BASE_URL = 'http://pinoy-hoops.bbh-labs.com.sg'

        value: function login(email) {
            console.log('Test login from API');
        }
    }, {
        key: 'loggedIn',
        value: function loggedIn() {
            return false;
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
function statusChangeCallback(response) {
    if (response.status === 'connected') {} else if (response.status === 'not_authorized') {} else {}
}

function checkLoginState() {
    FB.getLoginState(function (response) {
        statusChangeCallback(response);
    });
}

module.exports = API;