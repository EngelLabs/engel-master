import Command from '../../../core/structures/Command';
import Moderation from '../../../core/helpers/Moderation';
import Moderator from '..';

export default new Command<Moderator>({
        name: 'case',
        usage: '<case number>',
        info: 'View a moderation case by id',
        aliases: [
                'modlog'
        ],
        examples: [
                'case 69',
                'modlog 420'
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
                                .lean();
                } catch (err) {
                        return ctx.error(err);
                }

                if (!modlog) return ctx.error(`Case \`${ctx.args[0]}\` not found.`);

                const moderation = new Moderation(ctx.core);

                const embed = {
                        description: moderation.formatModlog(modlog),
                        color: ctx.config.colours.success
                };

                return ctx.send({ embed });
        }
});
