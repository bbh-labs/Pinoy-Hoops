'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Flux from 'flux';
import cx from 'classnames';

var dispatcher = new Flux.Dispatcher();

const BASE_URL = '';
//const BASE_URL = 'http://pinoy-hoops.bbh-labs.com.sg';

class App extends React.Component {
    render() {
        return (
            <div id='app'>
                <Mapp hoops={ this.state.hoops } />
                <Menu />
                <AddHoop />
                <Activities />
            </div>
        )
    }
    state = {
        hoops: [],
    }
    componentDidMount() {
        this.fetchHoops();

        this.dispatcherId = dispatcher.register((payload) => {
            switch (payload.type) {
            case 'add-hoop':
                this.fetchHoops();
                break;
            }
        });
    }
    fetchHoops = () => {
        $.ajax({
            url: BASE_URL + '/api/hoops',
            method: 'GET',
            dataType: 'json',
        }).done((hoops) => {
            this.setState({ hoops: hoops });
        }).fail(() => {
            alert('Failed to fetch hoops!');
        });
    }
}

class Mapp extends React.Component {
    render() {
        return <div id='map'></div>
    }
    componentDidMount() {
        L.mapbox.accessToken = 'pk.eyJ1IjoiemFjb25nIiwiYSI6ImNpbG4yOHB4cTAwczZ1bGtuZGFkcW11OWEifQ.5CuLAlmVw7YwZblPzvJvAw';

        this.map = L.mapbox.map('map', 'zacong.phbnc5dd');
        this.map.on('click', function(event) {
            dispatcher.dispatch({ type: 'map-clicked', event: event });
        });

        this.markers = [];
    }
    componentDidUpdate() {
        this.setHoops(this.props.hoops);
    }
    setHoops = (hoops) => {
        this.clearHoops();

        for (let i in hoops) {
            let hoop = hoops[i];
            let marker = L.marker([ hoop.latitude, hoop.longitude ])
             .addTo(this.map)
             .bindPopup([
                "<div class='hoop'>",
                    "<h1>" + hoop.name + "</h1>",
                    "<p>" + hoop.description + "</p>",
                    "<img src='" + hoop.image_url + "' />",
                "</div>",
             ].join(''));

            this.markers.push(marker);
        }
    }
    clearHoops = () => {
        for (let i in this.markers) {
            this.map.removeLayer(this.markers[i]);
        }
        this.markers = [];
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
        let activated = this.state.activated;
        let latlng = this.state.latlng;

        return (
            <div className='wrapper'>
                <div className='row'>
                    <div className='add-hoop'>
                        <div className={ cx('popup1 overlay', activated && 'popup1--activated') }>
                            <div className='popup'>
                                <h3>Name your hoop</h3>
                                <a className='close' href='#' onClick={ this.close }>&times;</a>
                                <form className='content' onSubmit={ this.submit }>
                                    <p>Name your hoop</p>
                                    <textarea name='name' rows='1' cols='50' maxLength='50'></textarea>
                                    <p>Tell us more about the hoop</p>
                                    <textarea name='description' rows='6' cols='50' maxLength='200'></textarea>
                                    <p>Upload image of hoop</p>
                                    <label id='add-hoop-image-label' htmlFor='add-hoop-image-input'>
                                        Upload
                                        <input id='add-hoop-image-input' name='file' type='file' accept='image/*' />
                                    </label>
                                    <p>Paste Image URL</p>
                                    <textarea name='image-url' rows='1' cols='50' maxLength='100'></textarea>
                                    <input name='latitude' type='hidden' value={ latlng.lat } />
                                    <input name='longitude' type='hidden' value={ latlng.lng } />
                                    <button type='submit'>Submit</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    state = {
        activated: false,
        latlng: { lat: 0, lng: 0 },
    }
    componentDidMount() {
        dispatcher.register((payload) => {
            switch (payload.type) {
            case 'map-clicked':
                this.setState({ activated: true, latlng: payload.event.latlng });
                break;
            }
        });
    }
    close = (event) => {
        this.setState({ activated: false });
    }
    submit = (event) => {
        event.preventDefault();

        let form = event.target;

        $.ajax({
            url: BASE_URL + '/api/hoop',
            method: 'POST',
            data: new FormData(form),
            contentType: false,
            processData: false,
        }).done(() => {
            form.reset();
            dispatcher.dispatch({ type: 'add-hoop' });
            this.setState({ activated: false });
        }).fail((response) => {
            alert('fail: ' + response);
        });
    }
}

class Hoop extends React.Component {
    render() {
        let activated = this.state.activated;

        return (
            <div className='wrapper'>
                <div className='row'>
                    <div className='hoop'>
                        <div className={ cx('popup3 overlay', activated && 'popup3--activated') }>
                            <div className='popup'>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    state = {
        activated: false,
    }
    close = (event) => {
        this.setState({ activated: false });
    }
}

class Activities extends React.Component {
    render() {
        return (
            <div className='wrapper'>
                <div className='row'>
                    <div className='dt-12 tl-6 tp-8 ml-6'>
                        <ul className='feeds'>
                            <div className='panel-group'>
                                <div className='panel panel-default'>
                                    <div className='panel-heading'>
                                        <h4 className='panel-title'>
                                            <a data-toggle='collapse' href='#collapse1'>Activity feeds</a>
                                        </h4>
                                    </div>
                                    <div id='collapse1' className='panel-collapse collapse'>
                                        <div className='highlight'>
                                            <div className='panel-body'>
                                                <div className='thumnails' >
                                                    <a><img src='images/dummy02.jpg' /></a>
                                                </div>
                                                <div className='title'>
                                                    <p className='time'>2 mins ago</p>
                                                    <p>Mike Swift added new story to :Street 17' hoop</p>
                                                </div>
                                            </div>
                                        </div>    
                                        <div className='panel-body'>
                                            <div className='thumnails' >
                                                <a><img src='images/dummy01.jpg' /></a>
                                            </div>
                                            <div className='title'>
                                                <p className='time'>5 mins ago</p>
                                                <p >Steven added new story to 'Lorong24' hoop</p>
                                            </div>
                                        </div>
                                        <div className='panel-body'>
                                            <div className='thumnails' >
                                                <a><img src='images/dummy01.jpg' /></a>
                                            </div>
                                            <div className='title'>
                                                <p className='time'>5 mins ago</p>
                                                <p >Steven added new story to 'Lorong24' hoop</p>
                                            </div>
                                        </div>
                                        <div className='panel-body'>
                                            <div className='thumnails' >
                                                <a><img src='images/dummy01.jpg' /></a>
                                            </div>
                                            <div className='title'>
                                                <p className='time'>5 mins ago</p>
                                                <p >Steven added new story to 'Lorong24' hoop</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ul>  
                    </div>
                </div>
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
