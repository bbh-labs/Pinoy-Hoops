'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _flux = require('flux');

var _flux2 = _interopRequireDefault(_flux);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var dispatcher = new _flux2.default.Dispatcher();

var BASE_URL = '';
//const BASE_URL = 'http://pinoy-hoops.bbh-labs.com.sg';

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
            hoops: []
        }, _this.fetchHoops = function () {
            $.ajax({
                url: BASE_URL + '/api/hoops',
                method: 'GET',
                dataType: 'json'
            }).done(function (hoops) {
                _this.setState({ hoops: hoops });
            }).fail(function () {
                alert('Failed to fetch hoops!');
            });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(App, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { id: 'app' },
                _react2.default.createElement(Mapp, { hoops: this.state.hoops }),
                _react2.default.createElement(Menu, null),
                _react2.default.createElement(AddHoop, null),
                _react2.default.createElement(Activities, null)
            );
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            this.fetchHoops();

            this.dispatcherId = dispatcher.register(function (payload) {
                switch (payload.type) {
                    case 'add-hoop':
                        _this2.fetchHoops();
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
        var _Object$getPrototypeO2;

        var _temp2, _this3, _ret2;

        _classCallCheck(this, Mapp);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this3 = _possibleConstructorReturn(this, (_Object$getPrototypeO2 = Object.getPrototypeOf(Mapp)).call.apply(_Object$getPrototypeO2, [this].concat(args))), _this3), _this3.setHoops = function (hoops) {
            _this3.clearHoops();

            for (var i in hoops) {
                var hoop = hoops[i];
                var marker = L.marker([hoop.latitude, hoop.longitude]).addTo(_this3.map).bindPopup(["<div class='hoop'>", "<h1>" + hoop.name + "</h1>", "<p>" + hoop.description + "</p>", "<img src='" + hoop.image_url + "' />", "</div>"].join(''));

                _this3.markers.push(marker);
            }
        }, _this3.clearHoops = function () {
            for (var i in _this3.markers) {
                _this3.map.removeLayer(_this3.markers[i]);
            }
            _this3.markers = [];
        }, _temp2), _possibleConstructorReturn(_this3, _ret2);
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

            this.map = L.mapbox.map('map', 'zacong.phbnc5dd');
            this.map.on('click', function (event) {
                dispatcher.dispatch({ type: 'map-clicked', event: event });
            });

            this.markers = [];
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.setHoops(this.props.hoops);
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
        var _Object$getPrototypeO3;

        var _temp3, _this5, _ret3;

        _classCallCheck(this, AddHoop);

        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        return _ret3 = (_temp3 = (_this5 = _possibleConstructorReturn(this, (_Object$getPrototypeO3 = Object.getPrototypeOf(AddHoop)).call.apply(_Object$getPrototypeO3, [this].concat(args))), _this5), _this5.state = {
            activated: false,
            latlng: { lat: 0, lng: 0 }
        }, _this5.close = function (event) {
            _this5.setState({ activated: false });
        }, _this5.submit = function (event) {
            event.preventDefault();

            var form = event.target;

            $.ajax({
                url: BASE_URL + '/api/hoop',
                method: 'POST',
                data: new FormData(form),
                contentType: false,
                processData: false
            }).done(function () {
                form.reset();
                dispatcher.dispatch({ type: 'add-hoop' });
                _this5.setState({ activated: false });
            }).fail(function (response) {
                alert('fail: ' + response);
            });
        }, _temp3), _possibleConstructorReturn(_this5, _ret3);
    }

    _createClass(AddHoop, [{
        key: 'render',
        value: function render() {
            var activated = this.state.activated;
            var latlng = this.state.latlng;

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
                            { className: (0, _classnames2.default)('popup1 overlay', activated && 'popup1--activated') },
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
                                    { className: 'close', href: '#', onClick: this.close },
                                    '×'
                                ),
                                _react2.default.createElement(
                                    'form',
                                    { className: 'content', onSubmit: this.submit },
                                    _react2.default.createElement(
                                        'p',
                                        null,
                                        'Name your hoop'
                                    ),
                                    _react2.default.createElement('textarea', { name: 'name', rows: '1', cols: '50', maxLength: '50' }),
                                    _react2.default.createElement(
                                        'p',
                                        null,
                                        'Tell us more about the hoop'
                                    ),
                                    _react2.default.createElement('textarea', { name: 'description', rows: '6', cols: '50', maxLength: '200' }),
                                    _react2.default.createElement(
                                        'p',
                                        null,
                                        'Upload image of hoop'
                                    ),
                                    _react2.default.createElement(
                                        'label',
                                        { id: 'add-hoop-image-label', htmlFor: 'add-hoop-image-input' },
                                        'Upload',
                                        _react2.default.createElement('input', { id: 'add-hoop-image-input', name: 'file', type: 'file', accept: 'image/*' })
                                    ),
                                    _react2.default.createElement(
                                        'p',
                                        null,
                                        'Paste Image URL'
                                    ),
                                    _react2.default.createElement('textarea', { name: 'image-url', rows: '1', cols: '50', maxLength: '100' }),
                                    _react2.default.createElement('input', { name: 'latitude', type: 'hidden', value: latlng.lat }),
                                    _react2.default.createElement('input', { name: 'longitude', type: 'hidden', value: latlng.lng }),
                                    _react2.default.createElement(
                                        'button',
                                        { type: 'submit' },
                                        'Submit'
                                    )
                                )
                            )
                        )
                    )
                )
            );
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this6 = this;

            dispatcher.register(function (payload) {
                switch (payload.type) {
                    case 'map-clicked':
                        _this6.setState({ activated: true, latlng: payload.event.latlng });
                        break;
                }
            });
        }
    }]);

    return AddHoop;
}(_react2.default.Component);

