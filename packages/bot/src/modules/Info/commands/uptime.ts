import * as prettyMS from 'pretty-ms';
import Command from '../../../core/structures/Command';
import type Info from '..';

export default new Command<Info>({
        name: 'uptime',
        info: 'Get the bot\'s uptime',
        dmEnabled: true,
        alwaysEnabled: true,
        cooldown: 10000,
        execute: function (ctx) {
                return ctx.info(`Uptime: ${prettyMS(Math.floor(process.uptime()) * 1000)}`);
        }
});
