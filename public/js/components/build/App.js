'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRouter = require('react-router');

var _Login = require('./Login');

var _Login2 = _interopRequireDefault(_Login);

var _Dashboard = require('./Dashboard');

var _Dashboard2 = _interopRequireDefault(_Dashboard);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _dispatcher = require('./dispatcher');

var _dispatcher2 = _interopRequireDefault(_dispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
    _inherits(App, _React$Component);

    function App() {
        var _Object$getPrototypeO;

        var _temp, _this, _ret;

        _classCallCheck(this, App);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(App)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.state = {
            user: null
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(App, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { id: 'app' },
                this.props.children
            );
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            _reactRouter.hashHistory.replace('/dashboard');

            _api2.default.loginUser({}, function (user) {
                _api2.default.user = user;
                _dispatcher2.default.dispatch({ type: 'loggedIn', user: user });
            }, function () {
                // do nothing
            });

            this.dispatcherID = _dispatcher2.default.register(function (payload) {
                switch (payload.type) {
                    case 'loggedIn':
                        _this2.setState({ user: payload.user });
                        _reactRouter.hashHistory.replace('/dashboard');
                        break;
                }
            });
        }
    }]);

    return App;
}(_react2.default.Component);

function requireAuth(nextState, replace) {
    switch (nextState.location.pathname) {
        case '/login':
            if (_api2.default.loggedIn()) {
                replace({
                    pathname: '/dashboard',
                    state: { nextPathname: nextState.location.pathname }
                });
            }
            //API.checkLogIn(function() {
            //    hashHistory.replace('/dashboard');
            //}, function() {
            //    // do nothing
            //});
            break;
        case '/dashboard':
            if (!_api2.default.loggedIn()) {
                replace({
                    pathname: '/login',
                    state: { nextPathname: nextState.location.pathname }
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

_reactDom2.default.render(_react2.default.createElement(
    _reactRouter.Router,
    { history: _reactRouter.hashHistory },
    _react2.default.createElement(
        _reactRouter.Route,
        { path: '/', component: App },
        _react2.default.createElement(_reactRouter.Route, { path: 'dashboard', component: _Dashboard2.default, onEnter: requireAuth }),
        _react2.default.createElement(_reactRouter.Route, { path: 'login', component: _Login2.default, onEnter: requireAuth })
    )
), document.getElementById('root'));