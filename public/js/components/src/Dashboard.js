'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

// Moment
import moment from 'moment';

import API from "./api";
import dispatcher from './dispatcher';

class Dashboard extends React.Component {
    render() {
        return (
            <div className='dashboard'>
                <Mapp hoops={ this.state.hoops } />
                <Menu />
                <AddHoop />
                <Activities activities={ this.state.activities } />
            </div>
        )
    }
    state = {
        hoops: [],
        activities: [],
    }
    componentDidMount() {
        this.getHoops();
        this.getActivities();

        this.dispatcherId = dispatcher.register((payload) => {
            switch (payload.type) {
            case 'add-hoop':
                this.getHoops();
                break;
            }
        });
    }
    getHoops = () => {
        API.getHoops((hoops) => {
            this.setState({ hoops: hoops });
        }, () => {
            alert('Failed to get hoops');
        });
    }
    getActivities = () => {
        API.getActivities((activities) => {
            this.setState({ activities: activities });
        }, () => {
            alert('Failed to get activities');
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
                             <li className='right'><a href='#' onClick={ this.logOut }>logout</a></li>
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
    logOut(event) {
        event.preventDefault();

        API.logOut();
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
        event.preventDefault();
        this.setState({ activated: false });
    }
    submit = (event) => {
        event.preventDefault();

        let form = event.target;

        API.addHoop(new FormData(form), () => {
            form.reset();
            dispatcher.dispatch({ type: 'add-hoop' });
            this.setState({ activated: false });
        }, (response) => {
            alert('fail: ' + JSON.stringify(response));
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
                                        {
                                            this.props.activities.map(function(activity, i) {
                                                return <Activity key={i} activity={ activity } />;
                                            })
                                        }
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

class Activity extends React.Component {
    render() {
        let activity = this.props.activity;

        return (
            <div className='panel-body'>
                <div className='thumnails' >
                    <a><img src={ activity.hoop.image_url } /></a>
                </div>
                <div className='title'>
                    <p className='time'>{ moment(activity.created_at).fromNow() }</p>
                    <p>{ activity.user.name + activity.predicate + '\'' + activity.hoop.name + '\'' }</p>
                </div>
            </div>
        )
    }
}

module.exports = Dashboard;