var Hoop = function (_React$Component5) {
    _inherits(Hoop, _React$Component5);

    function Hoop() {
        var _Object$getPrototypeO4;

        var _temp4, _this7, _ret4;

        _classCallCheck(this, Hoop);

        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
        }

        return _ret4 = (_temp4 = (_this7 = _possibleConstructorReturn(this, (_Object$getPrototypeO4 = Object.getPrototypeOf(Hoop)).call.apply(_Object$getPrototypeO4, [this].concat(args))), _this7), _this7.state = {
            activated: false
        }, _this7.close = function (event) {
            _this7.setState({ activated: false });
        }, _temp4), _possibleConstructorReturn(_this7, _ret4);
    }

    _createClass(Hoop, [{
        key: 'render',
        value: function render() {
            var activated = this.state.activated;

            return _react2.default.createElement(
                'div',
                { className: 'wrapper' },
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'hoop' },
                        _react2.default.createElement(
                            'div',
                            { className: (0, _classnames2.default)('popup3 overlay', activated && 'popup3--activated') },
                            _react2.default.createElement('div', { className: 'popup' })
                        )
                    )
                )
            );
        }
    }]);

    return Hoop;
}(_react2.default.Component);

var Activities = function (_React$Component6) {
    _inherits(Activities, _React$Component6);

    function Activities() {
        _classCallCheck(this, Activities);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Activities).apply(this, arguments));
    }

    _createClass(Activities, [{
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
                            { className: 'feeds' },
                            _react2.default.createElement(
                                'div',
                                { className: 'panel-group' },
                                _react2.default.createElement(
                                    'div',
                                    { className: 'panel panel-default' },
                                    _react2.default.createElement(
                                        'div',
                                        { className: 'panel-heading' },
                                        _react2.default.createElement(
                                            'h4',
                                            { className: 'panel-title' },
                                            _react2.default.createElement(
                                                'a',
                                                { 'data-toggle': 'collapse', href: '#collapse1' },
                                                'Activity feeds'
                                            )
                                        )
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        { id: 'collapse1', className: 'panel-collapse collapse' },
                                        _react2.default.createElement(
                                            'div',
                                            { className: 'highlight' },
                                            _react2.default.createElement(
                                                'div',
                                                { className: 'panel-body' },
                                                _react2.default.createElement(
                                                    'div',
                                                    { className: 'thumnails' },
                                                    _react2.default.createElement(
                                                        'a',
                                                        null,
                                                        _react2.default.createElement('img', { src: 'images/dummy02.jpg' })
                                                    )
                                                ),
                                                _react2.default.createElement(
                                                    'div',
                                                    { className: 'title' },
                                                    _react2.default.createElement(
                                                        'p',
                                                        { className: 'time' },
                                                        '2 mins ago'
                                                    ),
                                                    _react2.default.createElement(
                                                        'p',
                                                        null,
                                                        'Mike Swift added new story to :Street 17\' hoop'
                                                    )
                                                )
                                            )
                                        ),
                                        _react2.default.createElement(
                                            'div',
                                            { className: 'panel-body' },
                                            _react2.default.createElement(
                                                'div',
                                                { className: 'thumnails' },
                                                _react2.default.createElement(
                                                    'a',
                                                    null,
                                                    _react2.default.createElement('img', { src: 'images/dummy01.jpg' })
                                                )
                                            ),
                                            _react2.default.createElement(
                                                'div',
                                                { className: 'title' },
                                                _react2.default.createElement(
                                                    'p',
                                                    { className: 'time' },
                                                    '5 mins ago'
                                                ),
                                                _react2.default.createElement(
                                                    'p',
                                                    null,
                                                    'Steven added new story to \'Lorong24\' hoop'
                                                )
                                            )
                                        ),
                                        _react2.default.createElement(
                                            'div',
                                            { className: 'panel-body' },
                                            _react2.default.createElement(
                                                'div',
                                                { className: 'thumnails' },
                                                _react2.default.createElement(
                                                    'a',
                                                    null,
                                                    _react2.default.createElement('img', { src: 'images/dummy01.jpg' })
                                                )
                                            ),
                                            _react2.default.createElement(
                                                'div',
                                                { className: 'title' },
                                                _react2.default.createElement(
                                                    'p',
                                                    { className: 'time' },
                                                    '5 mins ago'
                                                ),
                                                _react2.default.createElement(
                                                    'p',
                                                    null,
                                                    'Steven added new story to \'Lorong24\' hoop'
                                                )
                                            )
                                        ),
                                        _react2.default.createElement(
                                            'div',
                                            { className: 'panel-body' },
                                            _react2.default.createElement(
                                                'div',
                                                { className: 'thumnails' },
                                                _react2.default.createElement(
                                                    'a',
                                                    null,
                                                    _react2.default.createElement('img', { src: 'images/dummy01.jpg' })
                                                )
                                            ),
                                            _react2.default.createElement(
                                                'div',
                                                { className: 'title' },
                                                _react2.default.createElement(
                                                    'p',
                                                    { className: 'time' },
                                                    '5 mins ago'
                                                ),
                                                _react2.default.createElement(
                                                    'p',
                                                    null,
                                                    'Steven added new story to \'Lorong24\' hoop'
                                                )
                                            )
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

    return Activities;
}(_react2.default.Component);

_reactDom2.default.render(_react2.default.createElement(App, null), document.getElementById('root'));