'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import API from './api';

class Login extends React.Component {
    render() {
        return (
            <div className='login-page'>
                <a href='index.html'><img className='logo' src='images/playpinoy_logo_w.png' /></a>
                <div className='form'>
                    <form action='#' className='register-form'>
                        <input type='text' placeholder='name' />
                        <input type='password' placeholder='password' />
                        <input type='email' placeholder='email address' />
                        <button>create</button>
                        <p className='message'>Already registered? <a href='#'>Sign In</a></p>
                    </form>
                    <form action='#' className='login-form'>
                        <h4>login</h4>
                        <button className='facebook-login' onClick={ API.login.bind(this, 'facebook') }>Facebook</button>
                        <button className='twitter-login' onClick={ API.login.bind(this, 'twitter') }>Twitter</button>
                        <p className='message'>Not registered? <a href='#'>Create an account</a></p>
                    </form>
                </div>
            </div>
        )
    }
}

module.exports = Login;
