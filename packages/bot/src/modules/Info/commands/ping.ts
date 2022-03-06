import Command from '../../../core/structures/Command';
import type Info from '..';

const ping = new Command<Info>({
        name: 'ping',
        info: 'Calculate the time taken for the bot to send a message',
        aliases: [
                'latency'
        ],
        alwaysEnabled: true,
        dmEnabled: true,
        execute: async function (ctx) {
                const start = Date.now();

                const msg = await ctx.send('Pong!');

                if (msg) {
                        const latency = Date.now() - start;
                        let text = `Pong! ${latency}ms`;

                        if (latency === 69 || latency === 420) {
                                text += ' 😏';
                        }

                        msg.edit(text).catch(() => false);
                }
        }
});

ping.command({
        name: 'ws',
        hidden: true,
        info: 'Calculate the time taken for the bot to receive a message',
        dmEnabled: true,
        execute: function (ctx) {
                const latency = Date.now() - ctx.message.timestamp;

                return ctx.send(`Pong! ${latency < 0 ? -latency : latency}ms`);
        }
});

ping.command({
        name: '_adv',
        hidden: true,
        info: '???',
        dmEnabled: true,
        execute: function (ctx) {
                return ctx.error('???');
        }
});

export default ping;
