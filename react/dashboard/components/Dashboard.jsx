import React, { Component } from 'react'

export default class Dashboard extends Component {
        constructor(props) {
                super(props);

                this.state = {
                        selectedGuild: null,
                };
        }

        render() {
                const dash = !this.state.selectedGuild
                        ? (
                                <div className="selector">
                                        <p className="title">Please select a guild.</p>
                                        {allGuilds.forEach(guild => {
                                                <img src={`https://cdn.discord.gg`}/>
                                        })}
                                </div>
                        )
                        : (
                                <div className=""></div>
                        )

                return (
                        <div className="dashboard">
                                {dash}
                        </div>
                )
        }
}
