const Command = require('../../../core/structures/Command');


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

                let modlog;

                try {
                        modlog = await ctx.models.ModLog
                                .findOne({ guild: ctx.guild.id, case: caseNum })
                                .lean();
                } catch (err) {
                        return ctx.error(err);
                }

                if (!modlog) return ctx.error(`Case \`${ctx.args[0]}\` not found.`);

                const embed = {
                        title: `**Case:** ${modlog.case}`,
                        description: ctx.helpers.moderation.formatModlog(modlog),
                        color: ctx.config.colours.success,
                        timestamp: modlog.created.toISOString(),
                };

                return ctx.send({ embed });
        }
});