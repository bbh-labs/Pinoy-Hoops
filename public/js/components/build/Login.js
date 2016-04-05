'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Login = function (_React$Component) {
    _inherits(Login, _React$Component);

    function Login() {
        _classCallCheck(this, Login);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Login).apply(this, arguments));
    }

    _createClass(Login, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { className: 'login-page' },
                _react2.default.createElement(
                    'a',
                    { href: 'index.html' },
                    _react2.default.createElement('img', { className: 'logo', src: 'images/playpinoy_logo_w.png' })
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'form' },
                    _react2.default.createElement(
                        'form',
                        { action: '#', className: 'register-form' },
                        _react2.default.createElement('input', { type: 'text', placeholder: 'name' }),
                        _react2.default.createElement('input', { type: 'password', placeholder: 'password' }),
                        _react2.default.createElement('input', { type: 'email', placeholder: 'email address' }),
                        _react2.default.createElement(
                            'button',
                            null,
                            'create'
                        ),
                        _react2.default.createElement(
                            'p',
                            { className: 'message' },
                            'Already registered? ',
                            _react2.default.createElement(
                                'a',
                                { href: '#' },
                                'Sign In'
                            )
                        )
                    ),
                    _react2.default.createElement(
                        'form',
                        { action: '#', className: 'login-form' },
                        _react2.default.createElement(
                            'h4',
                            null,
                            'login'
                        ),
                        _react2.default.createElement(
                            'button',
                            { className: 'facebook-login', onClick: _api2.default.login.bind(this, 'facebook') },
                            'Facebook'
                        ),
                        _react2.default.createElement(
                            'button',
                            { className: 'twitter-login', onClick: _api2.default.login.bind(this, 'twitter') },
                            'Twitter'
                        ),
                        _react2.default.createElement(
                            'p',
                            { className: 'message' },
                            'Not registered? ',
                            _react2.default.createElement(
                                'a',
                                { href: '#' },
                                'Create an account'
                            )
                        )
                    )
                )
            );
        }
    }]);

    return Login;
}(_react2.default.Component);

module.exports = Login;