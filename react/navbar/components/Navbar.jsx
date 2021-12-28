import React, { Component } from 'react'

export default class Navbar extends Component {
    render() {
        return (
            <nav className="navbar">
                <a className="list-item button is-special" href="/login" title="Login via Discord">Login</a>
            </nav>
        )
    }
}
