const Command = require('../../../structures/Command');
const prettyMS = require('pretty-ms');


module.exports = new Command({
    name: 'case',
    usage: '<case number>',
    info: 'View a moderation case by id',
    aliases: [
        'modlog',
    ],
    examples: [
        'case 69',
        'modlog 420',
    ],
    cooldown: 3000,
    requiredArgs: 1,
    execute: async function (ctx) {
        const caseNum = parseInt(ctx.args[0]);

        if (isNaN(caseNum) || caseNum < 0) {
            return ctx.error(`\`${ctx.args[0]}\` is not a valid case number.`);
        }

        try {
            var modlog = await ctx.models.ModLog
                .findOne({ guild: ctx.guild.id, case: caseNum })
                .lean()
                .exec();

        } catch (err) {
            return ctx.error(err);
        }

        if (!modlog) return ctx.error(`Case \`${ctx.args[0]}\` not found.`);

        const msgArray = [
            `**Type:** ${modlog.type}`,
        ];

        if (modlog.user) {
            msgArray.push(`**User:** ${modlog.user.name} (${modlog.user.id})`);
        }

        if (modlog.channel) {
            msgArray.push(`**Channel:** ${modlog.channel.name} (${modlog.channel.id})`);
        }

        if (modlog.count) {
            msgArray.push(`**Count:** ${modlog.count}`);
        }

        msgArray.push(`**Moderator:** ${modlog.mod.name} (${modlog.mod.id})`);

        if (modlog.reason && modlog.reason.length) {
            msgArray.push(`**Reason:** ${modlog.reason}`);
        }

        if (modlog.duration) {
            msgArray.push(
                `**Duration:** ${prettyMS(modlog.duration)} (active: ${modlog.expiry && modlog.expiry > Date.now() ? 'true' : 'false'})`
            );
        }

        const embed = {
            title: `**Case:** ${modlog.case}`,
            description: msgArray.join('\n'),
            color: ctx.config.colours.success,
            timestamp: modlog.created.toISOString(),
        };

        return ctx.send({ embed });
    }
});