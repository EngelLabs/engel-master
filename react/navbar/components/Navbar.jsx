import React, { Component } from 'react';
// import Router from 'react-router';

export default class Navbar extends Component {
        render() {
                const cornerButton = user
                        ? <a className="button is-important" href="/dashboard" title="Manage servers">Manage</a>
                        : <a className="button is-important" href="/login" title="Login via Discord">Login</a>

                return (
                        <div className="navbar">
                                {cornerButton}
                                {user &&
                                        <a className="button is-important" href="/logout" title="Logout">Logout</a>}
                                <a className="button is-important" href="/invite" title="Add to a server">Invite</a>
                                <a className="button is-info" href="">Support</a>
                                <a className="button is-info" href="">Modules</a>
                                <a className="button is-info" href="">Commands</a>
                                <a className="button is-info is-gold" href="">Premium</a>
                        </div>
                )
        }
}
