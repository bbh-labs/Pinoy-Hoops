'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

class Login extends React.Component {
    render() {
        return (
            <div className='login-page'>
                <a href='index.html'><img className='logo' src='images/playpinoy_logo_w.png' /></a>
                <div className='form'>
                    <form className='register-form'>
                        <input type='text' placeholder='name'/>
                        <input type='password' placeholder='password'/>
                        <input type='text' placeholder='email address'/>
                        <button>create</button>
                        <p className='message'>Already registered? <a href='#'>Sign In</a></p>
                    </form>
                    <form className='login-form'>
                        <h4>login</h4>
                        <button style={{ backgroundColor: '#3c5a99' }}>Facebook</button>
                        <button style={{ backgroundColor: '#2ca7e0' }}>Twitter</button>
                        <button style={{ backgroundColor: '#a77b5e' }}>Instagram</button>
                        <p className='message'>Not registered? <a href='#'>Create an account</a></p>
                    </form>
                </div>
            </div>
        )
    }
}

module.exports = Login;
