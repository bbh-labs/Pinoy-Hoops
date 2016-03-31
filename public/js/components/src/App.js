'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Flux from 'flux';

var dispatcher = new Flux.Dispatcher();

class App extends React.Component {
    render() {
        return (
            <div id='app'>
                <Mapp />
                <Menu />
                <AddHoop />
            </div>
        )
    }
    componentDidMount() {
        dispatcher.register(function(payload) {
            switch (payload.type) {
            case 'map-click':
                // TODO: Implement upload hoop by clicking on the map
                console.log(payload.event.latlng);
                break;
            }
        });
    }
}

class Mapp extends React.Component {
    render() {
        return <div id='map'></div>
    }
    componentDidMount() {
        L.mapbox.accessToken = 'pk.eyJ1IjoiemFjb25nIiwiYSI6ImNpbG4yOHB4cTAwczZ1bGtuZGFkcW11OWEifQ.5CuLAlmVw7YwZblPzvJvAw';
        var map = L.mapbox.map('map', 'zacong.phbnc5dd');
        map.on('click', function(event) {
            dispatcher.dispatch({ type: 'map-click', event: event });
        });
    }
}

class Menu extends React.Component {
    render() {
        return (
            <div className='wrapper'>
                <div className='row'>
                    <div className='dt-12 tl-6 tp-8 ml-6'>
                        <ul className='menu'>
                             <a href='/'><img className='logo' src='images/playpinoy_logo_b.png' /></a>
                             <li className='right'><a href='login.html'>login</a></li>
                             <div className='hamburger'>
                                <a data-toggle='collapse' href='#collapse2'>
                                    <img src='images/basketball_b.png' />
                                </a>
                             </div>
                             <div id='collapse2' className='panel-collapse collapse'>
                                <div className='sub-menu'>
                                    <a href='#popup1'><p>Add a hoop</p></a>
                                    <p><a>Popular hoop</a></p>
                                    <p><a>Nearby hoop</a></p>
                                    <p><a>Latest hoop</a></p>
                                    <a href='#popup2'><p>About</p></a>
                                    <p><a>Join the Community</a></p>
                                </div>
                            </div>
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
}

class AddHoop extends React.Component {
    render() {
        return (
            <div className='wrapper'>
                <div className='row'>
                    <div className='add-hoop'>
                        <div id='popup1' className='overlay'>
                            <div className='popup'>
                                <h3>Name your hoop</h3>
                                <a className='close' href='#'>&times;</a>
                                <div className='content'>
                                    <p>Name your hoop</p>
                                    <textarea rows='1' cols='50' maxlength='50'></textarea>
                                    <p>Tell us more about the hoop</p>
                                    <textarea rows='6' cols='50' maxlength='200'></textarea>
                                    <p>Upload image of hoop</p>
                                    <button>Upload</button>
                                    <p>Paste Image URL</p>
                                    <textarea rows='1' cols='50' maxlength='100'></textarea>
                                    <button>Submit</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
