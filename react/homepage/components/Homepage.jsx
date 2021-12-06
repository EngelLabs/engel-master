import React, { Component } from 'react'
import axios from 'axios';

export default class Homepage extends Component {
    state = {
        prefixes: null,
    };

    async getPrefixes() {
        let resp;
        try {
            resp = await axios.get('/api/guilds/828010463476056137');
        } catch (err) {
            console.error(err);
        }

        console.info(resp);

        this.setState({ prefixes: resp.data.prefixes });
    }

    componentDidMount() {
        this.getPrefixes();
    }
    
    render() {
        return (
            <div>
                {this.state.prefixes &&
                <p>Current prefixes: {this.state.prefixes.toString()}</p>}
            </div>
        )
    }
}
