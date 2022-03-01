import * as eris from 'eris';
import { Constants } from 'eris';
import Base from '../structures/Base';

const idRegex = /([0-9]{15,20})$/;
const roleMentionRegex = /<@&([0-9]{15,20})>$/;
const userMentionRegex = /<@!?([0-9]{15,20})>$/;
const channelMentionRegex = /<#([0-9]{15,20})>$/;
const timeRegex = /[a-zA-Z]+|[0-9]+/g;

const invalidArgument = 'Invalid argument.';
const invalidArugment2 = 'Invalid argument. Try again by providing an ID/@mention?';

/**
 * Conversion helper
 */
export default class Converter extends Base {
        public role(guild: eris.Guild, argument: string): Promise<eris.Role | undefined> {
                return new Promise((resolve, reject) => {
                        const match = this.roleID(argument);

                        if (isNaN(parseInt(match))) return reject(match);

                        resolve(guild.roles.get(match));
                });
        }

        public member(guild: eris.Guild, argument: string, fetch: boolean = false): Promise<eris.Member | undefined> {
                return new Promise((resolve, reject) => {
                        const match = this.userID(argument);

                        if (isNaN(parseInt(match))) return reject(match);

                        const member = guild.members.get(match);

                        if (member || !fetch) return resolve(member);

                        this.eris.getRESTGuildMember(guild.id, match)
                                .then(member => resolve(member))
                                .catch(() => resolve(null));
                });
        }

        public user(argument: string, fetch: boolean = false): Promise<eris.User | undefined> {
                return new Promise((resolve, reject) => {
                        const match = this.userID(argument);

                        if (isNaN(parseInt(match))) return reject(match);

                        const user = this.eris.users.get(match);

                        if (user || !fetch) return resolve(user);

                        this.eris.getRESTUser(match)
                                .then(user => resolve(user))
                                .catch(() => resolve(null));
                });
        }

        public channel(guild: eris.Guild, argument: string, fetch: boolean = false): Promise<eris.GuildChannel | undefined> {
                return new Promise((resolve, reject) => {
                        const match = this.channelID(argument);

                        if (isNaN(parseInt(match))) return reject(match);

                        const channel = guild.channels.get(match);

                        if (channel || !fetch) return resolve(channel);

                        this.eris.getRESTChannel(match)
                                .then(channel => resolve(<eris.GuildChannel>channel))
                                .catch(() => resolve(null));
                });
        }

        public textChannel(guild: eris.Guild, argument: string, fetch: boolean = false): Promise<eris.TextChannel | undefined> {
                return new Promise((resolve, reject) => {
                        this.channel(guild, argument, fetch)
                                .then(channel => {
                                        if (channel?.type !== Constants.ChannelTypes.GUILD_TEXT) {
                                                return reject(`${channel.mention} is not a text channel.`);
                                        }

                                        resolve(<eris.TextChannel>channel);
                                })
                                .catch(reject);
                });
        }

        public id(argument: string): string {
                if (!argument || !argument.length) return invalidArgument;

                const match = argument.match(idRegex);

                if (!match || !match.length) return 'Invalid ID.';

                return match[1];
        }

        private _convertID(argument: string, altRegex: RegExp, errorMsg: string = invalidArugment2): string {
                let match = this.id(argument);

                if (isNaN(parseInt(match))) {
                        // @ts-ignore
                        match = argument.match(altRegex);

                        if (!match || !match.length) {
                                return errorMsg;
                        }

                        return match[1];
                }

                return match;
        }

        public channelID(argument: string): string {
                return this._convertID(argument, channelMentionRegex, invalidArugment2.replace('@', '#'));
        }

        public roleID(argument: string): string {
                return this._convertID(argument, roleMentionRegex);
        }

        public userID(argument: string): string {
                return this._convertID(argument, userMentionRegex);
        }

        public duration(argument: string): number | undefined {
                if (!argument || !argument.length) return;

                const match = argument.match(timeRegex);

                if (!match || !match.length) return;

                const ret = parseInt(match[0], 10);

                switch (match[1]) {
                        case 's':
                                return Math.round(ret);

                        case 'm':
                                return Math.round(ret * 60);

                        case 'h':
                                return Math.round(ret * 60 * 60);

                        case 'd':
                                return Math.round(ret * 60 * 60 * 24);

                        case 'w':
                                return Math.round(ret * 60 * 60 * 24 * 7);

                        case 'mo':
                                return Math.round(ret * 60 * 60 * 24 * 30);
                }
        }
}
