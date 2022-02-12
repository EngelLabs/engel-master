const { Command } = require('@timbot/core');


const ping = new Command({
        name: 'ping',
        info: 'Calculate the time taken for the bot to send a message',
        aliases: [
                'latency',
        ],
        alwaysEnabled: true,
        dmEnabled: true,
        execute: function (ctx) {
                const start = Date.now();

                return ctx.send('Pong!')
                        .then((msg) => {
                                if (msg) {
                                        const latency = Date.now() - start;
                                        let text = `Pong! ${latency}ms`;

                                        if (latency === 69 || latency === 420) text += ' 😏';

                                        msg.edit(text);
                                }
                        })
                        .catch(() => false);
        },
});

ping.command({
        name: 'ws',
        hidden: true,
        info: 'Calculate the time taken for the bot to receive a message',
        dmEnabled: true,
        execute: function (ctx) {
                return ctx.send(`Pong! ${Date.now() - ctx.message.timestamp}ms`);
        },
});

ping.command({
        name: '_adv',
        hidden: true,
        info: '???',
        dmEnabled: true,
        execute: function (ctx) {
                return ctx.error('???');
        },
});


module.exports = ping;