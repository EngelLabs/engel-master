import Command from '../../../core/structures/Command';
import type Tags from '..';

export default new Command<Tags>({
        name: 'tag',
        usage: '<*tag name>',
        info: 'Find a server tag.',
        requiredArgs: 1,
        disableModuleCheck: true,
        execute: async function (ctx) {
                const name = ctx.args.join(' ');

                const tag = await ctx.mongo.tags.findOne({ guild: ctx.guild.id, name });
                if (tag) {
                        ctx.mongo.tags
                                .updateOne({ guild: ctx.guild.id, name }, { $inc: { uses: 1 } })
                                .catch(err => ctx.logger.error(err));
                }

                return tag
                        ? ctx.send(tag.content).catch(() => false)
                        : ctx.error(`Tag \`${name}\` not found.`);
        }
});
