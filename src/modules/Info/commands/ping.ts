import Command from '../../../core/structures/Command';
import Info from '..';

const ping = new Command<Info>({
        name: 'ping',
        info: 'Calculate the time taken for the core to send a message',
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
        info: 'Calculate the time taken for the core to receive a message',
        dmEnabled: true,
        execute: function (ctx) {
                return ctx.send(`Pong! ${Date.now() - ctx.message.timestamp}ms`);
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
