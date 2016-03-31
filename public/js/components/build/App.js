'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _flux = require('flux');

var _flux2 = _interopRequireDefault(_flux);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var dispatcher = new _flux2.default.Dispatcher();

var App = function (_React$Component) {
    _inherits(App, _React$Component);

    function App() {
        _classCallCheck(this, App);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(App).apply(this, arguments));
    }

    _createClass(App, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { id: 'app' },
                _react2.default.createElement(Mapp, null),
                _react2.default.createElement(Menu, null),
                _react2.default.createElement(AddHoop, null)
            );
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            dispatcher.register(function (payload) {
                switch (payload.type) {
                    case 'map-click':
                        // TODO: Implement upload hoop by clicking on the map
                        console.log(payload.event.latlng);
                        break;
                }
            });
        }
    }]);

    return App;
}(_react2.default.Component);

var Mapp = function (_React$Component2) {
    _inherits(Mapp, _React$Component2);

    function Mapp() {
        _classCallCheck(this, Mapp);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Mapp).apply(this, arguments));
    }

    _createClass(Mapp, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement('div', { id: 'map' });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            L.mapbox.accessToken = 'pk.eyJ1IjoiemFjb25nIiwiYSI6ImNpbG4yOHB4cTAwczZ1bGtuZGFkcW11OWEifQ.5CuLAlmVw7YwZblPzvJvAw';
            var map = L.mapbox.map('map', 'zacong.phbnc5dd');
            map.on('click', function (event) {
                dispatcher.dispatch({ type: 'map-click', event: event });
            });
        }
    }]);

    return Mapp;
}(_react2.default.Component);

var Menu = function (_React$Component3) {
    _inherits(Menu, _React$Component3);

    function Menu() {
        _classCallCheck(this, Menu);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Menu).apply(this, arguments));
    }

    _createClass(Menu, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { className: 'wrapper' },
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'dt-12 tl-6 tp-8 ml-6' },
                        _react2.default.createElement(
                            'ul',
                            { className: 'menu' },
                            _react2.default.createElement(
                                'a',
                                { href: '/' },
                                _react2.default.createElement('img', { className: 'logo', src: 'images/playpinoy_logo_b.png' })
                            ),
                            _react2.default.createElement(
                                'li',
                                { className: 'right' },
                                _react2.default.createElement(
                                    'a',
                                    { href: 'login.html' },
                                    'login'
                                )
                            ),
                            _react2.default.createElement(
                                'div',
                                { className: 'hamburger' },
                                _react2.default.createElement(
                                    'a',
                                    { 'data-toggle': 'collapse', href: '#collapse2' },
                                    _react2.default.createElement('img', { src: 'images/basketball_b.png' })
                                )
                            ),
                            _react2.default.createElement(
                                'div',
                                { id: 'collapse2', className: 'panel-collapse collapse' },
                                _react2.default.createElement(
                                    'div',
                                    { className: 'sub-menu' },
                                    _react2.default.createElement(
                                        'a',
                                        { href: '#popup1' },
                                        _react2.default.createElement(
                                            'p',
                                            null,
                                            'Add a hoop'
                                        )
                                    ),
                                    _react2.default.createElement(
                                        'p',
                                        null,
                                        _react2.default.createElement(
                                            'a',
                                            null,
                                            'Popular hoop'
                                        )
                                    ),
                                    _react2.default.createElement(
                                        'p',
                                        null,
                                        _react2.default.createElement(
                                            'a',
                                            null,
                                            'Nearby hoop'
                                        )
                                    ),
                                    _react2.default.createElement(
                                        'p',
                                        null,
                                        _react2.default.createElement(
                                            'a',
                                            null,
                                            'Latest hoop'
                                        )
                                    ),
                                    _react2.default.createElement(
                                        'a',
                                        { href: '#popup2' },
                                        _react2.default.createElement(
                                            'p',
                                            null,
                                            'About'
                                        )
                                    ),
                                    _react2.default.createElement(
                                        'p',
                                        null,
                                        _react2.default.createElement(
                                            'a',
                                            null,
                                            'Join the Community'
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            );
        }
    }]);

    return Menu;
}(_react2.default.Component);

var AddHoop = function (_React$Component4) {
    _inherits(AddHoop, _React$Component4);

    function AddHoop() {
        _classCallCheck(this, AddHoop);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(AddHoop).apply(this, arguments));
    }

    _createClass(AddHoop, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { className: 'wrapper' },
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'add-hoop' },
                        _react2.default.createElement(
                            'div',
                            { id: 'popup1', className: 'overlay' },
                            _react2.default.createElement(
                                'div',
                                { className: 'popup' },
                                _react2.default.createElement(
                                    'h3',
                                    null,
                                    'Name your hoop'
                                ),
                                _react2.default.createElement(
                                    'a',
                                    { className: 'close', href: '#' },
                                    '×'
                                ),
                                _react2.default.createElement(
                                    'div',
                                    { className: 'content' },
                                    _react2.default.createElement(
                                        'p',
                                        null,
                                        'Name your hoop'
                                    ),
                                    _react2.default.createElement('textarea', { rows: '1', cols: '50', maxlength: '50' }),
                                    _react2.default.createElement(
                                        'p',
                                        null,
                                        'Tell us more about the hoop'
                                    ),
                                    _react2.default.createElement('textarea', { rows: '6', cols: '50', maxlength: '200' }),
                                    _react2.default.createElement(
                                        'p',
                                        null,
                                        'Upload image of hoop'
                                    ),
                                    _react2.default.createElement(
                                        'button',
                                        null,
                                        'Upload'
                                    ),
                                    _react2.default.createElement(
                                        'p',
                                        null,
                                        'Paste Image URL'
                                    ),
                                    _react2.default.createElement('textarea', { rows: '1', cols: '50', maxlength: '100' }),
                                    _react2.default.createElement(
                                        'button',
                                        null,
                                        'Submit'
                                    )
                                )
                            )
                        )
                    )
                )
            );
        }
    }]);

    return AddHoop;
}(_react2.default.Component);

_reactDom2.default.render(_react2.default.createElement(App, null), document.getElementById('root'));